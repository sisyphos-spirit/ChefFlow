import { View, Text, FlatList, Pressable, TextInput } from 'react-native'
import { useUserStore } from '../../store/useUserStore'
import { useEffect, useState } from 'react'
import { Button } from '@rneui/themed'
import RecetaItem from '../../components/RecetaItem';
import { useRecetas } from '../../hooks/useRecetas'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

export default function Recetas() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListaRecetas'>;

  const user = useUserStore((state) => state.user) // Obtener el usuario del store
  const { recetas, fetchRecetas, deleteReceta, loading } = useRecetas();
  const navigation = useNavigation<NavigationProp>(); // Obtener la navegación
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) fetchRecetas(); // Obtener recetas al cargar el componente
  }, [user]);

  const goToCreator = () => {
    navigation.navigate('CrearReceta');
  };

  const goToView = (item: any) => {
    navigation.navigate('InfoReceta', { receta: item });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReceta(id);
      await fetchRecetas(); // Refrescar la lista tras eliminar
    } catch (error) {
      console.error('Error al eliminar la receta:', error);
    }
  };

  // Filtrar recetas según el término de búsqueda
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

  return (
    <View style={{ flex: 1 }}>
      {user ? (
        <>
          {/* Buscador de recetas */}
          <View style={{ marginHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
            <TextInput
              placeholder="Buscar receta..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ccc',
                paddingHorizontal: 15,
                paddingVertical: 10,
                fontSize: 16,
                elevation: 2,
              }}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          {/* Formulario para crear una nueva receta */}
          <View style={{ marginBottom: -35 }}>
            <Button
              title="Crear Receta"
              onPress={() => goToCreator()}
              buttonStyle={{ backgroundColor: '#007BFF' }}
            />
          </View>

          {/* Lista de recetas */}
          {filteredRecetas.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 }}>
              No se encontraron recetas
            </Text>
          ) : (
            <FlatList
              style={{ marginTop: 60 }}
              data={filteredRecetas} // Usar recetas filtradas
              keyExtractor={(item, index) => item.id || index.toString()} // Asegúrate de que la clave sea única
              renderItem={({ item }) => (
                <Pressable onPress={() => goToView(item)}>
                  <RecetaItem item={item} />
                </Pressable>
              )}
              refreshing={loading} // Indica si está cargando
              onRefresh={fetchRecetas} // Llama a la función para actualizar las recetas
            />
          )}
        </>
      ) : (
        <Text>Por favor, inicia sesión</Text>
      )}
    </View>
  )
}