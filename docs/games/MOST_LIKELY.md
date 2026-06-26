# Es Tu? / Quem e o mais provavel

`most_likely` e o primeiro jogo real do MVP do Playpint.

## Objetivo

O backend escolhe uma pergunta do tipo "Quem e mais provavel...?" e todos os jogadores votam num jogador da sala. A ronda revela quem recebeu mais votos, as percentagens e, se a UI quiser mostrar, a lista de quem votou em quem.

## Estado MVP

- Unico modo exposto no registry: `most_likely`.
- Outros modos como `would_you_rather`, `impostor`, `stop`, `quiz` e similares ficam fora deste MVP.
- Minimo tecnico: 2 jogadores.
- Minimo recomendado: 3 jogadores.
- Tempo de pergunta/ronda: 30 segundos.
- Tempo de votacao: 15 segundos.
- Rondas por defeito: 12.
- Banco default: 1000 perguntas unicas, com tom de bar/adulto leve.

## Fluxo da ronda

1. O backend cria a ronda em `active` e escolhe uma pergunta.
2. Durante 30 segundos, os jogadores veem a pergunta e os jogadores elegiveis.
3. A ronda passa para `voting`.
4. Durante 15 segundos, cada jogador pode votar uma vez num jogador da sala.
5. O backend rejeita votos duplicados, fora do prazo, com pergunta errada, de jogadores fora da sala ou em alvos inexistentes.
6. A ronda termina quando todos votam ou quando o prazo de votacao expira.
7. O backend calcula e publica o resultado oficial.

## Perguntas

O deck default fica em `apps/backend/src/modules/games/most-likely/questionDeck.ts`.

Regras do deck:

- gerar 1000 perguntas unicas;
- evitar repeticao dentro da mesma sessao;
- manter tom divertido, picante e adequado a mesa de bar;
- variar os contextos logo nas primeiras rondas, sem prender tudo a "numa noite de bar";
- nao entrar em conteudo explicito ou pesado.

## Resultado oficial

O resultado contem:

- `winners`: jogador ou jogadores empatados no maior numero de votos.
- `voteCounts`: votos e percentagem por jogador.
- `votes`: trilho publico de quem votou em quem.
- `totalVotes`: numero total de votos aceites.

Se nenhum voto for aceite, `winners` fica vazio.

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
- calcular percentagens e vencedores;
- emitir eventos de runtime para a sala: `round_started`, `voting_started`, `vote_received` e `round_finished`;
- emitir o evento `most_likely.round_finished`.

Pecas principais:

- `mostLikelyModule`: regras de uma ronda isolada.
- `mostLikelyRuntime`: eventos oficiais de uma ronda.
- `mostLikelySession`: varias rondas, perguntas usadas e fim de jogo.
- `mostLikelyController`: fachada que a sala usa para arrancar o jogo, receber votos, fazer `tick` do tempo, avancar ronda e obter snapshots por jogador.

O frontend nunca calcula o resultado oficial.

## Mobile

Modulo: `apps/mobile/src/game-modes/most-likely`.

Responsabilidades:

- transformar o snapshot oficial em screen model;
- bloquear voto antes de `voting`;
- bloquear voto depois de o jogador votar;
- criar a intencao de voto que sera enviada ao backend;
- permitir trocar a selecao local antes de confirmar o voto;
- mostrar contagem decrescente baseada no `clock` do servidor;
- mostrar resultado simples com vencedor e percentagem.

Direcao visual aprovada:

- fundo ilustrado escuro com ambiente de bar premium, sem aspeto infantil;
- amarelo Playpint para o jogador selecionado e para o vencedor;
- laranja para estados importantes como voto enviado;
- ciano apenas como acento secundario;
- header do jogo usa o wordmark `Playpint`, nao um placeholder `P`;
- sem scroll no ecra do jogo;
- resultado mostra vencedor em destaque, frase sarcastica curta, tabela da ronda e botao para avancar;
- frase do resultado pode ser mais picante, mantendo tom de brincadeira;
- cartao selecionado/vencedor com brilho, entrada animada e reflexo premium;
- antes do host abrir a votacao, os jogadores aparecem numa linha de avatares;
- botao de confirmar fica proximo da grelha de votacao.

## Registry

O MVP expoe apenas:

```text
most_likely
```

Novos jogos devem entrar como modulos independentes no backend, contratos proprios em `packages/contracts`, e screen models proprios no mobile.
