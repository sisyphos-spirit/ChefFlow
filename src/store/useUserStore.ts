import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

type State = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<State>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
