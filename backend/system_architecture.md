# Backend System Architecture & Database Design

Tài liệu này mô tả chi tiết kiến trúc hệ thống, cấu trúc thư mục, các dịch vụ (services) AI, thực thể dữ liệu (entities/db), và thiết kế luồng xử lý của backend **Expert Pedagogical Architect**.

---

## 1. Cấu trúc thư mục (Directory Structure)

```
backend/
├── app/
│   ├── models/
│   │   └── template_store.py       # Entity & In-memory Store cho Lesson Templates
│   ├── routes/
│   │   ├── ai.py                  # API đồng bộ (Extract, Map, Enrich)
│   │   ├── general.py             # Health check endpoint
│   │   ├── stream.py              # ⚡ SSE Streaming Pipeline
│   │   └── templates.py           # CRUD API quản lý Lesson Templates
│   ├── services/
│   │   ├── chunking_service.py    # Phân mảnh tài liệu ngữ nghĩa (Semantic Chunking)
│   │   ├── faithfulness_service.py# Kiểm tra mức độ trung thực của bài học so với tài liệu gốc
│   │   └── openrouter_service.py  # Giao tiếp API LLM qua cổng OpenRouter
│   ├── config.py                  # Cấu hình môi trường (API Key, Server configs)
│   └── __init__.py                # Khởi tạo Flask OpenAPI ứng dụng
├── run.py                         # File chạy server chính
├── requirements.txt               # Dependencies
└── system_architecture.md         # [File này]
```

---

## 2. Kiến trúc Hệ thống (System Architecture)

Hệ thống được thiết kế theo mô hình **RESTful API** kết hợp **Server-Sent Events (SSE)** để stream dữ liệu thời gian thực cho Client. 

### Sơ đồ luồng xử lý kịch bản bài học (SSE Flow):
```
[Client] ---> POST /api/ai/pedagogy/stream (File + Template ID)
  |
  +---> 1. Trích xuất Text (PDF/MD/TXT) 📄
  +---> 2. Semantic Chunking & Nhận diện phân đoạn ✂️
  +---> 3. Gọi AI ánh xạ kiến thức gốc sang Template (Mapping) 🗺️
  |         * Trả Event: event: mapped_nodes (Cấu trúc sơ bộ bài học)
  +---> 4. Gọi song song (Threaded) OpenAI/LLM tạo chi tiết hoạt động cho từng Node ⚡
  |         * Trả Event: event: section (Nội dung chi tiết từng Node khi xong)
  +---> 5. Trả Event cuối cùng: event: done (Hoàn thành kịch bản)
```

---

## 3. Thực thể & Cơ sở dữ liệu (Entities & Database Design)

Hiện tại hệ thống sử dụng một lớp in-memory store (**`TemplateStore`**) được thiết kế dạng Interface cô lập để dễ dàng nâng cấp lên SQLAlchemy ORM (SQLite / PostgreSQL) sau này mà không cần sửa đổi API Routes.

### LessonTemplate Schema

```json
{
  "id": "string (Unique slugified ID)",
  "name": "string (Tên template)",
  "description": "string (Mô tả ưu điểm & ngữ cảnh)",
  "tags": ["string (Nhãn phân loại)"],
  "suitable_for": {
    "duration_min": "int (Thời lượng tối thiểu phù hợp)",
    "duration_max": "int (Thời lượng tối đa phù hợp)",
    "bloom_levels": ["string (Mức độ Bloom tương thích: NB, TH, VD, PT)"],
    "student_count_min": "int",
    "student_count_max": "int"
  },
  "nodes": [
    {
      "node_type": "string (Tên loại node: Khởi động, Lý thuyết, Thực hành...)",
      "goal": "string (Mục tiêu sư phạm)",
      "suggested_duration_pct": "float (Tỷ lệ phân bổ thời gian, tổng = 1.0)"
    }
  ],
  "rag_activities": [
    "string (Danh sách đề xuất phương pháp/hoạt động dạy học dự phòng cho template này)"
  ],
  "created_at": "ISO-8601 Timestamp"
}
```

---

## 4. Mô tả các Services Chính (Core Services)

### 4.1. `openrouter_service.py`
Chịu trách nhiệm tương tác trực tiếp với API của **OpenRouter** hỗ trợ thiết lập JSON Schema để ép định dạng LLM sinh ra chính xác:
* `map_knowledge_to_template(...)`: Chuyển đổi dữ liệu thô ban đầu thành cấu trúc node sơ bộ của kịch bản giảng dạy.
* `enrich_single_node(...)`: Đắp nội dung hoạt động chi tiết (Hoạt động giáo viên, Hoạt động học sinh, Gợi ý thiết bị, Rủi ro sư phạm).

### 4.2. `chunking_service.py`
Cung cấp giải pháp xử lý tài liệu lớn, tránh tràn Context Window của LLM:
* `semantic_chunk(...)`: Chia tài liệu dựa trên ranh giới ngữ nghĩa bằng cách đo khoảng cách tương quan của nội dung (văn bản/câu).
* `get_all_section_contexts(...)`: Lấy ra các đoạn ngữ cảnh (Top-K chunks tương quan) khớp với mục tiêu của từng node trong bài học.

### 4.3. `faithfulness_service.py`
Dịch vụ kiểm tra và đánh giá mức độ trung thực của bài học:
* Kiểm định chéo xem các phần kiến thức do LLM sinh ra có bị hư cấu (hallucination) hay bị lệch chuẩn so với tài liệu học tập gốc được upload hay không.

---

## 5. Cơ chế RAG (Retrieval-Augmented Generation)

Hệ thống tích hợp quy trình **RAG nội bộ (Local RAG)** để tối ưu hóa context đưa vào LLM, tránh việc gửi toàn bộ tài liệu thô dẫn đến vượt quá giới hạn token (Context Window) hoặc làm nhiễu thông tin phản hồi của mô hình.

```
[File Tài Liệu] ── Trích xuất ──> [Văn bản thô]
                                         │
                                 Semantic Chunking
                                         │
                                         ▼
                               [Danh sách Chunks]
                                         │
                        ┌────────────────┴────────────────┐
                        ▼                                 ▼
             [Tìm Chunks tương quan]              [Toàn bộ văn bản]
             (get_all_section_contexts)                   │
                        │                                 │
             (Top-K Chunks theo Node)                     │
                        │                                 │
                        ▼                                 ▼
            [Phần 3: Parallel Enrich]           [Phần 2: Knowledge Mapping]
```

### Chi tiết luồng RAG:
1. **Phân đoạn ngữ nghĩa (Semantic Chunking)**:
   * Tài liệu tải lên được cắt nhỏ một cách thông minh bằng `chunking_service.py` dựa trên sự thay đổi ngữ nghĩa giữa các câu, đảm bảo các ý liên quan được giữ trong cùng một chunk.
2. **Truy vấn thông tin (Retrieval)**:
   * Hàm `get_all_section_contexts` thực hiện quét danh sách các Chunks và so khớp từ khóa/ngữ nghĩa của từng Node mục tiêu (ví dụ: tìm các phần liên quan đến lý thuyết để đắp vào node "Lý thuyết cốt lõi").
   * Chọn ra **Top-K chunks tương thích nhất** cho từng phân đoạn bài học cụ thể.
3. **Thúc đẩy thế hệ (Generation - Prompt Enrichment)**:
   * Khi gọi API song song ở bước Enrich, thay vì gửi full tài liệu, hệ thống chỉ đính kèm các Chunks đã truy vấn này vào prompt (`section_context`). LLM sử dụng ngữ cảnh cô đọng này để thiết kế các hoạt động chi tiết mà không bị hallucinate.

---

## 6. Danh sách các API Endpoints

### 6.1. Templates CRUD API (`/api/templates`)
* `GET /api/templates`: Danh sách các mẫu bài học (Hỗ trợ lọc tự động theo query params: `duration`, `bloom`, `student_count`).
* `GET /api/templates/<template_id>`: Xem chi tiết một template.
* `POST /api/templates`: Tạo mới mẫu bài học.
* `PUT /api/templates/<template_id>`: Cập nhật mẫu bài học.
* `DELETE /api/templates/<template_id>`: Xóa mẫu bài học.

### 6.2. AI Processing API (`/api/ai`)
* `POST /api/ai/pedagogy/extract`: Tách text thuần túy từ file PDF/TXT/MD.
* `POST /api/ai/pedagogy/map`: Ánh xạ kiến thức sang template bài học.
* `POST /api/ai/pedagogy/enrich`: Làm phong phú hoạt động dạy học.
* `POST /api/ai/pedagogy/stream`: ⚡ SSE Pipeline chính của Playground. Nhận File tài liệu kèm `template_id` để sinh kịch bản streaming thời gian thực.
