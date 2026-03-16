from fastapi import APIRouter, Depends, HTTPException
from components.calculos.interfaces import CalculosService
from components.calculos.schemas import ResultadoIMC, ResultadoTMB
from dependencies import get_calculos_service

router = APIRouter(prefix="/calculos", tags=["Cálculos Corporais"])


@router.get("/imc/{usuario_id}", response_model=ResultadoIMC)
def imc(usuario_id: int, svc: CalculosService = Depends(get_calculos_service)):
    try:
        return svc.calcular_imc(usuario_id)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/tmb/{usuario_id}", response_model=ResultadoTMB)
def tmb(usuario_id: int, svc: CalculosService = Depends(get_calculos_service)):
    try:
        return svc.calcular_tmb(usuario_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
