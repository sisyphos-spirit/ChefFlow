import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { useUserStore } from '../store/useUserStore'
import Avatar from '../components/Avatar'

export default function Account() {
  const user = useUserStore((state) => state.user) // Obtener el usuario del store
  const [loading, setLoading] = useState(true)
  const [full_name, setFull_name] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

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
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={full_name || ''} onChangeText={(text) => setFull_name(text)} />
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
          title={loading ? 'Cargando ...' : 'Actualizar perfil'}
          onPress={() => updateProfile({ full_name, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>


      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
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