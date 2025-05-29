import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Account from '../screens/Account';
import RecetasStack from './recetasStack';
import ExplorarStack from './explorarStack';
import PerfilStack from './perfilStack';
import { useTheme } from '../hooks/useTheme';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useLanguageStore } from '../store/useLanguageStore';
import { messages } from '../constants/messages';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarStyle: {
          backgroundColor: colors.secondary,
          borderTopColor: colors.primary,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Nunito-Regular',
          fontSize: 13,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'MisRecetasTab') {
            return <MaterialCommunityIcons name={focused ? 'book-open-variant' : 'book-outline'} size={size} color={color} />;
          } else if (route.name === 'ExplorarTab') {
            return <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />;
          } else if (route.name === 'PerfilTab') {
            return <FontAwesome name={focused ? 'user-circle' : 'user-o'} size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="MisRecetasTab" component={RecetasStack} options={{ title: t.myRecipes, tabBarLabel: t.myRecipes }} />
      <Tab.Screen name="ExplorarTab" component={ExplorarStack} options={{ title: t.explore, tabBarLabel: t.explore }} />
      <Tab.Screen name="PerfilTab" component={PerfilStack} options={{ title: t.profile, tabBarLabel: t.profile }} />
    </Tab.Navigator>
  );
}
