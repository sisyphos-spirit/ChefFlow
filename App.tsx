import { useState, useEffect } from 'react'
import { supabase } from './src/lib/supabase'
import Auth from './src/screens/Auth'
import { useUserStore } from './src/store/useUserStore'
import MainTabs from './src/navigation/mainTabs'
import { NavigationContainer } from '@react-navigation/native'
import { AppFontProvider } from './src/components/AppFontProvider'
import { ThemeProvider } from './src/hooks/useTheme'

export default function App() {
  const user = useUserStore((state) => state.user) // Obtener el usuario del store
  const setUser = useUserStore((state) => state.setUser) // Setter del usuario

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null) // Guardar el usuario en el store
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null) // Actualizar el usuario en el store
    })
  }, [])

  return (
    <ThemeProvider>
      <AppFontProvider>
        <NavigationContainer>
          {user ? <MainTabs /> : <Auth />}
        </NavigationContainer>
      </AppFontProvider>
    </ThemeProvider>
  )
}