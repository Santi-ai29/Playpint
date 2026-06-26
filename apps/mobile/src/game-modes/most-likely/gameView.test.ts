import assert from "node:assert/strict";
import test from "node:test";
import type {
  MostLikelyPlayerState,
  MostLikelyPublicState,
  RoundSnapshot,
} from "../../../../../packages/contracts/src";
import { createMostLikelyScreenModel } from "./screenModel";
import {
  createMostLikelyGameView,
  createMostLikelyVoteDraft,
  createMostLikelyVoteIntent,
} from "./gameView";

test("creates the approved Playpint-branded question view", () => {
  const view = createMostLikelyGameView(
    snapshot({ lifecycleState: "active" }),
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(view.backgroundStyle, "premium_illustrated_bar");
  assert.equal(view.brand.logoText, "Playpint");
  assert.equal(view.brand.modeLabel, "Es Tu?");
  assert.equal(view.playerGrid.every((player) => player.visualState === "disabled"), true);
});

test("creates a voting view and a contract-compatible vote intent", () => {
  const source = snapshot({
    lifecycleState: "voting",
    clock: {
      startsAt: "2026-06-25T20:00:30.000Z",
      endsAt: "2026-06-25T20:00:45.000Z",
    },
  });
  const model = createMostLikelyScreenModel(source, "2026-06-25T20:00:35.000Z");
  const view = createMostLikelyGameView(source, "2026-06-25T20:00:35.000Z");
  const intent = createMostLikelyVoteIntent({
    model,
    playerId: "p1",
    targetPlayerId: "p2",
  });

  assert.equal(view.status, "voting");
  assert.equal(view.footer?.text, "Escolhe uma pessoa");
  assert.equal(view.playerGrid.every((player) => player.visualState === "enabled"), true);
  assert.deepEqual(intent, {
    enabled: true,
    action: {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    },
  });
});

test("allows changing the local selected player before confirming the vote", () => {
  const source = snapshot({
    lifecycleState: "voting",
    clock: {
      startsAt: "2026-06-25T20:00:30.000Z",
      endsAt: "2026-06-25T20:00:45.000Z",
    },
  });
  const model = createMostLikelyScreenModel(source, "2026-06-25T20:00:35.000Z");
  const firstDraft = createMostLikelyVoteDraft({
    model,
    selectedTargetPlayerId: "p2",
  });
  const changedDraft = createMostLikelyVoteDraft({
    model,
    selectedTargetPlayerId: "p3",
  });

  assert.equal(firstDraft.canConfirm, true);
  assert.equal(
    firstDraft.options.find((option) => option.playerId === "p2")?.selected,
    true,
  );
  assert.equal(changedDraft.canConfirm, true);
  assert.equal(
    changedDraft.options.find((option) => option.playerId === "p3")?.selected,
    true,
  );
  assert.equal(
    changedDraft.options.find((option) => option.playerId === "p2")?.selected,
    false,
  );
});

test("blocks vote intents when the player already voted", () => {
  const model = createMostLikelyScreenModel(
    snapshot({
      lifecycleState: "voting",
      clock: {
        startsAt: "2026-06-25T20:00:30.000Z",
        endsAt: "2026-06-25T20:00:45.000Z",
      },
      playerState: {
        hasVoted: true,
        selectedTargetPlayerId: "p2",
      },
    }),
    "2026-06-25T20:00:35.000Z",
  );

  assert.deepEqual(
    createMostLikelyVoteIntent({
      model,
      playerId: "p1",
      targetPlayerId: "p3",
    }),
    { enabled: false, reason: "already_voted" },
  );
});

test("keeps the primary result view simple", () => {
  const view = createMostLikelyGameView(
    snapshot({
      lifecycleState: "result",
      playerState: {
        hasVoted: true,
        selectedTargetPlayerId: "p2",
      },
      result: true,
    }),
    "2026-06-25T20:00:45.000Z",
  );

  assert.equal(view.status, "result");
  assert.equal(view.result?.winnerNickname, "Bruno");
  assert.equal(view.result?.winnerLabel, "mais votado");
  assert.equal(view.result?.winnerPercentage, "66.7%");
  assert.equal(
    view.result?.sarcasticLine,
    "Bruno tentou passar despercebido. A mesa discordou.",
  );
  assert.deepEqual(view.result?.tableRows, [
    {
      playerId: "p2",
      label: "Bruno",
      votesLabel: "2 votos",
      percentageLabel: "66.7%",
      isWinner: true,
    },
    {
      playerId: "p3",
      label: "Carla",
      votesLabel: "1 voto",
      percentageLabel: "33.3%",
      isWinner: false,
    },
    {
      playerId: "p1",
      label: "Ana",
      votesLabel: "0 votos",
      percentageLabel: "0%",
      isWinner: false,
    },
  ]);
});

function snapshot(input: {
  lifecycleState: "active" | "voting" | "result";
  clock?: RoundSnapshot["clock"];
  playerState?: MostLikelyPlayerState;
  result?: boolean;
}): RoundSnapshot<MostLikelyPublicState, MostLikelyPlayerState> {
  return {
    gameMode: "most_likely",
    gameModeId: "most_likely",
    roomId: "room_1",
    roundId: "round_1",
    lifecycleState: input.lifecycleState,
    clock:
      input.clock ??
      {
        startsAt: "2026-06-25T20:00:00.000Z",
        endsAt: "2026-06-25T20:00:30.000Z",
      },
    serverNow: "2026-06-25T20:00:05.000Z",
    publicState: {
      question: {
        id: "q1",
        prompt: "Quem e mais provavel que chegue atrasado?",
        contentLevel: "friends",
      },
      players: [
        { playerId: "p1", nickname: "Ana" },
        { playerId: "p2", nickname: "Bruno" },
        { playerId: "p3", nickname: "Carla" },
      ],
      submittedCount: input.playerState?.hasVoted ? 1 : 0,
      totalPlayers: 3,
      result: input.result
        ? {
            questionId: "q1",
            prompt: "Quem e mais provavel que chegue atrasado?",
            totalVotes: 3,
            winners: [
              {
                playerId: "p2",
                nickname: "Bruno",
                votes: 2,
                percentage: 66.7,
              },
            ],
            voteCounts: [
              {
                playerId: "p2",
                nickname: "Bruno",
                votes: 2,
                percentage: 66.7,
              },
              {
                playerId: "p3",
                nickname: "Carla",
                votes: 1,
                percentage: 33.3,
              },
              {
                playerId: "p1",
                nickname: "Ana",
                votes: 0,
                percentage: 0,
              },
            ],
            votes: [],
          }
        : undefined,
    },
    playerState: input.playerState ?? { hasVoted: false },
  };
}
