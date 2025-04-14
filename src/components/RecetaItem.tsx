import { View, StyleSheet } from 'react-native';
import { Input, Button } from '@rneui/themed';
import Img_receta from './Img_receta';
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
      <Input label="Título" value={titulo} onChangeText={setTitulo} />
      <Input label="Descripción" value={descripcion} onChangeText={setDescripcion} />
      <Img_receta size={200} url={recetaUrl} onUpload={setRecetaUrl} />
      <Button
        title="Eliminar"
        onPress={() => onDelete(item.id)}
        buttonStyle={styles.deleteButton}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20, padding: 10, borderWidth: 1, borderRadius: 5 },
  deleteButton: { backgroundColor: 'red', marginTop: 10 },
});