from fastapi import APIRouter, Depends, HTTPException
from components.nutricao.interfaces import NutricaoService
from components.nutricao.schemas import RecomendacaoNutricional
from dependencies import get_nutricao_service

router = APIRouter(prefix="/nutricao", tags=["Nutrição"])


@router.get(
    "/recomendar/{usuario_id}",
    response_model=RecomendacaoNutricional,
    summary="Recomendação nutricional personalizada",
    description=(
        "Combina IMC e TMB (via CalculosService) com o objetivo do usuário "
        "para gerar metas calóricas, macros e refeições sugeridas."
    ),
)
def recomendar(
    usuario_id: int,
    svc: NutricaoService = Depends(get_nutricao_service),
):
    try:
        return svc.recomendar(usuario_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
