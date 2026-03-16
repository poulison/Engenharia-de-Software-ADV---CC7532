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

**UsuarioComponent** — gerencia o ciclo de vida de usuários: cadastro com validação (e-mail duplicado, campos obrigatórios), busca por ID e listagem. Localizado em components/usuario/.

**CalculosComponent** — executa os cálculos corporais de saúde do usuário. Calcula o IMC (com classificação da OMS) e a TMB (Taxa Metabólica Basal pela fórmula Mifflin-St Jeor). Localizado em components/calculos/. Este 
componente depende do UsuarioComponent para buscar os dados físicos do usuário, mas nunca o instancia diretamente.

### Interfaces Fornecidas

<<interface>> UsuarioService
  + cadastrar_usuario(dados: UsuarioCriar) → Usuario
  + buscar_usuario(usuario_id: int)        → Optional[Usuario]
  + listar_usuarios()                      → list[Usuario]

<<interface>> CalculosService
  + calcular_imc(usuario_id: int)  → ResultadoIMC
  + calcular_tmb(usuario_id: int)  → ResultadoTMB
Ambas definidas com abc.ABC + @abstractmethod em Python — equivalente direto ao interface do Java/UML.

### Interface Requerida

CalculosComponent requer UsuarioService — ele precisa dos dados físicos (peso, altura, idade) do usuário para calcular IMC e TMB. Essa dependência é declarada apenas pelo tipo da interface, nunca pela classe concreta.

### Como Ocorre a Comunicação

O dependencies.py cria os componentes e injeta UsuarioComponent dentro de CalculosComponent como UsuarioService (a interface)
Quando alguém chama calcular_imc(1), o CalculosComponent chama self._usuario_service.buscar_usuario(1) internamente
Essa chamada é resolvida pelo UsuarioComponent sem que CalculosComponent saiba qual classe está do outro lado


### Como Foi Evitado o Acoplamento Direto
Três mecanismos combinados: interfaces abstratas (nenhum componente importa a classe concreta do outro), injeção de dependência no construtor (o CalculosComponent recebe UsuarioService, não UsuarioComponent), e um container centralizado (dependencies.py) que faz o wiring. Trocar a implementação de qualquer componente não exige nenhuma alteração no outro.

### Instruções de Execução

1 - Sem instalar nada (demo puro):

2 - bashpython demo.py

3 - Com API REST (FastAPI):

4 - bashpip install -r requirements.txt

5 - uvicorn main:app --reload

**Acesse: http://localhost:8000/docs**
