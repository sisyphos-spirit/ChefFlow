import React, { useState } from 'react'
import { Alert, AppState, Image, View, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import { useLanguageStore } from '../store/useLanguageStore'
import { messages } from '../constants/messages'
import { AppInput } from '../components/AppInput'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { getGlobalStyles } from '../constants/GlobalStyles'
import { SectionTitle } from '../components/SectionTitle'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useTheme } from '../hooks/useTheme'

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const language = useLanguageStore((state) => state.language);
  const t = messages[language];
  const { colors } = useTheme();
  const styles = getGlobalStyles(colors);
  // Solo estilos locales para detalles muy específicos
  const localStyles = StyleSheet.create({
    centerContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 200,
      height: 160,
      marginBottom: 12,
    },
    inputIconContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    inputIconContainerPassword: {
      position: 'relative',
      marginBottom: 48,
    },
    icon: {
      position: 'absolute',
      left: 10,
      top: 18,
      zIndex: 1,
    },
    inputWithIcon: {
      paddingLeft: 36,
    },
  });

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  };

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  };

  return (
    <View style={[styles.container, { justifyContent: 'center',padding: 20 }]}> 
      <View style={localStyles.centerContainer}>
        <Image source={require('../assets/icon.png')} style={localStyles.logo} />
      </View>
      <View style={localStyles.inputIconContainer}>
        <Icon name="envelope" size={20} color={colors.placeholder} style={localStyles.icon} />
        <AppInput
          placeholder={t.emailPlaceholder || 'email@address.com'}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, localStyles.inputWithIcon]}
        />
      </View>
      <View style={localStyles.inputIconContainerPassword}>
        <Icon name="lock" size={20} color={colors.placeholder} style={localStyles.icon} />
        <AppInput
          placeholder={t.password || 'Password'}
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[styles.input, localStyles.inputWithIcon]}
        />
      </View>
      <PrimaryButton
        title={t.signIn || 'Sign in'}
        onPress={signInWithEmail}
        disabled={loading}
        style={styles.buttonPrimary}
        textStyle={styles.textPrimary}
      />
      <View style={{ marginBottom: 16 }} />
      <SecondaryButton
        title={t.signUp || 'Sign up'}
        onPress={signUpWithEmail}
        disabled={loading}
        style={styles.buttonSecondary}
        textStyle={styles.textPrimary}
      />
    </View>
  )
}