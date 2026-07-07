import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('edore_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setIsLoggedIn(true)
      }
    } catch (e) {
      console.error('Error loading auth from localStorage', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email, password) => {
    // Mock login logic
    const mockUser = {
      name: email.split('@')[0],
      email: email,
      avatar: email.charAt(0).toUpperCase()
    }
    setUser(mockUser)
    setIsLoggedIn(true)
    localStorage.setItem('edore_user', JSON.stringify(mockUser))
    return { success: true }
  }

  const register = (name, email, password) => {
    // Mock register logic
    const mockUser = {
      name: name,
      email: email,
      avatar: name.charAt(0).toUpperCase()
    }
    setUser(mockUser)
    setIsLoggedIn(true)
    localStorage.setItem('edore_user', JSON.stringify(mockUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('edore_user')
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
