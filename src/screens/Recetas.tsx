import { View, Text, Alert, FlatList, Pressable } from 'react-native'
import { useUserStore } from '../store/useUserStore'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { Input, Button } from '@rneui/themed'
import Img_receta from '../components/Img_receta'
import uuid from 'react-native-uuid';
import RecetaItem from '../components/RecetaItem';
import { useRecetas } from '../hooks/useRecetas'
import RecetaForm from '../components/RecetaForm'
import { Link, router } from 'expo-router'

export default function Recetas() {
  const user = useUserStore((state) => state.user) // Obtener el usuario del store
  const { recetas, fetchRecetas, deleteReceta, createReceta, loading } = useRecetas();

  useEffect(() => {
    if (user) fetchRecetas(); // Obtener recetas al cargar el componente
  }, [user])

  return (
    <View style={{ padding: 20 }}>
      {user ? (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Tus Recetas</Text>

          {/* Formulario para crear una nueva receta */}
          <View style={{ marginBottom: 20 }}>
            <Button
              title="Crear Receta"
              onPress={() => { router.push('./CrearReceta') }}
              buttonStyle={{ backgroundColor: '#007BFF' }}></Button>
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
    </View>
  )
}