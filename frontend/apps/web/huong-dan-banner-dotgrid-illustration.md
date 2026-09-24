# Banner: Dot-grid (mono-primary) + Illustration overlay

Banner hero dùng nền gradient dot-grid chỉ trong dải màu `primary` + illustration SVG (unDraw) đặt tràn nhẹ ra rìa. Không cần ảnh raster, không cần thư viện ngoài — chỉ CSS thuần + 1 file SVG.

Demo trực tiếp: xem artifact đã publish, hoặc copy code bên dưới chạy độc lập.

---

## 1. Yêu cầu

- Design tokens màu đã có sẵn dạng CSS variable, ví dụ:
  ```css
  --color-primary-300: #6e96ef;
  --color-primary-500: #034ce4;
  --color-primary-800: #012474;
  --color-primary-600: #0240c0; /* dùng cho text nút CTA */
  ```
- 1 file illustration SVG (khuyến nghị lấy từ [unDraw](https://undraw.co) vì cho phép đổi màu accent theo 1 mã hex duy nhất trước khi tải xuống).

---

## 2. Cấu trúc HTML

```html
<div class="banner banner--hero">
  <div class="banner-inner">
    <div class="banner-label">CHÀO MỪNG TRỞ LẠI</div>
    <h2>Ý tưởng thành hành động</h2>
    <p class="sub">Biến quy trình rời rạc thành một luồng làm việc liền mạch cho cả đội ngũ.</p>
    <div class="cta">Bắt đầu ngay →</div>
  </div>

  <div class="illustration">
    <!-- Dán trực tiếp nội dung <svg>...</svg> vào đây (inline SVG) -->
    <!-- KHÔNG dùng <img src="..."> nếu muốn recolor bằng CSS sau này -->
  </div>
</div>
```

> **Vì sao dùng inline `<svg>` thay vì `<img src="...">`?**
> Inline SVG cho phép override `fill` bằng CSS (`.illustration svg path { fill: ... }`) nếu sau này đổi bộ màu. Load qua `<img>` sẽ khoá cứng màu gốc của file.

---

## 3. CSS

```css
/* Base banner — dùng chung cho mọi biến thể banner */
.banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  isolation: isolate; /* tạo stacking context riêng, tránh z-index leak ra ngoài */
}

/* Biến thể: dot-grid mono-primary + illustration */
.banner--hero {
  position: relative;
  height: 280px;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.18) 1.5px, transparent 1.5px),
    linear-gradient(
      135deg,
      var(--color-primary-300),
      var(--color-primary-500) 55%,
      var(--color-primary-800)
    );
  background-size: 18px 18px, 100% 100%;
}

/* Khối text bên trái */
.banner--hero .banner-inner {
  position: relative;
  z-index: 2; /* nổi trên illustration */
  height: 100%;
  display: flex;
  flex-direction: column; /* QUAN TRỌNG: không có dòng này chữ sẽ xếp ngang */
  align-items: flex-start;
  justify-content: center;
  padding: 0 44px;
  max-width: 320px; /* giới hạn để chữ không đè lên illustration */
}

.banner--hero .banner-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 10px;
}

.banner--hero h2 {
  font-family: var(--font-header, sans-serif);
  color: white;
  font-size: 30px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0 0 10px;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.15);
}

.banner--hero p.sub {
  color: rgba(255, 255, 255, 0.82);
  font-size: 13.5px;
  line-height: 1.55;
  margin: 0 0 18px;
}

.banner--hero .cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: var(--color-primary-600, #0240c0);
  font-weight: 700;
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 8px;
  width: fit-content;
}

/* Illustration tràn nhẹ ra rìa banner để tạo cảm giác "thoát khung" */
.banner--hero .illustration {
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 420px;
  z-index: 1; /* nằm dưới banner-inner */
  opacity: 0.96;
  pointer-events: none; /* không chặn click vào nút/link phía trên */
}

.banner--hero .illustration svg {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 20px 30px rgba(1, 22, 78, 0.25));
}
```

---

## 4. Các điểm cần lưu ý khi implement

| Vấn đề | Giải thích |
|---|---|
| **`flex-direction: column` trên `.banner-inner`** | Bắt buộc phải có, nếu không các dòng text (label, h2, p, cta) sẽ tự xếp thành hàng ngang thay vì xuống dòng. |
| **Thứ tự z-index** | `.banner-inner` = 2 (trên), `.illustration` = 1 (dưới) — đảm bảo text luôn đọc được dù illustration có tràn qua. |
| **`overflow: hidden` trên `.banner`** | Cắt phần illustration tràn ra ngoài bo góc, tránh vỡ layout ở góc banner. |
| **`pointer-events: none` trên `.illustration`** | Vì illustration đặt `position: absolute` chồng lên, nếu không có dòng này nó có thể chặn click vào nút CTA nằm bên dưới nó theo thứ tự DOM. |
| **Màu SVG nên khớp tông thương hiệu** | Nếu dùng unDraw, đổi màu accent của SVG (thường 1–2 màu chính trong file) sang đúng `primary` hoặc `secondary` của bộ token trước khi tải, để không bị lệch tông với nền gradient. |
| **Responsive** | Dưới ~640px nên ẩn hoặc thu nhỏ `.illustration` (`display: none` hoặc giảm `width`) vì nó dễ bị cắt xấu khi banner co hẹp lại. Có thể thêm: |

```css
@media (max-width: 640px) {
  .banner--hero .illustration {
    display: none;
  }
  .banner--hero .banner-inner {
    max-width: 100%;
  }
}
```

---

## 5. Cách lấy & chuẩn bị illustration

1. Vào [undraw.co](https://undraw.co), tìm illustration phù hợp chủ đề (vd: "ideas flow", "team", "dashboard").
2. Trước khi tải, dùng bộ chọn màu của unDraw để đổi accent color sang đúng mã hex trong bộ token (vd `#f28c0f` cho secondary, hoặc `#034ce4` cho primary).
3. Tải file `.svg`, mở bằng text editor, copy toàn bộ nội dung `<svg>...</svg>` và dán trực tiếp vào chỗ `<!-- dán SVG ở đây -->` trong HTML — không tham chiếu qua `<img src>` hay `background-image`.

---

## 6. Checklist bàn giao cho dev

- [ ] Đã có đủ biến CSS `--color-primary-300/500/600/800` trong `:root` hoặc theme file.
- [ ] Đã copy đúng khối CSS `.banner`, `.banner--hero` và các class con ở mục 3.
- [ ] Đã dán illustration dạng inline SVG (không phải `<img>`).
- [ ] Đã test ở mobile (≤640px) — illustration ẩn hoặc không vỡ layout.
- [ ] Đã kiểm tra nút CTA bên trong vẫn click được (không bị illustration che mất do thiếu `pointer-events: none`).
