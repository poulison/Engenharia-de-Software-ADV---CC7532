from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from components.exercicios.interfaces import ExerciciosService
from components.exercicios.schemas import ExercicioOut
from dependencies import get_exercicios_service

router = APIRouter(prefix="/exercicios", tags=["Exercicios"])


@router.get("/", response_model=list[ExercicioOut])
def listar(
    grupo: Optional[str] = Query(default=None),
    nivel: Optional[str] = Query(default=None),
    busca: Optional[str] = Query(default=None),
    svc: ExerciciosService = Depends(get_exercicios_service),
):
    return svc.listar(grupo=grupo, nivel=nivel, busca=busca)


@router.get("/recomendar/{usuario_id}", response_model=list[ExercicioOut])
def recomendar(
    usuario_id: int,
    svc: ExerciciosService = Depends(get_exercicios_service),
):
    try:
        return svc.recomendar(usuario_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/{exercicio_id}", response_model=ExercicioOut)
def buscar(
    exercicio_id: int,
    svc: ExerciciosService = Depends(get_exercicios_service),
):
    exercicio = svc.buscar(exercicio_id)
    if not exercicio:
        raise HTTPException(404, "Exercicio nao encontrado.")
    return exercicio
