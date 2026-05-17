from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from database import engine, SessionLocal
from database import Base
import models.db_models
from routers import usuario_router, calculos_router, nutricao_router, exercicios_router, relatorio_router

Base.metadata.create_all(bind=engine)

with engine.begin() as conn:
    colunas = {col["name"] for col in inspect(conn).get_columns("usuarios")}
    if "sexo" not in colunas:
        conn.execute(text("ALTER TABLE usuarios ADD COLUMN sexo VARCHAR(20)"))

app = FastAPI(
    title="Plus Health API",
    description="API do sistema Plus Health — Lab 4: UsuarioComponent + CalculosComponent.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuario_router)
app.include_router(calculos_router)
app.include_router(nutricao_router)
app.include_router(exercicios_router)
app.include_router(relatorio_router)

@app.get("/", tags=["Root"])
def root():
    return {"sistema": "Plus Health", "versao": "1.0.0", "docs": "/docs"}
