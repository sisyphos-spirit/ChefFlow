import { create } from 'zustand';

type State = {
  receta: Receta | null;
  setReceta: (receta: Receta | null) => void;
};

interface Receta {
    id: string
    titulo: string
    descripcion: string
    imagen_url: string
}

export const useRecetaStore = create<State>((set) => ({
  receta: null,
  setReceta: (receta) => set({ receta }),
}));
