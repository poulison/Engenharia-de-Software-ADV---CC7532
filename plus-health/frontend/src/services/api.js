import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// ── Usuários ──────────────────────────────────────────────────────
export const cadastrarUsuario = (dados) => api.post('/usuarios/cadastro', dados)
export const loginUsuario     = (dados) => api.post('/usuarios/login', dados)
export const buscarUsuario    = (id)    => api.get(`/usuarios/${id}`)
export const atualizarFisico  = (id, dados) => api.patch(`/usuarios/${id}/fisico`, dados)

// ── Cálculos ──────────────────────────────────────────────────────
export const calcularIMC = (id) => api.get(`/calculos/imc/${id}`)
export const calcularTMB = (id) => api.get(`/calculos/tmb/${id}`)

// ── Exercícios ────────────────────────────────────────────────────
export const listarExercicios = (params) => api.get('/exercicios/', { params })
export const buscarExercicio  = (id)     => api.get(`/exercicios/${id}`)

// ── Nutrição ──────────────────────────────────────────────────────
export const buscarAlimento  = (nome) => api.get('/nutricao/buscar', { params: { nome } })
export const detalharAlimento = (id)  => api.get(`/nutricao/${id}`)

export default api
