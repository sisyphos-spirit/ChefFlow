import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Recetas from '../screens/Recetas';
import RecetaForm from '../components/RecetaForm';

const Stack = createNativeStackNavigator();

export default function RecetasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListaRecetas" component={Recetas} options={{ title: 'Mis Recetas' }} />
      <Stack.Screen name="RecetaForm" component={RecetaForm} options={{ title: 'Crear Receta' }} />
    </Stack.Navigator>
  );
}