import math
from .interfaces import CalculosService
from .schemas import ResultadoIMC, ResultadoTMB
from components.usuario.interfaces import UsuarioService   # só a interface!


class CalculosComponent(CalculosService):

    def __init__(self, usuario_service: UsuarioService):
        self._usuario_service = usuario_service   # injeção de dependência

    def calcular_imc(self, usuario_id: int) -> ResultadoIMC:
        u = self._usuario_service.buscar(usuario_id)
        if not u:
            raise ValueError(f"Usuário {usuario_id} não encontrado.")
        imc = round(u.peso / math.pow(u.altura, 2), 2)
        return ResultadoIMC(
            usuario_id=u.id, nome=u.nome, imc=imc,
            classificacao=self._classificar(imc), peso=u.peso, altura=u.altura
        )

    def calcular_tmb(self, usuario_id: int) -> ResultadoTMB:
        u = self._usuario_service.buscar(usuario_id)
        if not u:
            raise ValueError(f"Usuário {usuario_id} não encontrado.")
        tmb = round(10 * u.peso + 6.25 * (u.altura * 100) - 5 * u.idade, 2)
        return ResultadoTMB(
            usuario_id=u.id, nome=u.nome, tmb_kcal=tmb,
            descricao=f"Você precisa de aproximadamente {tmb} kcal/dia em repouso."
        )

    @staticmethod
    def _classificar(imc: float) -> str:
        if imc < 18.5: return "Abaixo do peso"
        if imc < 25.0: return "Peso normal"
        if imc < 30.0: return "Sobrepeso"
        if imc < 35.0: return "Obesidade grau I"
        if imc < 40.0: return "Obesidade grau II"
        return "Obesidade grau III"
