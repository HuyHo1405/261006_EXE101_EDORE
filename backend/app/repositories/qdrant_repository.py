"""
qdrant_repository.py — Low-level Qdrant client wrapper.

Chứa tất cả raw calls đến Qdrant REST API qua qdrant-client.
QdrantService dùng layer này để không bị tied vào qdrant-client internals.

Payload indexes:
    Sau khi tạo collection, tự động tạo indexes trên:
        - source    (keyword) — filter theo document
        - lop       (integer) — filter theo lớp học
        - bai_so    (integer) — filter theo số bài
        - loai      (keyword) — filter theo loại chunk
    Giúp Qdrant filter chính xác O(1) thay vì scan toàn collection.
"""

from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    PayloadSchemaType,
)
from flask import current_app


def _get_client() -> QdrantClient:
    """Tạo Qdrant client từ Flask app config."""
    host = current_app.config.get('QDRANT_HOST', 'localhost')
    port = current_app.config.get('QDRANT_PORT', 6333)
    return QdrantClient(host=host, port=port)


def _build_filter(
    source_filter: Optional[str] = None,
    lop: Optional[int] = None,
    bai_so: Optional[int] = None,
    loai: Optional[str] = None,
) -> Optional[Filter]:
    """
    Xây dựng Qdrant Filter từ các tham số metadata.
    Tất cả điều kiện được kết hợp bằng AND (must).
    """
    conditions = []

    if source_filter:
        conditions.append(FieldCondition(key="source", match=MatchValue(value=source_filter)))
    if lop is not None:
        conditions.append(FieldCondition(key="lop", match=MatchValue(value=lop)))
    if bai_so is not None:
        conditions.append(FieldCondition(key="bai_so", match=MatchValue(value=bai_so)))
    if loai is not None:
        conditions.append(FieldCondition(key="loai", match=MatchValue(value=loai)))

    if not conditions:
        return None
    return Filter(must=conditions)


class QdrantRepository:

    # Các field cần tạo payload index để filter nhanh
    _PAYLOAD_INDEXES = {
        "source":  PayloadSchemaType.KEYWORD,
        "lop":     PayloadSchemaType.INTEGER,
        "bai_so":  PayloadSchemaType.INTEGER,
        "loai":    PayloadSchemaType.KEYWORD,
        "ten_bai": PayloadSchemaType.KEYWORD,
        "muc":     PayloadSchemaType.KEYWORD,
    }

    # ── Collection Management ─────────────────────────────────────────────────

    @staticmethod
    def ensure_collection(collection: str, vector_size: int) -> bool:
        """
        Tạo collection nếu chưa tồn tại và đảm bảo payload indexes tồn tại.
        Returns True nếu tạo mới, False nếu đã tồn tại.
        """
        client = _get_client()
        existing = [c.name for c in client.get_collections().collections]
        created = False

        if collection not in existing:
            client.create_collection(
                collection_name=collection,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE,
                ),
            )
            created = True
            print(f"[QdrantRepository] Created collection '{collection}' (vector_size={vector_size})")

        # Luôn ensure payload indexes (idempotent — Qdrant bỏ qua nếu đã có)
        QdrantRepository._ensure_payload_indexes(client, collection)

        return created

    @staticmethod
    def _ensure_payload_indexes(client: QdrantClient, collection: str) -> None:
        """
        Tạo payload indexes cho các field filter.
        Chạy idempotent — nếu index đã tồn tại Qdrant sẽ bỏ qua.

        Mục đích: filter theo lop + bai_so + loai sẽ chạy O(log N) thay vì O(N).
        """
        for field_name, field_schema in QdrantRepository._PAYLOAD_INDEXES.items():
            try:
                client.create_payload_index(
                    collection_name=collection,
                    field_name=field_name,
                    field_schema=field_schema,
                    wait=True,
                )
            except Exception:
                # Index đã tồn tại hoặc lỗi minor — bỏ qua
                pass

    @staticmethod
    def list_collections() -> List[str]:
        client = _get_client()
        return [c.name for c in client.get_collections().collections]

    @staticmethod
    def get_collection_info(collection: str) -> Optional[Dict[str, Any]]:
        """Trả về thông tin collection (số điểm, vector size, ...)."""
        client = _get_client()
        try:
            info = client.get_collection(collection)
            return {
                "name":         collection,
                "points_count": info.points_count,
                "vector_size":  info.config.params.vectors.size,
                "distance":     str(info.config.params.vectors.distance),
                "status":       str(info.status),
            }
        except Exception:
            return None

    # ── Write ─────────────────────────────────────────────────────────────────

    @staticmethod
    def upsert_points(collection: str, points: List[PointStruct]) -> int:
        """Upsert danh sách điểm vào collection. Returns số điểm đã upsert."""
        client = _get_client()
        client.upsert(collection_name=collection, points=points, wait=True)
        return len(points)

    @staticmethod
    def delete_by_source(collection: str, source_name: str) -> int:
        """
        Xóa tất cả điểm có payload.source == source_name.
        Returns số điểm đã xóa.
        """
        client = _get_client()
        source_filter = Filter(
            must=[FieldCondition(key="source", match=MatchValue(value=source_name))]
        )
        count_result = client.count(collection_name=collection, count_filter=source_filter, exact=True)
        count = count_result.count

        client.delete(
            collection_name=collection,
            points_selector=source_filter,
            wait=True,
        )
        return count

    # ── Read ──────────────────────────────────────────────────────────────────

    @staticmethod
    def search_points(
        collection: str,
        query_vector: List[float],
        limit: int = 5,
        source_filter: Optional[str] = None,
        lop: Optional[int] = None,
        bai_so: Optional[int] = None,
        loai: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Vector search trong collection với metadata filter đầy đủ.

        Filter: lop + bai_so + loai được apply trước khi ANN search
        → chỉ tìm trong đúng bài cần, không bao giờ retrieve nhầm bài.

        Args:
            source_filter: Filter theo tên document (payload.source)
            lop:           Filter theo lớp học (6, 7, 8, ...)
            bai_so:        Filter theo số bài (chính xác tuyệt đối)
            loai:          Filter theo loại chunk:
                           kien_thuc_chinh | cau_hoi | vi_du | luyen_tap | loi_dan

        Returns:
            list dict: { score, payload }
        """
        client = _get_client()

        search_filter = _build_filter(
            source_filter=source_filter,
            lop=lop,
            bai_so=bai_so,
            loai=loai,
        )

        response = client.query_points(
            collection_name=collection,
            query=query_vector,
            limit=limit,
            query_filter=search_filter,
            with_payload=True,
        )
        results = response.points

        return [
            {
                "score":   hit.score,
                "payload": hit.payload,
            }
            for hit in results
        ]

    @staticmethod
    def count_by_source(collection: str, source_name: str) -> int:
        """Đếm số điểm theo source."""
        client = _get_client()
        source_filter = Filter(
            must=[FieldCondition(key="source", match=MatchValue(value=source_name))]
        )
        result = client.count(collection_name=collection, count_filter=source_filter, exact=True)
        return result.count

    @staticmethod
    def get_bai_list(collection: str, lop: int, source: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Lấy danh sách các bài đã index cho một lớp cụ thể.

        Returns:
            List[{ bai_so, ten_bai }] — đã dedup và sắp xếp theo bai_so
        """
        client = _get_client()
        conditions = [FieldCondition(key="lop", match=MatchValue(value=lop))]
        if source:
            conditions.append(FieldCondition(key="source", match=MatchValue(value=source)))

        # Scroll để lấy sample points (không cần vector)
        results, _ = client.scroll(
            collection_name=collection,
            scroll_filter=Filter(must=conditions),
            limit=500,
            with_payload=["bai_so", "ten_bai"],
            with_vectors=False,
        )

        seen: set = set()
        bai_list = []
        for point in results:
            bai_so  = point.payload.get("bai_so")
            ten_bai = point.payload.get("ten_bai", "")
            if bai_so is not None and bai_so not in seen:
                seen.add(bai_so)
                bai_list.append({"bai_so": bai_so, "ten_bai": ten_bai})

        return sorted(bai_list, key=lambda x: x["bai_so"])
