import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Explorar from '../screens/recetas/Explorar';
import InfoReceta from '../screens/recetas/InfoReceta';

const Stack = createNativeStackNavigator();

export default function ExplorarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ExplorarRecetas" component={Explorar} options={{ title: 'Explorar' }} />
      <Stack.Screen name="InfoReceta" component={InfoReceta} options={{ title: 'Info Receta' }} />
    </Stack.Navigator>
  );
}
