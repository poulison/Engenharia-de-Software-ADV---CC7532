from pydantic import BaseModel


class ExercicioOut(BaseModel):
    id: int
    nome: str
    grupo_muscular: str
    nivel: str
    equipamento: str
    descricao: str
    instrucoes: list[str]
    dicas: list[str]
    calorias_30min: int

