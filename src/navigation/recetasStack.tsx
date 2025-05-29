import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Recetas from '../screens/recetas/Recetas';
import CrearReceta from '../screens/recetas/CrearReceta';
import EditarReceta from '../screens/recetas/EditarReceta';
import InfoReceta from '../screens/recetas/InfoReceta';
import { useTheme } from '../hooks/useTheme'; // Cambiado a la ruta correcta
import { useLanguageStore } from '../store/useLanguageStore';
import { messages } from '../constants/messages';

const Stack = createNativeStackNavigator();

export default function RecetasStack() {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerTitleStyle: {
          fontFamily: 'Poppins-Bold',
          fontSize: 22,
          color: colors.text,
        },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="ListaRecetas" component={Recetas} options={{ title: t.myRecipes }} />
      <Stack.Screen name="CrearReceta" component={CrearReceta} options={{ title: t.createRecipe }} />
      <Stack.Screen name="EditarReceta" component={EditarReceta} options={{ title: t.editRecipe }} />
      <Stack.Screen name="InfoReceta" component={InfoReceta as React.ComponentType<any>} options={{ title: t.viewRecipe }} />
    </Stack.Navigator>
  );
}