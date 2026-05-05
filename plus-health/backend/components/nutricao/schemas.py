from pydantic import BaseModel
from typing import List


class MacrosRecomendados(BaseModel):
    proteina_g: float
    carboidrato_g: float
    gordura_g: float


class RefeicaoSugerida(BaseModel):
    nome: str
    descricao: str
    kcal_estimado: int


class RecomendacaoNutricional(BaseModel):
    usuario_id: int
    nome: str
    objetivo: str
    imc: float
    classificacao_imc: str
    tmb_kcal: float
    kcal_alvo: float
    fator_atividade_utilizado: float
    descricao_ajuste: str
    macros: MacrosRecomendados
    refeicoes_sugeridas: List[RefeicaoSugerida]
    dicas: List[str]
