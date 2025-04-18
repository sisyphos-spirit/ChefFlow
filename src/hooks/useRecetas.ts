import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import RecetaItem from '../components/RecetaItem';
import { useUserStore } from '../store/useUserStore';
import uuid from 'react-native-uuid';

interface Receta {
    id: string
    titulo: string
    descripcion: string
    imagen_url: string
}

export function useRecetas() {
  const user = useUserStore((state) => state.user) // Obtener el usuario del store
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchRecetas();
  }, [user]);

  async function fetchRecetas() {
    try {
      setLoading(true)
      if (!user) throw new Error('No user available!')

      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('id_usuario', user.id);

      if (error) throw error 
      console.log('Fetched recetas:', data); // Debugging log
      setRecetas(data || []);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function createReceta(newTitulo: string, newDescripcion: string, newRecetaUrl: string) {
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
  
  async function updateReceta(id: string, newTitulo: string, newDescripcion: string, newRecetaUrl: string) {
    try {
      setLoading(true)
      const { error } = await supabase.from('recetas').update({
        titulo: newTitulo,
        descripcion: newDescripcion,
        imagen_url: newRecetaUrl,
      }).eq('id_receta', id)

      if (error) throw error
      Alert.alert('Éxito', 'Receta actualizada correctamente')
      fetchRecetas() // Refrescar la lista
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return { recetas, loading, createReceta, deleteReceta, fetchRecetas, updateReceta };
}