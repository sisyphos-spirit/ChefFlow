import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Modal, TextInput, Pressable } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useRecetas } from '../../hooks/useRecetas';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { IngredienteBase, Ingrediente } from '../../navigation/types';
import Img_receta from '../../components/Img_receta';
import DropDownPicker from 'react-native-dropdown-picker';
import { isEmpty, isPositiveNumber } from '../../utils/validation';
import { showError, showSuccess } from '../../utils/alerts';
import { useLanguageStore } from '../../store/useLanguageStore';
import { messages } from '../../constants/messages';
import { useTheme } from '../../hooks/useTheme';
import { AppInput } from '../../components/AppInput';
import { SectionTitle } from '../../components/SectionTitle';
import { PrimaryButton } from '../../components/PrimaryButton';
import { getGlobalStyles } from '../../constants/GlobalStyles';

export default function EditRecipe() {
  const route = useRoute<RouteProp<RootStackParamList, 'EditarReceta'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { receta: recipe } = route.params;
  const { updateReceta: updateRecipe } = useRecetas();
  const { fetchIngredientes: fetchIngredients, fetchIngredientesReceta: fetchRecipeIngredients, ingredientes: availableIngredients } = useIngredientes();

  const [title, setTitle] = useState(recipe.titulo);
  const [description, setDescription] = useState(recipe.descripcion);
  const [imageUrl, setImageUrl] = useState(recipe.imagen_url);
  const [steps, setSteps] = useState<string[]>(recipe.pasos || []);
  const [ingredients, setIngredients] = useState<Ingrediente[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredienteBase | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<IngredienteBase[]>([]);

  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  const localStyles = StyleSheet.create({
    container: { marginHorizontal: 25, padding: 10, borderWidth: 1, borderRadius: 5, backgroundColor: colors.secondary, borderColor: colors.primary },
    scrollContainer: { flexGrow: 1 },
    sectionContainer: { marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    dropdownContainer: { marginBottom: 20 },
    zIndex1000: { zIndex: 1000 },
    dropDownContainer: { maxHeight: 200 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    ingredienteItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5, alignItems: 'center' },
    removeText: {},
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    removeStepButton: { marginLeft: 4, paddingHorizontal: 8, paddingVertical: 4, justifyContent: 'center', alignItems: 'center', minWidth: 60 },
    addStepButton: { marginTop: 10, padding: 10, alignItems: 'center', borderRadius: 5 },
    addStepText: { fontSize: 16 },
    dropdown: { marginBottom: 10 },
  });

  useEffect(() => {
    fetchIngredients();
    async function loadIngredients() {
      // Unificar nombres de campos con la base de datos
      // Cambiar recipe.id por recipe.id_receta
      if (recipe.id_receta) {
        const recipeIngredients = await fetchRecipeIngredients(recipe.id_receta);
        setIngredients(recipeIngredients);
      }
    }
    loadIngredients();
  }, []);

  useEffect(() => {
    setFilteredIngredients(
      availableIngredients.filter((ing: IngredienteBase) =>
        ing.nombre.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [searchValue, availableIngredients]);

  const addIngredient = () => {
    if (!selectedIngredient || !isPositiveNumber(amount)) {
      showError(t.selectIngredientValidAmount);
      return;
    }
    setIngredients((prev) => {
      const existing = prev.find((ing) => ing.id === selectedIngredient.id);
      if (existing) {
        showError(t.ingredientAlreadyAdded);
        return prev;
      } else {
        return [
          ...prev,
          { ...selectedIngredient, cantidad: parseFloat(amount) },
        ];
      }
    });
    closeModal();
  };

  const handleSave = async () => {
    // Cambiar updateRecipe para usar id_receta
    if (isEmpty(title) || isEmpty(description) || isEmpty(imageUrl) || steps.length === 0 || ingredients.length === 0) {
      showError(t.completeAllFieldsSave);
      return;
    }
    try {
      await updateRecipe(recipe.id_receta, title, description, imageUrl, steps, ingredients);
      showSuccess(t.recipeUpdated);
      navigation.goBack();
    } catch (error) {
      showError(t.couldNotUpdateRecipe);
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const handleUpdateStep = (index: number, text: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = text;
    setSteps(updatedSteps);
  };

  const openModal = (ingredient: IngredienteBase) => {
    setSelectedIngredient(ingredient);
    setAmount('');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedIngredient(null);
    setAmount('');
    setIsModalVisible(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View>
        <AppInput
          placeholder={t.editRecipe}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <AppInput
          placeholder={t.description || 'Description'}
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        <Img_receta size={200} url={imageUrl} onUpload={setImageUrl} />

        <SectionTitle style={{ fontSize: 18, marginTop: 16 }}>{t.steps}</SectionTitle>
        {steps.map((step, index) => (
          <View key={index} style={localStyles.stepRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>{`${t.step} ${index + 1}`}</Text>
              <AppInput
                placeholder={t.step}
                value={step}
                onChangeText={(text) => handleUpdateStep(index, text)}
                multiline
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              />
            </View>
            <Pressable onPress={() => handleRemoveStep(index)} style={localStyles.removeStepButton}>
              <Text style={[localStyles.removeText, { color: colors.accent, fontWeight: 'bold' }]}>{t.remove || 'Eliminar'}</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={handleAddStep} style={[localStyles.addStepButton, { backgroundColor: colors.accent }]}> 
          <Text style={[localStyles.addStepText, { color: colors.text }]}>{t.addStep}</Text>
        </Pressable>

        <SectionTitle style={{ fontSize: 18, marginTop: 16 }}>{t.ingredients}</SectionTitle>
        <View style={[localStyles.dropdownContainer, openDropdown ? localStyles.zIndex1000 : null]}>
          <DropDownPicker
            open={openDropdown}
            value={selectedIngredient?.id || null}
            items={filteredIngredients.map((ing) => ({
              label: `${ing.nombre || 'Ingrediente desconocido'} (${ing.unidad || 'unidad desconocida'})`,
              value: ing.id,
              ingredient: ing,
            }))}
            setOpen={setOpenDropdown}
            setValue={(callback) => {
              const value = callback(selectedIngredient?.id || null);
              if (!value) return;
              const ingredient = availableIngredients.find((ing: IngredienteBase) => ing.id === value);
              if (ingredient) {
                openModal(ingredient);
              }
            }}
            setItems={() => {}}
            searchable
            searchPlaceholder={t.searchIngredient}
            onChangeSearchText={setSearchValue}
            style={[
              localStyles.dropdown,
              { backgroundColor: colors.secondary, borderColor: colors.primary },
            ]}
            dropDownContainerStyle={[
              localStyles.dropDownContainer,
              { backgroundColor: colors.secondary, borderColor: colors.primary },
            ]}
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            textStyle={{ color: colors.text }}
            placeholderStyle={{ color: colors.placeholder }}
            searchContainerStyle={{ backgroundColor: colors.secondary }}
            searchTextInputStyle={{ color: colors.text, backgroundColor: colors.secondary, borderColor: colors.primary }}
            selectedItemContainerStyle={{ backgroundColor: colors.primary + '22' }}
            selectedItemLabelStyle={{ color: colors.primary, fontWeight: 'bold' }}
          />
        </View>
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={localStyles.modalContainer}>
            <View style={[localStyles.modalContent, { backgroundColor: colors.secondary }]}> 
              <SectionTitle style={{ fontSize: 16 }}>{t.addQuantity}</SectionTitle>
              <Text style={{ color: colors.text }}>{selectedIngredient?.nombre || ''} ({selectedIngredient?.unidad || ''})</Text>
              <AppInput
                style={styles.input}
                keyboardType="numeric"
                placeholder={t.amount}
                placeholderTextColor={colors.placeholder}
                value={amount}
                onChangeText={setAmount}
              />
              <View style={localStyles.modalButtons}>
                <PrimaryButton title={t.cancel} onPress={closeModal} style={{ backgroundColor: colors.accent, flex: 1, marginRight: 8 }} textStyle={{ color: colors.text }} />
                <PrimaryButton title={t.add} onPress={addIngredient} style={{ backgroundColor: colors.primary, flex: 1 }} textStyle={{ color: colors.text }} />
              </View>
            </View>
          </View>
        </Modal>
        {ingredients.map((ing, index) => (
          <View key={index} style={localStyles.ingredienteItem}>
            <Text style={{ color: colors.text }}>{ing.nombre || ''} - {('cantidad' in ing ? ing.cantidad : '')} {ing.unidad || ''}</Text>
            <Pressable onPress={() => removeIngredient(ing.id)}>
              <Text style={[localStyles.removeText, { color: colors.accent }]}>{t.remove}</Text>
            </Pressable>
          </View>
        ))}
        <PrimaryButton
          title={t.saveChanges || 'Guardar Cambios'}
          onPress={handleSave}
          style={{ marginTop: 20 }}
          textStyle={{ color: colors.text }}
        />
      </View>
    </ScrollView>
  );
}