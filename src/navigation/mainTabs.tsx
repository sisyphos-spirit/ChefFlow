import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Account from '../screens/Account';
import Recetas from '../screens/recetas/Recetas';
import RecetaForm from '../screens/recetas/RecetaForm';
import RecetasStack from './recetasStack';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Recetas" component={RecetasStack} />
      <Tab.Screen name="Perfil" component={Account} />
    </Tab.Navigator>
  );
}
