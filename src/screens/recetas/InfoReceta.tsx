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
import { useTheme } from '../../hooks/useTheme';
import { getGlobalStyles } from '../../constants/GlobalStyles';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';

interface InfoRecetaProps {
  route: { params: { receta: Receta } };
};

export default function InfoReceta({ route }: InfoRecetaProps) {
  const { receta } = route.params;
  // Cambiar referencias a los nombres de la base de datos
  const { fetchIngredientesReceta, fetchConversionUnidades, convertirUnidad } = useIngredientes();
  const { deleteReceta, togglePublicarReceta } = useRecetas();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useUserStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  // Estilos locales solo para detalles específicos
  const localStyles = StyleSheet.create({
    card: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 32,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    titulo: {
      fontSize: 26,
      fontFamily: 'Poppins-Bold',
      color: colors.text,
      marginBottom: 8,
      flex: 1,
      flexWrap: 'wrap',
    },
    section: {
      marginTop: 18,
      marginBottom: 8,
    },
    ingredient: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Nunito-Regular',
      marginBottom: 2,
    },
    step: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Nunito-Regular',
      marginBottom: 2,
    },
    // Mejora visual de los pasos
    stepsList: {
      marginTop: 8,
      marginBottom: 8,
      gap: 8,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    stepNumberCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    stepNumber: {
      color: colors.secondary,
      fontFamily: 'Poppins-Bold',
      fontSize: 16,
    },
    stepText: {
      flex: 1,
      color: colors.text,
      fontFamily: 'Nunito-Regular',
      fontSize: 16,
      lineHeight: 22,
    },
    errorText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
      color: colors.placeholder,
      fontFamily: 'Nunito-Regular',
    },
    button: {
      marginTop: 14,
      borderRadius: 8,
    },
    buttonDanger: {
      marginTop: 14,
      borderRadius: 8,
      backgroundColor: colors.accent,
    },
    buttonPrimary: {
      marginTop: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    copyButton: {
      marginTop: 10,
      borderRadius: 8,
      backgroundColor: colors.accent,
    },
    img: {
      alignSelf: 'center',
      marginVertical: 16,
    },
    imgContainer: {
      alignItems: 'center',
      marginVertical: 18,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      minHeight: 180,
      minWidth: 180,
      maxWidth: '100%',
    },
    // Mejora visual de los valores nutricionales
    nutritionCard: {
      flexDirection: 'column',
      alignItems: 'stretch',
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
      gap: 0,
    },
    nutritionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    nutritionItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nutritionLabel: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.placeholder,
      marginBottom: 2,
    },
    nutritionValue: {
      fontFamily: 'Poppins-Bold',
      fontSize: 16,
      color: colors.text,
    },
  });

  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [nutritionalTotals, setNutritionalTotals] = useState({
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(receta.publicada);
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
        <Text style={localStyles.errorText}>{t.errorRecipeNotFound}</Text>
      </View>
    );
  }

  const pasos = receta.pasos || [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={localStyles.card}>
        <View style={localStyles.row}>
          <Text style={localStyles.titulo}>{receta.titulo}</Text>
          {isOwner && (
            <Button
              type="clear"
              onPress={handleTogglePublicar}
              loading={isPublishing}
              icon={
                <Icon
                  name={isPublished ? 'lock-open' : 'lock'}
                  type="material"
                  color={isPublished ? colors.primary : colors.placeholder}
                  size={28}
                />
              }
              accessibilityLabel={isPublished ? 'Hacer privada' : 'Hacer pública'}
            />
          )}
        </View>
        <Text style={styles.textPrimary}>{receta.descripcion}</Text>

        <View style={localStyles.section}>
          <Text style={styles.sectionTitle}>{t.nutritionalValues}</Text>
          <View style={localStyles.nutritionCard}>
            <View style={localStyles.nutritionRow}>
              <View style={localStyles.nutritionItem}>
                <Text style={localStyles.nutritionLabel}>{t.calories}</Text>
                <Text style={localStyles.nutritionValue}>{nutritionalTotals.calorias.toFixed(2)}</Text>
              </View>
              <View style={localStyles.nutritionItem}>
                <Text style={localStyles.nutritionLabel}>{t.proteins}</Text>
                <Text style={localStyles.nutritionValue}>{nutritionalTotals.proteinas.toFixed(2)} g</Text>
              </View>
            </View>
            <View style={localStyles.nutritionRow}>
              <View style={localStyles.nutritionItem}>
                <Text style={localStyles.nutritionLabel}>{t.fats}</Text>
                <Text style={localStyles.nutritionValue}>{nutritionalTotals.grasas.toFixed(2)} g</Text>
              </View>
              <View style={localStyles.nutritionItem}>
                <Text style={localStyles.nutritionLabel}>{t.carbs}</Text>
                <Text style={localStyles.nutritionValue}>{nutritionalTotals.carbohidratos.toFixed(2)} g</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Imagen de la receta con presentación mejorada */}
        <View style={localStyles.imgContainer}>
          <Img_preview size={320} url={receta.imagen_url} onUpload={() => {}} />
        </View>

        <View style={localStyles.section}>
          <Text style={styles.sectionTitle}>{t.ingredients}</Text>
          <View style={{
            backgroundColor: colors.background,
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginTop: 8,
            marginBottom: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
          }}>
            {Array.isArray(ingredientes) && ingredientes.length > 0 ? (
              ingredientes.map((ing, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 10 }} />
                  <Text style={{ fontSize: 16, color: colors.text, fontFamily: 'Nunito-Regular', flexShrink: 1 }}>
                    {ing.nombre} - {ing.cantidad.toFixed(2)} {ing.unidad}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={localStyles.ingredient}>{t.noIngredients}</Text>
            )}
          </View>
        </View>

        <View style={localStyles.section}>
          <Text style={styles.sectionTitle}>{t.steps}</Text>
          {pasos.length > 0 ? (
            <View style={localStyles.stepsList}>
              {pasos.map((paso, index) => (
                <View key={index} style={localStyles.stepRow}>
                  <View style={localStyles.stepNumberCircle}>
                    <Text style={localStyles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={localStyles.stepText}>{paso}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={localStyles.step}>{t.noSteps}</Text>
          )}
        </View>

        {/* Botón para copiar el ID de la receta: visible para todos si es pública, o para el dueño si es privada */}
        {((receta.publicada === true) || isOwner) && (
          <SecondaryButton
            title={t.copyId}
            onPress={async () => {
              await Clipboard.setStringAsync(receta.id_receta || '');
              showCopyIdAlert(!receta.publicada && !!isOwner);
            }}
            style={styles.buttonPrimary}
            textStyle={styles.textPrimary}
          />
        )}
        {isOwner && (
          <>
            <PrimaryButton
              title={t.editRecipe}
              onPress={handleEdit}
              style={styles.buttonPrimary}
              textStyle={styles.textPrimary}
            />

            <PrimaryButton
              title={t.deleteRecipe}
              onPress={handleDelete}
              style={styles.buttonSecondary}
              textStyle={styles.textPrimary}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}