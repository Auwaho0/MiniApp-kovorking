import { ButtonHTMLAttributes, ReactNode } from "react";
import { hapticLight } from "../lib/telegram";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  children: ReactNode;
};

const styles: Record<string, string> = {
  primary: "bg-tg-button text-tg-button-text",
  secondary: "bg-tg-secondary text-tg-text",
  danger: "bg-red-500 text-white",
  ghost: "bg-transparent text-tg-text",
};

export function Button({ variant = "primary", className = "", children, onClick, ...rest }: Props) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        hapticLight();
        onClick?.(e);
      }}
      className={`w-full rounded-xl px-4 py-3 font-medium text-[15px]
                  transition active:scale-[0.97] active:opacity-80
                  disabled:opacity-50 disabled:active:scale-100
                  ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}