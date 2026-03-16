import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar   from './components/Navbar'
import Login    from './pages/Login'
import Cadastro from './pages/Cadastro'
import Perfil   from './pages/Perfil'

function PrivateRoute({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { usuario } = useAuth()
  return !usuario ? children : <Navigate to="/perfil" replace />
}

function Layout({ children }) {
  return <><Navbar /><main>{children}</main></>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Layout><Perfil /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
