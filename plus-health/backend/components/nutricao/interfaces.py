from abc import ABC, abstractmethod
from typing import Optional
from .schemas import AlimentoOut, RecomendacaoNutricional


class NutricaoService(ABC):

    @abstractmethod
    def recomendar(self, usuario_id: int) -> RecomendacaoNutricional: ...

    @abstractmethod
    def buscar_alimentos(self, nome: Optional[str] = None) -> list[AlimentoOut]: ...

    @abstractmethod
    def detalhar_alimento(self, alimento_id: int) -> Optional[AlimentoOut]: ...
