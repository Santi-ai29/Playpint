# Playpint - Eu Nunca

## Objetivo

`never_have_i_ever` e uma ronda social de confissao leve. O backend escolhe uma
frase `Eu nunca...`, cada jogador responde em segredo se ja fez ou nunca fez, e
o resultado mostra percentagens e nicknames por resposta.

## Fluxo

1. O backend cria a ronda com `createNeverHaveIEverRound`.
2. Todos recebem o mesmo prompt e um prazo oficial de 30 segundos.
3. Cada jogador envia `have_done_it` ("Ja fiz") ou `never_done_it` ("Nunca fiz").
4. O backend aceita apenas uma resposta por jogador.
5. A ronda fecha quando todos respondem ou quando o prazo termina.
6. O resultado oficial mostra percentagens, nicknames, abstencoes e +1 ponto por resposta enviada.

## Separacao tecnica

- Contratos: `packages/contracts/src/neverHaveIEver.ts`.
- Backend: `apps/backend/src/modules/games/never-have-i-ever`.
- Mobile: `apps/mobile/src/game-modes/never-have-i-ever`.

