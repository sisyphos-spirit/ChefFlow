export interface Receta {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  pasos: string[];
  ingredientes: { nombre: string; cantidad: number; unidad: string }[];
  publicada?: boolean;
  id_usuario?: string;
  id_receta?: string;
};

export type RootStackParamList = {
  ListaRecetas: undefined;
  CrearReceta: { receta?: any } | undefined;
  EditarReceta: { receta: any };
  InfoReceta: { receta: Receta };
};

export interface IngredienteBase {
  id: string;
  nombre: string;
  unidad: string;
};

export interface Ingrediente extends IngredienteBase {
  cantidad: number;
  calorias?: number;
  proteinas?: number;
  carbohidratos?: number;
  grasas?: number;
};