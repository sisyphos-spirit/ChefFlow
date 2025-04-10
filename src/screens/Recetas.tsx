import { View, Text, Alert, FlatList } from 'react-native'
import { useUserStore } from '../store/useUserStore'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { Input, Button } from '@rneui/themed'
import Img_receta from '../components/Img_receta'
import uuid from 'react-native-uuid';
import { ScrollView } from 'react-native-gesture-handler'

interface Receta {
  id: string
  titulo: string
  descripcion: string
  receta_url: string
}

function RecetaItem({
  item,
  onDelete,
  loading,
}: {
  item: Receta
  onDelete: (id: string) => void
  loading: boolean
}) {
  const [titulo, setTitulo] = useState(item.titulo)
  const [descripcion, setDescripcion] = useState(item.descripcion)
  const [recetaUrl, setRecetaUrl] = useState(item.receta_url)

  return (
    <View style={{ marginBottom: 20, padding: 10, borderWidth: 1, borderRadius: 5 }}>
      <Input
        label="Título"
        value={titulo}
        onChangeText={(text) => setTitulo(text)}
      />
      <Input
        label="Descripción"
        value={descripcion}
        onChangeText={(text) => setDescripcion(text)}
      />
      <Img_receta
        size={200}
        url={recetaUrl}
        onUpload={(url: string) => setRecetaUrl(url)}
      />
      <Button
        title="Eliminar"
        onPress={() => onDelete(item.id)}
        buttonStyle={{ backgroundColor: 'red', marginTop: 10 }}
        disabled={loading}
      />
    </View>
  )
}

export default function Recetas() {
  const user = useUserStore((state) => state.user) // Obtener el usuario del store
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(false)

  // Campos para crear una nueva receta
  const [newTitulo, setNewTitulo] = useState('')
  const [newDescripcion, setNewDescripcion] = useState('')
  const [newRecetaUrl, setNewRecetaUrl] = useState('')

  useEffect(() => {
    if (user) fetchRecetas()
  }, [user])

  async function fetchRecetas() {
    try {
      setLoading(true)
      if (!user) throw new Error('No user available!')

      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('id_usuario', user.id)

      if (error) throw error
      setRecetas(data || [])
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function createReceta() {
    try {
      setLoading(true)
      if (!user) throw new Error('No user available!')

      const { error } = await supabase.from('recetas').insert([
        {
          id_receta: uuid.v4(), // Generar un ID único para la receta
          id_usuario: user.id, // ID del usuario autenticado
          titulo: newTitulo,
          descripcion: newDescripcion,
          imagen_url: newRecetaUrl, // URL de la imagen subida
          publicada: false, // Valor por defecto para la columna `publicada`
          fecha_creacion: new Date(), // Fecha de creación
        },
      ])

      if (error) throw error
      Alert.alert('Éxito', 'Receta creada correctamente')
      setNewTitulo('')
      setNewDescripcion('')
      setNewRecetaUrl('')
      fetchRecetas() // Refrescar la lista
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function deleteReceta(id: string) {
    try {
      setLoading(true)
      const { error } = await supabase.from('recetas').delete().eq('id', id)

      if (error) throw error
      Alert.alert('Éxito', 'Receta eliminada correctamente')
      fetchRecetas() // Refrescar la lista
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {user ? (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Tus Recetas</Text>

          {/* Formulario para crear una nueva receta */}
          <View style={{ marginBottom: 20 }}>
            <Input
              label="Título"
              value={newTitulo}
              onChangeText={(text) => setNewTitulo(text)}
            />
            <Input
              label="Descripción"
              value={newDescripcion}
              onChangeText={(text) => setNewDescripcion(text)}
            />
            <Img_receta
              size={200}
              url={newRecetaUrl}
              onUpload={(url: string) => setNewRecetaUrl(url)}
            />
            <Button
              title="Crear Receta"
              onPress={createReceta}
              disabled={loading || !newTitulo || !newDescripcion || !newRecetaUrl}
            />
          </View>

          {/* Lista de recetas */}
          <FlatList
            data={recetas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecetaItem item={item} onDelete={deleteReceta} loading={loading} />
            )}
          />
        </>
      ) : (
        <Text>Por favor, inicia sesión</Text>
      )}
    </ScrollView>
  )
}