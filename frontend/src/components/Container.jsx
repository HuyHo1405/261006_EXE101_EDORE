/**
 * Container.jsx
 *
 * Một wrapper đơn giản đọc spacing từ CSS variables được đặt ở layout cha.
 * Layout cha chịu trách nhiệm khai báo:
 *   --layout-px   (padding ngang)
 *   --layout-max  (max-width)
 *
 * Component này chỉ áp dụng chúng — không tự hard-code giá trị nào.
 */
export default function Container({ children, className = '' }) {
  return (
    <div
      className={`w-full mx-auto ${className}`}
      style={{
        maxWidth: 'var(--layout-max, 80rem)',
        paddingLeft: 'var(--layout-px, 1.5rem)',
        paddingRight: 'var(--layout-px, 1.5rem)',
      }}
    >
      {children}
    </div>
  )
}
