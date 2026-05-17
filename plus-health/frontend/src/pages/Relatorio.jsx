import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { gerarRelatorio } from '../services/api'

export default function Relatorio() {
  const { usuario } = useAuth()
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    setLoading(true)
    gerarRelatorio(usuario.id)
      .then(r => setDados(r.data))
      .catch(() => setErro('Nao foi possivel gerar o relatorio.'))
      .finally(() => setLoading(false))
  }, [usuario])

  if (loading) return <div style={styles.page}><div className="card">Gerando relatorio...</div></div>
  if (erro) return <div style={styles.page}><div className="error-msg">{erro}</div></div>
  if (!dados) return null

  return (
    <div style={styles.page}>
      <h1 className="page-title">Relatório de Saúde</h1>

      <div style={styles.grid}>
        <Metric title="IMC" value={dados.imc.imc} detail={dados.imc.classificacao} />
        <Metric title="TMB" value={dados.tmb.tmb_kcal} detail="kcal/dia" />
        <Metric title="Meta" value={dados.nutricao.kcal_alvo} detail="kcal/dia" />
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={styles.sectionTitle}>Resumo</h2>
        <p style={styles.text}>
          {dados.usuario.nome}, objetivo: <strong>{dados.usuario.objetivo || 'manter'}</strong>.
          {' '}A recomendacao atual combina sua classificacao corporal, meta calorica,
          macros e sugestoes de exercicios para orientar o acompanhamento.
        </p>
      </div>

      <div style={styles.twoCols}>
        <div className="card">
          <h2 style={styles.sectionTitle}>Macronutrientes</h2>
          <Info label="Proteina" value={`${dados.nutricao.macros.proteina_g} g`} />
          <Info label="Carboidrato" value={`${dados.nutricao.macros.carboidrato_g} g`} />
          <Info label="Gordura" value={`${dados.nutricao.macros.gordura_g} g`} />
        </div>

        <div className="card">
          <h2 style={styles.sectionTitle}>Exercícios Recomendados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dados.exercicios_recomendados.map(exercicio => (
              <div key={exercicio.id} style={styles.exercise}>
                <strong>{exercicio.nome}</strong>
                <span>{exercicio.grupo_muscular} · {exercicio.nivel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ title, value, detail }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <p style={{ color: '#6b7280', fontSize: 13, fontWeight: 700 }}>{title}</p>
      <p style={{ color: '#22c55e', fontSize: 32, fontWeight: 800 }}>{value}</p>
      <p style={{ color: '#4b5563', fontSize: 13 }}>{detail}</p>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div style={styles.info}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '32px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  twoCols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 800, marginBottom: 12, color: '#1f2937' },
  text: { color: '#4b5563', lineHeight: 1.7 },
  info: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    color: '#4b5563',
  },
  exercise: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    padding: '10px 12px',
    borderRadius: 8,
    background: '#f9fafb',
    color: '#4b5563',
  },
}

