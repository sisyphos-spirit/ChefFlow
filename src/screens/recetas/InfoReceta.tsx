import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@rneui/themed';
import Img_preview from '../../components/Img_preview';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { Ingrediente } from '../../hooks/useIngredientes';
import { useState, useEffect } from 'react';

export default function InfoReceta({ route }: { route: any }) {
  const { receta } = route.params;
  const { fetchIngredientesReceta, fetchConversionUnidades, convertirUnidad } = useIngredientes();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [nutritionalTotals, setNutritionalTotals] = useState({
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
  });

  useEffect(() => {
    async function loadIngredientes() {
      if (receta && receta.id_receta) {
        const fetchedIngredientes = await fetchIngredientesReceta(receta.id_receta);
        const conversionMap = await fetchConversionUnidades();

        // Convert quantities to grams and calculate nutritional totals
        let totalCalorias = 0;
        let totalProteinas = 0;
        let totalCarbohidratos = 0;
        let totalGrasas = 0;

        const convertedIngredientes = fetchedIngredientes.map((ing) => {
          const cantidadEnGramos = ing.unidad === 'g' ? ing.cantidad : convertirUnidad(ing.cantidad, ing.id, conversionMap);
          totalCalorias += (ing.calorias || 0) * (cantidadEnGramos / 100);
          totalProteinas += (ing.proteinas || 0) * (cantidadEnGramos / 100);
          totalCarbohidratos += (ing.carbohidratos || 0) * (cantidadEnGramos / 100);
          totalGrasas += (ing.grasas || 0) * (cantidadEnGramos / 100);
          return { ...ing, cantidad: cantidadEnGramos, unidad: 'g' };
        });

        setIngredientes(convertedIngredientes);
        setNutritionalTotals({
          calorias: totalCalorias,
          proteinas: totalProteinas,
          carbohidratos: totalCarbohidratos,
          grasas: totalGrasas,
        });
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.titulo}>{receta.titulo}</Text>
        <Text>{receta.descripcion}</Text>

        <Text style={styles.sectionTitle}>Valores nutricionales:</Text>
        <Text>Calorías: {nutritionalTotals.calorias.toFixed(2)}</Text>
        <Text>Proteínas: {nutritionalTotals.proteinas.toFixed(2)} g</Text>
        <Text>Grasas: {nutritionalTotals.grasas.toFixed(2)} g</Text>
        <Text>Carbohidratos: {nutritionalTotals.carbohidratos.toFixed(2)} g</Text>

        <Img_preview size={200} url={receta.imagen_url} onUpload={() => {}} />

        <Text style={styles.sectionTitle}>Ingredientes:</Text>
        {ingredientes.length > 0 ? (
          ingredientes.map((ing: { nombre: string; cantidad: number; unidad: string }, index: number) => (
            <Text key={index}>
              {ing.nombre} - {ing.cantidad.toFixed(2)} {ing.unidad}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { marginHorizontal: 25, padding: 10, borderWidth: 1, borderRadius: 5 },
  titulo: { fontSize: 30, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
});