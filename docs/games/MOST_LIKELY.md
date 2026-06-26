# Es Tu? / Quem e o mais provavel

`most_likely` e o primeiro jogo real do MVP do Playpint.

## Objetivo

O backend escolhe uma pergunta do tipo "Quem e mais provavel...?" e todos os jogadores votam num jogador da sala. A ronda revela quem recebeu mais votos, as percentagens, a lista de quem votou em quem e os pontos oficiais.

## Estado MVP

- Unico modo exposto no registry: `most_likely`.
- Outros modos como `would_you_rather`, `impostor`, `stop`, `quiz` e similares ficam fora deste MVP.
- Minimo tecnico: 2 jogadores.
- Minimo recomendado: 3 jogadores.
- Tempo de pergunta/ronda: 30 segundos.
- Tempo de votacao: 15 segundos.

## Fluxo da ronda

1. O backend cria a ronda em `active` e escolhe uma pergunta.
2. Durante 30 segundos, os jogadores veem a pergunta e os jogadores elegiveis.
3. A ronda passa para `voting`.
4. Durante 15 segundos, cada jogador pode votar uma vez num jogador da sala.
5. O backend rejeita votos duplicados, fora do prazo, com pergunta errada, de jogadores fora da sala ou em alvos inexistentes.
6. A ronda termina quando todos votam ou quando o prazo de votacao expira.
7. O backend calcula e publica o resultado oficial.

## Pontuacao

No MVP, cada voto recebido vale 10 pontos para o jogador votado.

Exemplo:

- Bruno recebe 2 votos: +20 pontos.
- Carla recebe 1 voto: +10 pontos.
- Ana recebe 0 votos: +0 pontos.

Este criterio e simples e pode ser trocado mais tarde sem alterar o contrato basico de resultados.

## Resultado oficial

O resultado contem:

- `winners`: jogador ou jogadores empatados no maior numero de votos.
- `voteCounts`: votos e percentagem por jogador.
- `votes`: trilho publico de quem votou em quem.
- `scoreDeltas`: pontos atribuidos nesta ronda.
- `totalVotes`: numero total de votos aceites.

Se nenhum voto for aceite, `winners` fica vazio e todos recebem 0 pontos.

## Contratos partilhados

Os contratos estao em `packages/contracts/src/mostLikely.ts`.

Principais tipos:

- `MostLikelyQuestion`
- `MostLikelyVoteRequest`
- `MostLikelyPublicState`
- `MostLikelyPlayerState`
- `MostLikelyRoundResult`
- `MostLikelyRoundStartedEvent`
- `MostLikelyVotingStartedEvent`
- `MostLikelyVoteReceivedEvent`
- `MostLikelyRoundResultEvent`

## Backend

Modulo: `apps/backend/src/modules/games/most-likely`.

Responsabilidades:

- escolher pergunta;
- abrir e fechar janelas oficiais de ronda/votacao;
- validar voto unico por jogador;
- validar jogador votante e jogador alvo;
- calcular percentagens, vencedores e pontos;
- emitir eventos de runtime para a sala: `round_started`, `voting_started`, `vote_received` e `round_finished`;
- emitir o evento `most_likely.round_finished`.

Pecas principais:

- `mostLikelyModule`: regras de uma ronda isolada.
- `mostLikelyRuntime`: eventos oficiais de uma ronda.
- `mostLikelySession`: varias rondas, perguntas usadas, pontuacao acumulada e fim de jogo.
- `mostLikelyController`: fachada que a sala usa para arrancar o jogo, receber votos, fazer `tick` do tempo, avancar ronda e obter snapshots por jogador.

O frontend nunca calcula o resultado oficial.

## Mobile

Modulo: `apps/mobile/src/game-modes/most-likely`.

Responsabilidades:

- transformar o snapshot oficial em screen model;
- bloquear voto antes de `voting`;
- bloquear voto depois de o jogador votar;
- criar a intencao de voto que sera enviada ao backend;
- mostrar contagem decrescente baseada no `clock` do servidor;
- mostrar vencedores, percentagens, votos revelados e pontos no resultado.

Direcao visual aprovada:

- fundo ilustrado escuro com ambiente de bar premium, sem aspeto infantil;
- amarelo Playpint para o jogador selecionado e para o vencedor;
- laranja para estados importantes como voto enviado;
- ciano apenas como acento secundario;
- header do jogo usa o wordmark `Playpint`, nao um placeholder `P`;
- resultado principal simples: vencedor, percentagem, ranking compacto e pontos.

## Registry

O MVP expoe apenas:

```text
most_likely
```

Novos jogos devem entrar como modulos independentes no backend, contratos proprios em `packages/contracts`, e screen models proprios no mobile.
