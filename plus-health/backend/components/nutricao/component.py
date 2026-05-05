"""
NutricaoComponent
-----------------
Gera recomendações nutricionais personalizadas com base nos dados corporais
do usuário.

Interfaces requeridas (injetadas pelo construtor — sem acoplamento direto):
  • CalculosService  →  calcular_imc(), calcular_tmb()
  • UsuarioService   →  buscar()

Lógica central:
  1. Busca IMC e TMB via CalculosService.
  2. Lê o objetivo do usuário via UsuarioService.
  3. Aplica fator de atividade e ajuste calórico de acordo com o objetivo.
  4. Calcula macros (proteína, carboidrato, gordura) em gramas.
  5. Monta refeições sugeridas e dicas personalizadas.
"""

from .interfaces import NutricaoService
from .schemas import (
    RecomendacaoNutricional,
    MacrosRecomendados,
    RefeicaoSugerida,
)
from components.calculos.interfaces import CalculosService
from components.usuario.interfaces import UsuarioService


# ---------------------------------------------------------------------------
# Constantes de configuração
# ---------------------------------------------------------------------------

# Mapeamento de objetivos aceitos → chave interna
_OBJETIVOS = {
    "emagrecer": "emagrecer",
    "perder peso": "emagrecer",
    "emagrecimento": "emagrecer",
    "ganhar massa": "massa",
    "ganho de massa": "massa",
    "hipertrofia": "massa",
    "manter": "manter",
    "manutenção": "manter",
    "manutencao": "manter",
}

# Fator de atividade leve (sedentário/leve) — usado como base
_FATOR_LEVE = 1.375

# Ajuste calórico por objetivo (em kcal sobre a TDEE)
_AJUSTE_KCAL = {
    "emagrecer": -500,
    "massa":     +300,
    "manter":      0,
}

# Proteína (g/kg de peso corporal) por objetivo
_PROTEINA_G_POR_KG = {
    "emagrecer": 2.0,
    "massa":     2.2,
    "manter":    1.6,
}

# Gordura como % do total calórico
_GORDURA_PCT = {
    "emagrecer": 0.25,
    "massa":     0.25,
    "manter":    0.30,
}


# ---------------------------------------------------------------------------
# Refeições sugeridas por objetivo
# ---------------------------------------------------------------------------

_REFEICOES: dict[str, list[dict]] = {
    "emagrecer": [
        {"nome": "Café da manhã",  "descricao": "Ovos mexidos (2) + pão integral (1 fatia) + fruta", "kcal_estimado": 350},
        {"nome": "Lanche manhã",   "descricao": "Iogurte grego natural sem açúcar + 10 amêndoas",      "kcal_estimado": 180},
        {"nome": "Almoço",         "descricao": "Peito de frango grelhado (150 g) + arroz integral (100 g) + salada verde à vontade", "kcal_estimado": 480},
        {"nome": "Lanche tarde",   "descricao": "Whey protein (1 dose) + 1 maçã",                      "kcal_estimado": 220},
        {"nome": "Jantar",         "descricao": "Peixe assado (150 g) + legumes no vapor + 1 batata-doce pequena", "kcal_estimado": 420},
    ],
    "massa": [
        {"nome": "Café da manhã",  "descricao": "Omelete (3 ovos) + aveia (50 g) + banana + mel",      "kcal_estimado": 550},
        {"nome": "Lanche manhã",   "descricao": "Vitamina: leite integral + whey + aveia + pasta de amendoim", "kcal_estimado": 450},
        {"nome": "Almoço",         "descricao": "Frango ou carne vermelha (200 g) + arroz branco (150 g) + feijão + legumes", "kcal_estimado": 700},
        {"nome": "Lanche tarde",   "descricao": "Pão integral (2 fatias) + queijo cottage + 1 fruta",   "kcal_estimado": 380},
        {"nome": "Jantar",         "descricao": "Salmão grelhado (180 g) + batata-doce (150 g) + brócolis", "kcal_estimado": 580},
        {"nome": "Ceia",           "descricao": "Caseína ou iogurte grego + castanhas",                  "kcal_estimado": 200},
    ],
    "manter": [
        {"nome": "Café da manhã",  "descricao": "Tapioca recheada com queijo e ovo + suco natural",     "kcal_estimado": 400},
        {"nome": "Lanche manhã",   "descricao": "Mix de frutas + iogurte natural",                      "kcal_estimado": 200},
        {"nome": "Almoço",         "descricao": "Frango ou peixe (150 g) + arroz + feijão + salada",    "kcal_estimado": 550},
        {"nome": "Lanche tarde",   "descricao": "Fruta + punhado de oleaginosas",                        "kcal_estimado": 180},
        {"nome": "Jantar",         "descricao": "Omelete (2 ovos) + legumes refogados + arroz integral", "kcal_estimado": 450},
    ],
}

# Dicas por objetivo
_DICAS: dict[str, list[str]] = {
    "emagrecer": [
        "Priorize proteínas em todas as refeições para preservar massa muscular.",
        "Beba pelo menos 35 ml de água por kg de peso corporal por dia.",
        "Prefira alimentos integrais e evite ultraprocessados.",
        "Faça 3–5 refeições por dia para manter o metabolismo ativo.",
        "Inclua treinos de resistência para evitar perda de massa magra.",
    ],
    "massa": [
        "Garanta um superávit calórico consistente e controlado (200–400 kcal).",
        "Distribua a proteína em 4–6 refeições para maximizar a síntese muscular.",
        "Consuma carboidratos pré e pós-treino para energia e recuperação.",
        "Durma 7–9 horas por noite — o crescimento muscular ocorre no descanso.",
        "Hidratação adequada é essencial para a performance e recuperação.",
    ],
    "manter": [
        "Varie as fontes de proteína (carnes, ovos, leguminosas) ao longo da semana.",
        "Mantenha um equilíbrio entre todos os grupos alimentares.",
        "Pratique atividade física regularmente para preservar a composição corporal.",
        "Monitore o peso semanalmente (mesmo dia e horário) para ajustar se necessário.",
        "Priorize alimentos in natura e minimize ultraprocessados.",
    ],
}


# ---------------------------------------------------------------------------
# Componente
# ---------------------------------------------------------------------------

class NutricaoComponent(NutricaoService):

    def __init__(
        self,
        calculos_service: CalculosService,
        usuario_service: UsuarioService,
    ):
        # Dependências injetadas — nunca instanciadas aqui
        self._calculos = calculos_service
        self._usuario = usuario_service

    # ------------------------------------------------------------------
    # Interface pública
    # ------------------------------------------------------------------

    def recomendar(self, usuario_id: int) -> RecomendacaoNutricional:
        # 1. Buscar dados do usuário
        usuario = self._usuario.buscar(usuario_id)
        if not usuario:
            raise ValueError(f"Usuário {usuario_id} não encontrado.")

        # 2. Buscar IMC e TMB via CalculosService (comunicação entre serviços)
        resultado_imc = self._calculos.calcular_imc(usuario_id)
        resultado_tmb = self._calculos.calcular_tmb(usuario_id)

        # 3. Mapear objetivo
        objetivo_raw = (usuario.objetivo or "manter").strip().lower()
        objetivo_key = _OBJETIVOS.get(objetivo_raw, "manter")

        # 4. Calcular kcal alvo
        tdee = round(resultado_tmb.tmb_kcal * _FATOR_LEVE, 2)
        ajuste = _AJUSTE_KCAL[objetivo_key]
        kcal_alvo = round(tdee + ajuste, 2)

        # 5. Calcular macros
        macros = self._calcular_macros(usuario.peso, kcal_alvo, objetivo_key)

        # 6. Montar refeições e dicas
        refeicoes = [RefeicaoSugerida(**r) for r in _REFEICOES[objetivo_key]]
        dicas = _DICAS[objetivo_key]

        # 7. Descrição do ajuste
        descricao_ajuste = self._descricao_ajuste(objetivo_key, tdee, ajuste, kcal_alvo)

        return RecomendacaoNutricional(
            usuario_id=usuario_id,
            nome=usuario.nome,
            objetivo=objetivo_raw,
            imc=resultado_imc.imc,
            classificacao_imc=resultado_imc.classificacao,
            tmb_kcal=resultado_tmb.tmb_kcal,
            kcal_alvo=kcal_alvo,
            fator_atividade_utilizado=_FATOR_LEVE,
            descricao_ajuste=descricao_ajuste,
            macros=macros,
            refeicoes_sugeridas=refeicoes,
            dicas=dicas,
        )

    # ------------------------------------------------------------------
    # Helpers privados
    # ------------------------------------------------------------------

    @staticmethod
    def _calcular_macros(
        peso_kg: float,
        kcal_alvo: float,
        objetivo: str,
    ) -> MacrosRecomendados:
        # Proteína
        prot_g = round(peso_kg * _PROTEINA_G_POR_KG[objetivo], 1)
        prot_kcal = prot_g * 4

        # Gordura
        gord_kcal = kcal_alvo * _GORDURA_PCT[objetivo]
        gord_g = round(gord_kcal / 9, 1)

        # Carboidrato — restante das calorias
        carb_kcal = max(kcal_alvo - prot_kcal - gord_kcal, 0)
        carb_g = round(carb_kcal / 4, 1)

        return MacrosRecomendados(
            proteina_g=prot_g,
            carboidrato_g=carb_g,
            gordura_g=gord_g,
        )

    @staticmethod
    def _descricao_ajuste(
        objetivo: str,
        tdee: float,
        ajuste: int,
        kcal_alvo: float,
    ) -> str:
        if objetivo == "emagrecer":
            return (
                f"Seu gasto diário estimado (TDEE) é {tdee:.0f} kcal. "
                f"Aplicamos um déficit de {abs(ajuste)} kcal para promover "
                f"perda de peso gradual e saudável, resultando em {kcal_alvo:.0f} kcal/dia."
            )
        if objetivo == "massa":
            return (
                f"Seu gasto diário estimado (TDEE) é {tdee:.0f} kcal. "
                f"Adicionamos um superávit de {ajuste} kcal para suportar "
                f"o ganho de massa muscular, resultando em {kcal_alvo:.0f} kcal/dia."
            )
        return (
            f"Seu gasto diário estimado (TDEE) é {tdee:.0f} kcal. "
            f"A meta calórica de {kcal_alvo:.0f} kcal/dia visa manter "
            f"o seu peso e composição corporal atuais."
        )
