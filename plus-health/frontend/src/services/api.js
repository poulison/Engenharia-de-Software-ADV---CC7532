import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`

const api = axios.create({
  baseURL: API_URL,
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
export const recomendarExercicios = (id) => api.get(`/exercicios/recomendar/${id}`)

// ── Nutrição ──────────────────────────────────────────────────────
export const recomendarNutricao = (id) => api.get(`/nutricao/recomendar/${id}`)
export const buscarAlimento     = (nome) => api.get('/nutricao/buscar', { params: { nome } })
export const detalharAlimento   = (id)   => api.get(`/nutricao/${id}`)

// ── Relatório ─────────────────────────────────────────────────────
export const gerarRelatorio = (id) => api.get(`/relatorio/${id}`)

export default api
