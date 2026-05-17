import os
import uuid

os.environ["DATABASE_URL"] = "sqlite:///./test_plushealth_pytest.db"

from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def criar_usuario(objetivo="Ganho de massa", sexo="masculino"):
    email = f"teste-{uuid.uuid4().hex}@example.com"
    payload = {
        "nome": "Usuario Teste",
        "email": email,
        "senha": "1234",
        "idade": 30,
        "sexo": sexo,
        "peso": 80.0,
        "altura": 1.80,
        "objetivo": objetivo,
    }
    resp = client.post("/usuarios/cadastro", json=payload)
    assert resp.status_code == 201, resp.text
    return payload, resp.json()


def test_cadastro_login_e_calculos():
    payload, usuario = criar_usuario()

    login = client.post("/usuarios/login", json={
        "email": payload["email"],
        "senha": payload["senha"],
    })
    assert login.status_code == 200
    assert login.json()["id"] == usuario["id"]

    imc = client.get(f"/calculos/imc/{usuario['id']}")
    assert imc.status_code == 200
    assert imc.json()["classificacao"]

    tmb = client.get(f"/calculos/tmb/{usuario['id']}")
    assert tmb.status_code == 200
    assert tmb.json()["tmb_kcal"] == 1780.0


def test_nutricao_exercicios_e_relatorio():
    _, usuario = criar_usuario(objetivo="Perda de peso", sexo="feminino")
    uid = usuario["id"]

    nutricao = client.get(f"/nutricao/recomendar/{uid}")
    assert nutricao.status_code == 200
    assert nutricao.json()["macros"]["proteina_g"] > 0

    alimentos = client.get("/nutricao/buscar?nome=aveia")
    assert alimentos.status_code == 200
    assert alimentos.json()

    exercicios = client.get("/exercicios/?nivel=Iniciante")
    assert exercicios.status_code == 200
    assert exercicios.json()

    recomendados = client.get(f"/exercicios/recomendar/{uid}")
    assert recomendados.status_code == 200
    assert recomendados.json()

    relatorio = client.get(f"/relatorio/{uid}")
    assert relatorio.status_code == 200
    body = relatorio.json()
    assert body["usuario"]["id"] == uid
    assert body["exercicios_recomendados"]

