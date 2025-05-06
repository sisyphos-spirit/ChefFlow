import { View, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';
import Img_preview from '../../components/Img_preview';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { Ingrediente } from '../../hooks/useIngredientes';
import { useState, useEffect } from 'react';

export default function InfoReceta({ route }: { route: any }) {
  const { receta } = route.params;
  const { fetchIngredientesReceta } = useIngredientes();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);

  useEffect(() => {
    console.log('Receta ID:', receta?.id_receta); // Log para depuración
    async function loadIngredientes() {
      if (receta && receta.id_receta) {
        const fetchedIngredientes = await fetchIngredientesReceta(receta.id_receta);
        console.log('Fetched ingredientes:', fetchedIngredientes); // Log para depuración
        setIngredientes(fetchedIngredientes);
      }
    }
    loadIngredientes();
  }, [receta]);

  if (!receta) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: No se encontró la receta.</Text>
      </View>
    );
  }

  const pasos = receta.pasos || [];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{receta.titulo}</Text>
      <Text>{receta.descripcion}</Text>
      <Img_preview size={200} url={receta.imagen_url} onUpload={() => {}} />

      <Text style={styles.sectionTitle}>Ingredientes:</Text>
      {ingredientes.length > 0 ? (
        ingredientes.map((ing: { nombre: string; cantidad: number; unidad: string }, index: number) => (
          <Text key={index}>
            {ing.nombre} - {ing.cantidad} {ing.unidad}
          </Text>
        ))
      ) : (
        <Text>No hay ingredientes disponibles.</Text>
      )}

      <Text style={styles.sectionTitle}>Pasos:</Text>
      {pasos.length > 0 ? (
        pasos.map((paso: string, index: number) => (
          <Text key={index}>
            {index + 1}. {paso}
          </Text>
        ))
      ) : (
        <Text>No hay pasos disponibles.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 25, padding: 10, borderWidth: 1, borderRadius: 5 },
  titulo: { fontSize: 30, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
});