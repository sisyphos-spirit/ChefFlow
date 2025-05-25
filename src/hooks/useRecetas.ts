import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import { useUserStore } from '../store/useUserStore';
import uuid from 'react-native-uuid';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';

interface Receta {
    id: string
    titulo: string
    descripcion: string
    imagen_url: string
    pasos: string[];
};

export function useRecetas() {
  const user = useUserStore((state) => state.user); // Obtener el usuario del store
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchRecetas();
  }, [user]);

  async function fetchRecetas() {
    try {
      setLoading(true);
      if (!user) throw new Error('No user available!');

      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('id_usuario', user.id);

      if (error) throw error;
      setRecetas(data || []);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function createReceta(newTitulo: string, newDescripcion: string, newRecetaUrl: string, pasos: string[], ingredientes: { id: string, nombre: string; cantidad: Float }[]) {
    try {
      setLoading(true);
      if (!user) throw new Error('No user available!');

      const receta_id = uuid.v4(); // Generar un ID único para la receta
      
      const { error: recetaError } = await supabase.from('recetas').insert([
        {
          id_receta: receta_id, 
          id_usuario: user.id, // ID del usuario autenticado
          titulo: newTitulo,
          descripcion: newDescripcion,
          imagen_url: newRecetaUrl, // URL de la imagen subida
          pasos: pasos, // Pasos de la receta
          publicada: false, // Valor por defecto para la columna `publicada`
          fecha_creacion: new Date(), // Fecha de creación
        },
      ]);

      if (recetaError) {
        console.error('Error al insertar la receta:', recetaError); // Log del error
        throw recetaError;
      }

      console.log('Receta insertada correctamente'); // Log de éxito

      const ingredientesData = ingredientes.map((ingrediente) => ({
        id_receta: receta_id,
        id_ingrediente: ingrediente.id, // ID del ingrediente
        cantidad: ingrediente.cantidad,
        created_at: new Date(),
      }));

      console.log('Datos de los ingredientes a insertar:', ingredientesData); // Log de los datos de ingredientes

      const { error: ingredientesError } = await supabase.from('receta_ingredientes').insert(ingredientesData);

      if (ingredientesError) {
        console.error('Error al insertar los ingredientes:', ingredientesError); // Log del error
        throw ingredientesError;
      }

      console.log('Ingredientes insertados correctamente'); // Log de éxito

      Alert.alert('Éxito', 'Receta creada correctamente');
      fetchRecetas(); // Refrescar la lista
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error en createReceta:', error.message); // Log del error general
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteReceta(id: string) {
    try {
      setLoading(true);
      const { error } = await supabase.from('recetas').delete().eq('id_receta', id);

      if (error) throw error;

      // Actualizar la lista de recetas localmente
      setRecetas((prevRecetas) => prevRecetas.filter((receta) => receta.id !== id));

      Alert.alert('Éxito', 'Receta eliminada correctamente');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  
  async function updateReceta(id: string, newTitulo: string, newDescripcion: string, newRecetaUrl: string, pasos: string[], ingredientes: { id: string, nombre: string; cantidad: number; unidad: string }[]) {
    try {
      setLoading(true);

      // Actualizar los datos principales de la receta
      const { error: recetaError } = await supabase.from('recetas').update({
        titulo: newTitulo,
        descripcion: newDescripcion,
        imagen_url: newRecetaUrl,
        pasos: pasos,
      }).eq('id_receta', id);

      if (recetaError) throw recetaError;

      // Eliminar ingredientes antiguos
      const { error: deleteError } = await supabase.from('receta_ingredientes').delete().eq('id_receta', id);
      if (deleteError) throw deleteError;

      // Insertar los nuevos ingredientes
      const ingredientesData = ingredientes.map((ingrediente) => ({
        id_receta: id,
        id_ingrediente: ingrediente.id,
        cantidad: ingrediente.cantidad,
        created_at: new Date(),
      }));
      if (ingredientesData.length > 0) {
        const { error: insertError } = await supabase.from('receta_ingredientes').insert(ingredientesData);
        if (insertError) throw insertError;
      }

      Alert.alert('Éxito', 'Receta actualizada correctamente');
      fetchRecetas();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function togglePublicarReceta(id_receta: string, publicar: boolean) {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('recetas')
        .update({ publicada: publicar })
        .eq('id_receta', id_receta);
      if (error) throw error;
      // Opcional: refrescar recetas si es necesario
      await fetchRecetas();
      return publicar;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Obtener todas las recetas públicas
  async function fetchRecetasPublicas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('publicada', true);
      if (error) throw error;
      setRecetas(data || []);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return { recetas, loading, createReceta, deleteReceta, fetchRecetas, updateReceta, togglePublicarReceta, fetchRecetasPublicas };
}