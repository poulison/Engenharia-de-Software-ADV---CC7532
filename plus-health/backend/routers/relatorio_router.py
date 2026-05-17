from fastapi import APIRouter, Depends, HTTPException
from components.relatorio.interfaces import RelatorioService
from components.relatorio.schemas import RelatorioSaude
from dependencies import get_relatorio_service

router = APIRouter(prefix="/relatorio", tags=["Relatorio"])


@router.get("/{usuario_id}", response_model=RelatorioSaude)
def gerar(
    usuario_id: int,
    svc: RelatorioService = Depends(get_relatorio_service),
):
    try:
        return svc.gerar(usuario_id)
    except ValueError as e:
        raise HTTPException(404, str(e))

