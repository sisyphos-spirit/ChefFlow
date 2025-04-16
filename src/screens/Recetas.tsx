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
import { navigate } from 'expo-router/build/global-state/routing'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function Recetas() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListaRecetas'>;

  const user = useUserStore((state) => state.user) // Obtener el usuario del store
  const { recetas, fetchRecetas, deleteReceta, createReceta, loading } = useRecetas();
  const navigation = useNavigation<NavigationProp>(); // Obtener la navegación

  useEffect(() => {
    if (user) fetchRecetas(); // Obtener recetas al cargar el componente
  }, [user])

  const goToEditor = () => {
    navigation.navigate('RecetaForm');
  };

  return (
    <View style={{ flex: 1 }}>
      {user ? (
        <>
          {/* Formulario para crear una nueva receta */}
          <View style={{ marginBottom: 20 }}>
            <Button
              title="Crear Receta"
              onPress={() => { goToEditor() }}
              buttonStyle={{ backgroundColor: '#007BFF' }}></Button>
          </View>

          {/* Lista de recetas */}
          <FlatList style={{ marginTop: 60 }}
            data={recetas}
            keyExtractor={(item, index) => item.id || index.toString()} // Asegúrate de que la clave sea única
            renderItem={({ item }) => (
              <RecetaItem item={item} onDelete={deleteReceta} loading={loading} />
            )}
            refreshing={loading} // Indica si está cargando
            onRefresh={fetchRecetas} // Llama a la función para actualizar las recetas

          />
        </>
      ) : (
        <Text>Por favor, inicia sesión</Text>
      )}
    </View>
  )
}