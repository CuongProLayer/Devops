import { useState, useEffect } from 'react'
import { CleanAdmin, CleanLogin, CleanStorefront } from './CleanScreens'
import { getToken, getStoredUser, clearAuth } from './api'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState('admin')
  const [currentUser, setCurrentUser] = useState(null)
  const [ready, setReady] = useState(false)

  // Check saved session on load
  useEffect(() => {
    const token = getToken()
    const user = getStoredUser()
    if (token && user) {
      setIsAuthenticated(true)
      setRole(user.role || 'admin')
      setCurrentUser(user)
    }
    setReady(true)
  }, [])

  const handleLogin = (selectedRole, userData) => {
    setRole(selectedRole)
    setCurrentUser(userData || { role: selectedRole })
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    clearAuth()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setRole('admin')
  }

  if (!ready) return null

  if (!isAuthenticated) {
    return <CleanLogin onLogin={handleLogin} />
  }

  if (role === 'customer') {
    return <CleanStorefront onLogout={handleLogout} currentUser={currentUser} />
  }

  return (
    <CleanAdmin
      role={role}
      onLogout={handleLogout}
      currentUser={currentUser}
    />
  )
}
