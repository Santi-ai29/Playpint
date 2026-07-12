import assert from "node:assert/strict";
import test from "node:test";
import type {
  PublicPlayer,
  WhatWouldYouDoQuestion,
} from "../../../../../../packages/contracts/src";
import {
  progressWhatWouldYouDoRuntimeRound,
  startWhatWouldYouDoRuntimeRound,
  submitWhatWouldYouDoRuntimeVote,
} from "./whatWouldYouDoRuntime";

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
];

test("starts the what_would_you_do runtime with a round_started event", () => {
  const started = startRound();

  assert.equal(started.state.lifecycleState, "active");
  assert.equal(started.event.type, "what_would_you_do.round_started");
  assert.equal(started.event.question.id, "q1");
});

test("opens voting when the question window expires", () => {
  const started = startRound();
  const transition = progressWhatWouldYouDoRuntimeRound(
    started.state,
    "2026-06-25T20:00:21.000Z",
  );

  assert.equal(transition.state.lifecycleState, "voting");
  assert.deepEqual(
    transition.events.map((event) => event.type),
    ["what_would_you_do.voting_started"],
  );
  assert.equal(
    Date.parse(transition.state.clock.endsAt) -
      Date.parse(transition.state.clock.startsAt),
    18_000,
  );
});

test("emits vote_received events and closes the round after the last vote", () => {
  const voting = progressWhatWouldYouDoRuntimeRound(
    startRound().state,
    "2026-06-25T20:00:21.000Z",
  ).state;
  const first = submitWhatWouldYouDoRuntimeVote(
    voting,
    {
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    },
    "2026-06-25T20:00:22.000Z",
  );
  const second = submitWhatWouldYouDoRuntimeVote(
    first.state,
    {
      playerId: "p2",
      questionId: "q1",
      optionId: "b",
    },
    "2026-06-25T20:00:23.000Z",
  );
  const third = submitWhatWouldYouDoRuntimeVote(
    second.state,
    {
      playerId: "p3",
      questionId: "q1",
      optionId: "a",
    },
    "2026-06-25T20:00:24.000Z",
  );

  assert.deepEqual(
    first.events.map((event) => event.type),
    ["what_would_you_do.vote_received"],
  );
  assert.deepEqual(
    third.events.map((event) => event.type),
    ["what_would_you_do.vote_received", "what_would_you_do.round_finished"],
  );
  assert.equal(third.state.lifecycleState, "result");
  assert.equal(third.state.result?.winnerOptionIds[0], "a");
});

test("closes the voting window when the official deadline passes", () => {
  const voting = progressWhatWouldYouDoRuntimeRound(
    startRound().state,
    "2026-06-25T20:00:21.000Z",
  ).state;
  const closed = progressWhatWouldYouDoRuntimeRound(
    voting,
    "2026-06-25T20:00:39.000Z",
  );

  assert.equal(closed.state.lifecycleState, "result");
  assert.deepEqual(
    closed.events.map((event) => event.type),
    ["what_would_you_do.round_finished"],
  );
});

function startRound() {
  return startWhatWouldYouDoRuntimeRound({
    roomId: "room_1",
    roundId: "round_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    deck,
    questionId: "q1",
  });
}
