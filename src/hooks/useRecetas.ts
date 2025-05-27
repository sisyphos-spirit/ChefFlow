import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import { useUserStore } from '../store/useUserStore';
import uuid from 'react-native-uuid';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import type { Receta, Ingrediente, IngredienteBase } from '../navigation/types';

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
      const recetasWithIngredientes = await Promise.all(
        (data || []).map(async (receta: any) => {
          // Obtener ingredientes de la receta
          const { data: recetaIngredientes, error: errorRecIng } = await supabase
            .from('receta_ingredientes')
            .select('id_ingrediente, cantidad')
            .eq('id_receta', receta.id_receta);
          if (errorRecIng) throw errorRecIng;
          let ingredientes: any[] = [];
          if (recetaIngredientes && recetaIngredientes.length > 0) {
            const ingredienteIds = recetaIngredientes.map((item: any) => item.id_ingrediente);
            const { data: ingredientesData, error: errorIng } = await supabase
              .from('ingredientes')
              .select('id, nombre, unidad')
              .in('id', ingredienteIds);
            if (errorIng) throw errorIng;
            ingredientes = recetaIngredientes.map((ri: any) => {
              const ing = ingredientesData?.find((i: any) => i.id === ri.id_ingrediente);
              return {
                id: ri.id_ingrediente,
                nombre: ing?.nombre || 'Desconocido',
                unidad: ing?.unidad || 'Desconocido',
                cantidad: ri.cantidad,
              };
            });
          }
          return { ...receta, ingredientes };
        })
      );
      setRecetas(recetasWithIngredientes);
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
          id_usuario: user.id,
          titulo: newTitulo,
          descripcion: newDescripcion,
          imagen_url: newRecetaUrl,
          pasos: pasos,
          publicada: false,
          fecha_creacion: new Date(),
        },
      ]);
      if (recetaError) throw recetaError;
      const ingredientesData = ingredientes.map((ingrediente) => ({
        id_receta: receta_id,
        id_ingrediente: ingrediente.id,
        cantidad: ingrediente.cantidad,
        created_at: new Date(),
      }));
      if (ingredientesData.length > 0) {
        const { error: ingredientesError } = await supabase.from('receta_ingredientes').insert(ingredientesData);
        if (ingredientesError) throw ingredientesError;
      }
      Alert.alert('Éxito', 'Receta creada correctamente');
      fetchRecetas();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteReceta(id_receta: string) {
    try {
      setLoading(true);
      const { error } = await supabase.from('recetas').delete().eq('id_receta', id_receta);
      if (error) throw error;
      setRecetas((prevRecetas) => prevRecetas.filter((receta) => receta.id_receta !== id_receta));
      Alert.alert('Éxito', 'Receta eliminada correctamente');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  
  async function updateReceta(id_receta: string, newTitulo: string, newDescripcion: string, newRecetaUrl: string, pasos: string[], ingredientes: { id: string, nombre: string; cantidad: number; unidad: string }[]) {
    try {
      setLoading(true);
      const { error: recetaError } = await supabase.from('recetas').update({
        titulo: newTitulo,
        descripcion: newDescripcion,
        imagen_url: newRecetaUrl,
        pasos: pasos,
      }).eq('id_receta', id_receta);
      if (recetaError) throw recetaError;
      const { error: deleteError } = await supabase.from('receta_ingredientes').delete().eq('id_receta', id_receta);
      if (deleteError) throw deleteError;
      const ingredientesData = ingredientes.map((ingrediente) => ({
        id_receta: id_receta,
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
      const recetasWithIngredientes = await Promise.all(
        (data || []).map(async (receta: any) => {
          const { data: recetaIngredientes, error: errorRecIng } = await supabase
            .from('receta_ingredientes')
            .select('id_ingrediente, cantidad')
            .eq('id_receta', receta.id_receta);
          if (errorRecIng) throw errorRecIng;
          let ingredientes: any[] = [];
          if (recetaIngredientes && recetaIngredientes.length > 0) {
            const ingredienteIds = recetaIngredientes.map((item: any) => item.id_ingrediente);
            const { data: ingredientesData, error: errorIng } = await supabase
              .from('ingredientes')
              .select('id, nombre, unidad')
              .in('id', ingredienteIds);
            if (errorIng) throw errorIng;
            ingredientes = recetaIngredientes.map((ri: any) => {
              const ing = ingredientesData?.find((i: any) => i.id === ri.id_ingrediente);
              return {
                id: ri.id_ingrediente,
                nombre: ing?.nombre || 'Desconocido',
                unidad: ing?.unidad || 'Desconocido',
                cantidad: ri.cantidad,
              };
            });
          }
          return { ...receta, ingredientes };
        })
      );
      setRecetas(recetasWithIngredientes);
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