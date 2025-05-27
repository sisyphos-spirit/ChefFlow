import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import type { Ingrediente, IngredienteBase } from '../navigation/types';

export function useIngredientes() {
  const [loading, setLoading] = useState(false);
  const [ingredientes, setIngredientes] = useState<IngredienteBase[]>([]);

  async function fetchIngredientes(): Promise<void> {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredientes')
        .select('id, nombre, unidad');

      //console.log('fetchIngredientes data:', data); // Log para depuración

      if (error) {
        console.error('Error fetching ingredientes:', error);
        throw error;
      }

      // Actualizar el estado con los datos obtenidos
      setIngredientes(data?.map((item: any) => ({
        id: item.id,
        nombre: item.nombre,
        unidad: item.unidad,
      })) || []);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchIngredientesReceta(recetaId: string): Promise<Ingrediente[]> {
    try {
      setLoading(true);

      // Verificar si la receta existe antes de buscar ingredientes
      const { data: recetaExists, error: recetaError } = await supabase
        .from('recetas')
        .select('id_receta')
        .eq('id_receta', recetaId)
        .single();

      if (recetaError || !recetaExists) {
        console.warn(`La receta con ID ${recetaId} no existe o fue eliminada.`);
        return [];
      }

      const { data: recetaIngredientes, error: errorRecetaIngredientes } = await supabase
        .from('receta_ingredientes')
        .select('id_ingrediente, cantidad')
        .eq('id_receta', recetaId);

      if (errorRecetaIngredientes) {
        console.error('Error fetching receta_ingredientes:', errorRecetaIngredientes);
        throw errorRecetaIngredientes;
      }

      if (!recetaIngredientes || recetaIngredientes.length === 0) {
        return [];
      }

      const ingredienteIds = recetaIngredientes.map((item: any) => item.id_ingrediente);

      const { data: ingredientes, error: errorIngredientes } = await supabase
        .from('ingredientes')
        .select('id, nombre, unidad, kcal_100g, proteinas_100g, hidratos_100g, grasas_100g')
        .in('id', ingredienteIds);

      if (errorIngredientes) {
        console.error('Error fetching ingredientes:', errorIngredientes);
        throw errorIngredientes;
      }

      const combinedData = recetaIngredientes.map((recetaIngrediente: any) => {
        const ingrediente = ingredientes?.find((ing: any) => ing.id === recetaIngrediente.id_ingrediente);
        return {
          id: recetaIngrediente.id_ingrediente,
          nombre: ingrediente?.nombre || 'Desconocido',
          unidad: ingrediente?.unidad || 'Desconocido',
          cantidad: recetaIngrediente.cantidad,
          calorias: ingrediente?.kcal_100g || 0,
          proteinas: ingrediente?.proteinas_100g || 0,
          carbohidratos: ingrediente?.hidratos_100g || 0,
          grasas: ingrediente?.grasas_100g || 0,
        };
      });

      return combinedData;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function fetchConversionUnidades(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('conversion_unidades')
        .select('id_ingrediente, gramos_unidad');

      if (error) {
        console.error('Error fetching conversion_unidades:', error);
        throw error;
      }

      const conversionMap: Record<string, number> = {};
      data?.forEach((item: any) => {
        conversionMap[item.id_ingrediente] = item.gramos_unidad;
      });

      return conversionMap;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return {};
    }
  }

  function convertirUnidad(cantidad: number, idIngrediente: string, conversionMap: Record<string, number>): number {
    const factor = conversionMap[idIngrediente];
    if (!factor) {
      console.warn(`No conversion factor found for ingrediente ID ${idIngrediente}`);
      // Retornar la cantidad original y registrar el warning para depuración
      return cantidad;
    }
    return cantidad * factor;
  }

  return { ingredientes, loading, fetchIngredientes, fetchIngredientesReceta, fetchConversionUnidades, convertirUnidad };
}