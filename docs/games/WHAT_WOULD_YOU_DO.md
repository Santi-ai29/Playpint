# O Que Tu Fazias?

`what_would_you_do` e um modo social da sequencia "Es Tu?" onde a mesa escolhe entre dois lados de um dilema "O que preferias...?".

## Objetivo

O backend escolhe uma pergunta hipotetica e mostra duas opcoes. Cada jogador vota uma vez numa das opcoes. No fim, o backend publica o resultado oficial com votos e percentagens por opcao.

Exemplo:

- Pergunta: "O que preferias: ficar um mes sem telemovel ou um ano sem redes sociais?"
- Opcao A: "Um mes sem telemovel"
- Opcao B: "Um ano sem redes sociais"

## Estado MVP

- Game mode id: `what_would_you_do`.
- Minimo tecnico: 2 jogadores.
- Minimo recomendado: 3 jogadores.
- Tempo de pergunta/ronda: 20 segundos.
- Tempo de votacao: 18 segundos.
- Rondas por defeito: 10.
- Banco inicial: mais de 100 dilemas unicos, simples e feitos para dividir a mesa.
- O modo entra no registry backend e mobile como MVP.

## Fluxo da ronda

1. O backend cria a ronda em `active` e escolhe um dilema.
2. A UI mostra o estado de pergunta/aguardando votacao.
3. A ronda passa para `voting`.
4. Cada jogador escolhe uma das duas opcoes.
5. O backend aceita apenas um voto por jogador.
6. O backend rejeita votos duplicados, fora do prazo, com pergunta errada, de jogadores fora da sala ou em opcoes inexistentes.
7. A ronda termina quando todos votam ou quando o prazo de votacao expira.
8. O backend calcula `votes`, `percentage`, `winnerOptionIds` e publica o resultado oficial.

## Resultado oficial

O resultado contem:

- `optionResults`: votos, percentagem e estado vencedor por opcao.
- `winnerOptionIds`: opcao ou opcoes empatadas no maior numero de votos.
- `votes`: trilho publico de voto por jogador.
- `totalVotes`: numero total de votos aceites.

Se nenhum voto for aceite, `winnerOptionIds` fica vazio e as percentagens ficam a `0`.

## Contratos partilhados

Ficheiro: `packages/contracts/src/whatWouldYouDo.ts`.

Principais tipos:

- `WhatWouldYouDoQuestion`
- `WhatWouldYouDoOption`
- `WhatWouldYouDoVoteRequest`
- `WhatWouldYouDoPublicState`
- `WhatWouldYouDoPlayerState`
- `WhatWouldYouDoRoundResult`
- `WhatWouldYouDoRoundStartedEvent`
- `WhatWouldYouDoVotingStartedEvent`
- `WhatWouldYouDoVoteReceivedEvent`
- `WhatWouldYouDoRoundResultEvent`

## Backend

Modulo: `apps/backend/src/modules/games/what-would-you-do`.

Responsabilidades:

- escolher um dilema do deck;
- abrir e fechar janelas oficiais de ronda/votacao;
- validar voto unico por jogador;
- validar jogador votante;
- validar que a opcao pertence a pergunta ativa;
- calcular percentagens e vencedores;
- emitir eventos oficiais: `round_started`, `voting_started`, `vote_received`, `round_finished` e `game_finished`.

Pecas principais:

- `whatWouldYouDoModule`: regras de uma ronda isolada.
- `whatWouldYouDoRuntime`: eventos oficiais de uma ronda.
- `whatWouldYouDoSession`: varias rondas, perguntas usadas e fim de jogo.
- `whatWouldYouDoController`: fachada para arrancar jogo, receber votos, fazer `tick`, avancar ronda e obter snapshots por jogador.

O frontend nunca calcula o resultado oficial de producao.

## Mobile

Modulo: `apps/mobile/src/game-modes/what-would-you-do`.

Estados visuais:

- `waiting_question`: dilema no ecra antes da votacao.
- `voting`: duas opcoes ativas.
- `submitted`: voto enviado e bloqueado.
- `result`: barras, votos e percentagens oficiais.

Direcao visual:

- mesmo fundo premium escuro dos outros jogos;
- logo local do Playpint;
- duas opcoes grandes em formato duelo;
- animacao de entrada da pergunta;
- animacao dos botoes de opcao;
- confirmacao de voto com destaque laranja/amarelo;
- resultado com barras animadas e percentagens;
- interface simples, limpa e social.

Preview estatico:

```text
apps/mobile/preview/what-would-you-do/index.html
```

## Testes

Cobertura adicionada para:

- contratos e validacao de payload de voto;
- deck inicial;
- regras de backend, voto unico, rejeicoes e percentagens;
- runtime/eventos;
- sessao multi-ronda;
- controller;
- registry mobile;
- screen model e view model mobile.
