/**
 * EdoreLogo — SVG Vector Logo chính thức của Edore (gồm icon quyển sách và chữ "E" sắc nét)
 *
 * Spec: edore-design-tokens.md mục 2 & Canva HTML export
 *   - Tỉ lệ icon: width/height = 0.7800 (40.65 × 52.09px trong vector viewBox)
 */

import Image from "next/image";

interface EdoreLogoProps {
  /** Chiều cao logo (px). Width tự tính theo tỉ lệ 0.7800. Mặc định 56px. */
  size?: number;
  className?: string;
}

export function EdoreLogo({ size = 56, className = "" }: EdoreLogoProps) {
  const height = size;
  const width = Math.round(size * 0.78);

  return (
    <span
      className={`relative inline-block shrink-0 select-none ${className}`}
      style={{ position: "relative", width: `${width}px`, height: `${height}px` }}
      aria-hidden="true"
    >
      <Image
        src="/EDORE_LOGO.svg"
        alt="Edore Logo"
        width={width}
        height={height}
        priority
        className="w-full h-full object-contain"
      />
    </span>
  );
}
