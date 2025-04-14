export type RootStackParamList = {
    ListaRecetas: undefined;
    RecetaForm: { recipe?: any } | undefined; // acepta parámetro opcional si también sirve para editar
    DetalleReceta: { recipe: any };
    // Agrega aquí las demás rutas
  };