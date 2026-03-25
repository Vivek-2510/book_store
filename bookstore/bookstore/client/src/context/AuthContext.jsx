import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('bookstore_user') || 'null'))
  const [loading, setLoading] = useState(false)

  const saveUser = (data) => {
    localStorage.setItem('bookstore_user', JSON.stringify(data))
    setUser(data)
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveUser(data)
      toast.success(`Welcome back, ${data.name}!`)
      return { success: true, role: data.role }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      saveUser(data)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('bookstore_user')
    setUser(null)
    toast.success('Logged out')
  }

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData)
      saveUser({ ...user, name: data.name })
      toast.success('Profile updated!')
      return { success: true }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
      return { success: false }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
