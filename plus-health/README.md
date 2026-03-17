# Plus Health 

> Implementação de dois componentes com interfaces e injeção de dependência | FEI

---

## Componentes Implementados

### 1. UsuarioComponent
Gerencia cadastro, autenticação e dados físicos do usuário.

**Interface fornecida:** `UsuarioService`
- `cadastrar(dados)` → cria e persiste usuário no banco
- `login(dados)` → autentica por e-mail e senha
- `buscar(id)` → retorna usuário por ID
- `listar()` → retorna todos os usuários
- `atualizar_fisico(id, dados)` → atualiza peso e altura

### 2. CalculosComponent
Calcula indicadores corporais com base nos dados do usuário.

**Interface fornecida:** `CalculosService`
- `calcular_imc(usuario_id)` → calcula IMC e retorna classificação OMS
- `calcular_tmb(usuario_id)` → calcula Taxa Metabólica Basal (Mifflin-St Jeor)

**Interface requerida:** `UsuarioService` ← injetada via injeção de dependência

---

## Como ocorre a comunicação entre eles

`CalculosComponent` depende de `UsuarioService` para buscar os dados físicos do usuário (peso, altura, idade). Essa dependência é declarada apenas pelo tipo da interface no construtor — nunca pela classe concreta:

```python
class CalculosComponent(CalculosService):
    def __init__(self, usuario_service: UsuarioService):  # só a interface
        self._usuario_service = usuario_service
```

O `dependencies.py` é o único lugar onde as classes concretas são instanciadas e conectadas:

```python
def get_calculos_service(
    usuario_service: UsuarioService = Depends(get_usuario_service),
) -> CalculosService:
    return CalculosComponent(usuario_service=usuario_service)
```

---

## Como foi evitado o acoplamento direto

- `CalculosComponent` **nunca importa** `UsuarioComponent`
- Toda comunicação passa pela interface `UsuarioService` (ABC)
- O wiring é centralizado em `dependencies.py`
- Trocar a implementação de `UsuarioComponent` não exige nenhuma alteração em `CalculosComponent`

---

## Estrutura do projeto

```
plus-health-lab4/
├── docker-compose.yml
├── .env
├── backend/
│   ├── models/db_models.py          ← ORM (tabela usuarios)
│   ├── components/
│   │   ├── usuario/
│   │   │   ├── interfaces.py        ← <<interface>> UsuarioService
│   │   │   ├── schemas.py
│   │   │   └── component.py
│   │   └── calculos/
│   │       ├── interfaces.py        ← <<interface>> CalculosService
│   │       ├── schemas.py
│   │       └── component.py        ← requer UsuarioService via DI
│   ├── dependencies.py              ← container de injeção de dependência
│   └── routers/
│       ├── usuario_router.py
│       └── calculos_router.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Cadastro.jsx
        │   └── Perfil.jsx           ← exibe IMC e TMB em tempo real
        ├── services/api.js
        └── context/AuthContext.jsx
```

---

## Como executar

```bash
cp .env.example .env
docker compose up --build
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API docs  | http://localhost:8000/docs |
