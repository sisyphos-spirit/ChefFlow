import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, Modal, TextInput } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useRecetas } from '../../hooks/useRecetas';
import { useIngredientes, IngredienteBase, Ingrediente } from '../../hooks/useIngredientes';
import Img_receta from '../../components/Img_receta';
import DropDownPicker from 'react-native-dropdown-picker';

export default function EditarReceta() {
  const route = useRoute<RouteProp<RootStackParamList, 'EditarReceta'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { receta } = route.params;
  const { updateReceta } = useRecetas();
  const { fetchIngredientes, fetchIngredientesReceta, ingredientes: ingredientesDisponibles } = useIngredientes();

  const [titulo, setTitulo] = useState(receta.titulo);
  const [descripcion, setDescripcion] = useState(receta.descripcion);
  const [imagenUrl, setImagenUrl] = useState(receta.imagen_url);
  const [pasos, setPasos] = useState<string[]>(receta.pasos || []);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredienteBase | null>(null);
  const [cantidad, setCantidad] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredIngredientes, setFilteredIngredientes] = useState<IngredienteBase[]>([]);

  useEffect(() => {
    fetchIngredientes();
    async function cargarIngredientes() {
      if (receta.id_receta) {
        const ingredientesReceta = await fetchIngredientesReceta(receta.id_receta);
        setIngredientes(ingredientesReceta);
      }
    }
    cargarIngredientes();
  }, []);

  useEffect(() => {
    setFilteredIngredientes(
      ingredientesDisponibles.filter((ing: IngredienteBase) =>
        ing.nombre.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [searchValue, ingredientesDisponibles]);

  const handleSave = async () => {
    try {
      await updateReceta(receta.id_receta, titulo, descripcion, imagenUrl, pasos, ingredientes);
      Alert.alert('Éxito', 'Receta actualizada correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la receta');
    }
  };

  const handleAddPaso = () => {
    setPasos([...pasos, '']);
  };

  const handleRemovePaso = (index: number) => {
    const updatedPasos = pasos.filter((_, i) => i !== index);
    setPasos(updatedPasos);
  };

  const handleUpdatePaso = (index: number, text: string) => {
    const updatedPasos = [...pasos];
    updatedPasos[index] = text;
    setPasos(updatedPasos);
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

  const addIngrediente = () => {
    if (!selectedIngredient || !cantidad || parseFloat(cantidad) <= 0) {
      Alert.alert('Error', 'Selecciona un ingrediente y una cantidad válida.');
      return;
    }
    // Si el ingrediente ya existe, actualiza la cantidad en vez de ignorar
    setIngredientes((prev) => {
      const existente = prev.find((ing) => ing.id === selectedIngredient.id);
      if (existente) {
        return prev.map((ing) =>
          ing.id === selectedIngredient.id
            ? { ...ing, cantidad: parseFloat(cantidad) }
            : ing
        );
      } else {
        return [
          ...prev,
          { ...selectedIngredient, cantidad: parseFloat(cantidad) },
        ];
      }
    });
    closeModal();
  };

  const removeIngrediente = (id: string) => {
    setIngredientes((prev) => prev.filter((ing) => ing.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Input
          label="Título"
          value={titulo}
          onChangeText={setTitulo}
        />
        <Input
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
        <Text style={styles.sectionTitle}>Imagen</Text>
        <Img_receta size={200} url={imagenUrl} onUpload={setImagenUrl} />

        <View style={styles.sectionContainer}>
          <Button title="Añadir Paso" onPress={handleAddPaso} />
          {pasos.map((paso, index) => (
            <View key={index} style={styles.pasoContainer}>
              <Input
                label={`Paso ${index + 1}`}
                value={paso}
                onChangeText={(text) => handleUpdatePaso(index, text)}
              />
              <Button title="Eliminar" onPress={() => handleRemovePaso(index)} />
            </View>
          ))}
        </View>

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
              if (!value) return;
              const ingredient = ingredientesDisponibles.find((ing: IngredienteBase) => ing.id === value);
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
        {ingredientes.map((ing, index) => (
          <View key={index} style={styles.ingredienteItem}>
            <Text>{ing.nombre || ''} - {('cantidad' in ing ? ing.cantidad : '')} {ing.unidad || ''}</Text>
            <Button title="Eliminar" onPress={() => removeIngrediente(ing.id)} type="clear" titleStyle={{ color: 'red' }} />
          </View>
        ))}

        <Button
          title="Guardar Cambios"
          onPress={handleSave}
          buttonStyle={{ backgroundColor: 'green', marginTop: 20 }}
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
  dropdown: { marginBottom: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, width: '100%', marginVertical: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  ingredienteItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5, alignItems: 'center' },
});