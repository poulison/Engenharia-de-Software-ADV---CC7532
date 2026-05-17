from typing import Optional
import hashlib
import hmac
import os
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
        payload = dados.model_dump()
        payload["senha"] = _hash_senha(payload["senha"])
        u = UsuarioDB(**payload)
        self._db.add(u)
        self._db.commit()
        self._db.refresh(u)
        return UsuarioOut.model_validate(u)

    def login(self, dados: UsuarioLogin) -> UsuarioOut:
        u = (self._db.query(UsuarioDB)
             .filter(UsuarioDB.email == dados.email)
             .first())
        if not u or not _verificar_senha(dados.senha, u.senha):
            raise ValueError("E-mail ou senha incorretos.")
        if not u.senha.startswith("pbkdf2_sha256$"):
            u.senha = _hash_senha(dados.senha)
            self._db.commit()
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


def _hash_senha(senha: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac("sha256", senha.encode(), salt.encode(), 120000).hex()
    return f"pbkdf2_sha256${salt}${digest}"


def _verificar_senha(senha: str, senha_salva: str) -> bool:
    if not senha_salva.startswith("pbkdf2_sha256$"):
        return hmac.compare_digest(senha, senha_salva)
    _, salt, digest = senha_salva.split("$", 2)
    tentativa = hashlib.pbkdf2_hmac("sha256", senha.encode(), salt.encode(), 120000).hex()
    return hmac.compare_digest(tentativa, digest)
