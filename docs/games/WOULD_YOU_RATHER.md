# Playpint - Voce Prefere

## Estado

Primeiro jogo implementado sobre a base modular dos minijogos.

## Fluxo

1. O backend escolhe uma pergunta do baralho e define um prazo oficial de 15 segundos.
2. Cada jogador pode votar uma vez na opcao `A` ou `B`.
3. O backend rejeita votos duplicados, votos fora do prazo, jogadores fora da sala e opcoes invalidas.
4. A ronda fecha quando todos votam ou quando o prazo termina.
5. O resultado mostra percentagens, nicknames por opcao, jogadores sem voto e pontos.

## Pontuacao

- +1 ponto por voto valido.
- +2 pontos extra para quem escolheu a opcao mais votada.
- Em empate, todos os votantes recebem apenas o ponto de participacao.

## Ficheiros principais

- `packages/contracts/src/wouldYouRather.ts`
- `apps/backend/src/modules/games/would-you-rather/wouldYouRatherGame.ts`
- `apps/backend/src/modules/games/would-you-rather/questionBank.ts`
- `apps/mobile/src/game-modes/would-you-rather/screenModel.ts`

O mobile mostra o snapshot oficial. O resultado e a pontuacao nunca sao calculados no mobile.
