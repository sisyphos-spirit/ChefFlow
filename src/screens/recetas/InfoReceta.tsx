import { View, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';
import { useState } from 'react';
import Img_preview from '../../components/Img_preview';

interface Receta {
    id: string
    titulo: string
    descripcion: string
    imagen_url: string
}

export default function InfoReceta({ route }: {route: any}) {
  const { receta } = route.params;
  const [descripcion, setDescripcion] = useState(receta.descripcion);
  const [recetaUrl, setRecetaUrl] = useState(receta.imagen_url);
  const [titulo, setTitulo] = useState(receta.titulo);

  return (
    <View style={styles.container}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text>{descripcion}</Text>
      <Img_preview size={200} url={recetaUrl} onUpload={setRecetaUrl} />
      <Text>Receta: Paso1, Paso2, Pas3... Todo muy bonito con cuadritos y cositas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 25, padding: 10, borderWidth: 1, borderRadius: 5 },
  deleteButton: { backgroundColor: 'red', marginTop: 10 },
  titulo: { fontSize: 30, fontWeight: 'bold', marginBottom: 10 },
});