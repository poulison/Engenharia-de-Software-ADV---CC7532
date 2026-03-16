import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUsuario } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ email: '', senha: '' })
  const [erro, setErro]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await loginUsuario(form)
      login(data)
      navigate('/perfil')
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={styles.logoIcon}>⊕</span>
          <h1 style={styles.title}>Plus Health</h1>
          <p style={styles.sub}>Acesse sua conta</p>
        </div>

        {erro && <div className="error-msg">{erro}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label>E-mail</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.footer}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={{ color: '#22c55e', fontWeight: 600 }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 24, background: '#f0fdf4',
  },
  box: {
    background: '#fff', borderRadius: 16, padding: 40,
    width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { fontSize: 40, color: '#22c55e' },
  title: { fontSize: 28, fontWeight: 800, color: '#1f2937', marginTop: 4 },
  sub: { color: '#6b7280', marginTop: 4, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
}
