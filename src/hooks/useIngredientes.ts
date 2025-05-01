import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';

export function useIngredientes() {
    const [loading, setLoading] = useState(false);
    const [ingredientes, setIngredientes] = useState<{ nombre: string, unidad: string }[]>([]);
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<{ nombre: string; cantidad: Float }[]>([]);

    async function fetchIngredientes() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('ingredientes')
                .select('nombre, unidad');

            if (error) {
                console.error('Error fetching ingredientes:', error); // Log detallado del error
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('No ingredientes found in the database.'); // Log si no hay datos
            } else {
                console.log('Fetched ingredientes:', data); // Log detallado de los datos
            }

            setIngredientes(data || []);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error', error.message);
            } else {
                console.error('Unexpected error:', error); // Manejo de errores inesperados
            }
        } finally {
            setLoading(false);
        }
    }

    return { ingredientes, ingredientesSeleccionados, loading, fetchIngredientes };
}