# Projeto do Semestre: Plus Health

## Integrantes

- Eric Song Watanabe
- Paulo Andre de Oliveira Hirata
- Victor Merker Binda
- Victor Pimentel Lario
- Rafael Iamashita Becsei

## Descrição do Projeto

Uma breve descrição sobre o sistema que faremos esse semestre: ele está dentro do domínio da saúde e busca melhorar os hábitos cotidianos dos usuários, tendo como público-alvo as pessoas que buscam uma melhora nos seus hábitos. O sistema terá as principais funcionalidades dele sendo Cadastro, Login, Catálogo de Exercícios Físicos, Informações Nutricionais.                                
Para ler mais detalhes sobre o projeto acesse o documento: [Definição do projeto](https://github.com/poulison/Engenharia-de-Software-ADV---CC7532/blob/main/Definic%CC%A7a%CC%83o%20de%20Projeto.pdf)

## Descrição dos Dois Componentes Implementados

**UsuarioComponent** — Responsável por cadastrar, autenticar e gerenciar os dados dos usuários. Persiste as informações no banco de dados PostgreSQL via SQLAlchemy.
Operações que oferece:
-	cadastrar() — cria um novo usuário no banco após verificar e-mail duplicado
-	login() — autentica o usuário por e-mail e senha
-	buscar() — retorna um usuário pelo ID
-	listar() — retorna todos os usuários
-	atualizar_fisico() — atualiza o peso e a altura do usuário


**CalculosComponent** — Responsável pelos cálculos de saúde corporal. Para funcionar, precisa dos dados físicos do usuário (peso, altura, idade), que são fornecidos pelo UsuarioComponent via interface.
Operações que oferece:
-	calcular_imc() — calcula o IMC (peso ÷ altura²) e retorna a classificação da OMS
-	calcular_tmb() — calcula a Taxa Metabólica Basal pela fórmula Mifflin-St Jeor



### Interfaces Fornecidas

<<interface>> UsuarioService

    class UsuarioService(ABC):
        def cadastrar(dados: UsuarioCriar)     -> UsuarioOut
        def login(dados: UsuarioLogin)         -> UsuarioOut
        def buscar(usuario_id: int)            -> Optional[UsuarioOut]
        def listar()                           -> list[UsuarioOut]
        def atualizar_fisico(id, dados)        -> UsuarioOut



<<interface>> CalculosService

    class CalculosService(ABC):
        def calcular_imc(usuario_id: int)        -> ResultadoIMC
        def calcular_tmb(usuario_id: int)        -> ResultadoTMB


### Interface Requerida

Interface requerida é uma dependência que um componente precisa de outro para funcionar.
-	UsuarioComponent — não requer nenhuma interface externa, é independente
-	CalculosComponent — requer UsuarioService para buscar o peso, altura e idade do usuário antes de calcular

A dependência é declarada apenas pelo tipo da interface no construtor:

      class CalculosComponent(CalculosService):
          def __init__(self, usuario_service: UsuarioService):
          self._usuario_service = usuario_service


### Como Ocorre a Comunicação

A comunicação é indireta: CalculosComponent chama métodos de UsuarioService sem saber qual classe está implementando essa interface. O arquivo dependencies.py é responsável por conectar os dois.

Exemplo do fluxo ao calcular o IMC:
-	1. Frontend chama GET /calculos/imc/1
-	2. FastAPI cria UsuarioComponent e o injeta dentro de CalculosComponent via dependencies.py
-	3. CalculosComponent chama self._usuario_service.buscar(1)
-	4. UsuarioComponent consulta o banco e retorna os dados do usuário
-	5. CalculosComponent usa peso e altura para calcular e retorna o resultado
-	6. Frontend exibe o IMC na tela de Perfil

Trecho do container de injeção de dependência:

    # dependencies.py
    def get_calculos_service(
        usuario_svc = Depends(get_usuario_service)
    ) -> CalculosService:
        return CalculosComponent(usuario_service=usuario_svc)


### Justificativa — Como Foi Evitado o Acoplamento Direto
Três mecanismos foram combinados para evitar que os componentes dependessem diretamente um do outro:

- 1. Interfaces abstratas (ABC)
Cada componente expõe apenas uma interface como contrato. A classe concreta fica encapsulada dentro da sua própria pasta e nenhum outro módulo a importa diretamente.

- 2. Injeção de dependência pelo construtor
CalculosComponent recebe UsuarioService no seu construtor. Ele nunca importa UsuarioComponent e nunca instancia nada internamente. Apenas usa a interface que recebeu.

- 3. Container centralizado (dependencies.py)
É o único arquivo do sistema que conhece as classes concretas e faz a ligação entre elas. Se fosse necessário trocar a implementação de UsuarioComponent, bastaria alterar apenas este arquivo — CalculosComponent não precisaria de nenhuma mudança.


### Instruções de Execução
Pré-requisito: ter o Docker e o Docker Compose instalados.

1 - Clone o repositório no GitHub

2 - Copie o arquivo de ambiente
> cp .env.example .env

3 - Suba os containers:
> docker compose up --build

4 - Aguarde o build (primeira vez leva alguns minutos por causa do npm install)

5 - Acesse no navegador:
> Frontend: http://localhost:5173
> Documentação da API: http://localhost:8000/docs


O banco de dados é criado automaticamente no primeiro boot. Não é necessário rodar nenhum script SQL.
