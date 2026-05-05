import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/perfil" style={styles.brand}>
        <span>⊕</span> Plus Health
      </Link>

      {usuario && (
        <div style={styles.links}>
          <Link to="/perfil" style={{ ...styles.link, ...(pathname === '/perfil' ? styles.active : {}) }}>
            👤 Perfil
          </Link>
          <Link to="/nutricao" style={{ ...styles.link, ...(pathname === '/nutricao' ? styles.active : {}) }}>
            🥗 Nutrição
          </Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sair</button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: 64,
    background: '#fff', boxShadow: '0 1px 0 #e5e7eb', position: 'sticky', top: 0, zIndex: 100,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 20, color: '#22c55e' },
  links: { display: 'flex', alignItems: 'center', gap: 4 },
  link: { padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#4b5563' },
  active: { background: '#dcfce7', color: '#16a34a', fontWeight: 600 },
  logoutBtn: {
    marginLeft: 12, padding: '6px 16px', borderRadius: 8,
    background: 'transparent', border: '1.5px solid #e5e7eb',
    fontSize: 14, fontWeight: 600, color: '#4b5563', cursor: 'pointer',
  },
}
