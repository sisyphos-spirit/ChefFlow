import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button } from '@rneui/themed';
import Img_receta from '../../components/Img_receta';
import { useRecetas } from '../../hooks/useRecetas';
import { useIngredientes, IngredienteBase } from '../../hooks/useIngredientes';
import DropDownPicker from 'react-native-dropdown-picker';

export default function CrearReceta() {
  const [newTitulo, setNewTitulo] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newRecetaUrl, setNewRecetaUrl] = useState('');
  const [pasos, setPasos] = useState<string[]>([]);
  const [inputHeights, setInputHeights] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<{ id: string; nombre: string; unidad: string } | null>(null);
  const [cantidad, setCantidad] = useState<string>('');
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<{ id: string; nombre: string; cantidad: number; unidad: string }[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredIngredientes, setFilteredIngredientes] = useState<IngredienteBase[]>([]);

  const { createReceta } = useRecetas();
  const { ingredientes, loading: loadingIngredientes, fetchIngredientes } = useIngredientes();

  useEffect(() => {
    console.log('Fetching ingredientes'); // Log para depuración
    fetchIngredientes();
  }, []);

  useEffect(() => {
    setFilteredIngredientes(
      ingredientes.filter((ing) =>
        ing.nombre.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [searchValue, ingredientes]);

  const addIngrediente = () => {
    if (!selectedIngredient || !cantidad || parseFloat(cantidad) <= 0) {
      Alert.alert('Error', 'Selecciona un ingrediente y una cantidad válida.');
      return;
    }

    if (ingredientesSeleccionados.some((ing) => ing.id === selectedIngredient.id)) {
      Alert.alert('Error', 'Este ingrediente ya ha sido añadido.');
      return;
    }

    setIngredientesSeleccionados((prev) => [
      ...prev,
      { ...selectedIngredient, cantidad: parseFloat(cantidad) },
    ]);
    closeModal();
  };

  const removeIngrediente = (id: string) => {
    setIngredientesSeleccionados((prev) => prev.filter((ing) => ing.id !== id));
  };

  const openModal = (ingredient: IngredienteBase) => {
    setSelectedIngredient(ingredient);
    setCantidad('');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedIngredient(null);
    setCantidad('');
    setIsModalVisible(false);
  };

  const onSubmit = async () => {
    if (!newTitulo || !newDescripcion || !newRecetaUrl || pasos.length === 0 || ingredientesSeleccionados.length === 0) {
      Alert.alert('Error', 'Completa todos los campos antes de crear la receta.');
      return;
    }

    await createReceta(newTitulo, newDescripcion, newRecetaUrl, pasos, ingredientesSeleccionados);
    setNewTitulo('');
    setNewDescripcion('');
    setNewRecetaUrl('');
    setPasos([]);
    setInputHeights([]);
    setIngredientesSeleccionados([]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 20 }]}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <Input label="Título" value={newTitulo} onChangeText={setNewTitulo} />
        <Input label="Descripción" value={newDescripcion} onChangeText={setNewDescripcion} />
        <Img_receta size={200} url={newRecetaUrl} onUpload={setNewRecetaUrl} />

        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <View style={{ zIndex: 1000, flex: 1, marginBottom: 20 }}>
          <DropDownPicker
            open={openDropdown}
            value={selectedIngredient?.id || null}
            items={filteredIngredientes.map((ing) => ({
              label: `${ing.nombre || 'Ingrediente desconocido'} (${ing.unidad || 'unidad desconocida'})`,
              value: ing.id,
              ingredient: ing,
            }))}
            setOpen={setOpenDropdown}
            setValue={(callback) => {
              const value = callback(selectedIngredient?.id || null);
              if (!value) return; // Ensure value is valid

              const ingredient = ingredientes.find((ing) => ing.id === value);
              if (ingredient) {
                openModal(ingredient);
              }
            }}
            setItems={() => {}}
            searchable
            searchPlaceholder="Buscar ingrediente..."
            onChangeSearchText={setSearchValue}
            style={[styles.dropdown, { zIndex: 1000 }]}
            dropDownContainerStyle={{ zIndex: 1000, maxHeight: 200 }}
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
                value={cantidad}
                onChangeText={setCantidad}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancelar" onPress={closeModal} />
                <Button title="Añadir" onPress={addIngrediente} />
              </View>
            </View>
          </View>
        </Modal>

        {ingredientesSeleccionados.map((ing, index) => (
          <View key={index} style={styles.ingredienteItem}>
            <Text>{ing.nombre || ''} - {ing.cantidad || ''} {ing.unidad || ''}</Text>
            <Pressable onPress={() => removeIngrediente(ing.id)}>
              <Text style={styles.removeText}>Eliminar</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Pasos</Text>
        {pasos.map((paso, index) => (
          <Input
            key={index}
            label={`Paso ${index + 1}`}
            value={paso}
            onChangeText={(text) => {
              const updatedPasos = [...pasos];
              updatedPasos[index] = text;
              setPasos(updatedPasos);
            }}
            multiline
            style={{ height: inputHeights[index] || 40 }}
            onContentSizeChange={(event) => {
              const updatedHeights = [...inputHeights];
              updatedHeights[index] = event.nativeEvent.contentSize.height;
              setInputHeights(updatedHeights);
            }}
          />
        ))}
        <Pressable onPress={() => setPasos([...pasos, ''])} style={styles.addPasoButton}>
          <Text style={styles.addPasoText}>+ Añadir Paso</Text>
        </Pressable>

        <Button
          title="Crear Receta"
          onPress={onSubmit}
          disabled={loadingIngredientes || !newTitulo || !newDescripcion || !newRecetaUrl || pasos.length === 0 || ingredientesSeleccionados.length === 0}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  dropdown: { marginBottom: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, width: '100%', marginVertical: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  ingredienteItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  removeText: { color: 'red' },
  addPasoButton: { marginTop: 10, padding: 10, backgroundColor: '#ddd', alignItems: 'center', borderRadius: 5 },
  addPasoText: { fontSize: 16, color: '#000' },
});
