import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
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
import { useTheme } from '../../hooks/useTheme';
import { getGlobalStyles } from '../../constants/GlobalStyles';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AppInput } from '../../components/AppInput';

export default function Recipes() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListaRecetas'>;

  const user = useUserStore((state) => state.user);
  const { recetas: recipes, fetchRecetas: fetchRecipes, deleteReceta: deleteRecipe, loading } = useRecetas();
  const navigation = useNavigation<NavigationProp>();
  const [searchTerm, setSearchTerm] = useState('');
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  const localStyles = StyleSheet.create({
    searchBarContainer: {
      marginHorizontal: 30,
      marginTop: 20,
    },
    floatingButtonContainer: {
      position: 'absolute',
      bottom: 30,
      right: 24,
      zIndex: 10,
    },
    floatingButton: {
      minWidth: 48,
      minHeight: 48,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.primary,
      elevation: 4,
      justifyContent: 'center',
      alignItems: 'center',
      // Shadow for iOS
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    floatingButtonText: {
      color: colors.text,
      fontSize: 16,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
      color: colors.placeholder,
      fontFamily: 'Nunito-Regular',
    },
    list: {
      marginTop: 5,
    },
  });

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
          <View style={localStyles.searchBarContainer}>
            <AppInput
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.input}
              placeholderTextColor={colors.placeholder}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          {/* Lista de recetas */}
          {filteredRecipes.length === 0 ? (
            <Text style={localStyles.emptyText}>
              {t.noRecipes}
            </Text>
          ) : (
            <FlatList
              style={localStyles.list}
              data={filteredRecipes}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={({ item }) => (
                <Pressable onPress={() => goToRecipeInfo(item)}>
                  <RecetaItem item={item} />
                </Pressable>
              )}
              refreshing={loading}
              onRefresh={fetchRecipes}
              contentContainerStyle={{ paddingBottom: 100 }} // Prevents FAB overlap
            />
          )}
          {/* Botón flotante para crear receta */}
          <View style={localStyles.floatingButtonContainer} pointerEvents="box-none">
            <PrimaryButton
              title={t.createRecipe}
              onPress={goToRecipeCreate}
              style={localStyles.floatingButton}
              textStyle={localStyles.floatingButtonText}
            />
          </View>
        </>
      ) : (
        <Text style={styles.textPrimary}>{t.pleaseLogin}</Text>
      )}
    </View>
  )
}