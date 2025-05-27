import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button } from '@rneui/themed';
import Img_preview from '../../components/Img_preview';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { Ingrediente } from '../../navigation/types';
import { useState, useEffect } from 'react';
import { useRecetas } from '../../hooks/useRecetas';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useUserStore } from '../../store/useUserStore';
import { Icon } from '@rneui/themed';
import * as Clipboard from 'expo-clipboard';
import type { RouteProp } from '@react-navigation/native';
import type { Receta } from '../../navigation/types';
import { useLanguageStore } from '../../store/useLanguageStore';
import { messages } from '../../constants/messages';

interface InfoRecetaProps {
  route: { params: { receta: Receta } };
}

export default function InfoReceta({ route }: InfoRecetaProps) {
  const { receta } = route.params;
  // Cambiar referencias a los nombres de la base de datos
  const { fetchIngredientesReceta, fetchConversionUnidades, convertirUnidad } = useIngredientes();
  const { deleteReceta, togglePublicarReceta } = useRecetas();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUserStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [nutritionalTotals, setNutritionalTotals] = useState({
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(receta.publicada);
  // Cambiar comprobación de propietario para usar el campo correcto del usuario de Supabase
  // El objeto user de Supabase tiene el campo 'id', no 'id_usuario'.
  const isOwner = user && (receta.id_usuario === user.id);

  useEffect(() => {
    async function loadIngredientes() {
      if (!receta || !receta.id_receta) {
        console.warn('La receta no existe o fue eliminada.');
        setIngredientes([]);
        setNutritionalTotals({ calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
        return;
      }
      try {
        const fetchedIngredientes = await fetchIngredientesReceta(receta.id_receta);
        const conversionMap = await fetchConversionUnidades();
        let totalCalorias = 0;
        let totalProteinas = 0;
        let totalCarbohidratos = 0;
        let totalGrasas = 0;
        fetchedIngredientes.forEach((ing) => {
          if (!ing || typeof ing.cantidad !== 'number') return;
          const cantidadEnGramos = ing.unidad === 'g' ? ing.cantidad : convertirUnidad(ing.cantidad, ing.id, conversionMap);
          totalCalorias += (ing.calorias || 0) * (cantidadEnGramos / 100);
          totalProteinas += (ing.proteinas || 0) * (cantidadEnGramos / 100);
          totalCarbohidratos += (ing.carbohidratos || 0) * (cantidadEnGramos / 100);
          totalGrasas += (ing.grasas || 0) * (cantidadEnGramos / 100);
        });
        setIngredientes(fetchedIngredientes);
        setNutritionalTotals({
          calorias: totalCalorias,
          proteinas: totalProteinas,
          carbohidratos: totalCarbohidratos,
          grasas: totalGrasas,
        });
      } catch (error) {
        showAlert('Error', 'Error al cargar los ingredientes.');
        setIngredientes([]);
        setNutritionalTotals({ calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
      }
    }
    if (receta) {
      loadIngredientes();
    } else {
      console.warn('La receta no existe o fue eliminada.');
      setIngredientes([]);
      setNutritionalTotals({ calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    }
  }, [receta]);

  const handleDelete = async () => {
    Alert.alert(
      t.confirmDeleteTitle,
      t.confirmDeleteMsg,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              if (receta && receta.id_receta) {
                await deleteReceta(receta.id_receta);
                navigation.goBack();
              }
            } catch (error) {
              alert(t.errorDelete);
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
    if (!isPublished) {
      // Si va a hacer pública una receta privada, mostrar advertencia
      Alert.alert(
        t.makePublicWarningTitle,
        t.makePublicWarningMsg,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.yesMakePublic,
            style: 'default',
            onPress: async () => {
              setIsPublishing(true);
              if (receta && receta.id_receta) {
                const nuevoEstado = await togglePublicarReceta(receta.id_receta, true);
                if (nuevoEstado !== null) setIsPublished(nuevoEstado);
              }
              setIsPublishing(false);
            },
          },
        ]
      );
    } else {
      setIsPublishing(true);
      if (receta && receta.id_receta) {
        const nuevoEstado = await togglePublicarReceta(receta.id_receta, false);
        if (nuevoEstado !== null) setIsPublished(nuevoEstado);
      }
      setIsPublishing(false);
    }
  };

  function showAlert(title: string, message: string, buttons?: any[]) {
    Alert.alert(title, message, buttons);
  }
  function showCopyIdAlert(isPrivate: boolean) {
    if (isPrivate) {
      showAlert(t.copyIdWarningTitle || '', t.copyIdWarningMsg || '');
    } else {
      showAlert(t.idCopied, t.idCopiedMsg || '');
    }
  }

  if (!receta) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t.errorRecipeNotFound}</Text>
      </View>
    );
  }

  const pasos = receta.pasos || [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.titulo}>{receta.titulo}</Text>
          {isOwner && (
            <Button
              type="clear"
              onPress={handleTogglePublicar}
              loading={isPublishing}
              icon={
                <Icon
                  name={isPublished ? 'lock-open' : 'lock'}
                  type="material"
                  color={isPublished ? 'green' : 'grey'}
                  size={28}
                />
              }
              accessibilityLabel={isPublished ? 'Hacer privada' : 'Hacer pública'}
            />
          )}
        </View>
        <Text>{receta.descripcion}</Text>

        <Text style={styles.sectionTitle}>{t.nutritionalValues}</Text>
        <Text>{t.calories}: {nutritionalTotals.calorias.toFixed(2)}</Text>
        <Text>{t.proteins}: {nutritionalTotals.proteinas.toFixed(2)} g</Text>
        <Text>{t.fats}: {nutritionalTotals.grasas.toFixed(2)} g</Text>
        <Text>{t.carbs}: {nutritionalTotals.carbohidratos.toFixed(2)} g</Text>

        <Img_preview size={200} url={receta.imagen_url} onUpload={() => {}} />

        <Text style={styles.sectionTitle}>{t.ingredients}</Text>
        {ingredientes.length > 0 ? (
          ingredientes.map((ing, index) => (
            <Text key={index}>
              {ing.nombre} - {ing.cantidad.toFixed(2)} {ing.unidad}
            </Text>
          ))
        ) : (
          <Text>{t.noIngredients}</Text>
        )}

        <Text style={styles.sectionTitle}>{t.steps}</Text>
        {pasos.length > 0 ? (
          pasos.map((paso, index) => (
            <Text key={index}>
              {index + 1}. {paso}
            </Text>
          ))
        ) : (
          <Text>{t.noSteps}</Text>
        )}

        {/* Botón para copiar el ID de la receta: visible para todos si es pública, o para el dueño si es privada */}
        {((receta.publicada === true) || isOwner) && (
          <Button
            title={t.copyId}
            onPress={async () => {
              await Clipboard.setStringAsync(receta.id_receta || '');
              showCopyIdAlert(!receta.publicada && !!isOwner);
            }}
            buttonStyle={styles.copyButton}
          />
        )}
        {isOwner && (
          <>
            <Button
              title={t.editRecipe}
              onPress={handleEdit}
              buttonStyle={styles.editButton}
            />

            <Button
              title={t.deleteRecipe}
              onPress={handleDelete}
              buttonStyle={styles.deleteButton}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 30, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
  copyButton: { backgroundColor: '#888', marginTop: 10 },
  editButton: { backgroundColor: 'blue', marginTop: 20 },
  deleteButton: { backgroundColor: 'red', marginTop: 20 },
});