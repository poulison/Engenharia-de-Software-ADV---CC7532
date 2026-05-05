from abc import ABC, abstractmethod
from .schemas import RecomendacaoNutricional


class NutricaoService(ABC):

    @abstractmethod
    def recomendar(self, usuario_id: int) -> RecomendacaoNutricional: ...
