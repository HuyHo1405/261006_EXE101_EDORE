import os
import sys
import requests

# Đảm bảo terminal Windows hiển thị UTF-8 đúng
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')


BASE_URL = "http://127.0.0.1:5000"

def test_health():
    print("\n--- Kiểm tra Health Check Endpoint ---")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response JSON: {response.json()}")
    except Exception as e:
        print(f"Lỗi khi kiểm tra health: {e}")

def test_extract():
    print("\n--- Kiểm tra Tính năng 1: Trích xuất văn bản từ file (Không dùng AI) ---")
    # Tạo một file text tạm thời bằng tiếng Việt
    temp_filename = "temp_bai_hoc.txt"
    with open(temp_filename, "w", encoding="utf-8") as f:
        f.write(
            "Quang hợp là quá trình cây xanh sử dụng ánh sáng mặt trời, "
            "khí CO₂ và nước để tạo ra glucose và oxy.\n"
            "Quá trình này diễn ra trong lục lạp, nơi chứa chất diệp lục "
            "(chlorophyll) giúp hấp thụ ánh sáng.\n"
            "Quang hợp gồm hai giai đoạn chính: Phản ứng sáng (tạo ATP và NADPH, "
            "giải phóng O₂) và Chu trình Calvin (dùng ATP/NADPH để cố định CO₂ thành glucose)."
        )
    
    try:
        with open(temp_filename, "rb") as f:
            files = {"file": (temp_filename, f, "text/plain")}
            response = requests.post(f"{BASE_URL}/api/ai/pedagogy/extract", files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response JSON: {response.json()}")
    except Exception as e:
        print(f"Lỗi khi kiểm tra extract: {e}")
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

def test_map():
    print("\n--- Kiểm tra Tính năng 2: Ánh xạ kiến thức vào mẫu bài học (AI) ---")
    payload = {
        "extracted_knowledge": (
            "Quang hợp là quá trình cây xanh sử dụng ánh sáng mặt trời, CO₂ và nước "
            "để tạo ra glucose và oxy. Quá trình này diễn ra trong lục lạp với hai giai đoạn: "
            "Phản ứng sáng (tạo ATP và NADPH, giải phóng O₂) và Chu trình Calvin "
            "(cố định CO₂ thành glucose)."
        ),
        "system_template": (
            "Nút 1: Khởi động (Kích hoạt kiến thức nền), "
            "Nút 2: Lý thuyết cốt lõi (Trình bày nội dung chính), "
            "Nút 3: Thực hành (Vận dụng kiến thức)"
        )
    }
    try:
        response = requests.post(f"{BASE_URL}/api/ai/pedagogy/map", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response JSON: {response.json()}")
    except Exception as e:
        print(f"Lỗi khi kiểm tra map: {e}")

def test_enrich():
    print("\n--- Kiểm tra Tính năng 3: Làm giàu hoạt động học tập (AI) ---")
    payload = {
        "mapped_nodes": [
            {
                "node_name": "Nút 1: Khởi động",
                "node_intent": "Kích hoạt kiến thức nền về cây xanh và ánh sáng mặt trời",
                "mapped_knowledge": ["Cây xanh cần ánh sáng mặt trời để sống và tạo ra thức ăn"]
            },
            {
                "node_name": "Nút 2: Lý thuyết cốt lõi",
                "node_intent": "Giải thích cơ chế quang hợp và hai giai đoạn của nó",
                "mapped_knowledge": [
                    "Quang hợp diễn ra trong lục lạp nhờ chất diệp lục",
                    "Phản ứng sáng: tạo ATP, NADPH và giải phóng O₂",
                    "Chu trình Calvin: cố định CO₂ thành glucose"
                ]
            }
        ],
        "rag_activities": [
            "Phương pháp A: Nhập vai (học sinh đóng vai các phân tử như photon, CO₂, glucose để mô phỏng quá trình)",
            "Phương pháp B: Sơ đồ tư duy tiếp sức (các nhóm xây dựng sơ đồ nối các khái niệm, đầu vào và đầu ra)",
            "Phương pháp C: Thử thách phát hiện lỗi (học sinh tìm lỗi sai trong đoạn mô tả)"
        ]
    }
    try:
        response = requests.post(f"{BASE_URL}/api/ai/pedagogy/enrich", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response JSON: {response.json()}")
    except Exception as e:
        print(f"Lỗi khi kiểm tra enrich: {e}")

if __name__ == "__main__":
    print("Đảm bảo server đang chạy (`python run.py`) và OPENROUTER_API_KEY đã được cấu hình trong .env.")
    test_health()
    test_extract()
    test_map()
    test_enrich()

