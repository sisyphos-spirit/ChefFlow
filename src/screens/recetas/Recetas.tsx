import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native'
import { useUserStore } from '../../store/useUserStore'
import { useEffect, useState } from 'react'
import { Button } from '@rneui/themed'
import RecetaItem from '../../components/RecetaItem';
import { useRecetas } from '../../hooks/useRecetas'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useLanguageStore } from '../../store/useLanguageStore';
import { messages } from '../../constants/messages';

export default function Recipes() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListaRecetas'>;

  const user = useUserStore((state) => state.user);
  const { recetas: recipes, fetchRecetas: fetchRecipes, deleteReceta: deleteRecipe, loading } = useRecetas();
  const navigation = useNavigation<NavigationProp>();
  const [searchTerm, setSearchTerm] = useState('');
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];

  useEffect(() => {
    if (user) fetchRecipes();
  }, [user]);

  const goToRecipeCreate = () => {
    navigation.navigate('CrearReceta');
  };

  const goToRecipeInfo = (item: any) => {
    navigation.navigate('InfoReceta', { receta: item });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id);
      await fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    const matchTitle = recipe.titulo?.toLowerCase().includes(lower);
    const matchDescription = recipe.descripcion?.toLowerCase().includes(lower);
    const matchIngredient = Array.isArray(recipe.ingredientes)
      ? recipe.ingredientes.some((ing: any) => ing.nombre?.toLowerCase().includes(lower))
      : false;
    return matchTitle || matchDescription || matchIngredient;
  });

  return (
    <View style={styles.container}>
      {user ? (
        <>
          {/* Buscador de recetas */}
          <View style={styles.searchBarContainer}>
            <TextInput
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchBar}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          {/* Formulario para crear una nueva receta */}
          <View style={styles.createButtonContainer}>
            <Button
              title={t.createRecipe}
              onPress={goToRecipeCreate}
              buttonStyle={styles.createButton}
            />
          </View>

          {/* Lista de recetas */}
          {filteredRecipes.length === 0 ? (
            <Text style={styles.emptyText}>
              {t.noRecipes}
            </Text>
          ) : (
            <FlatList
              style={styles.list}
              data={filteredRecipes} // Usar recetas filtradas
              keyExtractor={(item, index) => item.id || index.toString()} // Asegúrate de que la clave sea única
              renderItem={({ item }) => (
                <Pressable onPress={() => goToRecipeInfo(item)}>
                  <RecetaItem item={item} />
                </Pressable>
              )}
              refreshing={loading} // Indica si está cargando
              onRefresh={fetchRecipes} // Llama a la función para actualizar las recetas
            />
          )}
        </>
      ) : (
        <Text>{t.pleaseLogin}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarContainer: { marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    elevation: 2,
  },
  createButtonContainer: { marginBottom: -35 },
  createButton: { backgroundColor: '#007BFF' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 },
  list: { marginTop: 60 },
});