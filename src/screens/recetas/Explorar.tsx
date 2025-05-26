import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useRecetas } from '../../hooks/useRecetas';
import RecetaItem from '../../components/RecetaItem';
import { Ionicons } from '@expo/vector-icons';

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
    // Buscar por título, descripción o nombre de ingrediente
    const matchTitulo = receta.titulo?.toLowerCase().includes(lower);
    const matchDescripcion = receta.descripcion?.toLowerCase().includes(lower);
    const matchIngrediente = Array.isArray(receta.ingredientes)
      ? receta.ingredientes.some((ing: any) => ing.nombre?.toLowerCase().includes(lower))
      : false;
    return matchTitulo || matchDescripcion || matchIngrediente;
  });

  // Navegación a InfoReceta dentro del stack de Explorar
  const goToView = (item: any) => {
    (navigation as any).navigate('InfoReceta', { receta: item });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <TextInput
            placeholder="Buscar receta..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={[styles.input, { flex: 1 }]}
          />
          <Pressable
            onPress={() => (navigation as any).navigate('BuscarPorId')}
            style={{ marginLeft: 10, backgroundColor: '#eee', borderRadius: 8, padding: 10 }}
            accessibilityLabel="Buscar por ID"
          >
            <Ionicons name="search" size={22} color="#333" />
          </Pressable>
        </View>
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
