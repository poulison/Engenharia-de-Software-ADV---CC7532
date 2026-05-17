from typing import Optional
from .interfaces import ExerciciosService
from .schemas import ExercicioOut
from components.usuario.interfaces import UsuarioService


_EXERCICIOS = [
    {
        "id": 1,
        "nome": "Agachamento livre",
        "grupo_muscular": "Pernas",
        "nivel": "Intermediario",
        "equipamento": "Peso corporal ou barra",
        "descricao": "Exercicio composto para quadriceps, gluteos e core.",
        "instrucoes": [
            "Mantenha os pes na largura dos ombros.",
            "Desca flexionando quadris e joelhos sem arredondar a coluna.",
            "Suba empurrando o chao e contraindo os gluteos.",
        ],
        "dicas": [
            "Comece com peso corporal ate dominar a tecnica.",
            "Evite deixar os joelhos colapsarem para dentro.",
        ],
        "calorias_30min": 210,
    },
    {
        "id": 2,
        "nome": "Flexao de braco",
        "grupo_muscular": "Peito",
        "nivel": "Iniciante",
        "equipamento": "Peso corporal",
        "descricao": "Fortalece peitoral, ombros, triceps e estabilizadores do tronco.",
        "instrucoes": [
            "Apoie as maos um pouco alem da largura dos ombros.",
            "Mantenha corpo alinhado da cabeca aos calcanhares.",
            "Flexione os cotovelos e retorne controlando o movimento.",
        ],
        "dicas": [
            "Use apoio nos joelhos se precisar reduzir a intensidade.",
            "Contraia o abdomen para proteger a lombar.",
        ],
        "calorias_30min": 180,
    },
    {
        "id": 3,
        "nome": "Remada curvada",
        "grupo_muscular": "Costas",
        "nivel": "Intermediario",
        "equipamento": "Halteres ou barra",
        "descricao": "Trabalha dorsais, romboides, trapezio e biceps.",
        "instrucoes": [
            "Incline o tronco mantendo a coluna neutra.",
            "Puxe a carga em direcao ao abdomen.",
            "Controle a descida sem relaxar os ombros.",
        ],
        "dicas": [
            "Evite usar impulso excessivo.",
            "Pense em aproximar as escapulas durante a puxada.",
        ],
        "calorias_30min": 190,
    },
    {
        "id": 4,
        "nome": "Prancha abdominal",
        "grupo_muscular": "Core",
        "nivel": "Iniciante",
        "equipamento": "Peso corporal",
        "descricao": "Exercicio isometrico para abdomen, lombar e estabilidade.",
        "instrucoes": [
            "Apoie antebracos e pontas dos pes no chao.",
            "Mantenha quadril alinhado ao tronco.",
            "Respire de forma controlada durante a permanencia.",
        ],
        "dicas": [
            "Comece com series de 20 a 30 segundos.",
            "Interrompa se perder o alinhamento do quadril.",
        ],
        "calorias_30min": 120,
    },
    {
        "id": 5,
        "nome": "Corrida leve",
        "grupo_muscular": "Cardio",
        "nivel": "Iniciante",
        "equipamento": "Tenis",
        "descricao": "Atividade aerobica para condicionamento e gasto calorico.",
        "instrucoes": [
            "Aquecimento: caminhe por 5 minutos.",
            "Mantenha ritmo em que ainda consiga conversar.",
            "Finalize reduzindo o ritmo aos poucos.",
        ],
        "dicas": [
            "Priorize regularidade antes de aumentar velocidade.",
            "Alterne corrida e caminhada se estiver comecando.",
        ],
        "calorias_30min": 260,
    },
    {
        "id": 6,
        "nome": "Desenvolvimento de ombros",
        "grupo_muscular": "Ombros",
        "nivel": "Intermediario",
        "equipamento": "Halteres",
        "descricao": "Movimento de empurrar para deltoides e triceps.",
        "instrucoes": [
            "Segure os halteres na altura dos ombros.",
            "Empurre a carga acima da cabeca sem arquear a lombar.",
            "Desca ate a posicao inicial com controle.",
        ],
        "dicas": [
            "Use carga moderada para preservar a tecnica.",
            "Mantenha abdomen contraido durante toda a serie.",
        ],
        "calorias_30min": 170,
    },
]


class ExerciciosComponent(ExerciciosService):

    def __init__(self, usuario_service: UsuarioService | None = None):
        self._usuario_service = usuario_service

    def listar(
        self,
        grupo: Optional[str] = None,
        nivel: Optional[str] = None,
        busca: Optional[str] = None,
    ) -> list[ExercicioOut]:
        exercicios = _EXERCICIOS
        if grupo:
            termo = grupo.strip().lower()
            exercicios = [e for e in exercicios if e["grupo_muscular"].lower() == termo]
        if nivel:
            termo = nivel.strip().lower()
            exercicios = [e for e in exercicios if e["nivel"].lower() == termo]
        if busca:
            termo = busca.strip().lower()
            exercicios = [
                e for e in exercicios
                if termo in e["nome"].lower()
                or termo in e["grupo_muscular"].lower()
                or termo in e["descricao"].lower()
            ]
        return [ExercicioOut(**e) for e in exercicios]

    def buscar(self, exercicio_id: int) -> Optional[ExercicioOut]:
        exercicio = next((e for e in _EXERCICIOS if e["id"] == exercicio_id), None)
        return ExercicioOut(**exercicio) if exercicio else None

    def recomendar(self, usuario_id: int) -> list[ExercicioOut]:
        if not self._usuario_service:
            raise ValueError("UsuarioService nao configurado.")
        usuario = self._usuario_service.buscar(usuario_id)
        if not usuario:
            raise ValueError("Usuario nao encontrado.")

        objetivo = (usuario.objetivo or "").strip().lower()
        if "perda" in objetivo or "emagrec" in objetivo:
            ids = {1, 2, 4, 5}
        elif "massa" in objetivo or "hipertrof" in objetivo:
            ids = {1, 2, 3, 6}
        elif "condicionamento" in objetivo:
            ids = {2, 4, 5, 6}
        else:
            ids = {2, 4, 5}
        return [ExercicioOut(**e) for e in _EXERCICIOS if e["id"] in ids]
