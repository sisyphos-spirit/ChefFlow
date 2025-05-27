import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, Modal, TextInput } from 'react-native';
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Input label={t.editRecipe} value={title} onChangeText={setTitle} />
        <Input label={t.description || 'Description'} value={description} onChangeText={setDescription} />
        <Img_receta size={200} url={imageUrl} onUpload={setImageUrl} />

        <View style={styles.sectionContainer}>
          <Button title="Añadir Paso" onPress={handleAddStep} />
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label={`Paso ${index + 1}`}
                  value={step}
                  onChangeText={(text) => handleUpdateStep(index, text)}
                  multiline
                  style={[styles.stepInput]}
                />
              </View>
              <Button
                title="Eliminar"
                onPress={() => handleRemoveStep(index)}
                type="clear"
                titleStyle={styles.deleteText}
                buttonStyle={styles.removeStepButton}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <View style={styles.dropdownContainer}>
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
            searchPlaceholder="Buscar ingrediente..."
            onChangeSearchText={setSearchValue}
            style={[styles.dropdown, styles.zIndex1000]}
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
              <Text style={styles.modalTitle}>Añadir cantidad</Text>
              <Text>{selectedIngredient?.nombre || ''} ({selectedIngredient?.unidad || ''})</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Cantidad"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancelar" onPress={closeModal} />
                <Button title="Añadir" onPress={addIngredient} />
              </View>
            </View>
          </View>
        </Modal>
        {ingredients.map((ing, index) => (
          <View key={index} style={styles.ingredienteItem}>
            <Text>{ing.nombre || ''} - {('cantidad' in ing ? ing.cantidad : '')} {ing.unidad || ''}</Text>
            <Button title="Eliminar" onPress={() => removeIngredient(ing.id)} type="clear" titleStyle={styles.deleteText} />
          </View>
        ))}
        <Button
          title="Guardar Cambios"
          onPress={handleSave}
          buttonStyle={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { marginHorizontal: 25, padding: 10, borderWidth: 1, borderRadius: 5 },
  sectionContainer: { marginTop: 20 },
  pasoContainer: { marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  dropdownContainer: { zIndex: 1000, flex: 1, marginBottom: 20 },
  zIndex1000: { zIndex: 1000 },
  dropDownContainer: { zIndex: 1000, maxHeight: 200 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, width: '100%', marginVertical: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  ingredienteItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5, alignItems: 'center' },
  deleteText: { color: 'red' },
  saveButton: { backgroundColor: 'green', marginTop: 20 },
  dropdown: { marginBottom: 10 },
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
  stepInput: {},
});