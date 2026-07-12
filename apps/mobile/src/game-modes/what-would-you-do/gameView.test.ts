import assert from "node:assert/strict";
import test from "node:test";
import type {
  RoundSnapshot,
  WhatWouldYouDoPlayerState,
  WhatWouldYouDoPublicState,
} from "../../../../../packages/contracts/src";
import { createWhatWouldYouDoScreenModel } from "./screenModel";
import {
  createWhatWouldYouDoGameView,
  createWhatWouldYouDoVoteDraft,
  createWhatWouldYouDoVoteIntent,
} from "./gameView";

test("creates the Playpint-branded waiting question view", () => {
  const view = createWhatWouldYouDoGameView(
    snapshot({ lifecycleState: "active" }),
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(view.backgroundStyle, "premium_illustrated_bar");
  assert.equal(view.brand.logoText, "O Que Fazias?");
  assert.equal(view.brand.logoAsset, "./assets/what-fazias-logo.png");
  assert.equal(view.brand.modeLabel, "O Que Fazias?");
  assert.equal(view.optionLayout, "duel_buttons");
  assert.equal(view.options.every((option) => option.visualState === "disabled"), true);
  assert.equal(view.footer?.text, "A preparar a situacao");
});

test("creates a voting view and a contract-compatible vote intent", () => {
  const source = snapshot({
    lifecycleState: "voting",
    clock: {
      startsAt: "2026-06-25T20:00:20.000Z",
      endsAt: "2026-06-25T20:00:38.000Z",
    },
  });
  const model = createWhatWouldYouDoScreenModel(
    source,
    "2026-06-25T20:00:28.000Z",
  );
  const view = createWhatWouldYouDoGameView(
    source,
    "2026-06-25T20:00:28.000Z",
  );
  const intent = createWhatWouldYouDoVoteIntent({
    model,
    playerId: "p1",
    optionId: "a",
  });

  assert.equal(view.status, "voting");
  assert.equal(view.optionLayout, "duel_buttons");
  assert.equal(view.footer?.text, "0/3 votos");
  assert.equal(view.options.every((option) => option.visualState === "enabled"), true);
  assert.deepEqual(intent, {
    enabled: true,
    action: {
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    },
  });
});

test("allows changing the local selected option before confirming the vote", () => {
  const source = snapshot({
    lifecycleState: "voting",
    clock: {
      startsAt: "2026-06-25T20:00:20.000Z",
      endsAt: "2026-06-25T20:00:38.000Z",
    },
  });
  const model = createWhatWouldYouDoScreenModel(
    source,
    "2026-06-25T20:00:28.000Z",
  );
  const firstDraft = createWhatWouldYouDoVoteDraft({
    model,
    selectedOptionId: "a",
  });
  const changedDraft = createWhatWouldYouDoVoteDraft({
    model,
    selectedOptionId: "b",
  });

  assert.equal(firstDraft.canConfirm, true);
  assert.equal(
    firstDraft.options.find((option) => option.optionId === "a")?.selected,
    true,
  );
  assert.equal(changedDraft.canConfirm, true);
  assert.equal(
    changedDraft.options.find((option) => option.optionId === "b")?.selected,
    true,
  );
  assert.equal(
    changedDraft.options.find((option) => option.optionId === "a")?.selected,
    false,
  );
});

test("blocks vote intents when the player already voted", () => {
  const model = createWhatWouldYouDoScreenModel(
    snapshot({
      lifecycleState: "voting",
      clock: {
        startsAt: "2026-06-25T20:00:20.000Z",
        endsAt: "2026-06-25T20:00:38.000Z",
      },
      playerState: {
        hasVoted: true,
        selectedOptionId: "a",
      },
    }),
    "2026-06-25T20:00:28.000Z",
  );

  assert.deepEqual(
    createWhatWouldYouDoVoteIntent({
      model,
      playerId: "p1",
      optionId: "b",
    }),
    { enabled: false, reason: "already_voted" },
  );
});

test("creates a simple result view with bars and percentages", () => {
  const view = createWhatWouldYouDoGameView(
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

  assert.equal(view.status, "result");
  assert.equal(view.optionLayout, "result_bars");
  assert.equal(view.result?.leadingOptionLabel, "Fugia");
  assert.equal(view.result?.winnerLabel, "opcao mais escolhida");
  assert.equal(view.result?.leadingPercentage, "66.7%");
  assert.deepEqual(view.result?.bars, [
    {
      optionId: "a",
      label: "Fugia",
      votesLabel: "2 votos",
      percentageLabel: "66.7%",
      percentage: 66.7,
      isWinner: true,
    },
    {
      optionId: "b",
      label: "Ficava paralisado",
      votesLabel: "1 voto",
      percentageLabel: "33.3%",
      percentage: 33.3,
      isWinner: false,
    },
  ]);
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
      submittedCount: 0,
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
            votes: [],
          }
        : undefined,
    },
    playerState: input.playerState ?? { hasVoted: false },
  };
}
