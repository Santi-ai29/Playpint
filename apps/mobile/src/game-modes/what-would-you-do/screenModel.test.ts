import assert from "node:assert/strict";
import test from "node:test";
import type {
  RoundSnapshot,
  WhatWouldYouDoPlayerState,
  WhatWouldYouDoPublicState,
} from "../../../../../packages/contracts/src";
import {
  createWhatWouldYouDoScreenModel,
  createWhatWouldYouDoVoteAction,
} from "./screenModel";

test("shows the waiting question phase before voting opens", () => {
  const model = createWhatWouldYouDoScreenModel(
    snapshot({
      lifecycleState: "active",
      playerState: { hasVoted: false },
    }),
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(model.status, "waiting_question");
  assert.equal(model.header.brandLogoText, "Playpint");
  assert.equal(model.header.brandLogoAsset, "./assets/playpint-logo.png");
  assert.equal(model.header.modeLabel, "O Que Fazias?");
  assert.equal(model.header.phaseLabel, "Pergunta");
  assert.equal(model.header.timerLabel, "00:15");
  assert.equal(model.copy.waitingTitle, "A preparar a situacao");
  assert.equal(model.canVote, false);
  assert.equal(model.options.every((option) => option.disabled), true);
});

test("enables option selection during voting", () => {
  const model = createWhatWouldYouDoScreenModel(
    snapshot({
      lifecycleState: "voting",
      clock: {
        startsAt: "2026-06-25T20:00:20.000Z",
        endsAt: "2026-06-25T20:00:38.000Z",
      },
      playerState: { hasVoted: false },
    }),
    "2026-06-25T20:00:28.000Z",
  );

  assert.equal(model.status, "voting");
  assert.equal(model.header.phaseLabel, "Votacao");
  assert.equal(model.copy.votingTitle, "Escolhe o que fazias");
  assert.equal(model.canVote, true);
  assert.equal(model.remainingSeconds, 10);
  assert.equal(model.options.every((option) => option.disabled === false), true);
});

test("locks selection after the current player votes", () => {
  const model = createWhatWouldYouDoScreenModel(
    snapshot({
      lifecycleState: "voting",
      clock: {
        startsAt: "2026-06-25T20:00:20.000Z",
        endsAt: "2026-06-25T20:00:38.000Z",
      },
      playerState: {
        hasVoted: true,
        selectedOptionId: "b",
      },
    }),
    "2026-06-25T20:00:28.000Z",
  );

  assert.equal(model.status, "submitted");
  assert.equal(model.header.phaseLabel, "Voto enviado");
  assert.equal(model.canVote, false);
  assert.equal(model.options.find((option) => option.optionId === "b")?.selected, true);
});

test("maps official option results, percentages, and vote trail", () => {
  const model = createWhatWouldYouDoScreenModel(
    snapshot({
      lifecycleState: "result",
      playerState: {
        hasVoted: true,
        selectedOptionId: "a",
      },
      result: true,
    }),
    "2026-06-25T20:00:38.000Z",
  );

  assert.equal(model.status, "result");
  assert.deepEqual(model.resultSummary, {
    title: "A mesa decidiu",
    leadingOptionLabel: "Fugia",
    winnerLabel: "opcao mais escolhida",
    leadingPercentage: 66.7,
    isTie: false,
    socialLine: "Instinto de sobrevivencia ganhou sem grande debate.",
  });
  assert.deepEqual(model.resultRows, [
    {
      optionId: "a",
      label: "Fugia",
      votes: 2,
      percentage: 66.7,
      isWinner: true,
    },
    {
      optionId: "b",
      label: "Ficava paralisado",
      votes: 1,
      percentage: 33.3,
      isWinner: false,
    },
  ]);
  assert.deepEqual(model.voteTrail, [
    { voterNickname: "Ana", optionLabel: "Fugia" },
    { voterNickname: "Bruno", optionLabel: "Ficava paralisado" },
    { voterNickname: "Carla", optionLabel: "Fugia" },
  ]);
});

test("creates a contract-compatible option vote action", () => {
  assert.deepEqual(
    createWhatWouldYouDoVoteAction({
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    }),
    {
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    },
  );
});

function snapshot(input: {
  lifecycleState: "active" | "voting" | "result";
  clock?: RoundSnapshot["clock"];
  playerState?: WhatWouldYouDoPlayerState;
  result?: boolean;
}): RoundSnapshot<WhatWouldYouDoPublicState, WhatWouldYouDoPlayerState> {
  return {
    gameMode: "what_would_you_do",
    gameModeId: "what_would_you_do",
    roomId: "room_1",
    roundId: "round_1",
    lifecycleState: input.lifecycleState,
    clock:
      input.clock ??
      {
        startsAt: "2026-06-25T20:00:00.000Z",
        endsAt: "2026-06-25T20:00:20.000Z",
      },
    serverNow: "2026-06-25T20:00:05.000Z",
    publicState: {
      question: {
        id: "q1",
        prompt: "Se um tubarao aparecesse a tua frente, o que fazias?",
        options: [
          { id: "a", label: "Fugia" },
          { id: "b", label: "Ficava paralisado" },
        ],
        contentLevel: "friends",
      },
      submittedCount: input.playerState?.hasVoted ? 1 : 0,
      totalPlayers: 3,
      result: input.result
        ? {
            questionId: "q1",
            prompt: "Se um tubarao aparecesse a tua frente, o que fazias?",
            totalVotes: 3,
            winnerOptionIds: ["a"],
            optionResults: [
              {
                optionId: "a",
                label: "Fugia",
                votes: 2,
                percentage: 66.7,
                isWinner: true,
              },
              {
                optionId: "b",
                label: "Ficava paralisado",
                votes: 1,
                percentage: 33.3,
                isWinner: false,
              },
            ],
            votes: [
              {
                voterPlayerId: "p1",
                voterNickname: "Ana",
                optionId: "a",
                optionLabel: "Fugia",
                submittedAt: "2026-06-25T20:00:21.000Z",
              },
              {
                voterPlayerId: "p2",
                voterNickname: "Bruno",
                optionId: "b",
                optionLabel: "Ficava paralisado",
                submittedAt: "2026-06-25T20:00:22.000Z",
              },
              {
                voterPlayerId: "p3",
                voterNickname: "Carla",
                optionId: "a",
                optionLabel: "Fugia",
                submittedAt: "2026-06-25T20:00:23.000Z",
              },
            ],
          }
        : undefined,
    },
    playerState: input.playerState,
  };
}
