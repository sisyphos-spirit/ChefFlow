import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Account from '../components/Account';
import Recetas from '../screens/Recetas';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Recetas" component={Recetas} />
      <Tab.Screen name="Perfil" component={Account} />
    </Tab.Navigator>
  );
}
