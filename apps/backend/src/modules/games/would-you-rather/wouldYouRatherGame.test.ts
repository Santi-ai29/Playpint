import assert from "node:assert/strict";
import test from "node:test";

import type { PlayerSummary } from "../../../../../../packages/contracts/src";
import {
  finishWouldYouRatherRound,
  getWouldYouRatherSnapshot,
  maybeFinishWouldYouRatherRound,
  selectWouldYouRatherQuestion,
  startWouldYouRatherRound,
  submitWouldYouRatherVote,
} from "./wouldYouRatherGame";

const players: PlayerSummary[] = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
];

test("accepts one vote per player and rejects duplicates", () => {
  let state = createRound(players).state;
  const first = submitWouldYouRatherVote(state, request("p1", "A"), now(1));
  state = first.state;

  assert.equal(first.ack.accepted, true);
  assert.equal(first.ack.optionId, "A");

  const duplicate = submitWouldYouRatherVote(state, request("p1", "B"), now(2));

  assert.equal(duplicate.ack.accepted, false);
  assert.equal(duplicate.ack.error?.code, "duplicate_submission");
  assert.equal(duplicate.ack.optionId, "A");
});

test("rejects invalid options and late votes", () => {
  const state = createRound(players).state;
  const invalid = submitWouldYouRatherVote(
    state,
    request("p1", "C" as "A"),
    now(1),
  );
  const late = submitWouldYouRatherVote(state, request("p1", "A"), now(15));

  assert.equal(invalid.ack.accepted, false);
  assert.equal(invalid.ack.error?.code, "invalid_submission");
  assert.equal(late.ack.accepted, false);
  assert.equal(late.ack.error?.code, "deadline_passed");
});

test("finishes when every player has voted and calculates official results", () => {
  let state = createRound(players).state;
  state = submitWouldYouRatherVote(state, request("p1", "A"), now(1)).state;
  state = submitWouldYouRatherVote(state, request("p2", "B"), now(2)).state;
  state = submitWouldYouRatherVote(state, request("p3", "B"), now(3)).state;

  assert.equal(state.lifecycleState, "result");
  assert.equal(state.result?.totalVotes, 3);
  assert.deepEqual(
    state.result?.results.map((result) => result.percentage),
    [33, 67],
  );
  assert.deepEqual(state.result?.results[1].nicknames, ["Bruno", "Carla"]);
  assert.deepEqual(
    state.result?.scoreDeltas.map((delta) => delta.delta),
    [1, 3, 3],
  );
});

test("keeps zero votes and tie scoring stable", () => {
  const empty = finishWouldYouRatherRound(
    createRound(players.slice(0, 2)).state,
    now(15),
  ).state;

  assert.equal(empty.result?.totalVotes, 0);
  assert.deepEqual(
    empty.result?.results.map((result) => result.percentage),
    [0, 0],
  );

  let tied = createRound(players.slice(0, 2)).state;
  tied = submitWouldYouRatherVote(tied, request("p1", "A"), now(1)).state;
  tied = submitWouldYouRatherVote(tied, request("p2", "B"), now(2)).state;

  assert.deepEqual(
    tied.result?.scoreDeltas.map((delta) => delta.delta),
    [1, 1],
  );
});

test("active snapshots hide other players votes", () => {
  let state = createRound(players).state;
  state = submitWouldYouRatherVote(state, request("p1", "A"), now(1)).state;

  const ownSnapshot = getWouldYouRatherSnapshot(state, "p1", now(2));
  const otherSnapshot = getWouldYouRatherSnapshot(state, "p2", now(2));

  assert.equal(ownSnapshot.playerState?.selectedOptionId, "A");
  assert.equal(otherSnapshot.playerState?.selectedOptionId, undefined);
  assert.equal(otherSnapshot.publicState.result, undefined);
  assert.equal(otherSnapshot.publicState.submittedCount, 1);
});

test("can close an expired round and avoids reused questions", () => {
  const state = createRound(players).state;
  const expired = maybeFinishWouldYouRatherRound(state, now(15));

  assert.equal(expired.lifecycleState, "result");

  const selected = selectWouldYouRatherQuestion({
    questionBank: [state.question, { ...state.question, id: "wyr_other" }],
    contentLevel: "family",
    usedQuestionIds: [state.question.id],
  });

  assert.equal(selected.id, "wyr_other");
});

function createRound(roundPlayers: PlayerSummary[]) {
  return startWouldYouRatherRound({
    roomId: "room-1",
    roundId: "round-1",
    players: roundPlayers,
    now: "2026-06-25T12:00:00.000Z",
    contentLevel: "family",
  });
}

function request(playerId: string, optionId: "A" | "B") {
  return {
    roomId: "room-1",
    roundId: "round-1",
    playerId,
    optionId,
  };
}

function now(seconds: number) {
  return `2026-06-25T12:00:${String(seconds).padStart(2, "0")}.000Z`;
}
