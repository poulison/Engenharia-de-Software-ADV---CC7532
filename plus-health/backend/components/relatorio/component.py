from .interfaces import RelatorioService
from .schemas import RelatorioSaude
from components.usuario.interfaces import UsuarioService
from components.calculos.interfaces import CalculosService
from components.nutricao.interfaces import NutricaoService
from components.exercicios.interfaces import ExerciciosService


class RelatorioComponent(RelatorioService):

    def __init__(
        self,
        usuario_service: UsuarioService,
        calculos_service: CalculosService,
        nutricao_service: NutricaoService,
        exercicios_service: ExerciciosService,
    ):
        self._usuarios = usuario_service
        self._calculos = calculos_service
        self._nutricao = nutricao_service
        self._exercicios = exercicios_service

    def gerar(self, usuario_id: int) -> RelatorioSaude:
        usuario = self._usuarios.buscar(usuario_id)
        if not usuario:
            raise ValueError("Usuario nao encontrado.")

        imc = self._calculos.calcular_imc(usuario_id)
        tmb = self._calculos.calcular_tmb(usuario_id)
        nutricao = self._nutricao.recomendar(usuario_id)
        exercicios = self._exercicios.recomendar(usuario_id)

        return RelatorioSaude(
            usuario=usuario,
            imc=imc,
            tmb=tmb,
            nutricao=nutricao,
            exercicios_recomendados=exercicios,
            mensagem="Relatorio consolidado gerado com sucesso.",
        )

