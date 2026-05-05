import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { recomendarNutricao } from '../services/api'

// ── Sub-componentes ─────────────────────────────────────────────────────────

function SectionTitle({ emoji, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937' }}>{title}</h3>
    </div>
  )
}

function MetaCard({ label, value, sub, color = '#22c55e', emoji }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
      <span style={{ fontSize: 32 }}>{emoji}</span>
      <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginTop: 8 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1.1, marginTop: 4 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function MacroBar({ label, grams, kcal, color, pct }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 14, color: '#6b7280' }}>{grams} g &nbsp;·&nbsp; {kcal} kcal</span>
      </div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .6s' }} />
      </div>
    </div>
  )
}

function RefeicaoCard({ nome, descricao, kcal_estimado, index }) {
  const cores = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']
  const cor = cores[index % cores.length]
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      padding: '14px 16px', background: '#f9fafb',
      borderRadius: 10, borderLeft: `4px solid ${cor}`,
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{nome}</p>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>{descricao}</p>
      </div>
      <div style={{
        minWidth: 64, textAlign: 'center',
        background: '#fff', border: `1.5px solid ${cor}`,
        borderRadius: 8, padding: '6px 10px',
      }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: cor }}>{kcal_estimado}</p>
        <p style={{ fontSize: 10, color: '#9ca3af' }}>kcal</p>
      </div>
    </div>
  )
}

// ── Badges de objetivo ──────────────────────────────────────────────────────

const OBJETIVO_BADGE = {
  emagrecer:  { label: 'Emagrecimento 🎯', bg: '#fef3c7', color: '#d97706' },
  massa:      { label: 'Ganho de Massa 💪', bg: '#dbeafe', color: '#1d4ed8' },
  manter:     { label: 'Manutenção ⚖️',   bg: '#dcfce7', color: '#15803d' },
}

function objetivoBadge(objetivo) {
  const key = objetivo?.includes('emagrec') || objetivo?.includes('perder')
    ? 'emagrecer'
    : objetivo?.includes('massa') || objetivo?.includes('hipert')
    ? 'massa'
    : 'manter'
  const b = OBJETIVO_BADGE[key] || OBJETIVO_BADGE.manter
  return (
    <span style={{
      display: 'inline-block', padding: '4px 14px', borderRadius: 99,
      background: b.bg, color: b.color, fontWeight: 700, fontSize: 13,
    }}>
      {b.label}
    </span>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function Nutricao() {
  const { usuario } = useAuth()
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!usuario) return
    setLoading(true)
    recomendarNutricao(usuario.id)
      .then(r => setDados(r.data))
      .catch(() => setErro('Não foi possível carregar a recomendação nutricional.'))
      .finally(() => setLoading(false))
  }, [usuario])

  if (!usuario) return null

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: '#6b7280', marginTop: 16 }}>Calculando sua recomendação…</p>
      </div>
    </div>
  )

  if (erro) return (
    <div style={styles.page}>
      <div className="card" style={{ textAlign: 'center', color: '#ef4444' }}>
        <p style={{ fontSize: 40 }}>⚠️</p>
        <p style={{ fontWeight: 600, marginTop: 8 }}>{erro}</p>
      </div>
    </div>
  )

  if (!dados) return null

  // Cálculo das % de macros para as barras
  const totalKcalMacros =
    dados.macros.proteina_g * 4 +
    dados.macros.carboidrato_g * 4 +
    dados.macros.gordura_g * 9

  const pctProt = Math.round((dados.macros.proteina_g * 4 / totalKcalMacros) * 100)
  const pctCarb = Math.round((dados.macros.carboidrato_g * 4 / totalKcalMacros) * 100)
  const pctGord = Math.round((dados.macros.gordura_g * 9 / totalKcalMacros) * 100)

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Nutrição</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#6b7280', fontSize: 15 }}>Olá, <strong>{dados.nome}</strong>! Veja sua recomendação personalizada.</span>
          {objetivoBadge(dados.objetivo)}
        </div>
      </div>

      {/* Métricas corporais */}
      <div style={{ ...styles.grid4, marginBottom: 24 }}>
        <MetaCard label="IMC" value={dados.imc} sub={dados.classificacao_imc} color="#22c55e" emoji="⚖️" />
        <MetaCard label="TMB (repouso)" value={`${dados.tmb_kcal}`} sub="kcal/dia" color="#3b82f6" emoji="🔥" />
        <MetaCard label="Meta Calórica" value={`${dados.kcal_alvo}`} sub="kcal/dia" color="#f59e0b" emoji="🎯" />
        <MetaCard label="Fator Atividade" value={`×${dados.fator_atividade_utilizado}`} sub="atividade leve" color="#8b5cf6" emoji="🏃" />
      </div>

      {/* Ajuste calórico */}
      <div className="card" style={{ marginBottom: 24 }}>
        <SectionTitle emoji="💡" title="Como foi calculada sua meta calórica" />
        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{dados.descricao_ajuste}</p>
      </div>

      <div style={styles.grid2}>
        {/* Macros */}
        <div className="card">
          <SectionTitle emoji="🧪" title="Distribuição de Macronutrientes" />
          <MacroBar
            label="🥩 Proteína"
            grams={dados.macros.proteina_g}
            kcal={Math.round(dados.macros.proteina_g * 4)}
            color="#22c55e"
            pct={pctProt}
          />
          <MacroBar
            label="🍚 Carboidrato"
            grams={dados.macros.carboidrato_g}
            kcal={Math.round(dados.macros.carboidrato_g * 4)}
            color="#3b82f6"
            pct={pctCarb}
          />
          <MacroBar
            label="🥑 Gordura"
            grams={dados.macros.gordura_g}
            kcal={Math.round(dados.macros.gordura_g * 9)}
            color="#f59e0b"
            pct={pctGord}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
            {[
              { label: 'Proteína', pct: pctProt, color: '#22c55e' },
              { label: 'Carbo', pct: pctCarb, color: '#3b82f6' },
              { label: 'Gordura', pct: pctGord, color: '#f59e0b' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: 18, color: m.color }}>{m.pct}%</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dicas */}
        <div className="card">
          <SectionTitle emoji="✅" title="Dicas para o seu objetivo" />
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 0, listStyle: 'none' }}>
            {dados.dicas.map((dica, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#374151' }}>
                <span style={{ color: '#22c55e', fontWeight: 800, flexShrink: 0 }}>✓</span>
                {dica}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Refeições */}
      <div className="card" style={{ marginTop: 24 }}>
        <SectionTitle emoji="🍽️" title="Sugestão de Refeições Diárias" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dados.refeicoes_sugeridas.map((r, i) => (
            <RefeicaoCard key={i} {...r} index={i} />
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: '#9ca3af' }}>
          * Os valores calóricos são estimativas. Consulte um nutricionista para um plano personalizado.
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: 960, margin: '0 auto', padding: '32px 24px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 },
  spinner: {
    width: 44, height: 44, borderRadius: '50%',
    border: '4px solid #dcfce7', borderTopColor: '#22c55e',
    animation: 'spin 0.8s linear infinite',
  },
}
