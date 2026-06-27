"""
index_sgk.py — Script chạy 1 lần để nạp PDF SGK vào Qdrant.

Usage:
    python scripts/index_sgk.py --pdf path/to/sgk_lich_su_7.pdf --source sgk_ls_7
    python scripts/index_sgk.py --pdf path/to/sgk_ls_8.pdf --source sgk_ls_8 --grade 8

Options:
    --pdf       (required) Đường dẫn đến file PDF
    --source    (required) Tên định danh document trong Qdrant (vd: sgk_ls_7)
    --collection         Qdrant collection name (mặc định: history_textbook)
    --grade              Lớp học (metadata)
    --subject            Môn học (mặc định: Lịch sử)
    --qdrant-host        Qdrant host (mặc định: localhost)
    --qdrant-port        Qdrant port (mặc định: 6333)
    --model              Embedding model (mặc định: paraphrase-multilingual-MiniLM-L12-v2)

Lưu ý:
    - Lần đầu chạy: model embedding sẽ được tải về (~120MB)
    - Các lần sau: load từ cache, nhanh
    - Script phải chạy từ thư mục backend/
"""

import argparse
import sys
import os

# Đảm bảo có thể import từ backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def main():
    parser = argparse.ArgumentParser(
        description="Index PDF SGK vào Qdrant vector database"
    )
    parser.add_argument('--pdf', required=True, help="Đường dẫn đến file PDF")
    parser.add_argument('--source', required=True, help="Tên định danh document (vd: sgk_ls_7)")
    parser.add_argument('--collection', default='history_textbook', help="Qdrant collection name")
    parser.add_argument('--grade', default=None, help="Lớp học (vd: 7, 8, 9)")
    parser.add_argument('--subject', default='Lịch sử', help="Môn học")
    parser.add_argument('--qdrant-host', default='localhost', help="Qdrant host")
    parser.add_argument('--qdrant-port', type=int, default=6333, help="Qdrant port")
    parser.add_argument('--model', default='paraphrase-multilingual-MiniLM-L12-v2', help="Embedding model")
    args = parser.parse_args()

    # Validate file
    if not os.path.exists(args.pdf):
        print(f"❌ File không tồn tại: {args.pdf}")
        sys.exit(1)

    if not args.pdf.lower().endswith('.pdf'):
        print(f"❌ Chỉ hỗ trợ file PDF. File nhận được: {args.pdf}")
        sys.exit(1)

    print(f"📄 File: {args.pdf}")
    print(f"🏷️  Source: {args.source}")
    print(f"📦 Collection: {args.collection}")
    print(f"🤖 Embedding model: {args.model}")
    print(f"🔌 Qdrant: {args.qdrant_host}:{args.qdrant_port}")
    print()

    # Bootstrap Flask app context (cần để QdrantService dùng current_app.config)
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

    # Override config bằng args
    os.environ['QDRANT_HOST'] = args.qdrant_host
    os.environ['QDRANT_PORT'] = str(args.qdrant_port)
    os.environ['QDRANT_COLLECTION'] = args.collection
    os.environ['EMBEDDING_MODEL'] = args.model

    from app import create_app
    flask_app = create_app()

    with flask_app.app_context():
        from app.services.qdrant_service import QdrantService

        # Build metadata
        metadata = {}
        lop_val = 0
        if args.grade:
            try:
                lop_val = int(args.grade)
            except ValueError:
                pass
            metadata["grade"] = args.grade

        print(f"⏳ Đang extract & chunk PDF...")

        with open(args.pdf, 'rb') as pdf_file:
            # Tạo fake file object
            class _PdfFileWrapper:
                def __init__(self, f, name):
                    self._f = f
                    self.filename = name
                def read(self, n=-1):
                    return self._f.read(n)
                def seek(self, *a):
                    return self._f.seek(*a)
                def tell(self):
                    return self._f.tell()

            wrapped = _PdfFileWrapper(pdf_file, os.path.basename(args.pdf))

            print(f"🧮 Đang embed chunks (lần đầu sẽ tải model ~120MB)...")
            result = QdrantService.index_pdf(
                file=wrapped,
                source_name=args.source,
                lop=lop_val,
                collection=args.collection,
                metadata=metadata,
            )

        if result.get("success"):
            print(f"✅ Index thành công!")
            print(f"   Source: {result['source']}")
            print(f"   Collection: {result['collection']}")
            print(f"   Chunks đã index: {result['chunks_indexed']}")
        else:
            print(f"❌ Lỗi khi index: {result.get('error')}")
            sys.exit(1)


if __name__ == '__main__':
    main()
