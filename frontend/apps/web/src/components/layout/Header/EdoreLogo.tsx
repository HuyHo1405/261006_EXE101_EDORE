/**
 * EdoreLogo — Composite: PNG quyển sách + chữ "E" phủ lên bằng Tailwind CSS
 *
 * Spec: edore-design-tokens.md mục 2 & Canva HTML export
 *   - Tỉ lệ icon: width/height = 0.7800 (625×800px)
 *   - Chữ E: Saira Extra Condensed 700 uppercase #fafafa
 *   - Offset: translateY(-5% height) để vị trí vừa vặn mặt sách
 */

import Image from "next/image";

interface EdoreLogoProps {
  /** Chiều cao logo (px). Width tự tính theo tỉ lệ 0.7800. */
  size?: number;
}

export function EdoreLogo({ size = 56 }: EdoreLogoProps) {
  const height = size;
  const width  = size * 0.7800;

  const eFontSize   = width * 0.7587;
  const eTranslateY = height * -0.05;

  return (
    <span
      className="relative inline-block shrink-0 select-none"
      style={{ position: "relative", width: `${width}px`, height: `${height}px` }}
      aria-hidden="true"
    >
      {/* Lớp 1: PNG quyển sách */}
      <Image
        src="/edore_logo.png"
        alt=""
        fill
        priority
        sizes={`${Math.ceil(width)}px`}
        className="object-contain"
      />

      {/* Lớp 2: Chữ "E" phủ lên mặt sách */}
      <span
        className="absolute top-0 left-0 w-full h-[85%] flex items-center justify-center font-header font-bold text-[#fafafa] uppercase tracking-[-0.01em] leading-none pointer-events-none"
        style={{
          fontSize: `${eFontSize}px`,
          transform: `translateY(${eTranslateY}px)`,
        }}
      >
        E
      </span>
    </span>
  );
}
