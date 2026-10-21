# Ngân hàng câu hỏi và xuất Kahoot

## Thay đổi

- Cả API tạo giáo án trực tiếp và tác vụ tạo nền đều bỏ `LUYEN_TAP` khỏi prompt và bộ phân tích phản hồi AI.
- Sau khi AI trả các phần còn lại, hệ thống gắn câu hỏi `PRACTICE` có `lesson_code` khớp chính xác bài được chọn, giữ đúng thứ tự node của template.
- Hiện lấy toàn bộ câu `PRACTICE` của bài, sắp theo mã câu hỏi. Giáo viên có thể sửa, xóa hoặc thêm câu trước khi lưu/xuất. Chưa áp dụng chọn ngẫu nhiên hoặc giới hạn số câu theo thời lượng.
- Nếu chưa có dữ liệu cho bài, node Luyện tập rỗng và cho phép thêm thủ công.
- Câu hỏi `WARM_UP` được nhập vào ngân hàng nhưng không gắn vào node Luyện tập. Luồng AI Khởi động giữ nguyên.
- Node Luyện tập từ ngân hàng không tham gia lượt kiểm chứng AI tự động sau khi tạo giáo án.
- Nút `Xuất CSV` được thay bằng `Xuất Word toàn bộ bài học`. File Word chứa tổng quan, đủ các phần giáo án hiện đang mở, nội dung chi tiết, ghi chú của giáo viên và bộ câu hỏi nguyên văn ở cuối, gồm lựa chọn, đáp án, lời giải và câu tự luận nếu có. Không dùng bản rút gọn Kahoot để xuất Word.
- Mẫu Word A4 dùng logo EDORE, font Arial, lề trái/phải 2,2 cm, tên bài căn giữa, đoạn văn căn đều hai lề và số trang ở chân trang. Phần lớn đánh số La Mã bằng danh sách Word, đơn vị kiến thức đánh số Ả Rập và bắt đầu lại trong từng phần. Nhãn nhỏ gộp vào đầu đoạn để tránh chia vụn nội dung.
- Bảng màu pastel: xanh phấn cho tiêu đề và thương hiệu, tím dịu cho đề mục/nhãn, nền mint nhạt cho ý chính và nền kem đào cho mốc thời gian. Chữ nội dung dùng xám đậm để dễ đọc, không dùng vàng chói. Không gọi AI để viết lại hay cắt ngắn nội dung khi xuất Word. Danh sách tư liệu hình ảnh gồm chú thích và đường dẫn, không tự tải ảnh từ bên ngoài.
- Các giáo án đã lưu trước đây giữ nguyên. Tạo giáo án mới để sử dụng câu hỏi từ ngân hàng.

## Nhập dữ liệu

Script leader gửi dùng đường dẫn cố định trên máy khác và tạo lại UUID bài học mỗi lần chạy. Với database đã có bài học, dùng script mới để chỉ nhập câu hỏi, tránh tạo lại bài học/chương.

1. Cài `openpyxl` trong Python dùng để chạy script (`python -m pip install openpyxl`).
2. Tại thư mục gốc repository:

```powershell
python scripts/import_lesson_questions.py 'E:\EXE2\Tổng hợp data.updated.xlsx'
```

Script đọc sheet `lesson_questions`, kiểm tra ID trùng, đáp án đúng, lựa chọn bắt buộc, thời gian, nhãn giai đoạn và độ khó trước khi ghi SQL. Không kết nối database, không sửa file Excel nguồn.

Đã tạo sẵn `java-backend/lesson-questions-generated.sql` từ file được cung cấp: 783 câu, gồm 543 `PRACTICE` và 240 `WARM_UP`.

3. Bật PostgreSQL của môi trường local. Database cần có dữ liệu bài học, ví dụ dữ liệu `lesson_metadata` từ bộ SQL bài học hiện tại. Chạy SQL bằng công cụ quản trị database hoặc `psql`:

```powershell
psql -h localhost -U edore -d edore -v ON_ERROR_STOP=1 -f java-backend/lesson-questions-generated.sql
```

Thay host/user/database theo cấu hình môi trường. SQL tự tạo bảng câu hỏi nếu chưa có, kiểm tra mỗi mã bài khớp đúng một bài học, rồi upsert theo `question_id` trong một transaction. Chạy lại cập nhật câu cùng ID; không tự xóa câu cũ không còn trong Excel. Nếu bài học thiếu/trùng mã, transaction dừng và không nhập một phần.

4. Chạy backend với JDK 21, frontend như bình thường, tạo giáo án mới từ bài lớp 6 có câu hỏi.

## Sử dụng và kiểm tra

Trong phần Luyện tập:

1. Kiểm tra câu hỏi và các lựa chọn A–D, chọn đáp án đúng bằng nút radio. Chỉnh thời gian nếu cần.
2. Xem/sửa lời giải; thêm hoặc xóa câu hỏi theo nhu cầu. Các chỉnh sửa nội dung node hiện giữ trong phiên trang đang mở.
3. `Xuất Word toàn bộ bài học` tải toàn bộ giáo án hiện trên giao diện, bao gồm các chỉnh sửa trong phiên, thay vì chỉ xuất các câu hỏi của node Luyện tập. Câu hỏi/đáp án dài hơn giới hạn Kahoot vẫn được xuất đầy đủ.
4. `Xuất Excel cho Kahoot` mở bản dành riêng cho Kahoot với số ký tự của từng trường. Bấm `AI rút gọn các câu dài theo quy tắc Kahoot` để xử lý các câu quá dài theo nhóm tối đa 5 câu. Prompt yêu cầu câu hỏi ≤120 ký tự, lựa chọn ≤75 ký tự, giữ ý nghĩa, phủ định, mốc thời gian và thứ tự đáp án. Server kiểm tra lại JSON và độ dài, thử lại một lần nếu sai. Trường vốn đã ngắn, vị trí đáp án đúng, ô lựa chọn trống và thời gian được giữ bằng code.
5. Đối chiếu bản gốc trong mỗi câu, chỉnh sửa bản rút gọn hoặc bỏ chọn câu không muốn đưa vào Kahoot. Kiểm tra độ dài không chứng minh được ý nghĩa tương đương, vì vậy cần duyệt lại nội dung. Đánh dấu đã kiểm tra rồi bấm `Tải Excel và giữ bản Kahoot`.
6. Bản thử giữ bản đã duyệt trong trình duyệt (`localStorage`), theo đường dẫn giáo án và nội dung gốc. Trong trang đang mở, bản này cũng nằm ở `node_payload.kahoot_export`. Trang hiện chưa có API lưu nội dung node nên bản này chưa ghi vào database/ngân hàng dùng chung và chưa đồng bộ sang thiết bị khác. Nếu câu hỏi gốc, đáp án đúng hoặc thời gian thay đổi, bản đã lưu không được dùng lại. Bộ câu hỏi gốc và bản Word giữ nguyên.
7. Vào Kahoot: Add question → Import → Import spreadsheet, chọn file `.xlsx`.

Bản Excel giới hạn mỗi lần xuất tối đa 200 câu, câu hỏi 120 ký tự và mỗi đáp án 75 ký tự. Word giữ nguyên cả câu hỏi/đáp án dài hơn giới hạn này và hỗ trợ cả câu tự luận. Bản Kahoot cần ít nhất hai lựa chọn và đáp án đúng hợp lệ; thời gian là 5, 10, 20, 30, 60 hoặc 120 giây. Trong bản Kahoot, trường vượt giới hạn hiện số ký tự màu đỏ. Không cắt lấy đầu chuỗi để ép độ dài. Câu tự luận của giáo án cũ cần chuyển thành trắc nghiệm trước khi xuất Kahoot.

Trong dữ liệu nguồn có 191 câu `PRACTICE` vượt ít nhất một giới hạn độ dài của Kahoot. Các câu này vẫn dùng và xuất Word bình thường; cần rút gọn câu hỏi/lựa chọn trước khi xuất Excel nhập Kahoot. Câu hỏi thuộc 20 bài `LS6_KNTT_B01` đến `LS6_KNTT_B20`; các mã này đều có trong bộ SQL bài học hiện có.

Quy cách và template: https://support.kahoot.com/hc/en-us/articles/115002812547

## Kiểm tra tự động

Xuất Word trên sidebar có ba nút: **Xuất Word bài giảng** gọi `POST /api/v1/lessons/export-docx/lesson`, **Word câu hỏi — Học sinh** gọi `/export-docx/questions/student` và **Word câu hỏi — Giáo viên** gọi `/export-docx/questions/teacher` (cùng tiền tố `/api/v1/lessons`). File bài giảng chứa nội dung và tiến trình dạy học. Bản học sinh chứa câu hỏi và lựa chọn gốc, không kèm đáp án hay giải thích, có họ tên/lớp và dòng “Đáp án của bạn là:” dưới từng câu; câu tự luận thêm hai dòng trống. Backend loại bỏ toàn bộ trường đáp án trước khi dựng bản học sinh. Bản giáo viên giữ đáp án và giải thích đầy đủ. Cả ba giữ logo EDORE và mẫu pastel, lấy dữ liệu hiện tại gồm các chỉnh sửa chưa lưu trên UI, không gọi AI để viết lại và không áp dụng giới hạn Kahoot. Hai nút câu hỏi bị vô hiệu khi chưa có câu hỏi. Endpoint `/export-docx` cũ và `/export-docx/questions` (bản giáo viên) vẫn giữ để tương thích.

```powershell
# Dùng JDK 21
mvn -f java-backend/pom.xml test

Set-Location frontend
npm run type-check --workspace=@edore/web
node --test apps/web/tests/kahootExport.test.cjs apps/web/tests/lessonDocument.test.cjs
```

Test bao phủ loại node Luyện tập khỏi prompt/parser ở cả hai đường tạo giáo án; ghép lại thứ tự; đáp án và lời giải từ ngân hàng; bài chưa có câu; cấu trúc template Excel; từ chối dữ liệu không hợp lệ; CSV tiếng Việt, escape và giới hạn độ dài.

Test tối ưu Kahoot dùng phản hồi AI mô phỏng: bảo toàn trường đã ngắn và đáp án đúng/thời gian, không thêm lựa chọn vào ô trống, xử lý phản hồi đảo thứ tự index, từ chối JSON sai/thiếu câu/trùng lựa chọn/vượt giới hạn, thử lại khi phản hồi sai, bỏ qua AI khi mọi câu đã ngắn. Frontend kiểm tra lại phản hồi và bỏ bản lưu khi nguồn thay đổi. Local chưa cấu hình khóa AI nên chưa gọi thử dịch vụ AI thật; cần kiểm tra chất lượng rút gọn trên môi trường đã cấu hình API.

## Triển khai production

CI chạy type-check toàn frontend, các test CSV và test backend trước khi cho phép deploy. Script `scripts/ec2-deploy.sh` chờ PostgreSQL sẵn sàng, nạp SQL câu hỏi trong transaction, rồi build/chạy backend và kiểm tra health. Vì vậy không cần nhập SQL thủ công trên production. Nếu production chưa có đủ 20 mã bài học hoặc có mã trùng, bước nhập sẽ báo lỗi và dừng trước khi thay backend.

Chưa kiểm thử đăng nhập/tạo giáo án với dịch vụ thật hoặc nhập trực tiếp lên tài khoản Kahoot. Docker local chưa chạy ở thời điểm thực hiện nên chưa áp dụng SQL vào database.
