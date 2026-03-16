from sqlalchemy import Column, Integer, String, Float
from database import Base


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id       = Column(Integer, primary_key=True, index=True)
    nome     = Column(String(120), nullable=False)
    email    = Column(String(200), unique=True, nullable=False, index=True)
    senha    = Column(String(200), nullable=False)
    idade    = Column(Integer, nullable=False)
    peso     = Column(Float, nullable=False)
    altura   = Column(Float, nullable=False)
    objetivo = Column(String(200), nullable=True)
