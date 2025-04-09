import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { useUserStore } from '../store/useUserStore'
import { Text } from '@rneui/themed'

export default function Recetas() {
    const user = useUserStore((state) => state.user) // Obtener el usuario del store

  return (
    <View>
        {user ? <Text>Bienvenido, {user.email}</Text> : <Text>Por favor, inicia sesión</Text>}
    </View>
  )
}