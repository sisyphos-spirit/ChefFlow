import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AppInput } from '../../components/AppInput';
import { SectionTitle } from '../../components/SectionTitle';
import { PrimaryButton } from '../../components/PrimaryButton';
import Img_receta from '../../components/Img_receta';
import { useRecetas } from '../../hooks/useRecetas';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { IngredienteBase } from '../../navigation/types';
import DropDownPicker from 'react-native-dropdown-picker';
import { isEmpty, isPositiveNumber } from '../../utils/validation';
import { showError } from '../../utils/alerts';
import { useLanguageStore } from '../../store/useLanguageStore';
import { messages } from '../../constants/messages';
import { useTheme } from '../../hooks/useTheme';
import { getGlobalStyles } from '../../constants/GlobalStyles';

export default function CreateRecipe() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [inputHeights, setInputHeights] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredienteBase | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<{ id: string; nombre: string; cantidad: number; unidad: string }[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<IngredienteBase[]>([]);

  const { createReceta: createRecipe } = useRecetas();
  const { ingredientes: ingredients, loading: loadingIngredients, fetchIngredientes: fetchIngredients } = useIngredientes();
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  const { colors } = useTheme();

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    setFilteredIngredients(
      ingredients.filter((ing) =>
        ing.nombre.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [searchValue, ingredients]);

  const addIngredient = () => {
    if (!selectedIngredient || !isPositiveNumber(amount)) {
      showError(t.selectIngredientValidAmount);
      return;
    }
    if (selectedIngredients.some((ing) => ing.id === selectedIngredient.id)) {
      showError(t.ingredientAlreadyAdded);
      return;
    }
    setSelectedIngredients((prev) => [
      ...prev,
      { ...selectedIngredient, cantidad: parseFloat(amount) },
    ]);
    closeModal();
  };

  const removeIngredient = (id: string) => {
    setSelectedIngredients((prev) => prev.filter((ing) => ing.id !== id));
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

  const onSubmit = async () => {
    if (isEmpty(title) || isEmpty(description) || isEmpty(imageUrl) || steps.length === 0 || selectedIngredients.length === 0) {
      showError(t.completeAllFieldsCreate);
      return;
    }

    await createRecipe(title, description, imageUrl, steps, selectedIngredients);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setSteps([]);
    setInputHeights([]);
    setSelectedIngredients([]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setInputHeights((prev) => prev.filter((_, i) => i !== index));
  };

  const styles = getGlobalStyles(colors);

  // Estilos locales para elementos no cubiertos por los estilos globales
  const localStyles = StyleSheet.create({
    dropdownContainer: { marginBottom: 20 },
    dropdown: { marginBottom: 10 },
    zIndex1000: { zIndex: 1000 },
    dropDownContainer: { maxHeight: 200 },
    modalContainer: 
    { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'rgba(0, 0, 0, 0.5)' 
    },
    modalContent: 
    { 
      width: '80%', 
      padding: 20, 
      borderRadius: 10, 
      alignItems: 'center' 
    },
    modalButtons: 
    { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      width: '100%' 
    },
    ingredientItem: 
    { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginVertical: 5 
    },
    removeText: {},
    stepRow: 
    { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 8 
    },
    removeStepButton: 
    { 
      marginLeft: 4, 
      paddingHorizontal: 8, 
      paddingVertical: 4, 
      justifyContent: 'center', 
      alignItems: 'center', 
      minWidth: 60 
    },
    addStepButton: 
    { 
      marginTop: 10, 
      padding: 10, 
      alignItems: 'center', 
      borderRadius: 5 
    },
    addStepText: { fontSize: 16 },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <AppInput
          placeholder={t.title}
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
              const ingredient = ingredients.find((ing) => ing.id === value);
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

        {selectedIngredients.map((ing, index) => (
          <View key={index} style={localStyles.ingredientItem}>
            <Text style={{ color: colors.text }}>{ing.nombre || ''} - {ing.cantidad || ''} {ing.unidad || ''}</Text>
            <Pressable onPress={() => removeIngredient(ing.id)}>
              <Text style={[localStyles.removeText, { color: colors.accent }]}>{t.remove}</Text>
            </Pressable>
          </View>
        ))}

        <SectionTitle style={{ fontSize: 18, marginTop: 16 }}>{t.steps}</SectionTitle>
        {steps.map((step, index) => (
          <View key={index} style={localStyles.stepRow}>
            <View style={{ flex: 1 }}>
              <AppInput
                placeholder={`${t.step} ${index + 1}`}
                value={step}
                onChangeText={(text) => {
                  const updatedSteps = [...steps];
                  updatedSteps[index] = text;
                  setSteps(updatedSteps);
                }}
                multiline
                style={[styles.input, { height: inputHeights[index] || 40 }]}
                onContentSizeChange={(event) => {
                  const updatedHeights = [...inputHeights];
                  updatedHeights[index] = event.nativeEvent.contentSize.height;
                  setInputHeights(updatedHeights);
                }}
              />
            </View>
            <Pressable onPress={() => removeStep(index)} style={localStyles.removeStepButton}>
              <Text style={[localStyles.removeText, { color: colors.accent, fontWeight: 'bold' }]}>{t.remove || 'Eliminar'}</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => setSteps([...steps, ''])} style={[localStyles.addStepButton, { backgroundColor: colors.accent }]}> 
          <Text style={[localStyles.addStepText, { color: colors.text }]}>{t.addStep}</Text>
        </Pressable>

        <PrimaryButton
          title={t.createRecipe}
          onPress={onSubmit}
          disabled={loadingIngredients || !title || !description || !imageUrl || steps.length === 0 || selectedIngredients.length === 0}
          style={{ marginTop: 20 }}
          textStyle={{ color: colors.text }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
