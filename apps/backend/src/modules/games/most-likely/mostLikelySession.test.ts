import assert from "node:assert/strict";
import test from "node:test";
import type {
  MostLikelyQuestion,
  PublicPlayer,
} from "../../../../../../packages/contracts/src";
import {
  getMostLikelySessionSnapshot,
  progressMostLikelySession,
  startMostLikelySession,
  startNextMostLikelyRound,
  submitMostLikelySessionVote,
} from "./mostLikelySession";

const players: PublicPlayer[] = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
];

const deck: MostLikelyQuestion[] = [
  {
    id: "q1",
    prompt: "Quem e mais provavel que chegue atrasado?",
    contentLevel: "friends",
  },
  {
    id: "q2",
    prompt: "Quem e mais provavel que peca mais uma rodada?",
    contentLevel: "bar",
  },
];

test("starts a playable most_likely session with a first round", () => {
  const started = startMostLikelySession({
    roomId: "room_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 2,
    deck,
  });

  assert.equal(started.state.status, "playing");
  assert.equal(started.state.currentRoundNumber, 1);
  assert.equal(started.state.totalRounds, 2);
  assert.ok(
    deck.some((question) => question.id === started.state.currentRound?.question.id),
  );
  assert.deepEqual(started.state.usedQuestionIds, [
    started.state.currentRound?.question.id,
  ]);
});

test("publishes an official result after a completed round", () => {
  const session = openVoting(startSession());
  const first = vote(session, "p1", "p2", "2026-06-25T20:00:32.000Z");
  const second = vote(first.state, "p2", "p3", "2026-06-25T20:00:33.000Z");
  const third = vote(second.state, "p3", "p2", "2026-06-25T20:00:34.000Z");

  assert.equal(third.state.currentRound?.lifecycleState, "result");
  assert.deepEqual(
    third.events.map((event) => event.type),
    ["most_likely.vote_received", "most_likely.round_finished"],
  );
  assert.deepEqual(
    third.state.currentRound?.result?.winners.map((winner) => winner.playerId),
    ["p2"],
  );
});

test("starts the next round with a fresh question", () => {
  const finishedRound = finishOneRound();
  const previousQuestionId = finishedRound.currentRound?.question.id;
  const next = startNextMostLikelyRound(
    finishedRound,
    "2026-06-25T20:01:00.000Z",
  );

  assert.equal(next.state.currentRoundNumber, 2);
  assert.notEqual(next.state.currentRound?.question.id, previousQuestionId);
  assert.deepEqual(
    next.events.map((event) => event.type),
    ["most_likely.round_started"],
  );
});

test("finishes the game after the configured number of rounds", () => {
  const finishedRound = finishOneRound();
  const next = startNextMostLikelyRound(
    finishedRound,
    "2026-06-25T20:01:00.000Z",
  );
  const voting = progressMostLikelySession(
    next.state,
    "2026-06-25T20:01:31.000Z",
  ).state;
  const first = vote(voting, "p1", "p3", "2026-06-25T20:01:32.000Z");
  const second = vote(first.state, "p2", "p3", "2026-06-25T20:01:33.000Z");
  const finishedSecondRound = vote(
    second.state,
    "p3",
    "p2",
    "2026-06-25T20:01:34.000Z",
  ).state;
  const finished = startNextMostLikelyRound(
    finishedSecondRound,
    "2026-06-25T20:02:00.000Z",
  );

  assert.equal(finished.state.status, "finished");
  assert.equal(finished.state.currentRound, undefined);
  assert.deepEqual(
    finished.events.map((event) => event.type),
    ["most_likely.game_finished"],
  );
});

test("creates a player-specific session snapshot", () => {
  const session = openVoting(startSession());
  const snapshot = getMostLikelySessionSnapshot(
    session,
    "p1",
    "2026-06-25T20:00:32.000Z",
  );

  assert.equal(snapshot.status, "playing");
  assert.equal(snapshot.currentRoundNumber, 1);
  assert.equal(snapshot.currentRound?.playerState?.hasVoted, false);
});

function startSession() {
  return startMostLikelySession({
    roomId: "room_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 2,
    deck,
  }).state;
}

function openVoting(state: ReturnType<typeof startSession>) {
  return progressMostLikelySession(state, "2026-06-25T20:00:31.000Z").state;
}

function vote(
  state: ReturnType<typeof startSession>,
  playerId: string,
  targetPlayerId: string,
  now: string,
) {
  return submitMostLikelySessionVote(
    state,
    {
      playerId,
      questionId: state.currentRound?.question.id ?? "missing",
      targetPlayerId,
    },
    now,
  );
}

function finishOneRound() {
  const session = openVoting(startSession());
  const first = vote(session, "p1", "p2", "2026-06-25T20:00:32.000Z");
  const second = vote(first.state, "p2", "p3", "2026-06-25T20:00:33.000Z");
  return vote(second.state, "p3", "p2", "2026-06-25T20:00:34.000Z").state;
}
