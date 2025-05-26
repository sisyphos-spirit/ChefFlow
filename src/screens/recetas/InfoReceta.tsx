import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button } from '@rneui/themed';
import Img_preview from '../../components/Img_preview';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { Ingrediente } from '../../hooks/useIngredientes';
import { useState, useEffect } from 'react';
import { useRecetas } from '../../hooks/useRecetas';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useUserStore } from '../../store/useUserStore';
import { Icon } from '@rneui/themed';
import * as Clipboard from 'expo-clipboard';

export default function InfoReceta({ route }: { route: any }) {
  const { receta } = route.params;
  const { fetchIngredientesReceta, fetchConversionUnidades, convertirUnidad } = useIngredientes();
  const { deleteReceta, togglePublicarReceta } = useRecetas();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUserStore((state) => state.user);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [nutritionalTotals, setNutritionalTotals] = useState({
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
  });
  const [publicando, setPublicando] = useState(false);
  const [publicada, setPublicada] = useState(receta.publicada);
  const esDueno = user && (receta.id_usuario === user.id);

  useEffect(() => {
    async function loadIngredientes() {
      if (receta && receta.id_receta) {
        try {
          const fetchedIngredientes = await fetchIngredientesReceta(receta.id_receta);
          const conversionMap = await fetchConversionUnidades();

          // Calcular valores nutricionales usando cantidades en gramos, pero guardar ingredientes con su unidad original
          let totalCalorias = 0;
          let totalProteinas = 0;
          let totalCarbohidratos = 0;
          let totalGrasas = 0;

          fetchedIngredientes.forEach((ing) => {
            const cantidadEnGramos = ing.unidad === 'g' ? ing.cantidad : convertirUnidad(ing.cantidad, ing.id, conversionMap);
            totalCalorias += (ing.calorias || 0) * (cantidadEnGramos / 100);
            totalProteinas += (ing.proteinas || 0) * (cantidadEnGramos / 100);
            totalCarbohidratos += (ing.carbohidratos || 0) * (cantidadEnGramos / 100);
            totalGrasas += (ing.grasas || 0) * (cantidadEnGramos / 100);
          });

          setIngredientes(fetchedIngredientes); // Guardar ingredientes con unidad original
          setNutritionalTotals({
            calorias: totalCalorias,
            proteinas: totalProteinas,
            carbohidratos: totalCarbohidratos,
            grasas: totalGrasas,
          });
        } catch (error) {
          console.error('Error al cargar los ingredientes:', error);
        }
      }
    }

    if (receta) {
      loadIngredientes();
    } else {
      console.warn('La receta no existe o fue eliminada.');
    }
  }, [receta]);

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta receta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (receta && receta.id_receta) {
                await deleteReceta(receta.id_receta);
                navigation.goBack(); // Redirige a la pantalla anterior
              }
            } catch (error) {
              alert(`Error al eliminar la receta`);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditarReceta', { receta });
  };

  const handleTogglePublicar = async () => {
    if (!publicada) {
      // Si va a hacer pública una receta privada, mostrar advertencia
      Alert.alert(
        'Advertencia',
        'Estás a punto de hacer pública esta receta. Cualquier usuario podrá verla y copiar su ID. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sí, hacer pública',
            style: 'default',
            onPress: async () => {
              setPublicando(true);
              const nuevoEstado = await togglePublicarReceta(receta.id_receta, true);
              if (nuevoEstado !== null) setPublicada(nuevoEstado);
              setPublicando(false);
            },
          },
        ]
      );
    } else {
      setPublicando(true);
      const nuevoEstado = await togglePublicarReceta(receta.id_receta, false);
      if (nuevoEstado !== null) setPublicada(nuevoEstado);
      setPublicando(false);
    }
  };

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.titulo}>{receta.titulo}</Text>
          {esDueno && (
            <Button
              type="clear"
              onPress={handleTogglePublicar}
              loading={publicando}
              icon={
                <Icon
                  name={publicada ? 'lock-open' : 'lock'}
                  type="material"
                  color={publicada ? 'green' : 'grey'}
                  size={28}
                />
              }
              accessibilityLabel={publicada ? 'Hacer privada' : 'Hacer pública'}
            />
          )}
        </View>
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

        {/* Botón para copiar el ID de la receta: visible para todos si es pública, o para el dueño si es privada */}
        {((receta.publicada === true) || esDueno) && (
          <Button
            title="Copiar ID de receta"
            onPress={async () => {
              await Clipboard.setStringAsync(receta.id_receta || receta.id || '');
              if (!receta.publicada && esDueno) {
                Alert.alert(
                  'Precaución al compartir',
                  'Estás a punto de compartir el ID de una receta privada. Solo comparte este ID con personas de confianza, ya que cualquiera con el ID podrá ver tu receta.'
                );
              } else {
                Alert.alert('ID copiado', 'El ID de la receta se ha copiado al portapapeles.');
              }
            }}
            buttonStyle={{ backgroundColor: '#888', marginTop: 10 }}
          />
        )}
        {esDueno && (
          <>
            <Button
              title="Editar Receta"
              onPress={handleEdit}
              buttonStyle={{ backgroundColor: 'blue', marginTop: 20 }}
            />

            <Button
              title="Eliminar Receta"
              onPress={handleDelete}
              buttonStyle={{ backgroundColor: 'red', marginTop: 20 }}
            />
          </>
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