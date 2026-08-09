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
from typing import List, Dict, Any, Tuple


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
    "tong_ket": [
        "tổng kết", "kết luận", "rút ra", "ghi nhớ", "bài học rút ra",
        "ôn lại", "nhìn lại", "điểm chính", "takeaway", "wrap up",
        "định hướng", "tiếp theo", "mở rộng", "củng cố", "nhắc lại",
        "tóm tắt", "đánh giá cuối", "reflection",
    ],
    "danh_gia": [
        "đánh giá", "kiểm tra", "assessment", "quiz", "test",
        "phản hồi", "feedback", "nhận xét", "rubric", "tiêu chí",
        "kết quả", "đầu ra", "output", "thành phẩm",
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
    # Tổng kết
    "tổng kết": "tong_ket",
    "tổng kết & định hướng": "tong_ket",
    "wrap up": "tong_ket",
    "kết bài": "tong_ket",
    # Đánh giá
    "đánh giá cuối buổi": "danh_gia",
    "kiểm tra đầu ra": "danh_gia",
}

# Kích thước chunk tối ưu (ký tự) — tương đương 300–500 token
CHUNK_MIN_CHARS = 200
CHUNK_MAX_CHARS = 3000
CHUNK_TARGET_CHARS = 1500
CHUNK_OVERLAP_SENTENCES = 2  # số câu overlap giữa các chunks để không mất ngữ cảnh

# Pattern Regex nhận diện mốc thời gian, ngày tháng, sự kiện lịch sử (cả tiếng Việt lẫn tiếng Anh)
TEMPORAL_PATTERNS = {
    "Specific_Date": re.compile(
        r"(?i)(?:ngày\s+)?\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b"
    ),
    "Year_BCE_CE": re.compile(
        r"(?i)(?:năm\s+)?\b\d{1,4}\s*(?:TCN|SCN|trước Công nguyên|Công nguyên)?\b"
    ),
    "Century": re.compile(
        r"(?i)thế kỉ?\s+[IVXLCDM]+|thế kỉ? thứ [IVXLCDM]+"
    ),
    "Time_Unit": re.compile(
        r"(?i)\b(thập kỉ|thế kỉ|thiên niên kỉ|trước Công nguyên|Công nguyên)\b"
    ),
    "Calendar_Type": re.compile(
        r"(?i)\b(âm lịch|dương lịch|công lịch)\b"
    ),
    "Year_Range": re.compile(
        r"\b\d{3,4}\s*[-–]\s*\d{3,4}\b"
    ),
    "Named_Date_VN": re.compile(
        r"(?i)ngày\s+\d{1,2}\s+tháng\s+\d{1,2}(?:\s+năm\s+\d{2,4})?"
    ),
}


def _has_temporal_marker(text: str) -> bool:
    """Kiểm tra xem một đoạn text có chứa mốc thời gian/ngày tháng không."""
    for pattern in TEMPORAL_PATTERNS.values():
        if pattern.search(text):
            return True
    return False


def extract_key_facts(text: str) -> str:
    """
    Trích xuất toàn bộ các mốc thời gian, sự kiện lịch sử từ tài liệu để tạo Key Facts Anchor.

    Key Facts Anchor là một block text nhỏ (~300-800 ký tự) chứa toàn bộ
    các mốc thời gian, ngày tháng, năm có trong tài liệu gốc. Block này sẽ được
    gắn vào đầu mọi prompt gửi lên API để AI không bao giờ bỏ sót mốc nào.

    Args:
        text: Toàn bộ văn bản tài liệu gốc

    Returns:
        str: Key facts anchor block
    """
    if not text or not text.strip():
        return ""

    sentences = re.split(r'(?<=[.!?\n])\s+|\n', text)
    anchor_lines = []
    seen = set()

    for sent in sentences:
        sent = sent.strip()
        if not sent or len(sent) < 5:
            continue
        if _has_temporal_marker(sent):
            key = sent[:80].lower()  # dedup key
            if key not in seen:
                seen.add(key)
                anchor_lines.append(f"- {sent}")

    if not anchor_lines:
        return ""

    anchor_block = "KEY FACTS (CÁC MỐC THỜI GIAN VÀ SỰ KIỆN QUAN TRỌNG TỪ TÀI LIỆU GỐC):\n"
    anchor_block += "\n".join(anchor_lines[:60])  # tối đa 60 dòng để giữ nhỏ gọn
    return anchor_block


def event_boundary_chunk(text: str) -> List[str]:
    """
    Chunking nâng cao dành cho tài liệu lịch sử/sự kiện.

    Các đảm bảo quan trọng:
    1. Không bao giờ cắt đƴi một câu chứa mốc thời gian ra khỏi ngữ cảnh xung quanh nó.
    2. Thêm CHUNK_OVERLAP_SENTENCES câu overlap giữa các chunk liền kề để không mất ngữ cảnh.
    3. Mọi chunk đều ≤ CHUNK_MAX_CHARS (3000 ký tự ~ an toàn với firewall).

    Args:
        text: Toàn bộ văn bản

    Returns:
        List[str]: Danh sách các chunks đã cắt an toàn, không bỏ sót mốc sự kiện
    """
    if not text or not text.strip():
        return []

    # Bước 1: Chia theo heading (ranh giới ngữ nghĩa mạnh nhất)
    heading_pattern = re.compile(r'(?m)^(?=#{1,3}\s)', re.MULTILINE)
    sections = heading_pattern.split(text)

    all_sentences: List[str] = []
    for section in sections:
        section = section.strip()
        if not section:
            continue
        # Bước 2: Tách thành các câu riêng lẻ (giữ nguyên).
        # Dùng lookahead để không mất dấu chấm
        sents = re.split(r'(?<=[.!?])\s+|(?<=\n)\n', section)
        all_sentences.extend([s.strip() for s in sents if s.strip()])

    if not all_sentences:
        return [text[:CHUNK_MAX_CHARS]]

    # Bước 3: Xây dựng chunks với Event-Boundary Protection
    chunks: List[str] = []
    current_sents: List[str] = []
    current_len = 0

    def flush_chunk():
        """Lưu chunk hiện tại vào danh sách."""
        if current_sents:
            chunks.append(" ".join(current_sents))

    for i, sent in enumerate(all_sentences):
        sent_len = len(sent)
        has_anchor = _has_temporal_marker(sent)

        # Nếu thêm câu này sẽ vượt giới hạn chunk
        if current_len + sent_len + 1 > CHUNK_MAX_CHARS and current_sents:
            # --- Bảo vệ ranh giới sự kiện ---
            # Nếu câu hiện tại chứa mốc thời gian, hãy kéo thêm vào chunk hiện tại
            # (chấp nhận vượt nhẹ giới hạn một chút để giữ nguyên sự kiện)
            if has_anchor and current_len + sent_len + 1 <= CHUNK_MAX_CHARS * 1.3:
                current_sents.append(sent)
                current_len += sent_len + 1
                continue

            # Kết thúc chunk hiện tại
            flush_chunk()

            # Overlap: mang CHUNK_OVERLAP_SENTENCES câu cuối của chunk cũ sang chunk mới
            overlap = current_sents[-CHUNK_OVERLAP_SENTENCES:] if len(current_sents) >= CHUNK_OVERLAP_SENTENCES else current_sents[:]
            current_sents = overlap[:]
            current_len = sum(len(s) + 1 for s in current_sents)

        current_sents.append(sent)
        current_len += sent_len + 1

    flush_chunk()

    # Bước 4: Lọc bỏ chunk quá ngắn
    return [c for c in chunks if len(c) >= CHUNK_MIN_CHARS]


def semantic_chunk(text: str) -> List[str]:
    """
    Chia text theo ranh giới ngữ nghĩa (giữ nguyên backward-compat):
    - Gọi event_boundary_chunk để tự động sử dụng logic mới (có overlap, có bảo vệ mốc thời gian).
    """
    return event_boundary_chunk(text)


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
    exclude_indices: set = None,
    return_indices: bool = False,
    node_index: int = 0,
    total_nodes: int = 3,
) -> Any:
    """
    Với mỗi section của template, tìm top-K chunks liên quan nhất.

    Args:
        chunks: Danh sách chunk đã được semantic_chunk() tạo ra
        section_key: Key trong SECTION_QUERY_HINTS ("khoi_dong" / "ly_thuyet" / "thuc_hanh" / "tong_ket" / "danh_gia")
        k: Số chunk trả về tối đa
        extra_query_terms: Query terms bổ sung từ node name cụ thể
        exclude_indices: Tập hợp các index chunk đã sử dụng để tránh trùng lặp
        return_indices: Nếu True, trả về tuple (selected_chunks, selected_indices)
        node_index: Vị trí của node hiện tại trong tiến trình (0-based)
        total_nodes: Tổng số nodes trong kịch bản

    Returns:
        List[str] hoặc Tuple[List[str], List[int]]
    """
    if not chunks:
        if return_indices:
            return [], []
        return []

    if exclude_indices is None:
        exclude_indices = set()

    # Tính toán chỉ số fallback tuần tự dựa trên vị trí của node trong tiến trình
    num_chunks = len(chunks)
    center = int(num_chunks * (node_index + 0.5) / total_nodes)
    start = max(0, center - k // 2)
    end = min(num_chunks, start + k)
    if end == num_chunks:
        start = max(0, end - k)
    sequential_fallback_indices = list(range(start, end))

    # Lấy query hints cho section này
    base_hints = SECTION_QUERY_HINTS.get(section_key, [])
    all_query_terms = base_hints + (extra_query_terms or [])
    query_tokens = _tokenize(" ".join(all_query_terms))

    if not query_tokens:
        selected = [chunks[i] for i in sequential_fallback_indices]
        if return_indices:
            return selected, sequential_fallback_indices
        return selected

    # Tokenize toàn bộ corpus
    corpus_tokens = [_tokenize(chunk) for chunk in chunks]

    # Tính IDF trên toàn bộ corpus + query
    full_corpus = corpus_tokens + [query_tokens]
    idf = _compute_idf(full_corpus)

    # Score từng chunk, với Anchor Boost: chunk chứa mốc thời gian được nhân đôi điểm
    ANCHOR_BOOST = 2.0
    scored = [
        (
            i,
            _tfidf_score(query_tokens, doc_tokens, idf)
            * (ANCHOR_BOOST if _has_temporal_marker(chunks[i]) else 1.0)
        )
        for i, doc_tokens in enumerate(corpus_tokens)
    ]

    # Sắp xếp giảm dần theo score
    scored.sort(key=lambda x: x[1], reverse=True)

    # Lọc ra các indices score > 0 (không dùng exclude_indices nữa để tránh tranh chấp/thiếu thông tin)
    available_scored = [(i, score) for i, score in scored if score > 0]

    top_k_indices = [i for i, score in available_scored[:k]]

    # Nếu không có chunk nào khớp có score > 0 → fallback lấy k chunk theo tuần tự
    if not top_k_indices:
        top_k_indices = sequential_fallback_indices

    # Giữ nguyên thứ tự xuất hiện trong document (context coherence)
    top_k_indices.sort()
    selected_chunks = [chunks[i] for i in top_k_indices]

    if return_indices:
        return selected_chunks, top_k_indices
    return selected_chunks


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
    if any(kw in name_lower for kw in ["tổng kết", "kết luận", "wrap up", "kết bài", "reflection"]):
        return "tong_ket"
    if any(kw in name_lower for kw in ["đánh giá", "kiểm tra", "assessment", "quiz", "test", "feedback"]):
        return "danh_gia"
    if any(kw in name_lower for kw in ["thực hành", "practice", "vận dụng", "bài tập"]):
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
    nodes: List[Any] = None,
    k: int = 5,
    node_names: List[str] = None,
) -> Dict[str, str]:
    """
    Tạo context riêng biệt cho từng node trong template với phân chia thông minh.

    Args:
        text: Toàn bộ text tài liệu
        nodes: Danh sách các nodes (mỗi phần tử có thể là dict có 'node_type'/'node_name' và 'goal', hoặc string)
        k: Số chunk per node
        node_names: Backward compatible list of node names

    Returns:
        Dict[str, str]: { node_name/node_type → context_string }
    """
    target_nodes = nodes if nodes is not None else node_names
    if not target_nodes:
        return {}

    chunks = semantic_chunk(text)
    contexts: Dict[str, str] = {}
    total_nodes = len(target_nodes)

    for idx, item in enumerate(target_nodes):
        if isinstance(item, dict):
            node_name = item.get("node_type", item.get("node_name", ""))
            goal = item.get("goal", "")
        else:
            node_name = str(item)
            goal = ""

        goal_terms = _tokenize(goal) if goal else None
        section_key = get_section_key_from_node_name(node_name)

        # Lấy top chunks mà không dùng exclusion list để tránh Starvation (thiếu thông tin)
        top_chunks, top_indices = retrieve_top_k(
            chunks=chunks,
            section_key=section_key,
            k=k,
            extra_query_terms=goal_terms,
            exclude_indices=None,
            return_indices=True,
            node_index=idx,
            total_nodes=total_nodes,
        )

        contexts[node_name] = "\n\n---\n\n".join(top_chunks) if top_chunks else text[:CHUNK_MAX_CHARS]

    return contexts


def extract_outline(text: str) -> str:
    """Trích headings H1-H3 thành outline ngắn gọn."""
    if not text:
        return ""
    lines = text.split("\n")
    headings = [l.strip() for l in lines if re.match(r'^#{1,3}\s', l.strip())]
    return "\n".join(headings[:20])  # tối đa 20 headings
