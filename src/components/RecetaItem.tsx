import { View, StyleSheet, Text } from 'react-native';
import { Input, Button } from '@rneui/themed';
import Img_preview from './Img_preview';
import { useState } from 'react';

interface Receta {
    id: string
    titulo: string
    descripcion: string
    imagen_url: string
}

export default function RecetaItem({ item, onDelete, loading }: {
    item: Receta
    onDelete: (id: string) => void
    loading: boolean
  }) {
  const [titulo, setTitulo] = useState(item.titulo);
  const [descripcion, setDescripcion] = useState(item.descripcion);
  const [recetaUrl, setRecetaUrl] = useState(item.imagen_url);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{titulo}</Text>
      <Img_preview size={285} url={recetaUrl} onUpload={setRecetaUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 30, marginVertical: 10, padding: 10, borderWidth: 1, borderRadius: 5, paddingBlock: 20 },
  text: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
});