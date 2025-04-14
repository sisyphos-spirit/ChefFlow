import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button } from '@rneui/themed';
import Img_receta from './Img_receta';
import { useState } from 'react';
import { useRecetas } from '../hooks/useRecetas';
import { FlatList } from 'react-native-gesture-handler';


export default function RecetaForm() {
    const [newTitulo, setNewTitulo] = useState('');
    const [newDescripcion, setNewDescripcion] = useState('');
    const [newRecetaUrl, setNewRecetaUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const { createReceta } = useRecetas();

    const onSubmit = async () => {
        try {
            setLoading(true);
            await createReceta(newTitulo, newDescripcion, newRecetaUrl);
            setNewTitulo('');
            setNewDescripcion('');
            setNewRecetaUrl('');
        }
        catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        }
        finally {
            setLoading(false);
        }
    }
    
  return (
    <View style={styles.container}>
      <Input label="Título" value={newTitulo} onChangeText={setNewTitulo} />
      <Input label="Descripción" value={newDescripcion} onChangeText={setNewDescripcion} />
      <Img_receta size={200} url={newRecetaUrl} onUpload={setNewRecetaUrl} />
      <Button
        title="Crear Receta"
        onPress={onSubmit}
        disabled={loading || !newTitulo || !newDescripcion || !newRecetaUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
});
