import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useRecetas } from '../../hooks/useRecetas';
import RecetaItem from '../../components/RecetaItem';

export default function Explorar() {
  const navigation = useNavigation();
  const { recetas, loading, fetchRecetasPublicas } = useRecetas();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecetasPublicas();
  }, []);

  const filteredRecetas = recetas.filter((receta) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      receta.titulo?.toLowerCase().includes(lower) ||
      receta.descripcion?.toLowerCase().includes(lower)
    );
  });

  // Navegación a InfoReceta dentro del stack de Explorar
  const goToView = (item: any) => {
    (navigation as any).navigate('InfoReceta', { receta: item });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
        <TextInput
          placeholder="Buscar receta..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
        />
      </View>
      {filteredRecetas.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 }}>
          No se encontraron recetas públicas
        </Text>
      ) : (
        <FlatList
          style={{ marginTop: 10 }}
          data={filteredRecetas}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => goToView(item)}>
              <RecetaItem item={item} />
            </Pressable>
          )}
          refreshing={loading}
          onRefresh={fetchRecetasPublicas}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    elevation: 2,
  },
});
