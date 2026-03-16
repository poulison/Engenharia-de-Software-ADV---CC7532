from abc import ABC, abstractmethod
from typing import Optional
from .schemas import UsuarioCriar, UsuarioLogin, UsuarioAtualizarFisico, UsuarioOut


class UsuarioService(ABC):

    @abstractmethod
    def cadastrar(self, dados: UsuarioCriar) -> UsuarioOut: ...

    @abstractmethod
    def login(self, dados: UsuarioLogin) -> UsuarioOut: ...

    @abstractmethod
    def buscar(self, usuario_id: int) -> Optional[UsuarioOut]: ...

    @abstractmethod
    def listar(self) -> list[UsuarioOut]: ...

    @abstractmethod
    def atualizar_fisico(self, usuario_id: int, dados: UsuarioAtualizarFisico) -> UsuarioOut: ...
