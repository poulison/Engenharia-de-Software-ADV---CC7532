import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cadastrarUsuario } from '../services/api'

const OBJETIVOS = ['Perda de peso', 'Ganho de massa', 'Condicionamento físico', 'Bem-estar geral', 'Saúde preventiva']

export default function Cadastro() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', idade: '', peso: '', altura: '', objetivo: ''
  })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        idade: parseInt(form.idade),
        peso: parseFloat(form.peso),
        altura: parseFloat(form.altura),
      }
      const { data } = await cadastrarUsuario(payload)
      login(data)
      navigate('/perfil')
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={{ fontSize: 36, color: '#22c55e' }}>⊕</span>
          <h1 style={styles.title}>Criar conta</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Comece sua jornada saudável</p>
        </div>

        {erro && <div className="error-msg">{erro}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label>Nome completo</label>
            <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ana Silva" required />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>E-mail</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ana@email.com" required />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="••••••" required />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Idade</label>
              <input name="idade" type="number" value={form.idade} onChange={handleChange} placeholder="28" min="1" max="120" required />
            </div>
            <div className="form-group">
              <label>Objetivo</label>
              <select name="objetivo" value={form.objetivo} onChange={handleChange}>
                <option value="">Selecione...</option>
                {OBJETIVOS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Peso (kg)</label>
              <input name="peso" type="number" step="0.1" value={form.peso} onChange={handleChange} placeholder="65.0" required />
            </div>
            <div className="form-group">
              <label>Altura (m)</label>
              <input name="altura" type="number" step="0.01" value={form.altura} onChange={handleChange} placeholder="1.68" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p style={styles.footer}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#22c55e', fontWeight: 600 }}>Entrar</Link>
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
    width: '100%', maxWidth: 520, boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
  },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
}
