import { create } from "zustand";

interface StoreState {
  count: number,
  increment: () => void;
}

const useStore = create<StoreState>((set, get) => ({
  count: 0,
  increment: () => set((state: any) => ({ count: get().count + 1 })),
}));

export default useStore;