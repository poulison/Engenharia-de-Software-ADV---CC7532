# Plus Health

## Integrantes
- Eric Song Watanabe
- Paulo Andre de Oliveira Hirata
- Victor Merker Binda
- Victor Pimentel Lario
- Rafael Iamashita Becsei

## Descrição do Projeto

Uma breve descrição sobre o sistema que faremos esse semestre: ele está dentro do domínio da saúde e busca melhorar os hábitos cotidianos dos usuários, tendo como público-alvo as pessoas que buscam uma melhora nos seus hábitos. O sistema terá as principais funcionalidades dele sendo Cadastro, Login, Catálogo de Exercícios Físicos, Informações Nutricionais.

Para ler mais detalhes sobre o projeto acesse o documento: Definição do projeto

---

## Descrição dos Componentes Implementados

### UsuarioComponent
Responsável por cadastrar, autenticar e gerenciar os dados dos usuários. Persiste as informações no banco de dados PostgreSQL via SQLAlchemy. Operações que oferece:

- `cadastrar()` — cria um novo usuário no banco após verificar e-mail duplicado
- `login()` — autentica o usuário por e-mail e senha
- `buscar()` — retorna um usuário pelo ID
- `listar()` — retorna todos os usuários
- `atualizar_fisico()` — atualiza o peso e a altura do usuário

### CalculosComponent
Responsável pelos cálculos de saúde corporal. Para funcionar, precisa dos dados físicos do usuário (peso, altura, idade), que são fornecidos pelo UsuarioComponent via interface. Operações que oferece:

- `calcular_imc()` — calcula o IMC (peso ÷ altura²) e retorna a classificação da OMS
- `calcular_tmb()` — calcula a Taxa Metabólica Basal pela fórmula Mifflin-St Jeor

### NutricaoComponent
Responsável por gerar recomendações nutricionais personalizadas combinando os indicadores corporais com o objetivo do usuário. Para funcionar, depende dos resultados de IMC e TMB (fornecidos pelo CalculosComponent) e do objetivo cadastrado pelo usuário (fornecido pelo UsuarioComponent). Operações que oferece:

- `recomendar()` — retorna meta calórica diária, macros (proteína, carboidrato e gordura em gramas), sugestão de refeições e dicas personalizadas por objetivo

A lógica de cálculo varia de acordo com o objetivo informado no cadastro:

| Objetivo | Ajuste calórico | Proteína | Gordura |
|---|---|---|---|
| `emagrecer` | TMB × 1,375 − 500 kcal | 2,0 g/kg | 25% das kcal |
| `ganhar massa` | TMB × 1,375 + 300 kcal | 2,2 g/kg | 25% das kcal |
| `manter` | TMB × 1,375 | 1,6 g/kg | 30% das kcal |

Os carboidratos correspondem ao restante calórico após proteína e gordura.

---

## Interfaces Fornecidas

**\<\<Interface\>\> UsuarioService**
```python
class UsuarioService(ABC):
    def cadastrar(dados: UsuarioCriar)     -> UsuarioOut
    def login(dados: UsuarioLogin)         -> UsuarioOut
    def buscar(usuario_id: int)            -> Optional[UsuarioOut]
    def listar()                           -> list[UsuarioOut]
    def atualizar_fisico(id, dados)        -> UsuarioOut
```

**\<\<Interface\>\> CalculosService**
```python
class CalculosService(ABC):
    def calcular_imc(usuario_id: int) -> ResultadoIMC
    def calcular_tmb(usuario_id: int) -> ResultadoTMB
```

**\<\<Interface\>\> NutricaoService**
```python
class NutricaoService(ABC):
    def recomendar(usuario_id: int) -> RecomendacaoNutricional
```

---

## Interface Requerida

Interface requerida é uma dependência que um componente precisa de outro para funcionar.

- **UsuarioComponent** — não requer nenhuma interface externa, é independente
- **CalculosComponent** — requer `UsuarioService` para buscar o peso, altura e idade do usuário antes de calcular
- **NutricaoComponent** — requer `CalculosService` (para IMC e TMB) e `UsuarioService` (para o objetivo do usuário)

As dependências são declaradas apenas pelo tipo da interface no construtor:

```python
class CalculosComponent(CalculosService):
    def __init__(self, usuario_service: UsuarioService):
        self._usuario_service = usuario_service

class NutricaoComponent(NutricaoService):
    def __init__(self, calculos_service: CalculosService, usuario_service: UsuarioService):
        self._calculos = calculos_service
        self._usuario  = usuario_service
```

---

## Como Ocorre a Comunicação

A comunicação é indireta: cada componente chama métodos das interfaces que recebeu sem saber qual classe está implementando. O arquivo `dependencies.py` é responsável por conectar todos.

**Exemplo do fluxo ao calcular o IMC:**

1. Frontend chama `GET /calculos/imc/1`
2. FastAPI cria `UsuarioComponent` e o injeta dentro de `CalculosComponent` via `dependencies.py`
3. `CalculosComponent` chama `self._usuario_service.buscar(1)`
4. `UsuarioComponent` consulta o banco e retorna os dados do usuário
5. `CalculosComponent` usa peso e altura para calcular e retorna o resultado
6. Frontend exibe o IMC na tela de Perfil

**Exemplo do fluxo ao gerar a recomendação nutricional:**

1. Frontend chama `GET /nutricao/recomendar/1`
2. FastAPI cria e injeta `UsuarioComponent` e `CalculosComponent` dentro de `NutricaoComponent` via `dependencies.py`
3. `NutricaoComponent` chama `self._calculos.calcular_imc(1)` → `CalculosComponent` retorna o IMC
4. `NutricaoComponent` chama `self._calculos.calcular_tmb(1)` → `CalculosComponent` retorna a TMB
5. `NutricaoComponent` chama `self._usuario.buscar(1)` para ler o objetivo do usuário
6. Calcula meta calórica, macros, monta refeições e dicas e retorna a recomendação
7. Frontend exibe a página de Nutrição

Trecho do container de injeção de dependência:

```python
# dependencies.py
def get_calculos_service(
    usuario_svc = Depends(get_usuario_service)
) -> CalculosService:
    return CalculosComponent(usuario_service=usuario_svc)

def get_nutricao_service(
    calculos_svc = Depends(get_calculos_service),
    usuario_svc  = Depends(get_usuario_service),
) -> NutricaoService:
    return NutricaoComponent(
        calculos_service=calculos_svc,
        usuario_service=usuario_svc,
    )
```

---

## Justificativa — Como Foi Evitado o Acoplamento Direto

Três mecanismos foram combinados para evitar que os componentes dependessem diretamente um do outro:

1. **Interfaces abstratas (ABC)** — Cada componente expõe apenas uma interface como contrato. A classe concreta fica encapsulada dentro da sua própria pasta e nenhum outro módulo a importa diretamente.
2. **Injeção de dependência pelo construtor** — Os componentes recebem as interfaces de que precisam no construtor. Eles nunca importam classes concretas nem instanciam nada internamente.
3. **Container centralizado (`dependencies.py`)** — É o único arquivo do sistema que conhece as classes concretas e faz a ligação entre elas. Se fosse necessário trocar qualquer implementação, bastaria alterar apenas este arquivo — os demais componentes não precisariam de nenhuma mudança.

---

## Endpoints da API

A documentação interativa completa (Swagger UI) está disponível em `http://localhost:8000/docs` após subir os containers.

### Usuários — `/usuarios`

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/usuarios/cadastro` | Cadastra um novo usuário |
| `POST` | `/usuarios/login` | Autentica e retorna dados do usuário |
| `GET` | `/usuarios/{id}` | Busca um usuário pelo ID |
| `GET` | `/usuarios/` | Lista todos os usuários |
| `PATCH` | `/usuarios/{id}/fisico` | Atualiza peso e altura do usuário |

Exemplo de corpo para cadastro:
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "1234",
  "idade": 28,
  "peso": 80.0,
  "altura": 1.75,
  "objetivo": "emagrecer"
}
```

### Cálculos Corporais — `/calculos`

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/calculos/imc/{usuario_id}` | Retorna IMC e classificação da OMS |
| `GET` | `/calculos/tmb/{usuario_id}` | Retorna TMB em kcal/dia |

Exemplo de resposta de IMC:
```json
{
  "usuario_id": 1,
  "nome": "João Silva",
  "imc": 26.12,
  "classificacao": "Sobrepeso",
  "peso": 80.0,
  "altura": 1.75
}
```

### Nutrição — `/nutricao`

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/nutricao/recomendar/{usuario_id}` | Recomendação nutricional personalizada completa |

Exemplo de resposta:
```json
{
  "usuario_id": 1,
  "nome": "João Silva",
  "objetivo": "emagrecer",
  "imc": 26.12,
  "classificacao_imc": "Sobrepeso",
  "tmb_kcal": 1837.5,
  "kcal_alvo": 2026.6,
  "fator_atividade_utilizado": 1.375,
  "descricao_ajuste": "Seu gasto diário estimado (TDEE) é 2526 kcal. Aplicamos um déficit de 500 kcal...",
  "macros": {
    "proteina_g": 160.0,
    "carboidrato_g": 110.4,
    "gordura_g": 42.4
  },
  "refeicoes_sugeridas": [
    {
      "nome": "Café da manhã",
      "descricao": "Ovos mexidos (2) + pão integral (1 fatia) + fruta",
      "kcal_estimado": 350
    }
  ],
  "dicas": ["Priorize proteínas em todas as refeições para preservar massa muscular."]
}
```

---

## Instruções de Execução

Pré-requisito: ter o Docker e o Docker Compose instalados.

**1 — Clone o repositório no GitHub**

**2 — Copie o arquivo de ambiente**
```bash
cp .env.example .env
```

**3 — Suba os containers**
```bash
docker compose up --build
```

**4 — Aguarde o build** (primeira vez leva alguns minutos por causa do npm install)

**5 — Acesse no navegador**
- Frontend: http://localhost:5173
- Documentação da API: http://localhost:8000/docs

O banco de dados é criado automaticamente no primeiro boot. Não é necessário rodar nenhum script SQL.

Para parar os containers:
```bash
docker compose down       # para e remove os containers
docker compose down -v    # também apaga o volume do banco
```

---

## Testes

### Via Swagger UI (recomendado)

Acesse `http://localhost:8000/docs` após subir os containers. A interface interativa permite testar todos os endpoints sem ferramentas externas.

### Fluxo de teste completo com curl

**1. Cadastrar um usuário**
```bash
curl -X POST http://localhost:8000/usuarios/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ana Costa",
    "email": "ana@email.com",
    "senha": "1234",
    "idade": 30,
    "peso": 65.0,
    "altura": 1.65,
    "objetivo": "emagrecer"
  }'
# Anote o "id" retornado (ex: 1)
```

**2. Fazer login**
```bash
curl -X POST http://localhost:8000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ana@email.com", "senha": "1234"}'
```

**3. Calcular IMC**
```bash
curl http://localhost:8000/calculos/imc/1
```

**4. Calcular TMB**
```bash
curl http://localhost:8000/calculos/tmb/1
```

**5. Obter recomendação nutricional**
```bash
curl http://localhost:8000/nutricao/recomendar/1
```

**6. Atualizar peso e verificar se os cálculos se atualizam**
```bash
curl -X PATCH http://localhost:8000/usuarios/1/fisico \
  -H "Content-Type: application/json" \
  -d '{"peso": 63.0, "altura": 1.65}'

curl http://localhost:8000/nutricao/recomendar/1
# IMC, TMB e meta calórica devem refletir o novo peso
```

### Verificando a comunicação entre NutricaoService e CalculosService

Para confirmar que `NutricaoComponent` consome `CalculosService` (e não recalcula internamente), compare os valores de TMB entre os dois endpoints — devem ser idênticos:

```bash
curl http://localhost:8000/calculos/tmb/1
# → {"tmb_kcal": 1560.0, ...}

curl http://localhost:8000/nutricao/recomendar/1
# → {"tmb_kcal": 1560.0, "kcal_alvo": 2143.0, ...}
#    kcal_alvo = tmb_kcal × 1.375 + ajuste_por_objetivo
```

### Testando diferentes objetivos

Cadastre três usuários com objetivos distintos e compare as recomendações:

| `objetivo` | Comportamento esperado |
|---|---|
| `"emagrecer"` | Déficit de 500 kcal, proteína 2,0 g/kg, 5 refeições |
| `"ganhar massa"` | Superávit de 300 kcal, proteína 2,2 g/kg, 6 refeições (inclui ceia) |
| `"manter"` | Meta = TDEE, macros equilibrados, 5 refeições |
