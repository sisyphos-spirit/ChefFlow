import { View, StyleSheet, Alert, Text, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { Input, Button } from '@rneui/themed';
import Img_receta from '../../components/Img_receta';
import { useState, useEffect } from 'react';
import { useRecetas } from '../../hooks/useRecetas';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { useIngredientes } from '../../hooks/useIngredientes';
import { Dropdown } from 'react-native-element-dropdown'; // Importar un dropdown para seleccionar ingredientes

export default function CrearReceta() {
    const [newTitulo, setNewTitulo] = useState('');
    const [newDescripcion, setNewDescripcion] = useState('');
    const [newRecetaUrl, setNewRecetaUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [pasos, setPasos] = useState<string[]>([]); // Estado para los pasos
    const [inputHeights, setInputHeights] = useState<number[]>([]); // Estado para las alturas dinámicas de los inputs
    const { createReceta } = useRecetas();
    const { ingredientes, loading: loadingIngredientes, fetchIngredientes } = useIngredientes(); // Obtener los ingredientes
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<{ nombre: string; cantidad: Float; unidad: string }[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<{ nombre: string; unidad: string } | null>(null);
    const [cantidad, setCantidad] = useState<string>('');

    useEffect(() => {
        fetchIngredientes(); // Llamar a la función para obtener los ingredientes al montar el componente
    }, []);

    const onSubmit = async () => {
        try {
            setLoading(true);
            await createReceta(newTitulo, newDescripcion, newRecetaUrl, pasos);
            setNewTitulo('');
            setNewDescripcion('');
            setNewRecetaUrl('');
            setPasos([]); // Limpiar los pasos después de crear la receta
            setInputHeights([]); // Limpiar las alturas de los inputs
            setIngredientesSeleccionados([]); // Limpiar los ingredientes seleccionados
        }
        catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            }
        }
        finally {
            setLoading(false);
        }
    };

    const addPaso = () => {
        setPasos([...pasos, '']); // Añadir un nuevo paso vacío
        setInputHeights([...inputHeights, 40]); // Establecer una altura inicial para el nuevo input
    };

    const updatePaso = (index: number, text: string) => {
        const updatedPasos = [...pasos];
        updatedPasos[index] = text; // Actualizar el paso correspondiente
        setPasos(updatedPasos);
    };

    const updateInputHeight = (index: number, height: number) => {
        const updatedHeights = [...inputHeights];
        updatedHeights[index] = height; // Actualizar la altura del input correspondiente
        setInputHeights(updatedHeights);
    };

    const addIngrediente = (nombre: string, cantidad: Float, unidad: string) => {
        if (!cantidad || cantidad <= 0) {
            Alert.alert('Error', 'La cantidad debe ser mayor a 0.');
            return;
        }

        if (ingredientesSeleccionados.some((ingrediente) => ingrediente.nombre === nombre)) {
            Alert.alert('Error', 'Este ingrediente ya ha sido añadido.');
            return;
        }

        setIngredientesSeleccionados([...ingredientesSeleccionados, { nombre, cantidad, unidad }]);
    };

    const removeIngrediente = (nombre: string) => {
        setIngredientesSeleccionados(
            ingredientesSeleccionados.filter((ingrediente) => ingrediente.nombre !== nombre)
        );
    };

    const openModal = (nombre: string, unidad: string) => {
        setSelectedIngredient({ nombre, unidad });
        setCantidad('');
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setSelectedIngredient(null);
        setCantidad('');
        setIsModalVisible(false);
    };

    const handleAddIngredient = () => {
        if (selectedIngredient && parseFloat(cantidad) > 0) {
            addIngrediente(selectedIngredient.nombre, parseFloat(cantidad), selectedIngredient.unidad);
            closeModal();
        } else {
            Alert.alert('Error', 'Introduce una cantidad válida.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Input label="Título" value={newTitulo} onChangeText={setNewTitulo} />
            <Input label="Descripción" value={newDescripcion} onChangeText={setNewDescripcion} />
            <Img_receta size={200} url={newRecetaUrl} onUpload={setNewRecetaUrl} />
            <Text style={{ fontSize: 30, marginTop: 15 }}>Ingredientes</Text>

            <Dropdown style={{ marginBottom: 10 }}
                data={ingredientes.map((ing) => ({ label: `${ing.nombre} (${ing.unidad})`, value: ing.nombre, unidad: ing.unidad }))}
                labelField="label"
                valueField="value"
                placeholder="Selecciona un ingrediente"
                onChange={(item: { label: string; value: string; unidad: string }) => {
                    openModal(item.value, item.unidad);
                }}
            />

            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Añadir cantidad</Text>
                        <Text>{selectedIngredient?.nombre} ({selectedIngredient?.unidad})</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Cantidad"
                            value={cantidad}
                            onChangeText={setCantidad}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancelar" onPress={closeModal} />
                            <Button title="Añadir" onPress={handleAddIngredient} />
                        </View>
                    </View>
                </View>
            </Modal>

            {ingredientesSeleccionados.map((ingrediente, index) => (
                <View key={index} style={styles.ingredienteItem}>
                    <Text>{ingrediente.nombre} - {ingrediente.cantidad} {ingrediente.unidad}</Text>
                    <Pressable onPress={() => removeIngrediente(ingrediente.nombre)}>
                        <Text style={styles.removeText}>Eliminar</Text>
                    </Pressable>
                </View>
            ))}

            <Text style={{ fontSize: 30, marginTop: 15 }}>Pasos</Text>
            {pasos.map((paso, index) => (
                <Input
                    key={index}
                    label={`Paso ${index + 1}`}
                    value={paso}
                    onChangeText={(text) => updatePaso(index, text)}
                    multiline // Permitir múltiples líneas
                    style={{ height: inputHeights[index] || 40 }} // Altura dinámica
                    onContentSizeChange={(event) =>
                        updateInputHeight(index, event.nativeEvent.contentSize.height)
                    } // Actualizar la altura cuando cambie el contenido
                />
            ))}
            <Pressable onPress={addPaso} style={styles.addPasoButton}>
                <Text style={styles.addPasoText}>+ Añadir Paso</Text>
            </Pressable>
            <Button
                title="Crear Receta"
                onPress={onSubmit}
                disabled={
                    loading ||
                    !newTitulo ||
                    !newDescripcion ||
                    !newRecetaUrl ||
                    pasos.length === 0 ||
                    ingredientesSeleccionados.length === 0
                }
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    addPasoButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#ddd',
        alignItems: 'center',
        borderRadius: 5,
    },
    addPasoText: {
        fontSize: 16,
        color: '#000',
    },
    ingredienteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    removeText: {
        color: 'red',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        marginVertical: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});
