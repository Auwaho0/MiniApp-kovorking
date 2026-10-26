import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Modal({ open, onClose, children, title }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px]
                 animate-[fadeIn_.15s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[90vh] overflow-y-auto
                   rounded-t-3xl bg-tg-bg p-5
                   animate-[slideUp_.22s_ease-out]"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-tg-text">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-tg-hint active:bg-tg-secondary"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}