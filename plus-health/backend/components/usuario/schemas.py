from pydantic import BaseModel, Field
from typing import Optional


class UsuarioCriar(BaseModel):
    nome:     str   = Field(..., min_length=2)
    email:    str
    senha:    str   = Field(..., min_length=4)
    idade:    int   = Field(..., gt=0, lt=120)
    peso:     float = Field(..., gt=0)
    altura:   float = Field(..., gt=0)
    objetivo: Optional[str] = None


class UsuarioLogin(BaseModel):
    email: str
    senha: str


class UsuarioAtualizarFisico(BaseModel):
    peso:   float = Field(..., gt=0)
    altura: float = Field(..., gt=0)


class UsuarioOut(BaseModel):
    id:       int
    nome:     str
    email:    str
    idade:    int
    peso:     float
    altura:   float
    objetivo: Optional[str] = None

    model_config = {"from_attributes": True}
