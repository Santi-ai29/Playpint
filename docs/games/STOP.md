# Stop

`stop` e o modo de palavras competitivo do Playpint.

## Objetivo

O backend escolhe uma letra por ronda. Cada jogador preenche respostas para as
categorias ativas e pode carregar `STOP` para fechar a ronda. O servidor e a
autoridade da letra, relogio, submissao, bloqueio de edicoes e pontuacao.

## Configuracao do host

O menu de personalizacao aparece quando o host escolhe `Stop` e cria a sala.
Depois de o jogo comecar, a mesma sala/configuracao e reutilizada para rondas e
recomecos, sem voltar automaticamente ao setup.

- Nome da sala.
- Jogadores da mesa.
- Numero de rondas.
- Tempo por ronda.
- Categorias ativas.

Categorias disponiveis:

- Nome
- Cidade
- Animal
- Comida
- Objeto
- Marca
- Filme/Serie
- Profissao
- Celebridade
- Picante

## Fluxo da ronda

1. O backend cria a ronda em `active`, escolhe a letra e abre o relogio.
2. Jogadores preenchem respostas para as categorias ativas.
3. Cada jogador so pode submeter uma vez.
4. Quando alguem carrega `STOP`, os inputs fecham imediatamente e a ronda
   passa para revisao.
5. Se ninguem carregar `STOP`, os inputs fecham no prazo oficial.
6. Na revisao, o host ve uma categoria de cada vez, pode anular respostas e
   avancar. O jogo fica a aguardar a mesa quando ainda faltam confirmacoes.
7. So depois da ultima categoria e que o backend calcula a pontuacao oficial.
8. Depois de fechada, novas respostas e edicoes sao rejeitadas.
9. O resultado oficial inclui respostas por jogador, pontos por categoria,
   total da ronda e ranking geral.

## Pontuacao

- Resposta vazia: 0 pontos.
- Resposta que nao comeca pela letra: 0 pontos.
- Resposta anulada pelo host na revisao: 0 pontos.
- Resposta repetida por outro jogador na mesma categoria: 5 pontos.
- Resposta valida e unica na categoria: 10 pontos.

A validacao automatica atual garante a regra basica da primeira letra, com
normalizacao simples para maiusculas e diacriticos. A estrutura de resultado
mantem `reason` por resposta para evoluir depois para validacao manual.

## Contratos

Contratos partilhados em `packages/contracts/src/stop.ts`:

- `StopGameSettings`
- `StopCategory`
- `StopSubmitAnswersRequest`
- `StopPublicState`
- `StopPlayerState`
- `StopRoundReview`
- `StopRoundResult`
- `StopOverallRankingEntry`
- `StopAnswerReviewDecisionRequest`
- eventos `stop.round_started`, `stop.answer_received`, `stop.round_stopped`,
  `stop.review_started`, `stop.round_finished` e `stop.game_finished`

## Backend

Modulo: `apps/backend/src/modules/games/stop`.

Pecas principais:

- `stopModule`: regras de uma ronda isolada, validacao e scoring.
- `stopRuntime`: eventos oficiais da ronda.
- `stopSession`: varias rondas, settings e ranking geral.
- `stopController`: fachada para sala usar `tick`, `submitAnswers`,
  `setAnswerReviewDecision`, `finishReview`, `nextRound` e snapshots.

O frontend nunca calcula o resultado oficial.

## Mobile

Modulo: `apps/mobile/src/game-modes/stop`.

Responsabilidades:

- transformar o snapshot oficial em screen model;
- mostrar letra grande, timer e campos rapidos de categoria;
- bloquear campos depois de submeter;
- mostrar revisao por categoria, com respostas por jogador e acao de anular;
- criar uma action compativel com o contrato;
- mostrar pontuacao final limpa e ranking geral acumulado.

Direcao visual:

- fundo escuro premium;
- amarelo Playpint como cor principal;
- laranja para o `STOP`;
- ciano apenas como acento secundario;
- logo Playpint real;
- animacoes subtis para entrada da letra, destaque do Stop e reveal do ranking.

## Preview

Preview local em `apps/mobile/preview/stop`.

Ela assume que a mesa ja foi personalizada antes do modo, mostra uma intro com
logo `STOP`, Playpint por baixo e um fundo fluido nitido com logos discretos,
sorteia a letra num slot visual limpo, faz uma contagem `3 2 1` animada e abre
a ronda ativa com review por categoria e ranking geral acumulado.
