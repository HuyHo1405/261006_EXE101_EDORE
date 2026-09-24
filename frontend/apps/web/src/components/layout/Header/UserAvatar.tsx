import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  name: string;
  src?: string;
  variant?: "free" | "pro";
  size?: number;
  className?: string;
}

export function UserAvatar({
  name,
  src,
  variant = "free",
  size = 54,
  className,
}: UserAvatarProps) {
  // Lấy chữ cái đầu tiên của tên người dùng (ví dụ: "Huy" -> "H")
  const initial = name.trim().charAt(0).toUpperCase() || "E";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 select-none rounded-xl transition-all duration-200 overflow-hidden",
        "bg-[var(--color-primary-500)] text-white font-header font-bold uppercase",
        variant === "pro"
          ? "border-[3.5px] border-[#FFBD59] shadow-[0_2px_10px_rgba(255,189,89,0.3)]"
          : "border-2 border-[var(--color-neutral-300)]",
        className
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.46)}px`,
      }}
      title={`Tài khoản ${variant === "pro" ? "Pro" : "Miễn phí"}: ${name}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
