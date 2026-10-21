# Sửa vòng lặp tải profile và refresh phiên

Trang `/dashboard/profile` trước đây chạy effect theo toàn bộ đối tượng `authUser`. Sau khi tải subscription, effect gọi `updatePlan`, luôn tạo đối tượng user mới dù plan không đổi. Điều này kích hoạt effect lần nữa, lặp sáu API và liên tục bật loading. Đây là vấn đề frontend độc lập với lỗi `UserSettings` thiếu association đã sửa ở backend.

Effect nay chạy theo `userId`, bỏ qua phản hồi cũ sau khi unmount/đổi user; `updatePlan` giữ nguyên state khi plan không thay đổi.

Đoạn log được người dùng cung cấp ngày 22/10 ghi nhận JWT hết hạn, không có lỗi MapsId trong mẫu này. Backend refresh xoay cả access token và refresh token, nhưng frontend cũ chỉ lưu access token mới; nhiều API đồng thời cũng có thể refresh cạnh tranh. Fetcher nay dùng chung một promise refresh trong một tab, lưu cả hai token, dùng lại access token mới khi nhận 401 trễ và chỉ retry một lần. Phản hồi cũ không khôi phục phiên sau logout hoặc retry request dưới tài khoản khác. Các tab trình duyệt khác nhau chưa chia sẻ khóa refresh.

`authSession.test.cjs` kiểm tra component profile với React và store Zustand thật, dùng API mô phỏng. Các ca gồm plan không đổi, thay plan/thông tin cùng user không gọi lại API, đổi user tải lại; sáu request cùng hết hạn chỉ refresh một lần; refresh lần tiếp theo dùng token đã xoay; 401 trễ; refresh thất bại; logout/đổi tài khoản; access token mới vẫn bị từ chối. CI chạy toàn bộ file `apps/web/tests/*.test.cjs`.

Kiểm chứng local: `node --test apps/web/tests/*.test.cjs` và `npm run type-check` từ thư mục `frontend`. Chưa kiểm tra bằng phiên đăng nhập production. Nếu trình duyệt đang giữ refresh token đã bị backend thay thế từ trước bản sửa, cần đăng nhập lại một lần sau deploy.
