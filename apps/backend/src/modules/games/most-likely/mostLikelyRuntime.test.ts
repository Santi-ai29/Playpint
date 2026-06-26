import assert from "node:assert/strict";
import test from "node:test";
import type {
  MostLikelyQuestion,
  PublicPlayer,
} from "../../../../../../packages/contracts/src";
import {
  progressMostLikelyRuntimeRound,
  startMostLikelyRuntimeRound,
  submitMostLikelyRuntimeVote,
} from "./mostLikelyRuntime";

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
];

test("starts the most_likely runtime with a round_started event", () => {
  const started = startRound();

  assert.equal(started.state.lifecycleState, "active");
  assert.equal(started.event.type, "most_likely.round_started");
  assert.equal(started.event.question.id, "q1");
  assert.equal(started.event.players.length, 3);
});

test("opens voting when the question window expires", () => {
  const started = startRound();
  const transition = progressMostLikelyRuntimeRound(
    started.state,
    "2026-06-25T20:00:31.000Z",
  );

  assert.equal(transition.state.lifecycleState, "voting");
  assert.deepEqual(
    transition.events.map((event) => event.type),
    ["most_likely.voting_started"],
  );
  assert.equal(
    Date.parse(transition.state.clock.endsAt) -
      Date.parse(transition.state.clock.startsAt),
    15_000,
  );
});

test("emits vote_received events and closes the round after the last vote", () => {
  const voting = progressMostLikelyRuntimeRound(
    startRound().state,
    "2026-06-25T20:00:31.000Z",
  ).state;
  const first = submitMostLikelyRuntimeVote(
    voting,
    {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    },
    "2026-06-25T20:00:32.000Z",
  );
  const second = submitMostLikelyRuntimeVote(
    first.state,
    {
      playerId: "p2",
      questionId: "q1",
      targetPlayerId: "p3",
    },
    "2026-06-25T20:00:33.000Z",
  );
  const third = submitMostLikelyRuntimeVote(
    second.state,
    {
      playerId: "p3",
      questionId: "q1",
      targetPlayerId: "p2",
    },
    "2026-06-25T20:00:34.000Z",
  );

  assert.deepEqual(
    first.events.map((event) => event.type),
    ["most_likely.vote_received"],
  );
  assert.deepEqual(
    third.events.map((event) => event.type),
    ["most_likely.vote_received", "most_likely.round_finished"],
  );
  assert.equal(third.state.lifecycleState, "result");
  assert.equal(third.state.result?.winners[0]?.nickname, "Bruno");
});

test("closes the voting window when the official deadline passes", () => {
  const voting = progressMostLikelyRuntimeRound(
    startRound().state,
    "2026-06-25T20:00:31.000Z",
  ).state;
  const closed = progressMostLikelyRuntimeRound(
    voting,
    "2026-06-25T20:00:46.000Z",
  );

  assert.equal(closed.state.lifecycleState, "result");
  assert.deepEqual(
    closed.events.map((event) => event.type),
    ["most_likely.round_finished"],
  );
});

function startRound() {
  return startMostLikelyRuntimeRound({
    roomId: "room_1",
    roundId: "round_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    deck,
    questionId: "q1",
  });
}
