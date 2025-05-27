import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, ScrollView } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { useUserStore } from '../store/useUserStore'
import Avatar from '../components/Avatar'
import { useLanguageStore } from '../store/useLanguageStore'
import { messages } from '../constants/messages'

export default function Account() {
  const user = useUserStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [full_name, setFull_name] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const t = messages[language]

  useEffect(() => {
    if (user) getProfile()
  }, [user])

  async function getProfile() {
    try {
      setLoading(true)
      if (!user) throw new Error('No user available!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url`)
        .eq('id', user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFull_name(data.full_name)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    full_name,
    avatar_url,
  }: {
    full_name: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!user) throw new Error('No user available!')

      const updates = {
        id: user.id,
        full_name,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Language selector */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
          <Button
            title="Español"
            type={language === 'es' ? 'solid' : 'outline'}
            onPress={() => setLanguage('es')}
            buttonStyle={{ marginRight: 8 }}
          />
          <Button
            title="English"
            type={language === 'en' ? 'solid' : 'outline'}
            onPress={() => setLanguage('en')}
          />
        </View>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label={t?.email || 'Email'} value={user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label={t?.username || 'Username'} value={full_name || ''} onChangeText={(text) => setFull_name(text)} />
      </View>

      <View>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url)
            updateProfile({ full_name, avatar_url: url })
          }}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? (t?.loading || 'Loading...') : (t?.updateProfile || 'Update profile')}
          onPress={() => updateProfile({ full_name, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title={t?.signOut || 'Sign Out'} onPress={() => supabase.auth.signOut()} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})