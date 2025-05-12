import { View, Text, FlatList, Pressable } from 'react-native'
import { useUserStore } from '../../store/useUserStore'
import { useEffect } from 'react'
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

  return (
    <View style={{ flex: 1 }}>
      {user ? (
        <>
          {/* Formulario para crear una nueva receta */}
          <View style={{ marginBottom: -35 }}>
            <Button
              title="Crear Receta"
              onPress={() => goToCreator()}
              buttonStyle={{ backgroundColor: '#007BFF' }}
            />
          </View>

          {/* Lista de recetas */}
          <FlatList
            style={{ marginTop: 60 }}
            data={recetas} // Usar directamente el estado global
            keyExtractor={(item, index) => item.id || index.toString()} // Asegúrate de que la clave sea única
            renderItem={({ item }) => (
              <Pressable onPress={() => goToView(item)}>
                <RecetaItem item={item} />
              </Pressable>
            )}
            refreshing={loading} // Indica si está cargando
            onRefresh={fetchRecetas} // Llama a la función para actualizar las recetas
          />
        </>
      ) : (
        <Text>Por favor, inicia sesión</Text>
      )}
    </View>
  )
}