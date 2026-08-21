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
  primary: "bg-zomax-action text-white shadow-sm hover:bg-[#a83a08]",
  secondary: "border border-zomax-line bg-white text-zomax-ink hover:border-orange-300 hover:text-zomax-brand-dark",
  danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  ghost: "bg-zomax-surface text-zomax-secondary hover:text-zomax-brand-dark",
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
      className={`inline-flex items-center justify-center font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zomax-brand-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
