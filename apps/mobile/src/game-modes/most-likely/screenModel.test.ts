import assert from "node:assert/strict";
import test from "node:test";
import type {
  MostLikelyPlayerState,
  MostLikelyPublicState,
  RoundSnapshot,
} from "../../../../../packages/contracts/src";
import {
  createMostLikelyScreenModel,
  createMostLikelyVoteAction,
} from "./screenModel";

test("shows the question phase before voting opens", () => {
  const model = createMostLikelyScreenModel(
    snapshot({
      lifecycleState: "active",
      playerState: { hasVoted: false },
    }),
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(model.status, "question");
  assert.equal(model.header.brandLogoText, "Playpint");
  assert.equal(model.header.modeLabel, "Es Tu?");
  assert.equal(model.header.phaseLabel, "Ronda");
  assert.equal(model.header.timerLabel, "00:25");
  assert.equal(model.canVote, false);
  assert.equal(model.remainingSeconds, 25);
  assert.equal(model.players.every((player) => player.disabled), true);
});

test("enables player selection during voting", () => {
  const model = createMostLikelyScreenModel(
    snapshot({
      lifecycleState: "voting",
      clock: {
        startsAt: "2026-06-25T20:00:30.000Z",
        endsAt: "2026-06-25T20:00:45.000Z",
      },
      playerState: { hasVoted: false },
    }),
    "2026-06-25T20:00:35.000Z",
  );

  assert.equal(model.status, "voting");
  assert.equal(model.header.phaseLabel, "Votacao");
  assert.equal(model.copy.votingTitle, "Escolhe uma pessoa");
  assert.equal(model.canVote, true);
  assert.equal(model.remainingSeconds, 10);
  assert.equal(model.players.every((player) => player.disabled === false), true);
});

test("locks selection after the current player votes", () => {
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

  assert.equal(model.status, "waiting");
  assert.equal(model.canVote, false);
  assert.equal(model.players.find((player) => player.playerId === "p2")?.selected, true);
});

test("maps official results, winners, percentages, and vote trail", () => {
  const model = createMostLikelyScreenModel(
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

  assert.equal(model.status, "result");
  assert.deepEqual(model.resultSummary, {
    title: "Resultado",
    winnerNickname: "Bruno",
    winnerLabel: "mais votado",
    winnerPercentage: 66.7,
    sarcasticLine:
      "Bruno foi apanhado no radar da mesa. Esses olhares nao se explicam sozinhos.",
  });
  assert.deepEqual(model.winners, ["Bruno"]);
  assert.deepEqual(
    model.resultRows.map((row) => ({
      playerId: row.playerId,
      votes: row.votes,
      percentage: row.percentage,
      isWinner: row.isWinner,
    })),
    [
      { playerId: "p2", votes: 2, percentage: 66.7, isWinner: true },
      { playerId: "p3", votes: 1, percentage: 33.3, isWinner: false },
      { playerId: "p1", votes: 0, percentage: 0, isWinner: false },
    ],
  );
  assert.deepEqual(model.voteTrail, [
    { voterNickname: "Ana", targetNickname: "Bruno" },
    { voterNickname: "Bruno", targetNickname: "Carla" },
    { voterNickname: "Carla", targetNickname: "Bruno" },
  ]);
});

test("creates a contract-compatible vote action", () => {
  assert.deepEqual(
    createMostLikelyVoteAction({
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    }),
    {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    },
  );
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
        prompt: "Quem e mais provavel que faca planos em cima da hora?",
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
            prompt: "Quem e mais provavel que faca planos em cima da hora?",
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
            votes: [
              {
                voterPlayerId: "p1",
                voterNickname: "Ana",
                targetPlayerId: "p2",
                targetNickname: "Bruno",
                submittedAt: "2026-06-25T20:00:31.000Z",
              },
              {
                voterPlayerId: "p2",
                voterNickname: "Bruno",
                targetPlayerId: "p3",
                targetNickname: "Carla",
                submittedAt: "2026-06-25T20:00:32.000Z",
              },
              {
                voterPlayerId: "p3",
                voterNickname: "Carla",
                targetPlayerId: "p2",
                targetNickname: "Bruno",
                submittedAt: "2026-06-25T20:00:33.000Z",
              },
            ],
          }
        : undefined,
    },
    playerState: input.playerState,
  };
}
