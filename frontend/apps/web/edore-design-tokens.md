# Edore — Design Tokens & Quy tắc (Source of Truth)

> File này là **nguồn sự thật duy nhất** cho hệ thống thiết kế Edore.
> Bất kỳ ai (người hoặc AI) làm việc trên sản phẩm Edore đều nên đọc file này trước,
> thay vì suy luận lại từ ảnh chụp màn hình hay code cũ.
> Khi có thay đổi, sửa ở đây trước, rồi mới đồng bộ sang code.

---

## 1. Thương hiệu

- **Tên brand:** Edore
- **Ngành:** Ed-tech / quản lý học tập
- **Tính cách thương hiệu:** tin cậy, tri thức, tối giản, chuyên nghiệp

---

## 2. Logo

- **Icon gốc:** hình quyển sách đóng, màu xanh brand, có dải ruy băng đánh dấu trang
  (file gốc: `efd8df80-c9ec-42be-b356-223d8f6692a5.png`, kích thước gốc 625×800px, tỉ lệ khung hình **0.7807** (width/height), tức height = width × 1.2820)
- **Chữ "E"** phủ trên icon:
  - Cùng chiều rộng với icon
  - Khung chứa chữ cao bằng **89.35%** chiều cao icon (48.7236 / 54.5436), neo sát mép trên-trái của icon
  - `font-size` = **75.87%** chiều rộng icon (41.3822 / 54.5436)
  - `line-height` = **104.50%** chiều rộng icon (57 / 54.5436)
  - Căn giữa theo cả 2 chiều trong khung chứa (không phải neo trên — dù khung neo sát top, chữ vẫn center theo chiều dọc bên trong khung đó)
  - Màu chữ: `#fafafa` (gần trắng, không phải trắng tuyệt đối)
  - Font: Saira Extra Condensed, weight 700, uppercase, letter-spacing -0.01em
- **Kích thước tối thiểu khuyến nghị:** 16px (favicon/UI nhỏ), 24px (navigation), 48px+ (marketing)
- **Vùng an toàn (clear space):** tối thiểu bằng 1/2 chiều cao logo quanh mọi phía
- **Không được:** kéo méo tỉ lệ, đổi màu khác ngoài brand blue/trắng/đen, xoay nghiêng, thêm đổ bóng lạ

---

## 3. Màu sắc

| Nhóm | Base (500) | Vai trò |
|---|---|---|
| Primary | `#034ce4` | Brand blue chính — CTA, link, nhấn mạnh |
| Secondary | `#f28c0f` | Amber — cảnh báo, điểm nhấn phụ |
| Tertiary | `#12ab83` | Teal — thành công, tăng trưởng |
| Neutral | thang từ `#fafafa` → `#1a1c1f` | Nền, chữ, viền |

- Mỗi nhóm màu có **10 bước** (50→900) + 2 gradient (135deg và 180deg)
- Nền mặc định: `#fafafa` | Bề mặt card: `#edf0f2` | Viền: `#d9d9d9`
- Semantic: `--color-brand`, `--color-error` (#ef4444), `--color-success` (= tertiary-500), `--color-warning` (= secondary-400)

---

## 4. Typography

| Vai trò | Font | Ghi chú |
|---|---|---|
| Header | **Saira Extra Condensed** | bold/extrabold, luôn uppercase, letter-spacing âm nhẹ |
| Body | **Mulish** | 300–800, dùng cho toàn bộ nội dung, input, button |
| Label/mã | **IBM Plex Mono** | nhãn form, code snippet, token name |

Thang size: xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30) 4xl(36) 5xl(48) 6xl(60)

---

## 5. Border Radius — **BẮT BUỘC tuân theo, không tự chọn số tuỳ ý**

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--radius-none` | 0px | Bảng dữ liệu, full-bleed |
| `--radius-xs` | 4px | Chip, tag, checkbox |
| `--radius-sm` | 6px | Input, select, textarea, button nhỏ |
| `--radius-md` | 8px | **Button mặc định**, dropdown, item danh sách |
| `--radius-lg` | 12px | **Card, panel, toast** |
| `--radius-xl` | 16px | Modal, bottom sheet, card lớn |
| `--radius-2xl` | 24px | Hero panel, media lớn |
| `--radius-full` | 9999px | Pill, avatar, icon tròn, FAB |

---

## 6. Spacing (thang 4px, kiểu 8dp Material)

`--space-1`=4px `--space-2`=8px `--space-3`=12px `--space-4`=16px `--space-5`=20px `--space-6`=24px `--space-8`=32px `--space-10`=40px `--space-12`=48px `--space-16`=64px

---

## 7. Layout — Responsive Grid (theo tinh thần Material Design)

| Breakpoint | Khoảng width | Số cột | Margin | Gutter | Thiết bị |
|---|---|---|---|---|---|
| xs | 0–599px | 4 | 16px | 8px | Điện thoại |
| sm | 600–904px | 8 | 24px | 16px | Điện thoại lớn/tablet dọc |
| md | 905–1239px | 12 | 32px | 24px | Tablet ngang |
| lg | 1240–1439px | 12 | 32px | 24px | Desktop |
| xl | ≥1440px | 12 | 32px | 24px | Desktop lớn |

**Nguyên tắc bắt buộc: Mobile-first.** Viết CSS mặc định cho mobile trước, dùng `min-width` media query để mở rộng dần lên desktop — không viết ngược lại bằng `max-width`.

---

## 8. Toast / Notification

- **Vị trí neo: LUÔN LUÔN top-right.** Không cung cấp tuỳ chọn đổi vị trí (top-center, bottom-right...) — ưu tiên nhất quán hơn linh hoạt.
- 5 loại: success, error, warning, info, loading — mỗi loại có icon + màu riêng theo bảng semantic ở mục 3
- **Kiểu dáng viền:** Sử dụng viền trung tính đồng nhất quanh card (`border-[var(--color-neutral-200)]`), không sử dụng dải màu viền bên trái (`border-left accent`). Nhận biết loại thông báo thông qua icon màu và thanh progress bar.
- Tự đóng sau 4s (trừ loading), có progress bar
- **Lưu ý kỹ thuật:** nếu overlay được render bằng `position: fixed` bên trong 1 cây component sâu, nên dùng `ReactDOM.createPortal` render thẳng ra `document.body` để tránh bị ảnh hưởng bởi containing block của ancestor. Khi làm vậy, token màu/font phải khai báo ở `:root` (không chỉ scope theo class `.edore-root`), và đồng bộ `data-theme` lên `document.documentElement` để phần portal cũng nhận đúng dark/light mode.

---

## 9. Buttons

- Biến thể: primary / outline / ghost / disabled — mỗi loại có size sm/md/lg
- Icon button: hình vuông (2rem/2.5rem/3rem theo size)
- Border-radius: `--radius-md` (theo mục 5, không tự đặt số khác)
- Trạng thái bắt buộc: hover (nâng nhẹ + shadow), active (scale 0.97), focus-visible (ring primary-300), disabled (opacity 0.4)

---

## 10. Cách dùng file này

- Khi bắt đầu 1 task mới liên quan Edore (dù hỏi Claude, hỏi người khác, hay tự làm), **đính kèm file này** thay vì mô tả lại từ đầu.
- Nếu đưa vào **Claude Project → Project knowledge**, mọi chat mới trong project đó tự động có ngữ cảnh này, không cần tag lại mỗi lần.
- Khi có quyết định thiết kế mới phát sinh trong lúc làm việc, **cập nhật file này ngay**, đừng để nó chỉ nằm rải rác trong code hoặc trong lịch sử chat.
