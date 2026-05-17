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
from components.nutricao.interfaces import NutricaoService
from components.nutricao.component import NutricaoComponent
from components.exercicios.interfaces import ExerciciosService
from components.exercicios.component import ExerciciosComponent
from components.relatorio.interfaces import RelatorioService
from components.relatorio.component import RelatorioComponent


def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    return UsuarioComponent(db)


def get_calculos_service(
    db: Session = Depends(get_db),
    usuario_service: UsuarioService = Depends(get_usuario_service),
) -> CalculosService:
    return CalculosComponent(usuario_service=usuario_service)


def get_nutricao_service(
    calculos_service: CalculosService = Depends(get_calculos_service),
    usuario_service: UsuarioService = Depends(get_usuario_service),
) -> NutricaoService:
    return NutricaoComponent(
        calculos_service=calculos_service,
        usuario_service=usuario_service,
    )


def get_exercicios_service(
    usuario_service: UsuarioService = Depends(get_usuario_service),
) -> ExerciciosService:
    return ExerciciosComponent(usuario_service=usuario_service)


def get_relatorio_service(
    usuario_service: UsuarioService = Depends(get_usuario_service),
    calculos_service: CalculosService = Depends(get_calculos_service),
    nutricao_service: NutricaoService = Depends(get_nutricao_service),
    exercicios_service: ExerciciosService = Depends(get_exercicios_service),
) -> RelatorioService:
    return RelatorioComponent(
        usuario_service=usuario_service,
        calculos_service=calculos_service,
        nutricao_service=nutricao_service,
        exercicios_service=exercicios_service,
    )
