# Sửa lỗi tạo User Settings

GET `/api/v1/users/me/settings` và PATCH cùng endpoint đều có nhánh tạo `UserSettings` chỉ gán `userId`. Entity dùng `@OneToOne`, `@MapsId` và `@JoinColumn(name = "user_id")`, nên Hibernate cần association `user` để lấy khóa chính. Gán UUID riêng không đáp ứng mapping này và gây `IdentifierGenerationException`, sau đó bị bọc thành lỗi JPA/HTTP 500.

`UserSettingsService` nay quản lý cả đọc/tạo mặc định và cập nhật trong transaction. Service lấy User hợp lệ, tạo settings bằng `.user(user)` và đồng bộ liên kết ngược. Mapping và schema giữ nguyên; không cần SQL sửa dữ liệu. User không tồn tại trả mã nghiệp vụ `USER_NOT_FOUND`.

Cả GET và PATCH khóa ghi trên hàng User trước khi kiểm tra settings. Khóa hàng cha xử lý được cả trường hợp chưa có hàng settings, tránh hai request cùng tạo một khóa `user_id`. PATCH chỉ cập nhật trường khác null, giữ được giá trị `false` và các trường không gửi lên. Mặc định vẫn là fact-check bật, giao diện `light`, ngôn ngữ `vi`.

## Kiểm chứng

`UserSettingsIntegrationTest` chạy Hibernate thật, Spring transactions và H2 ở chế độ PostgreSQL. Test tái hiện lỗi của cách tạo chỉ có UUID rồi xác nhận cách tạo mới thành công, GET tạo mặc định/đọc lại, PATCH lần đầu/cập nhật một phần, user không tồn tại và tám GET/PATCH đồng thời chỉ tạo một hàng. MockMvc kiểm tra thêm HTTP GET/PATCH với controller và service thật; danh tính user được cấp bằng argument resolver test.

Chạy bằng JDK 21: `mvn -f java-backend/pom.xml package`.

Đây là kiểm thử local, không dùng database production, JWT thật hay PostgreSQL server. Sau deploy có thể xác nhận qua tài khoản chưa có settings: mở trang cài đặt, thay đổi theme/fact-check và tải lại. Báo cáo log được cung cấp xác nhận nhóm lỗi MapsId; chưa có đủ bằng chứng để kết luận nguồn của tần suất request lặp lại hoặc toàn bộ hệ thống không còn lỗi khác.
