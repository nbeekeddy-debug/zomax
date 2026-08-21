import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-z-action text-white shadow-sm hover:bg-z-action-hover",
  secondary: "border border-z-line bg-white text-z-ink hover:border-orange-300 hover:text-z-brand",
  danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  ghost: "bg-z-soft text-z-secondary hover:text-z-brand",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-xl px-3 py-2 text-xs",
  md: "min-h-11 rounded-2xl px-4 py-2.5 text-sm",
  lg: "min-h-12 rounded-2xl px-5 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-z-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
