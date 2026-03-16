import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { calcularIMC, calcularTMB, atualizarFisico } from '../services/api'

function ImcBar({ imc }) {
  const pct = Math.min(Math.max(((imc - 10) / 40) * 100, 0), 100)
  const cor = imc < 18.5 ? '#60a5fa' : imc < 25 ? '#22c55e' : imc < 30 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 10, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: cor, borderRadius: 99, transition: 'width .6s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
        <span>Abaixo</span><span>Normal</span><span>Sobrepeso</span><span>Obesidade</span>
      </div>
    </div>
  )
}

export default function Perfil() {
  const { usuario, login } = useAuth()
  const [imc, setImc] = useState(null)
  const [tmb, setTmb] = useState(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ peso: usuario?.peso || '', altura: usuario?.altura || '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!usuario) return
    Promise.all([calcularIMC(usuario.id), calcularTMB(usuario.id)])
      .then(([r1, r2]) => { setImc(r1.data); setTmb(r2.data) })
      .catch(() => {})
  }, [usuario])

  async function handleAtualizar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await atualizarFisico(usuario.id, {
        peso: parseFloat(form.peso),
        altura: parseFloat(form.altura),
      })
      login(data)
      setEditando(false)
      const [r1, r2] = await Promise.all([calcularIMC(data.id), calcularTMB(data.id)])
      setImc(r1.data); setTmb(r2.data)
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao atualizar.')
    } finally {
      setLoading(false)
    }
  }

  if (!usuario) return null

  return (
    <div style={styles.page}>
      <h1 className="page-title">Meu Perfil</h1>

      <div style={styles.grid}>
        {/* Dados pessoais */}
        <div className="card">
          <div style={styles.avatar}>{usuario.nome[0].toUpperCase()}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{usuario.nome}</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>{usuario.email}</p>

          <div style={styles.infoGrid}>
            <InfoItem label="Idade" value={`${usuario.idade} anos`} />
            <InfoItem label="Objetivo" value={usuario.objetivo || '—'} />
            <InfoItem label="Peso" value={`${usuario.peso} kg`} />
            <InfoItem label="Altura" value={`${usuario.altura} m`} />
          </div>

          {!editando ? (
            <button className="btn btn-outline btn-full" style={{ marginTop: 16 }} onClick={() => setEditando(true)}>
              ✏️ Atualizar dados físicos
            </button>
          ) : (
            <form onSubmit={handleAtualizar} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {erro && <div className="error-msg">{erro}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label>Peso (kg)</label>
                  <input type="number" step="0.1" value={form.peso}
                    onChange={e => setForm(f => ({ ...f, peso: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Altura (m)</label>
                  <input type="number" step="0.01" value={form.altura}
                    onChange={e => setForm(f => ({ ...f, altura: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditando(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Indicadores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {imc && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>IMC</p>
                  <p style={{ fontSize: 36, fontWeight: 800, color: '#22c55e', lineHeight: 1.1 }}>{imc.imc}</p>
                  <p style={{ fontSize: 14, color: '#4b5563', marginTop: 2 }}>{imc.classificacao}</p>
                </div>
                <span style={{ fontSize: 40 }}>⚖️</span>
              </div>
              <ImcBar imc={imc.imc} />
            </div>
          )}

          {tmb && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>TMB — Taxa Metabólica Basal</p>
                  <p style={{ fontSize: 36, fontWeight: 800, color: '#22c55e', lineHeight: 1.1 }}>{tmb.tmb_kcal}</p>
                  <p style={{ fontSize: 14, color: '#4b5563', marginTop: 2 }}>kcal / dia em repouso</p>
                </div>
                <span style={{ fontSize: 40 }}>🔥</span>
              </div>
              <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>{tmb.descricao}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontWeight: 600, marginTop: 2 }}>{value}</p>
    </div>
  )
}

const styles = {
  page: { maxWidth: 880, margin: '0 auto', padding: '32px 24px' },
  grid: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' },
  avatar: {
    width: 72, height: 72, borderRadius: '50%', background: '#dcfce7',
    color: '#16a34a', fontSize: 32, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
}
