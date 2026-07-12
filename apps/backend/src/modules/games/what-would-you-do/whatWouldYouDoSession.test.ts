import assert from "node:assert/strict";
import test from "node:test";
import type {
  PublicPlayer,
  WhatWouldYouDoQuestion,
} from "../../../../../../packages/contracts/src";
import {
  getWhatWouldYouDoSessionSnapshot,
  progressWhatWouldYouDoSession,
  startNextWhatWouldYouDoRound,
  startWhatWouldYouDoSession,
  submitWhatWouldYouDoSessionVote,
} from "./whatWouldYouDoSession";

const players: PublicPlayer[] = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
];

const deck: WhatWouldYouDoQuestion[] = [
  {
    id: "q1",
    prompt: "Se um tubarao aparecesse a tua frente, o que fazias?",
    options: [
      { id: "a", label: "Fugia" },
      { id: "b", label: "Ficava paralisado" },
    ],
    contentLevel: "friends",
  },
  {
    id: "q2",
    prompt: "Se a mesa pedisse uma ultima rodada, o que fazias?",
    options: [
      { id: "a", label: "Alinhava" },
      { id: "b", label: "Chamava juizo" },
    ],
    contentLevel: "bar",
  },
];

test("starts a playable what_would_you_do session with a first round", () => {
  const started = startWhatWouldYouDoSession({
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
  const first = vote(session, "p1", "a", "2026-06-25T20:00:22.000Z");
  const second = vote(first.state, "p2", "b", "2026-06-25T20:00:23.000Z");
  const third = vote(second.state, "p3", "a", "2026-06-25T20:00:24.000Z");

  assert.equal(third.state.currentRound?.lifecycleState, "result");
  assert.deepEqual(
    third.events.map((event) => event.type),
    ["what_would_you_do.vote_received", "what_would_you_do.round_finished"],
  );
  assert.deepEqual(third.state.currentRound?.result?.winnerOptionIds, ["a"]);
});

test("starts the next round with a fresh question", () => {
  const finishedRound = finishOneRound();
  const previousQuestionId = finishedRound.currentRound?.question.id;
  const next = startNextWhatWouldYouDoRound(
    finishedRound,
    "2026-06-25T20:01:00.000Z",
  );

  assert.equal(next.state.currentRoundNumber, 2);
  assert.notEqual(next.state.currentRound?.question.id, previousQuestionId);
  assert.deepEqual(
    next.events.map((event) => event.type),
    ["what_would_you_do.round_started"],
  );
});

test("finishes the game after the configured number of rounds", () => {
  const finishedRound = finishOneRound();
  const next = startNextWhatWouldYouDoRound(
    finishedRound,
    "2026-06-25T20:01:00.000Z",
  );
  const voting = progressWhatWouldYouDoSession(
    next.state,
    "2026-06-25T20:01:21.000Z",
  ).state;
  const first = vote(voting, "p1", "b", "2026-06-25T20:01:22.000Z");
  const second = vote(first.state, "p2", "b", "2026-06-25T20:01:23.000Z");
  const finishedSecondRound = vote(
    second.state,
    "p3",
    "a",
    "2026-06-25T20:01:24.000Z",
  ).state;
  const finished = startNextWhatWouldYouDoRound(
    finishedSecondRound,
    "2026-06-25T20:02:00.000Z",
  );

  assert.equal(finished.state.status, "finished");
  assert.equal(finished.state.currentRound, undefined);
  assert.deepEqual(
    finished.events.map((event) => event.type),
    ["what_would_you_do.game_finished"],
  );
});

test("creates a player-specific session snapshot", () => {
  const session = openVoting(startSession());
  const snapshot = getWhatWouldYouDoSessionSnapshot(
    session,
    "p1",
    "2026-06-25T20:00:22.000Z",
  );

  assert.equal(snapshot.status, "playing");
  assert.equal(snapshot.currentRoundNumber, 1);
  assert.equal(snapshot.currentRound?.playerState?.hasVoted, false);
});

function startSession() {
  return startWhatWouldYouDoSession({
    roomId: "room_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 2,
    deck,
  }).state;
}

function openVoting(state: ReturnType<typeof startSession>) {
  return progressWhatWouldYouDoSession(state, "2026-06-25T20:00:21.000Z").state;
}

function vote(
  state: ReturnType<typeof startSession>,
  playerId: string,
  optionId: string,
  now: string,
) {
  return submitWhatWouldYouDoSessionVote(
    state,
    {
      playerId,
      questionId: state.currentRound?.question.id ?? "missing",
      optionId,
    },
    now,
  );
}

function finishOneRound() {
  const session = openVoting(startSession());
  const first = vote(session, "p1", "a", "2026-06-25T20:00:22.000Z");
  const second = vote(first.state, "p2", "b", "2026-06-25T20:00:23.000Z");
  return vote(second.state, "p3", "a", "2026-06-25T20:00:24.000Z").state;
}
