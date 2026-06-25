# Game Modes

Esta pasta contem a base mobile para modos de jogo independentes.

## Regra principal

Cada jogo deve exportar o seu proprio manifesto e o seu proprio adaptador de
UI. O lobby pode compor uma lista de manifestos sem importar detalhes internos
do backend nem de outro jogo.

## Base existente

- `core/timer.ts`: temporizador visual calculado a partir de `endsAt`.
- `core/shellState.ts`: estado comum para bloquear acoes, mostrar prazo e erro.
- `registry.ts`: registo desacoplado de manifestos.

Nenhum jogo concreto esta implementado nesta branch.
