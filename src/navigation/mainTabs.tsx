import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Account from '../screens/Account';
import RecetasStack from './recetasStack';
import ExplorarStack from './explorarStack';
import InfoReceta from '../screens/recetas/InfoReceta';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Mis recetas" component={RecetasStack} />
      <Tab.Screen name="Explorar" component={ExplorarStack} />
      <Tab.Screen name="Perfil" component={Account} />
    </Tab.Navigator>
  );
}
