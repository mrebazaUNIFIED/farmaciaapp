'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Usuario } from '@/interfaces'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  usuario: Usuario | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        loadUsuario(session.user.id)
      }
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUsuario(session.user.id)
      } else {
        setUsuario(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUsuario = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // 👈 Usa maybeSingle() en lugar de single()

      if (error) {
        console.error('Error loading usuario:', error)
        return
      }

      // Si no existe el registro en 'usuarios', no es un error crítico
      if (data) {
        setUsuario(data)
      } else {
        console.warn(`Usuario con id ${userId} no encontrado en tabla usuarios`)
        // Opcionalmente puedes crear el registro aquí
        // await createUsuario(userId)
      }
    } catch (error) {
      console.error('Error in loadUsuario:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    router.refresh()
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    setUsuario(null)
    router.push('/signin')
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        usuario,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}