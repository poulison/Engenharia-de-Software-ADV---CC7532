from pydantic import BaseModel
from components.usuario.schemas import UsuarioOut
from components.calculos.schemas import ResultadoIMC, ResultadoTMB
from components.nutricao.schemas import RecomendacaoNutricional
from components.exercicios.schemas import ExercicioOut


class RelatorioSaude(BaseModel):
    usuario: UsuarioOut
    imc: ResultadoIMC
    tmb: ResultadoTMB
    nutricao: RecomendacaoNutricional
    exercicios_recomendados: list[ExercicioOut]
    mensagem: str

