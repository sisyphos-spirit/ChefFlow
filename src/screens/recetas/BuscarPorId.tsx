import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRecetas } from '../../hooks/useRecetas';
import { supabase } from '../../lib/supabase';
import { isEmpty } from '../../utils/validation';
import { showError } from '../../utils/alerts';
import { useLanguageStore } from '../../store/useLanguageStore';
import { messages } from '../../constants/messages';
import { useTheme } from '../../hooks/useTheme';

export default function SearchById() {
  const [recipeId, setRecipeId] = useState('');
  const navigation = useNavigation();
  const { recetas: recipes, fetchRecetas: fetchRecipes } = useRecetas();
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  const { colors } = useTheme();

  // Buscar receta por id directamente en la base de datos usando el nombre real del campo
  const fetchRecipeById = async (id: string) => {
    const { data, error } = await supabase
      .from('recetas')
      .select('*')
      .eq('id_receta', id)
      .single();
    if (error || !data) return null;
    // Obtener ingredientes
    const { data: recipeIngredients } = await supabase
      .from('receta_ingredientes')
      .select('id_ingrediente, cantidad')
      .eq('id_receta', id);
    let ingredients: any[] = [];
    if (recipeIngredients && recipeIngredients.length > 0) {
      const ingredientIds = recipeIngredients.map((item: any) => item.id_ingrediente);
      const { data: ingredientsData } = await supabase
        .from('ingredientes')
        .select('id, nombre, unidad')
        .in('id', ingredientIds);
      ingredients = recipeIngredients.map((ri: any) => {
        const ing = ingredientsData?.find((i: any) => i.id === ri.id_ingrediente);
        return {
          id: ri.id_ingrediente,
          nombre: ing?.nombre || 'Unknown',
          unidad: ing?.unidad || 'Unknown',
          cantidad: ri.cantidad,
        };
      });
    }
    return { ...data, ingredients };
  };

  const handleSearch = async () => {
    if (isEmpty(recipeId)) {
      showError(t.enterRecipeId);
      return;
    }
    const recipe = await fetchRecipeById(recipeId.trim());
    if (recipe) {
      (navigation as any).navigate('InfoReceta', { receta: recipe });
    } else {
      showError(t.noRecipeFoundWithId, t.notFound);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t.pasteRecipeId}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.primary, color: colors.text }]}
        value={recipeId}
        onChangeText={setRecipeId}
        placeholder={t.recipeId}
        placeholderTextColor={colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title={t.searchRecipe} onPress={handleSearch} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});
