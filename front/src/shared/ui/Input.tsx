import { InputHTMLAttributes } from "react";

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full rounded-xl bg-tg-secondary px-4 py-3 text-[15px] text-tg-text
                  outline-none focus:ring-2 focus:ring-tg-button/40 ${className}`}
    />
  );
}