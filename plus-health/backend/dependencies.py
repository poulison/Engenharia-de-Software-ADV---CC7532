"""
dependencies.py — Container de Injeção de Dependência.
Cada router recebe apenas a interface (ABC), nunca a classe concreta.
"""
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

from components.usuario.interfaces import UsuarioService
from components.usuario.component import UsuarioComponent
from components.calculos.interfaces import CalculosService
from components.calculos.component import CalculosComponent


def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    return UsuarioComponent(db)


def get_calculos_service(
    db: Session = Depends(get_db),
    usuario_service: UsuarioService = Depends(get_usuario_service),
) -> CalculosService:
    return CalculosComponent(usuario_service=usuario_service)
