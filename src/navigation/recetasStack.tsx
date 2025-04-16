import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Recetas from '../screens/recetas/Recetas';
import RecetaForm from '../screens/recetas/RecetaForm';

const Stack = createNativeStackNavigator();

export default function RecetasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListaRecetas" component={Recetas} options={{ title: 'Mis Recetas' }} />
      <Stack.Screen name="RecetaForm" component={RecetaForm} options={{ title: 'Crear Receta' }} />
    </Stack.Navigator>
  );
}