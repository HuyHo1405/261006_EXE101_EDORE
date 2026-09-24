import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary-500)] text-[#fafafa] hover:bg-[var(--color-primary-400)] shadow-sm active:scale-[0.97]",
        outline:
          "border border-[var(--color-neutral-300)] bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]",
        ghost:
          "hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-500)] text-[var(--color-neutral-700)]",
        danger:
          "bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10 p-0",
        header: "h-11 px-6 text-xl font-header font-bold uppercase tracking-[-0.01em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
