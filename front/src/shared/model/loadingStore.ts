import { create } from "zustand";

type Status = "idle" | "loading" | "success" | "error";

type State = {
  status: Status;
  message?: string;
  start: (msg?: string) => void;
  success: (msg?: string) => void;
  error: (msg: string) => void;
  reset: () => void;
};

let timer: number | undefined;

export const useLoadingStore = create<State>((set) => ({
  status: "idle",
  start: (message) => {
    clearTimeout(timer);
    set({ status: "loading", message });
  },
  success: (message) => {
    set({ status: "success", message });
    clearTimeout(timer);
    timer = window.setTimeout(() => set({ status: "idle" }), 2000);
  },
  error: (message) => {
    set({ status: "error", message });
    clearTimeout(timer);
    timer = window.setTimeout(() => set({ status: "idle" }), 3000);
  },
  reset: () => {
    clearTimeout(timer);
    set({ status: "idle" });
  },
}));