import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const s = localStorage.getItem('plushealth_user')
    return s ? JSON.parse(s) : null
  })

  function login(user) {
    setUsuario(user)
    localStorage.setItem('plushealth_user', JSON.stringify(user))
  }

  function logout() {
    setUsuario(null)
    localStorage.removeItem('plushealth_user')
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
