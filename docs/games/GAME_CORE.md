# Playpint - Base dos minijogos

## Objetivo

Esta base existe para que cada minijogo entre como modulo independente, sem redesenhar Host, Join ou lobby.

## Estrutura

- `packages/contracts/src`: contratos neutros partilhados entre mobile e backend.
- `apps/backend/src/modules/games`: interfaces e registo de modulos de jogo.
- `apps/mobile/src/game-modes`: registo mobile por manifestos.

## Como adicionar um jogo

1. Criar uma branch propria, por exemplo `feat/game/would-you-rather`.
2. Criar contratos especificos em `packages/contracts/src`.
3. Criar o modulo autoritativo do backend em `apps/backend/src/modules/games/<jogo>`.
4. Criar o manifesto e view model mobile em `apps/mobile/src/game-modes/<jogo>`.
5. Registar o manifesto e o modulo apenas no ponto de integracao necessario.
6. Adicionar testes do fluxo da ronda.

## Regras

- O backend decide estado, prazos, resultados, pontuacao e validacao de votos.
- O mobile mostra snapshots oficiais e bloqueia toques repetidos, mas nao decide o resultado.
- Cada jogo deve ter uma unica branch e um unico objetivo.
- Alteracoes ao lobby devem ser minimas e feitas apenas para consumir manifestos.
