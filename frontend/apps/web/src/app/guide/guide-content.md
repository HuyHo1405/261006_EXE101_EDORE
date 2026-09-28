## 1. Overview (Tổng quan Hệ thống EDORE)

Chào mừng bạn đến với **EDORE** - Nền tảng Hỗ trợ Giáo viên Chuẩn bị Kịch bản Giảng dạy Thông minh. EDORE được thiết kế để giải phóng sức lao động của giáo viên khỏi việc soạn giáo án truyền thống, thay vào đó là một quy trình tự động, trực quan và mạnh mẽ.

Với EDORE, giáo viên sẽ đi qua một luồng duy nhất: **Tạo thông tin khóa học** -> **Tải lên tài liệu giảng dạy (Upload)** -> **AI tự động sinh kịch bản** -> **Giáo viên tinh chỉnh kịch bản trên giao diện Studio trực quan**.

[IMAGE: Sơ đồ Kiến trúc EDORE | Minh họa luồng đi từ Tải file -> AI Sinh kịch bản -> Tinh chỉnh Timeline | 720x340]

Hệ thống của chúng tôi hoàn toàn dựa trên việc **phân tích tài liệu có sẵn** (PDF, Word, Slide) để trích xuất tri thức, tuyệt đối không yêu cầu giáo viên phải ngồi gõ từng dòng nội dung trực tiếp. Điều này đảm bảo tính nhất quán, nhanh chóng và tận dụng tối đa sức mạnh của AI.

---

## 2. Course & Class Config (Cấu hình Khóa học & Lớp học)

Bước đầu tiên để bắt đầu là thiết lập không gian giảng dạy. Một kịch bản bài giảng tốt không chỉ phụ thuộc vào nội dung, mà còn phụ thuộc vào ngữ cảnh của lớp học vật lý.

**Bước 1: Khởi tạo thông tin cơ bản**
Giáo viên bắt đầu bằng việc đặt tên cho khóa học (Ví dụ: "Toán Đại số 10"), mã khóa học, và một đoạn mô tả ngắn gọn về mục tiêu của khóa học này.

**Bước 2: Xác định ngữ cảnh lớp học (Class Config)**
Đây là bước quan trọng để AI hiểu rõ lớp học của bạn. Bạn cần chọn các tham số chuẩn hóa:
* **Thời lượng tiết học (Duration):** 45 phút, 90 phút hoặc 120 phút.
* **Sĩ số (Class Size):** Dưới 20 học sinh, 20-40 học sinh, hay trên 40 học sinh.
* **Không gian (Room Type):** Lớp học tiêu chuẩn, Phòng máy tính, hay Phòng thực hành.
* **Bố trí (Layout):** Ngồi theo nhóm, hay ngồi theo hàng ngang truyền thống.

[IMAGE: Giao diện Form Cấu hình Lớp | Form khai báo tham số vật lý của lớp học (Sĩ số, Thời lượng, Bố trí) | 720x360]

Việc chọn đúng các tham số này giúp AI đưa ra các gợi ý hoạt động phù hợp (ví dụ: lớp đông không nên có quá nhiều hoạt động thuyết trình cá nhân, phòng máy tính thì AI sẽ đề xuất các bài thực hành trên máy).

---

## 3. Tạo Script (Tải Tài Liệu & Xử lý AI)

Đây là "trái tim" của EDORE, nơi phép màu của Trí tuệ nhân tạo xuất hiện. Chúng tôi loại bỏ hoàn toàn việc soạn thảo thủ công.

**Bước 1: Tải lên tài liệu (Upload)**
Thay vì tự gõ nội dung bài giảng, giáo viên chỉ cần tải lên các tài liệu nền tảng như sách giáo khoa (PDF), slide bài giảng có sẵn, hoặc tài liệu tham khảo (Word/TXT). 

[IMAGE: Giao diện Tải lên Tài liệu | Khu vực kéo thả file và chọn Khóa học để bắt đầu xử lý | 720x300]

**Bước 2: AI Phân tích và Sinh kịch bản (AI Generator Workflow)**
Ngay sau khi xác nhận, hệ thống sẽ đưa tác vụ vào hàng đợi (Queue) để AI phân tích. 
* Quá trình này chạy ngầm (bất đồng bộ). 
* Giáo viên sẽ thấy một thanh tiến trình (Progress bar) hiển thị trực quan trạng thái (từ 0% đến 100%).
* AI sẽ bóc tách các khái niệm chính, phân bổ thời gian (dựa trên Class Config) và chia bài học thành các "Node" (Hoạt động) logic.

[IMAGE: Thanh Tiến trình Xử lý AI | Vòng lặp chờ phản hồi từ AI kèm các thông điệp trạng thái sinh động | 720x250]

---

## 4. Edit Script (Tinh chỉnh Kịch bản bằng Studio Timeline)

Sau khi AI hoàn tất, giáo viên không nhận về một khối văn bản nhàm chán, mà là một **Kịch bản dạng Timeline (Dòng thời gian)** có thể tương tác được. 

Đây là công cụ dành cho **Giáo viên biên soạn, sắp xếp lại kịch bản**, phục vụ việc theo dõi và nhảy bước (nhảy từ hoạt động này sang hoạt động khác) trong quá trình đứng lớp, chứ không phải là công cụ để trình chiếu thay cho slide.

**Bước 1: Khám phá Timeline Accordion**
Kịch bản được chia thành các khoảng thời gian (Ví dụ: 0:00 - 5:00: Khởi động, 5:00 - 15:00: Giảng khái niệm mới). Mỗi khoảng thời gian là một khối (Accordion) có thể mở ra để xem chi tiết.

[IMAGE: Giao diện Studio Timeline | Các khối Accordion chứa từng bước giảng dạy xếp dọc theo thời gian | 720x400]

**Bước 2: Tinh chỉnh Chi tiết (Trình soạn thảo phong phú)**
Bên trong mỗi khối, giáo viên có một trình soạn thảo phong phú (Rich Text) tương tự như Notion.
* Giáo viên có thể định dạng lại text (in đậm, in nghiêng, gạch đầu dòng).
* Chỉnh sửa lại lời thoại gợi ý mà AI đã chuẩn bị.
* Thay đổi thời lượng của từng bước nếu thấy không hợp lý.

**Bước 3: Sidebar Gợi ý Hoạt động Sư phạm (Pedagogy Hints)**
Ở cột bên phải, hệ thống cung cấp một Sidebar thông minh. Dựa trên nội dung của block hiện tại, hệ thống sẽ đề xuất các "Hoạt động sư phạm" (Ví dụ: "Hãy đặt câu hỏi mở", "Cho học sinh thảo luận nhóm 2 phút"). Giáo viên có thể kéo thả hoặc click để áp dụng ngay vào kịch bản.

[IMAGE: Sidebar Gợi ý Hoạt động | Trình soạn thảo chi tiết kết hợp với thanh gợi ý hoạt động bên phải | 720x380]

---
