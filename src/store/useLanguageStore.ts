import { create } from 'zustand';
import type { Language } from '../constants/messages';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'es', // idioma por defecto
  setLanguage: (lang) => set({ language: lang }),
}));
