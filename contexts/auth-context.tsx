'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type Profile = {
    id: string
    email: string
    full_name: string
    role: 'hospital' | 'vendor' | 'admin' | 'cfo' | 'cpo'
    organization_name?: string
    phone?: string
    avatar_url?: string
}

type AuthContextType = {
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
        try {
            console.log('🔍 Fetching profile for user:', userId)
            
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                console.error('❌ Error fetching profile:', error)
                setProfile(null) // ✅ Set to null on error
                return null
            }

            console.log('✅ Profile fetched:', data)
            setProfile(data) // ✅ ACTUALLY SET THE PROFILE!
            return data
        } catch (error: any) {
            console.error('❌ Profile fetch failed:', error)
            setProfile(null) // ✅ Set to null on error
            return null
        }
    }

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('📝 Initial session:', session?.user?.email)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id).finally(() => {
                    setLoading(false)
                })
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('🔄 Auth state changed:', _event, session?.user?.email)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
