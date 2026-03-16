from fastapi import APIRouter, Depends, HTTPException
from components.usuario.interfaces import UsuarioService
from components.usuario.schemas import UsuarioCriar, UsuarioLogin, UsuarioAtualizarFisico, UsuarioOut
from dependencies import get_usuario_service

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.post("/cadastro", response_model=UsuarioOut, status_code=201)
def cadastrar(dados: UsuarioCriar, svc: UsuarioService = Depends(get_usuario_service)):
    try:
        return svc.cadastrar(dados)
    except ValueError as e:
        raise HTTPException(409, str(e))


@router.post("/login", response_model=UsuarioOut)
def login(dados: UsuarioLogin, svc: UsuarioService = Depends(get_usuario_service)):
    try:
        return svc.login(dados)
    except ValueError as e:
        raise HTTPException(401, str(e))


@router.get("/", response_model=list[UsuarioOut])
def listar(svc: UsuarioService = Depends(get_usuario_service)):
    return svc.listar()


@router.get("/{usuario_id}", response_model=UsuarioOut)
def buscar(usuario_id: int, svc: UsuarioService = Depends(get_usuario_service)):
    u = svc.buscar(usuario_id)
    if not u:
        raise HTTPException(404, "Usuário não encontrado.")
    return u


@router.patch("/{usuario_id}/fisico", response_model=UsuarioOut)
def atualizar_fisico(
    usuario_id: int,
    dados: UsuarioAtualizarFisico,
    svc: UsuarioService = Depends(get_usuario_service),
):
    try:
        return svc.atualizar_fisico(usuario_id, dados)
    except ValueError as e:
        raise HTTPException(404, str(e))
