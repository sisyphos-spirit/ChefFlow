import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Recetas from '../screens/recetas/Recetas';
import CrearReceta from '../screens/recetas/CrearReceta';
import EditarReceta from '../screens/recetas/EditarReceta';
import InfoReceta from '../screens/recetas/InfoReceta';

const Stack = createNativeStackNavigator();

export default function RecetasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListaRecetas" component={Recetas} options={{ title: 'Mis Recetas' }} />
      <Stack.Screen name="CrearReceta" component={CrearReceta} options={{ title: 'Crear Receta' }} />
      <Stack.Screen name="EditarReceta" component={EditarReceta} options={{ title: 'Editar Receta' }} />
      <Stack.Screen name="InfoReceta" component={InfoReceta} options={{ title: 'Info Receta' }} />
    </Stack.Navigator>
  );
}