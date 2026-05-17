from abc import ABC, abstractmethod
from .schemas import RelatorioSaude


class RelatorioService(ABC):

    @abstractmethod
    def gerar(self, usuario_id: int) -> RelatorioSaude: ...

