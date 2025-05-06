import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

export interface IngredienteBase {
  id: string;
  nombre: string;
  unidad: string;
}

export interface Ingrediente extends IngredienteBase {
  cantidad: number;
}

export function useIngredientes() {
  const [loading, setLoading] = useState(false);
  const [ingredientes, setIngredientes] = useState<IngredienteBase[]>([]);

  async function fetchIngredientes(): Promise<void> {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredientes')
        .select('id, nombre, unidad');

      console.log('fetchIngredientes data:', data); // Log para depuración

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

      // Primera consulta: Obtener cantidades e IDs de ingredientes desde receta_ingredientes
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

      // Obtener los IDs de los ingredientes
      const ingredienteIds = recetaIngredientes.map((item: any) => item.id_ingrediente);

      // Segunda consulta: Obtener detalles de los ingredientes desde ingredientes
      const { data: ingredientes, error: errorIngredientes } = await supabase
        .from('ingredientes')
        .select('id, nombre, unidad')
        .in('id', ingredienteIds);

      if (errorIngredientes) {
        console.error('Error fetching ingredientes:', errorIngredientes);
        throw errorIngredientes;
      }

      // Combinar los datos de ambas consultas
      const combinedData = recetaIngredientes.map((recetaIngrediente: any) => {
        const ingrediente = ingredientes?.find((ing: any) => ing.id === recetaIngrediente.id_ingrediente);
        return {
          id: recetaIngrediente.id_ingrediente,
          nombre: ingrediente?.nombre || 'Desconocido',
          unidad: ingrediente?.unidad || 'Desconocido',
          cantidad: recetaIngrediente.cantidad,
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

  return { ingredientes, loading, fetchIngredientes, fetchIngredientesReceta };
}