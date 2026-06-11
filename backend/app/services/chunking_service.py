"""
chunking_service.py — Tầng 1: Semantic Chunking + Top-K Retrieval

Chia tài liệu theo ranh giới ngữ nghĩa (heading, đoạn văn, câu hoàn chỉnh)
thay vì cắt cố định theo số ký tự. Với mỗi section của template giáo án,
dùng TF-IDF keyword overlap để lấy top-K chunks liên quan nhất.

Không dùng vector DB để tránh dependency nặng.
Có thể nâng cấp lên FAISS/ChromaDB nếu cần sau.
"""

import re
import math
from collections import Counter
from typing import List, Dict


# ─── Section-aware query hints ────────────────────────────────────────────────
# Mỗi node trong template có một bộ keywords đặc trưng để tìm chunk phù hợp
SECTION_QUERY_HINTS: Dict[str, List[str]] = {
    "khoi_dong": [
        "hook", "khởi động", "warm up", "tình huống thực tế", "câu hỏi",
        "kích thích", "tư duy", "mở đầu", "dẫn nhập", "giới thiệu bài",
        "trò chơi", "icebreaker", "motivation", "động lực", "bối cảnh",
    ],
    "ly_thuyet": [
        "lý thuyết", "khái niệm", "định nghĩa", "nguyên lý", "core", "theory",
        "giải thích", "nội dung chính", "kiến thức", "học sinh hiểu", "cốt lõi",
        "trình bày", "phân tích", "cơ chế", "quá trình", "đặc điểm", "tính chất",
    ],
    "thuc_hanh": [
        "thực hành", "bài tập", "vận dụng", "practice", "exercise", "áp dụng",
        "kiểm tra", "củng cố", "ôn tập", "review", "đánh giá", "quiz",
        "hoạt động", "nhóm", "làm", "thực hiện", "giải", "case study",
    ],
}

# Mapping từ tên node bất kỳ → section key chuẩn
NODE_TO_SECTION_KEY: Dict[str, str] = {
    # Khởi động
    "khởi động": "khoi_dong",
    "warm-up": "khoi_dong",
    "warm up": "khoi_dong",
    "mở đầu": "khoi_dong",
    "node 1": "khoi_dong",
    "nút 1": "khoi_dong",
    # Lý thuyết
    "lý thuyết cốt lõi": "ly_thuyet",
    "core theory": "ly_thuyet",
    "lý thuyết": "ly_thuyet",
    "node 2": "ly_thuyet",
    "nút 2": "ly_thuyet",
    # Thực hành
    "thực hành & vận dụng": "thuc_hanh",
    "thực hành": "thuc_hanh",
    "practice": "thuc_hanh",
    "vận dụng": "thuc_hanh",
    "kiểm tra": "thuc_hanh",
    "node 3": "thuc_hanh",
    "nút 3": "thuc_hanh",
}

# Kích thước chunk tối ưu (ký tự) — tương đương 300–500 token
CHUNK_MIN_CHARS = 200
CHUNK_MAX_CHARS = 2000
CHUNK_TARGET_CHARS = 1200


# ─── Core Chunking Logic ──────────────────────────────────────────────────────

def semantic_chunk(text: str) -> List[str]:
    """
    Chia text theo ranh giới ngữ nghĩa:
    1. Ưu tiên chia theo heading Markdown (# / ##)
    2. Tiếp theo là đoạn văn (double newline)
    3. Nếu đoạn vẫn quá dài → chia theo câu (dấu chấm/chấm than/chấm hỏi)
    4. Gộp chunk quá nhỏ với chunk kế tiếp (sliding merge)

    Returns:
        List[str]: Danh sách các chunks đã được làm sạch
    """
    if not text or not text.strip():
        return []

    # Bước 1: Chia theo heading trước (ranh giới ngữ nghĩa mạnh nhất)
    heading_pattern = re.compile(r'(?m)^(?=#{1,3}\s)', re.MULTILINE)
    sections = heading_pattern.split(text)

    raw_chunks: List[str] = []
    for section in sections:
        section = section.strip()
        if not section:
            continue

        # Bước 2: Chia tiếp theo double newline (paragraph boundary)
        paragraphs = re.split(r'\n\s*\n', section)
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(para) <= CHUNK_MAX_CHARS:
                raw_chunks.append(para)
            else:
                # Bước 3: Đoạn quá dài → chia theo câu
                sentences = re.split(r'(?<=[.!?])\s+', para)
                current = ""
                for sent in sentences:
                    if len(current) + len(sent) + 1 <= CHUNK_MAX_CHARS:
                        current = (current + " " + sent).strip()
                    else:
                        if current:
                            raw_chunks.append(current)
                        current = sent
                if current:
                    raw_chunks.append(current)

    # Bước 4: Gộp chunk quá nhỏ (sliding merge)
    merged: List[str] = []
    buffer = ""
    for chunk in raw_chunks:
        if len(buffer) + len(chunk) + 1 < CHUNK_MIN_CHARS:
            buffer = (buffer + "\n\n" + chunk).strip()
        else:
            if buffer:
                merged.append(buffer)
            buffer = chunk
    if buffer:
        merged.append(buffer)

    return [c for c in merged if c.strip()]


# ─── TF-IDF Top-K Retrieval ───────────────────────────────────────────────────

def _tokenize(text: str) -> List[str]:
    """Normalize + tokenize tiếng Việt và tiếng Anh."""
    text = text.lower()
    # Giữ lại chữ cái, số, dấu cách; bỏ ký tự đặc biệt
    text = re.sub(r'[^\w\s]', ' ', text, flags=re.UNICODE)
    return [t for t in text.split() if len(t) > 1]


def _compute_tf(tokens: List[str]) -> Dict[str, float]:
    """Term Frequency cho một document."""
    count = Counter(tokens)
    total = len(tokens) or 1
    return {term: freq / total for term, freq in count.items()}


def _compute_idf(corpus: List[List[str]]) -> Dict[str, float]:
    """Inverse Document Frequency trên toàn bộ corpus."""
    N = len(corpus)
    df: Dict[str, int] = {}
    for doc_tokens in corpus:
        for term in set(doc_tokens):
            df[term] = df.get(term, 0) + 1
    return {term: math.log((N + 1) / (freq + 1)) + 1 for term, freq in df.items()}


def _tfidf_score(query_tokens: List[str], doc_tokens: List[str], idf: Dict[str, float]) -> float:
    """Tính cosine-like similarity giữa query và document dựa trên TF-IDF."""
    tf = _compute_tf(doc_tokens)
    score = 0.0
    for term in query_tokens:
        if term in tf:
            score += tf[term] * idf.get(term, 1.0)
    # Normalize theo độ dài query để tránh bias
    return score / (len(query_tokens) or 1)


def retrieve_top_k(
    chunks: List[str],
    section_key: str,
    k: int = 5,
    extra_query_terms: List[str] = None,
) -> List[str]:
    """
    Với mỗi section của template, tìm top-K chunks liên quan nhất.

    Args:
        chunks: Danh sách chunk đã được semantic_chunk() tạo ra
        section_key: Key trong SECTION_QUERY_HINTS ("khoi_dong" / "ly_thuyet" / "thuc_hanh")
        k: Số chunk trả về tối đa
        extra_query_terms: Query terms bổ sung từ node name cụ thể

    Returns:
        List[str]: Top-K chunks được sắp xếp theo mức độ liên quan (cao → thấp)
    """
    if not chunks:
        return []

    # Lấy query hints cho section này
    base_hints = SECTION_QUERY_HINTS.get(section_key, [])
    all_query_terms = base_hints + (extra_query_terms or [])
    query_tokens = _tokenize(" ".join(all_query_terms))

    if not query_tokens:
        # Nếu không có query hints → trả về tất cả chunks theo thứ tự
        return chunks[:k]

    # Tokenize toàn bộ corpus
    corpus_tokens = [_tokenize(chunk) for chunk in chunks]

    # Tính IDF trên toàn bộ corpus + query
    full_corpus = corpus_tokens + [query_tokens]
    idf = _compute_idf(full_corpus)

    # Score từng chunk
    scored = [
        (i, _tfidf_score(query_tokens, doc_tokens, idf))
        for i, doc_tokens in enumerate(corpus_tokens)
    ]

    # Sắp xếp giảm dần theo score
    scored.sort(key=lambda x: x[1], reverse=True)

    # Trả về top-K (lấy tối đa k chunk, bỏ chunk score = 0)
    top_k_indices = [i for i, score in scored[:k] if score > 0]

    # Nếu không có chunk nào khớp → fallback lấy k chunk đầu tiên
    if not top_k_indices:
        return chunks[:k]

    # Giữ nguyên thứ tự xuất hiện trong document (context coherence)
    top_k_indices.sort()
    return [chunks[i] for i in top_k_indices]


# ─── Section-aware Context Builder ───────────────────────────────────────────

def get_section_key_from_node_name(node_name: str) -> str:
    """
    Ánh xạ tên node bất kỳ → section key chuẩn.
    Fallback: tìm keyword match, nếu không tìm thấy → "ly_thuyet" (default).
    """
    name_lower = node_name.lower().strip()

    # Exact match trước
    if name_lower in NODE_TO_SECTION_KEY:
        return NODE_TO_SECTION_KEY[name_lower]

    # Partial match
    for key, section in NODE_TO_SECTION_KEY.items():
        if key in name_lower or name_lower in key:
            return section

    # Keyword heuristic
    if any(kw in name_lower for kw in ["khởi", "warm", "mở", "đầu", "hook"]):
        return "khoi_dong"
    if any(kw in name_lower for kw in ["thực hành", "practice", "vận dụng", "bài tập", "kiểm"]):
        return "thuc_hanh"

    return "ly_thuyet"  # fallback mặc định


def build_section_context(
    text: str,
    node_name: str,
    k: int = 5,
) -> str:
    """
    Pipeline hoàn chỉnh: text → chunks → retrieve top-K → join thành context string.

    Args:
        text: Toàn bộ text đã extract từ tài liệu
        node_name: Tên node trong template (vd: "Khởi động", "Core Theory")
        k: Số chunk tối đa đưa vào context

    Returns:
        str: Context string sẵn sàng đưa vào AI prompt
    """
    chunks = semantic_chunk(text)
    section_key = get_section_key_from_node_name(node_name)
    top_chunks = retrieve_top_k(chunks, section_key, k=k)

    if not top_chunks:
        # Fallback: nếu chunking thất bại, cắt cứng text đầu tiên
        return text[:CHUNK_MAX_CHARS * k]

    return "\n\n---\n\n".join(top_chunks)


def get_all_section_contexts(
    text: str,
    node_names: List[str],
    k: int = 5,
) -> Dict[str, str]:
    """
    Tạo context riêng biệt cho từng node trong template.

    Args:
        text: Toàn bộ text tài liệu
        node_names: Danh sách tên node ["Khởi động", "Lý thuyết cốt lõi", "Thực hành"]
        k: Số chunk per node

    Returns:
        Dict[str, str]: { node_name → context_string }
    """
    # Cache chunks để không phải chunk lại nhiều lần
    chunks = semantic_chunk(text)

    contexts: Dict[str, str] = {}
    for node_name in node_names:
        section_key = get_section_key_from_node_name(node_name)
        top_chunks = retrieve_top_k(chunks, section_key, k=k)
        contexts[node_name] = "\n\n---\n\n".join(top_chunks) if top_chunks else text[:CHUNK_MAX_CHARS]

    return contexts
