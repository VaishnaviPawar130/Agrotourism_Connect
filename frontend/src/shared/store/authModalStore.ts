import { create } from 'zustand';

export type AuthModalMode = 'login' | 'register' | 'forgot-password';

interface AuthModalState {
  open: boolean;
  mode: AuthModalMode;
  openModal: (mode: AuthModalMode) => void;
  setMode: (mode: AuthModalMode) => void;
  close: () => void;
}

export const useAuthModalStore = create<AuthModalState>()((set) => ({
  open: false,
  mode: 'login',
  openModal: (mode) => set({ open: true, mode }),
  setMode: (mode) => set({ mode }),
  close: () => set({ open: false }),
}));
