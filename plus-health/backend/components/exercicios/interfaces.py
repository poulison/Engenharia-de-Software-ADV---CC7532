from abc import ABC, abstractmethod
from typing import Optional
from .schemas import ExercicioOut


class ExerciciosService(ABC):

    @abstractmethod
    def listar(
        self,
        grupo: Optional[str] = None,
        nivel: Optional[str] = None,
        busca: Optional[str] = None,
    ) -> list[ExercicioOut]: ...

    @abstractmethod
    def buscar(self, exercicio_id: int) -> Optional[ExercicioOut]: ...

    @abstractmethod
    def recomendar(self, usuario_id: int) -> list[ExercicioOut]: ...
