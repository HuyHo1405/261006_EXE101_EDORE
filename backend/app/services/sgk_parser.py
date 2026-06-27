"""
sgk_parser.py — Structure-aware parser cho SGK Lịch Sử (Fixed version)
 
Thay thế semantic_chunk() mù quáng bằng parse thông minh theo cấu trúc:
    BÀI X: TÊN BÀI
    ├── Lời dẫn                  → loai = loi_dan
    ├── I. MỤC LỚN
    │   ├── Câu hỏi thảo luận    → loai = cau_hoi
    │   ├── Ví dụ / Em có biết   → loai = vi_du
    │   └── Nội dung chính       → loai = kien_thuc_chinh
    └── LUYỆN TẬP – VẬN DỤNG    → loai = luyen_tap
 
Key fix so với version cũ:
    - Pre-process inject \n trước heading (handle text 1 dòng từ PDF words mode)
    - BAI_PATTERN extract ten_bai đúng (stop tại ? không lấy cả đoạn sau)
    - Thêm detect Khái niệm, Ý nghĩa → kien_thuc_chinh
"""
 
import re
from typing import List, Dict, Any, Optional
 
# ─── Constants ────────────────────────────────────────────────────────────────
 
LOAI_KIEN_THUC_CHINH = "kien_thuc_chinh"
LOAI_CAU_HOI         = "cau_hoi"
LOAI_VI_DU           = "vi_du"
LOAI_LUYEN_TAP       = "luyen_tap"
LOAI_LOI_DAN         = "loi_dan"
 
MAX_BUFFER_CHARS = 800
MIN_CHUNK_CHARS  = 30
 
# ─── Patterns ─────────────────────────────────────────────────────────────────
 
# BÀI 1: LỊCH SỬ LÀ GÌ? → (1, "LỊCH SỬ LÀ GÌ?")
# Stop tại dấu ? để không lấy "Học xong bài này..."
_BAI_PATTERN = re.compile(
    r'^(?:BÀI|Bài)\s+(\d+)\s*[:\.\-–]\s*([^?!]+[?!]?)',
    re.UNICODE,
)
 
# I. LỊCH SỬ VÀ MÔN LỊCH SỬ → ("I", "LỊCH SỬ VÀ MÔN LỊCH SỬ")
_MUC_PATTERN = re.compile(r'^([IVXivx]{1,5})\.\s+(.+)$')
 
# ─── Keyword banks ────────────────────────────────────────────────────────────
 
_CAU_HOI_KEYWORDS    = ["câu hỏi thảo luận", "em hãy", "hãy nêu", "hãy cho biết"]
_LUYEN_TAP_KEYWORDS  = ["luyện tập", "vận dụng", "phần luyện tập", "phần vận dụng"]
_VI_DU_KEYWORDS      = ["ví dụ", "em có biết", "chú thích"]
_KIEN_THUC_KEYWORDS  = ["khái niệm:", "ý nghĩa của việc học", "các nguồn sử liệu:"]
_SKIP_KEYWORDS       = ["mục tiêu", "yêu cầu cần đạt", "kiến thức:", "năng lực:",
                         "phẩm chất:", "sau khi học xong", "học xong bài này"]
 
# ─── Pre-process ─────────────────────────────────────────────────────────────
# Tất cả structural markers phải bắt đầu dòng riêng.
# Dùng lookahead inject \n TRƯỚC marker — không phụ thuộc ký tự kết thúc (?, ., !)

_MARKER_RE = re.compile(
    r'(?:'
    r'(?:BÀI|Bài)\s+\d+\s*[:\.\-–]'                       # BÀI X:
    r'|(?<!\w)[IVX]{1,5}\.\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ]' # I. II. III.
    r'|Câu\s+hỏi\s+thảo\s+luận'                            # Câu hỏi thảo luận
    r'|LUYỆN\s+TẬP'                                         # LUYỆN TẬP (hoa)
    r'|Luyện\s+tập'                                         # Luyện tập
    r'|Vận\s+dụng'                                          # Vận dụng
    r'|Lời\s+dẫn'                                           # Lời dẫn
    r'|Em\s+có\s+biết'                                      # Em có biết
    r'|Ví\s+dụ\s*:'                                         # Ví dụ:
    r'|Khái\s+niệm\s*:'                                     # Khái niệm:
    r'|Ý\s+nghĩa\s+của\s+việc\s+học'                       # Ý nghĩa của việc học
    r'|Các\s+nguồn\s+sử\s+liệu\s*:'                        # Các nguồn sử liệu:
    r')',
    re.UNICODE,
)

# Pattern xóa phần mục tiêu học tập — không cần embed
_MUC_TIEU_RE = re.compile(
    r'(?:Học\s+xong\s+bài\s+này|em\s+sẽ\s*:|yêu\s+cầu\s+cần\s+đạt)'
    r'.{0,3000}?'
    r'(?=Lời\s+dẫn|[IVX]{1,5}\.\s+[A-ZÀÁÂÃ]|BÀI\s+\d|\Z)',
    re.DOTALL | re.IGNORECASE,
)


def _preprocess(text: str) -> str:
    """
    Chuẩn hóa text SGK để state machine hoạt động đúng với mọi loại PDF.

    Chiến lược:
    1. Bỏ bullet chars OCR (●•…)
    2. Xóa phần mục tiêu học tập (Học xong bài này... em sẽ:...)
    3. Inject \\n trước mỗi structural marker bằng lookahead — không đoán ký tự kết thúc
    4. Dọn blank lines thừa
    """
    # 1. Bỏ ký tự bullet từ OCR
    text = text.replace('●', '').replace('•', '').replace('…', '...')

    # 2. Xóa phần mục tiêu (không cần embed)
    text = _MUC_TIEU_RE.sub('', text)

    # 3. Inject \n trước mỗi marker (dù đang ở giữa dòng hay đầu dòng)
    #    Sub: thay mỗi match bằng \n + match → đảm bảo marker luôn ở đầu dòng mới
    text = _MARKER_RE.sub(lambda m: '\n' + m.group(), text)

    # 4. Dọn blank lines thừa (3+ \n → 2 \n)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()
 
 
# ─── Helpers ──────────────────────────────────────────────────────────────────
 
def _extract_keywords(text: str, max_kw: int = 10) -> List[str]:
    words = re.findall(r'\b[\w]{4,}\b', text.lower(), re.UNICODE)
    seen: set = set()
    kws: List[str] = []
    for w in words:
        if w not in seen:
            seen.add(w)
            kws.append(w)
        if len(kws) >= max_kw:
            break
    return kws
 
 
def _build_prefix(bai_so, ten_bai, muc, ten_muc, loai) -> str:
    parts = []
    if bai_so is not None:
        parts.append(f"Bài {bai_so}" + (f" - {ten_bai}" if ten_bai else ""))
    if muc and ten_muc:
        parts.append(f"Mục {muc}: {ten_muc}")
    elif muc:
        parts.append(f"Mục {muc}")
    label = {
        LOAI_KIEN_THUC_CHINH: "Kiến thức chính",
        LOAI_CAU_HOI:         "Câu hỏi thảo luận",
        LOAI_VI_DU:           "Ví dụ minh họa",
        LOAI_LUYEN_TAP:       "Luyện tập – Vận dụng",
        LOAI_LOI_DAN:         "Lời dẫn",
    }.get(loai, "")
    if label:
        parts.append(label)
    return " | ".join(parts)
 
 
def _make_chunk(buffer, lop, bai_so, ten_bai, muc, ten_muc, loai):
    body = " ".join(buffer).strip()
    if len(body) < MIN_CHUNK_CHARS:
        return None
    prefix = _build_prefix(bai_so, ten_bai, muc, ten_muc, loai)
    content = f"{prefix}\n{body}" if prefix else body
    return {
        "content":  content,
        "lop":      lop,
        "bai_so":   bai_so,
        "ten_bai":  ten_bai,
        "muc":      muc,
        "ten_muc":  ten_muc,
        "loai":     loai,
        "tu_khoa":  _extract_keywords(body),
    }
 
 
def _detect_loai(line: str) -> Optional[str]:
    lower = line.lower()
    for kw in _LUYEN_TAP_KEYWORDS:
        if kw in lower: return LOAI_LUYEN_TAP
    for kw in _CAU_HOI_KEYWORDS:
        if kw in lower: return LOAI_CAU_HOI
    for kw in _KIEN_THUC_KEYWORDS:
        if kw in lower: return LOAI_KIEN_THUC_CHINH
    for kw in _VI_DU_KEYWORDS:
        if kw in lower: return LOAI_VI_DU
    return None
 
 
def _should_skip(line: str) -> bool:
    lower = line.lower()
    for kw in _SKIP_KEYWORDS:
        if kw in lower: return True
    if len(line) < 4: return True
    if re.fullmatch(r'\d+', line.strip()): return True
    return False
 
 
# ─── Main Parser ──────────────────────────────────────────────────────────────
 
def parse_sgk_chunks(text: str, lop: int = 0) -> List[Dict[str, Any]]:
    """
    Parse text SGK Lịch Sử thành danh sách chunks có cấu trúc.
 
    Hoạt động đúng với cả 2 dạng text:
        - Text có newline tự nhiên (get_text() default)
        - Text 1 dòng liên tục (get_text("words") mode)
    """
    # ── Step 1: Pre-process — đảm bảo heading luôn đầu dòng ─────────────────
    # Loại bỏ ký tự bullet từ OCR (●, •, …) để tránh nhiễu RegEx
    text = text.replace('●', '').replace('•', '').replace('…', '...')
    text = _preprocess(text)
 
    chunks: List[Dict[str, Any]] = []
    bai_so = ten_bai = muc = ten_muc = None
    loai   = LOAI_LOI_DAN
    buffer: List[str] = []
 
    def flush(override_loai=None):
        nonlocal buffer
        chunk = _make_chunk(
            buffer, lop, bai_so, ten_bai, muc, ten_muc,
            override_loai if override_loai is not None else loai,
        )
        if chunk:
            chunks.append(chunk)
        buffer = []
 
    # ── Step 2: State machine ─────────────────────────────────────────────────
    for raw_line in text.split("\n"):
        line = raw_line.strip()
        if not line:
            continue
 
        # Detect BÀI mới
        bai_m = _BAI_PATTERN.match(line)
        if bai_m:
            flush()
            bai_so  = int(bai_m.group(1))
            raw_ten = bai_m.group(2).strip()
            # Stop tại "Học xong" và các phrase mục tiêu
            ten_bai = re.split(r'\s+(?:Học\s+xong|Em\s+sẽ|Sau\s+khi)', raw_ten)[0].strip().rstrip(".")
            muc = ten_muc = None
            loai = LOAI_LOI_DAN
            continue
 
        # Detect MỤC lớn (I. II. III.)
        muc_m = _MUC_PATTERN.match(line)
        if muc_m:
            flush()
            muc     = muc_m.group(1).upper()
            ten_muc = muc_m.group(2).strip().rstrip(".")
            loai    = LOAI_KIEN_THUC_CHINH
            continue
 
        # Skip metadata
        if _should_skip(line):
            continue
 
        # Detect đổi loại
        new_loai = _detect_loai(line)
        if new_loai is not None and new_loai != loai:
            flush()
            loai = new_loai
            # Dòng là content (Khái niệm:...) → add vào buffer luôn
            if new_loai == LOAI_KIEN_THUC_CHINH:
                buffer.append(line)
            continue
 
        buffer.append(line)
 
        # Auto-flush khi buffer quá lớn
        if sum(len(s) for s in buffer) > MAX_BUFFER_CHARS:
            flush()
 
    flush()
 
    # Fallback
    if not chunks and text.strip():
        fallback = _make_chunk(
            [text.strip()], lop, bai_so, ten_bai, muc, ten_muc, LOAI_LOI_DAN
        )
        if fallback:
            chunks.append(fallback)
 
    return chunks
 
 
def build_qdrant_filter_payload(
    lop=None, bai_so=None, loai=None, source=None,
) -> Dict[str, Any]:
    payload = {}
    if lop is not None:      payload["lop"] = lop
    if bai_so is not None:   payload["bai_so"] = bai_so
    if loai is not None:     payload["loai"] = loai
    if source is not None:   payload["source_filter"] = source
    return payload