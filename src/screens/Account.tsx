import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { View, Alert, ScrollView, Text, StyleSheet } from 'react-native'
import { AppInput } from '../components/AppInput'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { getGlobalStyles } from '../constants/GlobalStyles'
import { useUserStore } from '../store/useUserStore'
import Avatar from '../components/Avatar'
import { useLanguageStore } from '../store/useLanguageStore'
import { messages } from '../constants/messages'
import { SectionTitle } from '../components/SectionTitle'
import { useTheme } from '../hooks/useTheme'

export default function Account() {
  const user = useUserStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [full_name, setFull_name] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { theme, setTheme, colors } = useTheme();
  const styles = getGlobalStyles(colors);
  // Estilos locales solo para detalles específicos
  const localStyles = StyleSheet.create({
    selectorRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    selectorGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectorButton: {
      width: 75,
      marginRight: 4,
    },
    selectorButtonLast: {
      width: 75,
      marginRight: 0,
    },
    emailText: {
      fontSize: 15,
      color: colors.text,
      fontFamily: 'Nunito_400Regular',
      paddingLeft: 2,
      paddingBottom: 8,
    },
    section: {
      marginBottom: 16,
    },
    avatar: {
      alignSelf: 'center',
      marginBottom: 16,
    },
    buttonPrimary: {
      marginTop: 20,
      marginBottom: 16,
    },
  });
  const t = messages[language];

  useEffect(() => {
    if (user) getProfile()
  }, [user]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error('No user available!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url`)
        .eq('id', user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      };

      if (data) {
        setFull_name(data.full_name);
        setAvatarUrl(data.avatar_url);
      };
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      };
    } finally {
      setLoading(false);
    };
  };

  async function updateProfile({
    full_name,
    avatar_url,
  }: {
    full_name: string
    avatar_url: string
  }) {
    try {
      setLoading(true);
      if (!user) throw new Error('No user available!');

      const updates = {
        id: user.id,
        full_name,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      };
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      };
    } finally {
      setLoading(false);
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={localStyles.selectorRow}>
          {/* Idiomas alineados a la izquierda */}
          <View style={localStyles.selectorGroup}>
            <SecondaryButton
              title="Español"
              onPress={() => setLanguage('es')}
              style={[localStyles.selectorButton, { opacity: language === 'es' ? 1 : 0.6 }]}
            />
            <SecondaryButton
              title="English"
              onPress={() => setLanguage('en')}
              style={[localStyles.selectorButtonLast, { opacity: language === 'en' ? 1 : 0.6 }]}
            />
          </View>
          {/* Tema alineado a la derecha */}
          <View style={localStyles.selectorGroup}>
            <SecondaryButton
              title={t.lightTheme}
              onPress={() => setTheme('light')}
              style={[localStyles.selectorButton, { opacity: theme === 'light' ? 1 : 0.6 }]}
            />
            <SecondaryButton
              title={t.darkTheme}
              onPress={() => setTheme('dark')}
              style={[localStyles.selectorButtonLast, { opacity: theme === 'dark' ? 1 : 0.6 }]}
            />
          </View>
        </View>
        <SectionTitle style={[styles.sectionTitle, { fontSize: 16, marginBottom: 2 }]}>{t?.email || 'Email'}</SectionTitle>
        <View style={{ marginBottom: 8 }}>
          <Text style={localStyles.emailText}>{user?.email}</Text>
        </View>
        <View style={localStyles.section}>
          <SectionTitle style={[styles.sectionTitle, { fontSize: 16, marginBottom: 2 }]}>{t?.username || 'Username'}</SectionTitle>
          <AppInput
            placeholder={t?.username || 'Username'}
            value={full_name || ''}
            onChangeText={setFull_name}
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </View>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url)
            updateProfile({ full_name, avatar_url: url })
          }}
        />
        <PrimaryButton
          title={loading ? (t?.loading || 'Loading...') : (t?.updateProfile || 'Update profile')}
          onPress={() => updateProfile({ full_name, avatar_url: avatarUrl })}
          disabled={loading}
          style={[styles.buttonPrimary, localStyles.buttonPrimary]}
          textStyle={styles.textPrimary}
        />
        <SecondaryButton
          title={t?.signOut || 'Sign Out'}
          onPress={() => supabase.auth.signOut()}
          style={styles.buttonSecondary}
          textStyle={styles.textPrimary}
        />
      </ScrollView>
    </View>
  )
}