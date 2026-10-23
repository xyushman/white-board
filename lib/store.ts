import { create } from "zustand";

export type StoreUser = {
  id: string;
  name: string;
  email: string;
  credit: number;
};

type UserStore = {
  user: StoreUser | null;
  loaded: boolean;
  setUser: (user: StoreUser | null) => void;
  setCredit: (credit: number) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loaded: false,
  setUser: (user) => set({ user, loaded: true }),
  setCredit: (credit) =>
    set((state) =>
      state.user ? { user: { ...state.user, credit } } : state,
    ),
}));
