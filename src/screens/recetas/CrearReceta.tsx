import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button } from '@rneui/themed';
import Img_receta from '../../components/Img_receta';
import { useRecetas } from '../../hooks/useRecetas';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { IngredienteBase } from '../../navigation/types';
import DropDownPicker from 'react-native-dropdown-picker';
import { isEmpty, isPositiveNumber } from '../../utils/validation';
import { showError } from '../../utils/alerts';
import { useLanguageStore } from '../../store/useLanguageStore';
import { messages } from '../../constants/messages';

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Input label={t.createRecipe} value={title} onChangeText={setTitle} />
        <Input label={t.description || 'Description'} value={description} onChangeText={setDescription} />
        <Img_receta size={200} url={imageUrl} onUpload={setImageUrl} />

        <Text style={styles.sectionTitle}>{t.ingredients}</Text>
        <View style={[styles.dropdownContainer, openDropdown ? styles.zIndex1000 : null]}>
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
              if (!value) return; // Ensure value is valid

              const ingredient = ingredients.find((ing) => ing.id === value);
              if (ingredient) {
                openModal(ingredient);
              }
            }}
            setItems={() => {}}
            searchable
            searchPlaceholder={t.searchIngredient}
            onChangeSearchText={setSearchValue}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
          />
        </View>

        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.addQuantity}</Text>
              <Text>{selectedIngredient?.nombre || ''} ({selectedIngredient?.unidad || ''})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder={t.amount}
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.modalButtons}>
                <Button title={t.cancel} onPress={closeModal} />
                <Button title={t.add} onPress={addIngredient} />
              </View>
            </View>
          </View>
        </Modal>

        {selectedIngredients.map((ing, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text>{ing.nombre || ''} - {ing.cantidad || ''} {ing.unidad || ''}</Text>
            <Pressable onPress={() => removeIngredient(ing.id)}>
              <Text style={styles.removeText}>{t.remove}</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{t.steps}</Text>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={{ flex: 1 }}>
              <Input
                label={`${t.step} ${index + 1}`}
                value={step}
                onChangeText={(text) => {
                  const updatedSteps = [...steps];
                  updatedSteps[index] = text;
                  setSteps(updatedSteps);
                }}
                multiline
                style={[styles.stepInput, { height: inputHeights[index] || 40 }]}
                onContentSizeChange={(event) => {
                  const updatedHeights = [...inputHeights];
                  updatedHeights[index] = event.nativeEvent.contentSize.height;
                  setInputHeights(updatedHeights);
                }}
              />
            </View>
            <Pressable onPress={() => removeStep(index)} style={styles.removeStepButton}>
              <Text style={styles.removeText}>{t.remove || 'Eliminar'}</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => setSteps([...steps, ''])} style={styles.addStepButton}>
          <Text style={styles.addStepText}>{t.addStep}</Text>
        </Pressable>

        <Button
          title={t.createRecipe}
          onPress={onSubmit}
          disabled={loadingIngredients || !title || !description || !imageUrl || steps.length === 0 || selectedIngredients.length === 0}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  dropdownContainer: { marginBottom: 20 },
  dropdown: { marginBottom: 10 },
  zIndex1000: { zIndex: 1000 },
  dropDownContainer: { maxHeight: 200 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, width: '100%', marginVertical: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  ingredientItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  removeText: { color: 'red' },
  stepInput: {},
  addStepButton: { marginTop: 10, padding: 10, backgroundColor: '#ddd', alignItems: 'center', borderRadius: 5 },
  addStepText: { fontSize: 16, color: '#000' },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeStepButton: {
    marginLeft: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
});
