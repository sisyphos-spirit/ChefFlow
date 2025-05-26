import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRecetas } from '../../hooks/useRecetas';
import { supabase } from '../../lib/supabase';

export default function BuscarPorId() {
  const [recetaId, setRecetaId] = useState('');
  const navigation = useNavigation();
  const { recetas, fetchRecetas } = useRecetas();

  // Buscar receta por id_receta directamente en la base de datos
  const fetchRecetaById = async (id: string) => {
    const { data, error } = await supabase
      .from('recetas')
      .select('*')
      .eq('id_receta', id)
      .single();
    if (error || !data) return null;
    // Obtener ingredientes
    const { data: recetaIngredientes } = await supabase
      .from('receta_ingredientes')
      .select('id_ingrediente, cantidad')
      .eq('id_receta', id);
    let ingredientes: any[] = [];
    if (recetaIngredientes && recetaIngredientes.length > 0) {
      const ingredienteIds = recetaIngredientes.map((item: any) => item.id_ingrediente);
      const { data: ingredientesData } = await supabase
        .from('ingredientes')
        .select('id, nombre, unidad')
        .in('id', ingredienteIds);
      ingredientes = recetaIngredientes.map((ri: any) => {
        const ing = ingredientesData?.find((i: any) => i.id === ri.id_ingrediente);
        return {
          id: ri.id_ingrediente,
          nombre: ing?.nombre || 'Desconocido',
          unidad: ing?.unidad || 'Desconocido',
          cantidad: ri.cantidad,
        };
      });
    }
    return { ...data, ingredientes };
  };

  const handleBuscar = async () => {
    if (!recetaId.trim()) {
      Alert.alert('Error', 'Por favor, introduce un ID de receta.');
      return;
    }
    const receta = await fetchRecetaById(recetaId.trim());
    if (receta) {
      (navigation as any).navigate('InfoReceta', { receta });
    } else {
      Alert.alert('No encontrado', 'No se encontró ninguna receta con ese ID.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pega el ID de la receta:</Text>
      <TextInput
        style={styles.input}
        value={recetaId}
        onChangeText={setRecetaId}
        placeholder="ID de la receta"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Buscar receta" onPress={handleBuscar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});
