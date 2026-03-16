from pydantic import BaseModel


class ResultadoIMC(BaseModel):
    usuario_id: int
    nome: str
    imc: float
    classificacao: str
    peso: float
    altura: float


class ResultadoTMB(BaseModel):
    usuario_id: int
    nome: str
    tmb_kcal: float
    descricao: str
