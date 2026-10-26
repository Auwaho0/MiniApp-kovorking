import { createPortal } from "react-dom";
import { useLoadingStore } from "../model/loadingStore";
import { Spinner } from "./Spinner";

export function LoadingModal() {
  const { status, message } = useLoadingStore();
  if (status === "idle") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="min-w-[180px] rounded-2xl bg-tg-bg px-6 py-5 text-center shadow-xl">
        {status === "loading" && (
          <>
            <Spinner className="text-tg-button" />
            <div className="mt-3 text-sm text-tg-text">{message ?? "Загрузка..."}</div>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-3xl">✅</div>
            <div className="mt-2 text-sm text-tg-text">{message ?? "Успешно"}</div>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-3xl">⚠️</div>
            <div className="mt-2 text-sm text-red-500">{message ?? "Ошибка"}</div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}