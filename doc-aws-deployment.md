# Hướng Dẫn & Checklist Thực Tế Khi Deploy Spring Boot Backend Lên AWS

Tài liệu tổng hợp các kịch bản thực tế, rủi ro hạ tầng và phương án xử lý chuẩn khi đưa ứng dụng **Spring Boot** kết hợp cùng **Frontend Domain chính thức (`https://edore.id.vn`)** lên môi trường **AWS (App Runner / EC2 / ECS / RDS)**.

---

## 📊 Bảng Tổng Quan Kịch Bản Thực Tế (Quick Reference)

| Hạng mục | Vấn đề / Rủi ro thực tế | Nguyên nhân gốc (Root Cause) | Phương án xử lý chuẩn (Best Practice) |
| :--- | :--- | :--- | :--- |
| **1. Swagger UI** | Lỗi Mixed Content `http://` khi gọi trên giao diện HTTPS | Backend chạy đằng sau AWS ALB / Proxy rơi vào HTTP port 8080 | Cấu hình `server.forward-headers-strategy=framework`. Khuyên tắt Swagger trên Production. |
| **2. CORS Policy** | Browser chặn request Preflight `OPTIONS` từ Frontend Domain | Origin Frontend (`https://edore.id.vn`) khác Domain Backend AWS | Thêm `https://edore.id.vn`, `https://*.edore.id.vn` và domain Vercel preview vào `SecurityConfig`. |
| **3. Mail SMTP** | Bị Google block IP / Bị AWS khóa kết nối Port 25 | AWS chặn Outbound Port 25; Google chặn IP Data Center lạ | Dùng **App Password (16 ký tự)**, kết nối qua Port **587 (TLS)** hoặc **465 (SSL)**; về lâu dài dùng AWS SES / Resend. |
| **4. File Upload** | File lưu đĩa cục bộ bị biến mất sau restart / deploy lại | Container / EC2 Instance dùng bộ nhớ tạm thời (**Ephemeral Storage**) | Chuyển toàn bộ luồng Upload lưu trữ trực tiếp sang **Amazon S3** hoặc Cloudinary. |
| **5. Timezone** | Thời gian lưu DB / Validate bị chậm hơn 7 tiếng | OS Linux trên AWS mặc định dùng múi giờ chuẩn UTC (GMT+0) | Cấu hình JVM timezone `-Duser.timezone=Asia/Ho_Chi_Minh` hoặc lưu chuẩn UTC/Instant. |
| **6. Database (RDS)** | Không kết nối được Database từ Backend | AWS RDS mặc định khóa toàn bộ Inbound Traffic trên Port 5432 | Thiết lập **Security Group** trên AWS cho phép Inbound IP / SG của Backend Server. |
| **7. Env Variables** | Rò rỉ thông tin bảo mật (DB pass, JWT Secret, Mail Pass) | Hardcode thông tin nhạy cảm vào `application.yml` rồi push Git | Khai báo biến môi trường (**Environment Variables**) trên AWS Console / App Runner / Secrets Manager. |

---

## 🔍 Chi Tiết Kịch Bản & Hướng Xử Lý

### 1. Swagger UI & Proxy Forwarding
- **Kịch bản thực tế:** Khi gắn domain HTTPS cho API thông qua Load Balancer (ALB) hoặc API Gateway, ứng dụng Spring Boot bên trong container vẫn lắng nghe HTTP ở port 8080. Swagger UI sẽ tự động sinh Schema test là `http://...`, khiến trình duyệt chặn request do lỗi **Mixed Content Error**.
- **Cách xử lý:**
  - Cấu hình Spring Boot nhận biết các Header chuyển tiếp (`X-Forwarded-Proto`, `X-Forwarded-Host`) từ Proxy/ALB:
    ```yaml
    server:
      forward-headers-strategy: framework
    ```
  - **Bảo mật:** Không public Swagger công khai trên Production. Hãy tắt Swagger trên profile production:
    ```yaml
    springdoc:
      api-docs:
        enabled: false
      swagger-ui:
        enabled: false
    ```

---

### 2. CORS (Cross-Origin Resource Sharing)
- **Kịch bản thực tế:** Frontend chạy trên domain chính thức **`https://edore.id.vn`** (hoặc `https://edore.vercel.app`) và Backend trên **AWS** (`https://api.edore.id.vn`) thuộc hai Origin khác nhau. Trình duyệt sẽ phát request Preflight `OPTIONS` để kiểm tra quyền truy cập. Nếu không cấu hình, toàn bộ request sẽ bị chặn.
- **Cách xử lý:**
  - Trong `CorsConfigurationSource` của `SecurityConfig.java`, khai báo chính xác các Origin được phép:
    ```java
    configuration.addAllowedOriginPattern("https://edore.id.vn");
    configuration.addAllowedOriginPattern("https://*.edore.id.vn");
    configuration.addAllowedOriginPattern("http://edore.id.vn");
    configuration.addAllowedOriginPattern("https://*.vercel.app");
    configuration.setAllowCredentials(true);
    ```

---

### 3. Dịch Vụ Gửi Email (SMTP Gmail & AWS SES)
- **Kịch bản thực tế:**
  1. **Google chặn đăng nhập:** IP server AWS thuộc Data Center (Sing/Tokyo). Google sẽ đánh dấu là đăng nhập từ thiết bị lạ và block nếu dùng mật khẩu thường.
  2. **AWS chặn Port 25:** AWS mặc định khóa Outbound Port 25 trên EC2 để chống spam email.
  3. **Giới hạn số lượng:** Gmail cá nhân giới hạn tối đa ~500 mail/ngày.
- **Cách xử lý:**
  - Bắt buộc tạo **Mật khẩu ứng dụng (App Password 16 ký tự)** trong tài khoản Google Security.
  - Sử dụng Port **587 (STARTTLS)** hoặc Port **465 (SSL)** thay vì Port 25.
  - Khuyên dùng dịch vụ gửi mail chuyên nghiệp như **AWS SES (Simple Email Service)**, **SendGrid**, hoặc **Resend** cho Production.

---

### 4. Lưu Trữ File (Ephemeral Storage vs Object Storage)
- **Kịch bản thực tế:** Nếu lưu file ảnh/tài liệu trực tiếp vào hệ thống tệp cục bộ (ví dụ `/uploads`), toàn bộ file sẽ bị xóa sạch (**bốc hơi**) khi server restart, container được deploy lại, hoặc khi hệ thống auto-scale ra máy chủ mới.
- **Cách xử lý:**
  - Tuyệt đối không lưu file trên ổ đĩa cục bộ của server ứng dụng.
  - Tích hợp dịch vụ lưu trữ đám mây bên ngoài: **Amazon S3** (hoặc Cloudinary, MinIO).

---

### 5. Quản Lý Múi Giờ (Timezone Alignment)
- **Kịch bản thực tế:** Hệ điều hành trên AWS mặc định sử dụng giờ chuẩn **UTC (GMT+0)**. Nếu ứng dụng dựa vào giờ hệ thống (`LocalDateTime.now()`), dữ liệu lưu xuống Database hoặc dùng để validate hết hạn sẽ bị **chậm 7 tiếng** so với giờ Việt Nam (GMT+7).
- **Cách xử lý:**
  - Cách 1: Thiết lập timezone cho JVM khi chạy ứng dụng: `-Duser.timezone=Asia/Ho_Chi_Minh`.
  - Cách 2: Thiết lập ở cấp độ ứng dụng Spring Boot:
    ```java
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }
    ```
  - Cách 3 (Khuyên dùng cho hệ thống lớn): Lưu trữ thời gian trong Database theo UTC (`Instant` / `OffsetDateTime`) và để Frontend tự convert theo múi giờ trình duyệt người dùng.

---

### 6. Kết Nối Database Trên AWS RDS
- **Kịch bản thực tế:** 
  - Không thể kết nối DB qua `localhost:5432`. Cần khởi tạo Database instance trên **AWS RDS PostgreSQL** (hoặc dùng dịch vụ Managed Cloud DB như Neon, Supabase).
  - AWS RDS mặc định chặn toàn bộ Inbound Traffic từ bên ngoài.
- **Cách xử lý:**
  - Cấu hình **Security Group** cho AWS RDS: Cho phép Inbound Traffic ở port Database (ví dụ `5432`) từ duy nhất Security Group / IP của Backend App (EC2 / App Runner / ECS).

---

### 7. Quản Lý Biến Môi Trường (Environment Variables)
- **Kịch bản thực tế:** Hardcode các thông tin nhạy cảm (Database Password, JWT Secret Key, Google Mail App Password, PayOS Keys) trong file `application.yml` rồi push lên Git gây nguy cơ rò rỉ bảo mật nghiêm trọng.
- **Cách xử lý:**
  - Đưa toàn bộ cấu hình nhạy cảm vào biến môi trường (`${DB_PASSWORD}`, `${JWT_SECRET}`).
  - Khai báo các giá trị thực tế trên giao diện quản trị AWS (AWS App Runner Environment Variables, Elastic Beanstalk Configuration, ECS Task Definition, hoặc **AWS Secrets Manager**).
