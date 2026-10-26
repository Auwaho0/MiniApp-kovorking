import { create } from "zustand";

type Tab = "home" | "my";

type State = {
  tab: Tab;
  setTab: (t: Tab) => void;
};

export const useNavStore = create<State>((set) => ({
  tab: "home",
  setTab: (tab) => set({ tab }),
}));