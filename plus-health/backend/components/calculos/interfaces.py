from abc import ABC, abstractmethod
from .schemas import ResultadoIMC, ResultadoTMB


class CalculosService(ABC):

    @abstractmethod
    def calcular_imc(self, usuario_id: int) -> ResultadoIMC: ...

    @abstractmethod
    def calcular_tmb(self, usuario_id: int) -> ResultadoTMB: ...
