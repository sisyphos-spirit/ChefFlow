import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../hooks/useTheme';
import Account from '../screens/Account';
import { useLanguageStore } from '../store/useLanguageStore';
import { messages } from '../constants/messages';

const Stack = createNativeStackNavigator();

export default function PerfilStack() {
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
      <Stack.Screen name="Cuenta" component={Account} options={{ title: t.profile }} />
    </Stack.Navigator>
  );
}
