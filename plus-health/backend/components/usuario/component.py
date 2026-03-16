from typing import Optional
from sqlalchemy.orm import Session
from .interfaces import UsuarioService
from .schemas import UsuarioCriar, UsuarioLogin, UsuarioAtualizarFisico, UsuarioOut
from models import UsuarioDB


class UsuarioComponent(UsuarioService):

    def __init__(self, db: Session):
        self._db = db

    def cadastrar(self, dados: UsuarioCriar) -> UsuarioOut:
        if self._db.query(UsuarioDB).filter(UsuarioDB.email == dados.email).first():
            raise ValueError(f"E-mail '{dados.email}' já cadastrado.")
        u = UsuarioDB(**dados.model_dump())
        self._db.add(u)
        self._db.commit()
        self._db.refresh(u)
        return UsuarioOut.model_validate(u)

    def login(self, dados: UsuarioLogin) -> UsuarioOut:
        u = (self._db.query(UsuarioDB)
             .filter(UsuarioDB.email == dados.email, UsuarioDB.senha == dados.senha)
             .first())
        if not u:
            raise ValueError("E-mail ou senha incorretos.")
        return UsuarioOut.model_validate(u)

    def buscar(self, usuario_id: int) -> Optional[UsuarioOut]:
        u = self._db.query(UsuarioDB).filter(UsuarioDB.id == usuario_id).first()
        return UsuarioOut.model_validate(u) if u else None

    def listar(self) -> list[UsuarioOut]:
        return [UsuarioOut.model_validate(u) for u in self._db.query(UsuarioDB).all()]

    def atualizar_fisico(self, usuario_id: int, dados: UsuarioAtualizarFisico) -> UsuarioOut:
        u = self._db.query(UsuarioDB).filter(UsuarioDB.id == usuario_id).first()
        if not u:
            raise ValueError("Usuário não encontrado.")
        u.peso = dados.peso
        u.altura = dados.altura
        self._db.commit()
        self._db.refresh(u)
        return UsuarioOut.model_validate(u)
