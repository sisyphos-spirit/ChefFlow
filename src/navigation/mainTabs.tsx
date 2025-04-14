import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Account from '../screens/Account';
import Recetas from '../screens/Recetas';
import RecetaForm from '../components/RecetaForm';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Recetas" component={Recetas} />
      <Tab.Screen name="Perfil" component={Account} />
      <Tab.Screen name="Crear Receta" component={RecetaForm} />
    </Tab.Navigator>
  );
}
