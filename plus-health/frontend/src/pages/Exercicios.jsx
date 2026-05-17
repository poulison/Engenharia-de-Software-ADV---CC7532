import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { buscarExercicio, listarExercicios, recomendarExercicios } from '../services/api'

const GRUPOS = ['Todos', 'Pernas', 'Peito', 'Costas', 'Core', 'Cardio', 'Ombros']
const NIVEIS = ['Todos', 'Iniciante', 'Intermediario']

export default function Exercicios() {
  const { usuario } = useAuth()
  const [exercicios, setExercicios] = useState([])
  const [recomendados, setRecomendados] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [filtros, setFiltros] = useState({ grupo: 'Todos', nivel: 'Todos', busca: '' })
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const params = useMemo(() => ({
    grupo: filtros.grupo === 'Todos' ? undefined : filtros.grupo,
    nivel: filtros.nivel === 'Todos' ? undefined : filtros.nivel,
    busca: filtros.busca || undefined,
  }), [filtros])

  useEffect(() => {
    setLoading(true)
    setErro('')
    listarExercicios(params)
      .then(({ data }) => {
        setExercicios(data)
        setSelecionado(data[0] || null)
      })
      .catch(() => setErro('Nao foi possivel carregar o catalogo de exercicios.'))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => {
    if (!usuario) return
    recomendarExercicios(usuario.id)
      .then(({ data }) => setRecomendados(data))
      .catch(() => {})
  }, [usuario])

  async function abrirDetalhe(id) {
    const { data } = await buscarExercicio(id)
    setSelecionado(data)
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 6 }}>Exercicios</h1>
          <p style={styles.sub}>Catalogo de movimentos com grupos musculares, nivel e orientacoes de execucao.</p>
        </div>
      </div>

      <div className="card" style={styles.filters}>
        <div className="form-group">
          <label>Buscar</label>
          <input
            value={filtros.busca}
            onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))}
            placeholder="Nome, grupo ou descricao"
          />
        </div>
        <div className="form-group">
          <label>Grupo muscular</label>
          <select value={filtros.grupo} onChange={e => setFiltros(f => ({ ...f, grupo: e.target.value }))}>
            {GRUPOS.map(grupo => <option key={grupo} value={grupo}>{grupo}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Nivel</label>
          <select value={filtros.nivel} onChange={e => setFiltros(f => ({ ...f, nivel: e.target.value }))}>
            {NIVEIS.map(nivel => <option key={nivel} value={nivel}>{nivel}</option>)}
          </select>
        </div>
      </div>

      {erro && <div className="error-msg">{erro}</div>}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>Carregando exercicios...</div>
      ) : (
        <>
        {!!recomendados.length && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12 }}>Recomendados para seu objetivo</h2>
            <div style={styles.recommended}>
              {recomendados.map(exercicio => (
                <button key={exercicio.id} type="button" onClick={() => abrirDetalhe(exercicio.id)} style={styles.recommendedItem}>
                  <strong>{exercicio.nome}</strong>
                  <span>{exercicio.grupo_muscular} · {exercicio.nivel}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={styles.grid}>
          <div style={styles.list}>
            {exercicios.map(exercicio => (
              <button
                key={exercicio.id}
                type="button"
                onClick={() => abrirDetalhe(exercicio.id)}
                style={{
                  ...styles.exerciseButton,
                  ...(selecionado?.id === exercicio.id ? styles.exerciseButtonActive : {}),
                }}
              >
                <div>
                  <p style={styles.exerciseName}>{exercicio.nome}</p>
                  <p style={styles.exerciseMeta}>{exercicio.grupo_muscular} · {exercicio.nivel}</p>
                </div>
                <span className="badge badge-green">{exercicio.calorias_30min} kcal</span>
              </button>
            ))}

            {!exercicios.length && (
              <div className="card" style={{ color: '#6b7280', textAlign: 'center' }}>
                Nenhum exercicio encontrado para os filtros atuais.
              </div>
            )}
          </div>

          {selecionado && (
            <div className="card" style={styles.detail}>
              <div style={styles.detailTop}>
                <div>
                  <h2 style={styles.detailTitle}>{selecionado.nome}</h2>
                  <p style={styles.detailSub}>{selecionado.descricao}</p>
                </div>
                <div style={styles.kcalBox}>
                  <strong>{selecionado.calorias_30min}</strong>
                  <span>kcal/30min</span>
                </div>
              </div>

              <div style={styles.badges}>
                <span className="badge badge-blue">{selecionado.grupo_muscular}</span>
                <span className="badge badge-yellow">{selecionado.nivel}</span>
                <span className="badge badge-green">{selecionado.equipamento}</span>
              </div>

              <Section title="Como executar" items={selecionado.instrucoes} />
              <Section title="Cuidados" items={selecionado.dicas} />
            </div>
          )}
        </div>
        </>
      )}
    </div>
  )
}

function Section({ title, items }) {
  return (
    <section style={{ marginTop: 22 }}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <ol style={styles.steps}>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ol>
    </section>
  )
}

const styles = {
  page: { maxWidth: 1060, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 20 },
  sub: { color: '#6b7280', fontSize: 14, lineHeight: 1.5 },
  filters: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 220px 180px',
    gap: 14,
    marginBottom: 20,
  },
  grid: { display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' },
  recommended: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  recommendedItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '12px',
    border: '1px solid #dcfce7',
    borderRadius: 10,
    background: '#f0fdf4',
    color: '#1f2937',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  exerciseButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    textAlign: 'left',
    background: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: '14px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  exerciseButtonActive: { borderColor: '#22c55e', background: '#f0fdf4' },
  exerciseName: { fontWeight: 800, fontSize: 15, color: '#1f2937' },
  exerciseMeta: { color: '#6b7280', fontSize: 13, marginTop: 3 },
  detail: { position: 'sticky', top: 84 },
  detailTop: { display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' },
  detailTitle: { fontSize: 24, fontWeight: 800, color: '#1f2937', marginBottom: 6 },
  detailSub: { color: '#4b5563', lineHeight: 1.6, fontSize: 14 },
  kcalBox: {
    minWidth: 96,
    border: '1.5px solid #22c55e',
    borderRadius: 10,
    padding: '10px 12px',
    textAlign: 'center',
    color: '#16a34a',
  },
  badges: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  sectionTitle: { fontSize: 16, color: '#1f2937', marginBottom: 8 },
  steps: { display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 20, color: '#4b5563', lineHeight: 1.5 },
}
