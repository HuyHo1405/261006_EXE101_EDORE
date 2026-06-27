"""
qdrant_service.py — Business logic cho Qdrant Vector DB.

Chịu trách nhiệm:
- Embedding texts bằng sentence-transformers (offline, ~120MB lần đầu tải)
- Index PDF SGK vào Qdrant dùng SGK-aware parser (parse_sgk_chunks)
- Search semantic với metadata filter (lop, bai_so, loai)
- Delete document theo source name

Chunking strategy:
    SGK-aware parse (sgk_parser.py):
        BÀI X → MỤC I/II/III → loai (kien_thuc_chinh | cau_hoi | vi_du | luyen_tap | loi_dan)
    Mỗi chunk có đầy đủ metadata để filter chính xác:
        lop + bai_so + loai → không bao giờ retrieve nhầm bài.
"""

import uuid
from typing import List, Dict, Any, Optional

from flask import current_app
from qdrant_client.models import PointStruct

from app.repositories.qdrant_repository import QdrantRepository


# ─── Embedding Model (Lazy Singleton) ────────────────────────────────────────
_embedding_model = None


def _get_embedding_model():
    """
    Lazy-load sentence-transformers model.
    Lần đầu: tải ~120MB về ~/.cache/huggingface/hub/.
    Các lần sau: load từ cache, nhanh.
    """
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        model_name = current_app.config.get('EMBEDDING_MODEL', 'paraphrase-multilingual-MiniLM-L12-v2')
        _embedding_model = SentenceTransformer(model_name)
    return _embedding_model


# ─── QdrantService ────────────────────────────────────────────────────────────

class QdrantService:

    VECTOR_SIZE = 384  # paraphrase-multilingual-MiniLM-L12-v2 output dim

    # ── Embedding ─────────────────────────────────────────────────────────────

    @staticmethod
    def embed_texts(texts: List[str]) -> List[List[float]]:
        """Embed danh sách texts thành vectors. Returns list of float vectors (dim=384)."""
        model = _get_embedding_model()
        embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    @staticmethod
    def embed_query(query: str) -> List[float]:
        """Embed một câu query đơn."""
        return QdrantService.embed_texts([query])[0]

    # ── Index ─────────────────────────────────────────────────────────────────

    @staticmethod
    def index_pdf(
        file,
        source_name: str,
        lop: int = 0,
        collection: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Pipeline: PDF → extract text → SGK-aware parse → embed → upsert vào Qdrant.

        Chunking strategy (SGK-aware):
            - parse_sgk_chunks() chia text theo cấu trúc BÀI/MỤC/loại
            - Mỗi chunk mang metadata đầy đủ: lop, bai_so, ten_bai, muc, loai
            - Payload indexes đã được tạo sẵn → filter O(log N)

        Args:
            file:        File-like object (đã có .filename)
            source_name: Tên định danh document, ví dụ "sgk_ls_6"
            lop:         Lớp học (6, 7, 8, ...) để gắn vào metadata filter
            collection:  Tên collection (mặc định từ config)
            metadata:    Metadata bổ sung (vd: {"subject": "history"})

        Returns:
            dict: { success, chunks_indexed, source, collection, bai_count,
                    loai_breakdown }
        """
        from app.services.ai_service import AIService
        from app.services.sgk_parser import parse_sgk_chunks

        collection = collection or current_app.config.get('QDRANT_COLLECTION', 'history_textbook')
        metadata = metadata or {}

        # 1. Extract text
        text, err = AIService.extract_text_from_file(file)
        if err:
            return {"success": False, "error": err}
        if not text:
            return {"success": False, "error": "Không trích xuất được text từ file."}

        # DEBUG: hiển thị stats text để chẩn đoán parse issues
        lines = [l for l in text.split('\n') if l.strip()]
        avg_len = sum(len(l) for l in lines) / max(len(lines), 1)
        print(f"[QdrantService] Extracted {len(text)} chars, {len(lines)} lines, avg_line_len={avg_len:.1f}")
        print(f"[QdrantService] Text preview (500 chars):\n{text[:500]}\n---")

        # 2. SGK-aware parse — thay thế semantic_chunk mù quáng
        chunks = parse_sgk_chunks(text, lop=lop)
        if not chunks:
            return {"success": False, "error": "Không tạo được chunks từ nội dung file."}

        print(f"[QdrantService] Parsed {len(chunks)} chunks từ '{source_name}' (lop={lop})")

        # Log breakdown theo loai để debug
        from collections import Counter
        loai_counts = Counter(c.get("loai") for c in chunks)
        print(f"[QdrantService] Loai breakdown: {dict(loai_counts)}")
        for i, c in enumerate(chunks):
            print(f"  Chunk {i+1}: bai={c.get('bai_so')} muc={c.get('muc')} loai={c.get('loai')} len={len(c.get('content',''))}")

        # 3. Ensure collection tồn tại + payload indexes
        QdrantRepository.ensure_collection(collection, QdrantService.VECTOR_SIZE)

        # 4. Embed tất cả chunks (batch theo nội dung text)
        contents = [c["content"] for c in chunks]
        vectors = QdrantService.embed_texts(contents)

        # 5. Build PointStructs với đầy đủ metadata SGK
        points = []
        bai_set: set = set()
        for chunk, vector in zip(chunks, vectors):
            bai_set.add(chunk.get("bai_so"))
            payload = {
                "source":   source_name,
                "lop":      chunk.get("lop", lop),
                "bai_so":   chunk.get("bai_so"),
                "ten_bai":  chunk.get("ten_bai"),
                "muc":      chunk.get("muc"),
                "ten_muc":  chunk.get("ten_muc"),
                "loai":     chunk.get("loai"),
                "tu_khoa":  chunk.get("tu_khoa", []),
                "text":     chunk["content"],
                **metadata,
            }
            points.append(PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload=payload,
            ))

        # 6. Upsert (batch 100 points)
        BATCH_SIZE = 100
        total_upserted = 0
        for batch_start in range(0, len(points), BATCH_SIZE):
            batch = points[batch_start:batch_start + BATCH_SIZE]
            QdrantRepository.upsert_points(collection, batch)
            total_upserted += len(batch)
            print(f"[QdrantService] Upserted {total_upserted}/{len(points)} chunks...")

        return {
            "success":        True,
            "source":         source_name,
            "collection":     collection,
            "chunks_indexed": total_upserted,
            "bai_count":      len([b for b in bai_set if b is not None]),
            "loai_breakdown": dict(loai_counts),
        }

    # ── Search ────────────────────────────────────────────────────────────────

    @staticmethod
    def search(
        query: str,
        collection: Optional[str] = None,
        top_k: int = 5,
        source_filter: Optional[str] = None,
        lop: Optional[int] = None,
        bai_so: Optional[int] = None,
        loai: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Semantic search với metadata filter chính xác.

        Khi GV chọn bài + lớp:
            → filter lop + bai_so + loai → chỉ search trong đúng bài đó
            → không bao giờ retrieve nhầm bài khác

        Args:
            query:         Câu truy vấn tiếng Việt
            collection:    Qdrant collection name
            top_k:         Số kết quả tối đa
            source_filter: Filter theo tên document
            lop:           Filter theo lớp (6, 7, 8, ...)
            bai_so:        Filter theo số bài
            loai:          Filter theo loại chunk (kien_thuc_chinh | cau_hoi | ...)

        Returns:
            List[{ score, text, source, lop, bai_so, ten_bai, muc, loai, ... }]
        """
        collection = collection or current_app.config.get('QDRANT_COLLECTION', 'history_textbook')
        query_vector = QdrantService.embed_query(query)

        raw_results = QdrantRepository.search_points(
            collection=collection,
            query_vector=query_vector,
            limit=top_k,
            source_filter=source_filter,
            lop=lop,
            bai_so=bai_so,
            loai=loai,
        )

        return [
            {
                "score": r["score"],
                **r["payload"],
            }
            for r in raw_results
        ]

    @staticmethod
    def get_context_for_bai(
        query: str,
        lop: int,
        bai_so: int,
        collection: Optional[str] = None,
        top_k: int = 5,
        loai_priority: Optional[List[str]] = None,
    ) -> str:
        """
        Retrieve context tối ưu cho một bài cụ thể.
        Dùng khi GV tạo giáo án cho Bài X lớp Y.

        Strategy:
            1. Nếu loai_priority được truyền → lấy từng loai theo thứ tự ưu tiên
            2. Nếu không → lấy top_k chunks tốt nhất trong bài (không filter loai)
            3. Join thành context string với separator

        Args:
            query:          Câu truy vấn (mục tiêu bài học, section name, ...)
            lop:            Lớp học
            bai_so:         Số bài cụ thể
            collection:     Qdrant collection
            top_k:          Số chunk tối đa
            loai_priority:  Ví dụ ["kien_thuc_chinh", "vi_du", "cau_hoi"]
                            → lấy lần lượt mỗi loai 2 chunk

        Returns:
            str: Context string sẵn sàng đưa vào AI prompt
        """
        collection = collection or current_app.config.get('QDRANT_COLLECTION', 'history_textbook')

        if loai_priority:
            # Lấy theo từng loai để đảm bảo diversity
            chunks_per_loai = max(1, top_k // len(loai_priority))
            all_results = []
            for loai in loai_priority:
                results = QdrantService.search(
                    query=query,
                    collection=collection,
                    top_k=chunks_per_loai,
                    lop=lop,
                    bai_so=bai_so,
                    loai=loai,
                )
                all_results.extend(results)
        else:
            # Không filter loai → lấy best-match chunks trong bài
            all_results = QdrantService.search(
                query=query,
                collection=collection,
                top_k=top_k,
                lop=lop,
                bai_so=bai_so,
            )

        if not all_results:
            return ""

        # Sắp xếp lại theo score và join
        all_results.sort(key=lambda x: x.get("score", 0), reverse=True)
        texts = [r.get("text", "") for r in all_results if r.get("text")]
        return "\n\n---\n\n".join(texts)

    # ── Lookup ────────────────────────────────────────────────────────────────

    @staticmethod
    def get_bai_list(lop: int, collection: Optional[str] = None, source: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Trả về danh sách bài đã index cho lớp cụ thể.

        Returns:
            List[{ bai_so, ten_bai }]
        """
        collection = collection or current_app.config.get('QDRANT_COLLECTION', 'history_textbook')
        return QdrantRepository.get_bai_list(collection, lop, source)

    # ── Delete ────────────────────────────────────────────────────────────────

    @staticmethod
    def delete_document(source_name: str, collection: Optional[str] = None) -> Dict[str, Any]:
        """Xóa tất cả chunks của một document theo source_name."""
        collection = collection or current_app.config.get('QDRANT_COLLECTION', 'history_textbook')
        deleted = QdrantRepository.delete_by_source(collection, source_name)
        return {
            "success":       True,
            "deleted_count": deleted,
            "source":        source_name,
            "collection":    collection,
        }

    # ── Stats ─────────────────────────────────────────────────────────────────

    @staticmethod
    def get_collection_info(collection: Optional[str] = None) -> Optional[Dict[str, Any]]:
        collection = collection or current_app.config.get('QDRANT_COLLECTION', 'history_textbook')
        return QdrantRepository.get_collection_info(collection)

    @staticmethod
    def list_collections() -> List[str]:
        return QdrantRepository.list_collections()
