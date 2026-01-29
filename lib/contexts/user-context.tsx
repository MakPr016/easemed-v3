'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type UserType = 'hospital' | 'vendor'

interface User {
    id: string
    name: string
    email: string
    organization: string
    avatar?: string
    type: UserType
}

interface UserContextType {
    user: User | null
    userType: UserType
    setUser: (user: User | null) => void
    setUserType: (type: UserType) => void
    logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [userType, setUserType] = useState<UserType>('hospital')

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        const storedUserType = localStorage.getItem('userType')

        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }

        if (storedUserType) {
            setUserType(storedUserType as UserType)
        } else {
            const typeFromPath = pathname.startsWith('/dashboard/vendor') ? 'vendor' : 'hospital'
            setUserType(typeFromPath)
        }
    }, [pathname])

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser)
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser))
            localStorage.setItem('userType', newUser.type)
            setUserType(newUser.type)
        } else {
            localStorage.removeItem('user')
            localStorage.removeItem('userType')
        }
    }

    const handleSetUserType = (type: UserType) => {
        setUserType(type)
        localStorage.setItem('userType', type)
    }

    const logout = () => {
        setUser(null)
        setUserType('hospital')
        localStorage.removeItem('user')
        localStorage.removeItem('userType')
    }

    return (
        <UserContext.Provider value={{ user, userType, setUser: handleSetUser, setUserType: handleSetUserType, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
