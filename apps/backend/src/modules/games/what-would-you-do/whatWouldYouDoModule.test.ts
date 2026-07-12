import assert from "node:assert/strict";
import test from "node:test";
import type {
  PublicPlayer,
  WhatWouldYouDoQuestion,
} from "../../../../../../packages/contracts/src";
import {
  createWhatWouldYouDoRound,
  finishWhatWouldYouDoRound,
  getWhatWouldYouDoSnapshot,
  startWhatWouldYouDoVoting,
  submitWhatWouldYouDoVote,
  whatWouldYouDoGameModule,
} from "./whatWouldYouDoModule";

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

test("creates an active what_would_you_do round with a 20 second prompt window", () => {
  const state = createRound();
  const snapshot = getWhatWouldYouDoSnapshot(
    state,
    "p1",
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(whatWouldYouDoGameModule.manifest.id, "what_would_you_do");
  assert.equal(state.lifecycleState, "active");
  assert.equal(snapshot.lifecycleState, "active");
  assert.equal(snapshot.publicState.question.id, "q1");
  assert.equal(snapshot.publicState.submittedCount, 0);
  assert.equal(snapshot.playerState?.hasVoted, false);
  assert.equal(
    Date.parse(state.clock.endsAt) - Date.parse(state.clock.startsAt),
    20_000,
  );
});

test("rejects votes before voting opens", () => {
  const early = submitWhatWouldYouDoVote(
    createRound(),
    {
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    },
    "2026-06-25T20:00:10.000Z",
  );

  assert.equal(early.ack.accepted, false);
  assert.equal(early.ack.errorCode, "voting_not_open");
  assert.equal(early.state.lifecycleState, "active");
});

test("accepts one option vote per player during the voting window", () => {
  const votingState = startWhatWouldYouDoVoting(
    createRound(),
    "2026-06-25T20:00:20.000Z",
  );
  const first = submitWhatWouldYouDoVote(
    votingState,
    {
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    },
    "2026-06-25T20:00:22.000Z",
  );
  const duplicate = submitWhatWouldYouDoVote(
    first.state,
    {
      playerId: "p1",
      questionId: "q1",
      optionId: "b",
    },
    "2026-06-25T20:00:23.000Z",
  );
  const invalidOption = submitWhatWouldYouDoVote(
    first.state,
    {
      playerId: "p2",
      questionId: "q1",
      optionId: "missing",
    },
    "2026-06-25T20:00:24.000Z",
  );

  assert.equal(votingState.lifecycleState, "voting");
  assert.equal(
    Date.parse(votingState.clock.endsAt) -
      Date.parse(votingState.clock.startsAt),
    18_000,
  );
  assert.equal(first.ack.accepted, true);
  assert.equal(first.state.votes.length, 1);
  assert.equal(duplicate.ack.errorCode, "duplicate_vote");
  assert.equal(invalidOption.ack.errorCode, "option_not_in_question");
});

test("finishes when all players vote and calculates option percentages", () => {
  const votingState = startWhatWouldYouDoVoting(
    createRound(),
    "2026-06-25T20:00:20.000Z",
  );
  const first = submitWhatWouldYouDoVote(
    votingState,
    {
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    },
    "2026-06-25T20:00:21.000Z",
  );
  const second = submitWhatWouldYouDoVote(
    first.state,
    {
      playerId: "p2",
      questionId: "q1",
      optionId: "b",
    },
    "2026-06-25T20:00:22.000Z",
  );
  const third = submitWhatWouldYouDoVote(
    second.state,
    {
      playerId: "p3",
      questionId: "q1",
      optionId: "a",
    },
    "2026-06-25T20:00:23.000Z",
  );

  assert.equal(third.state.lifecycleState, "result");
  assert.equal(third.ack.lifecycleState, "result");
  assert.deepEqual(third.state.result?.winnerOptionIds, ["a"]);
  assert.deepEqual(third.state.result?.optionResults, [
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
  assert.deepEqual(
    third.state.result?.votes.map((vote) => ({
      voterPlayerId: vote.voterPlayerId,
      optionId: vote.optionId,
    })),
    [
      { voterPlayerId: "p1", optionId: "a" },
      { voterPlayerId: "p2", optionId: "b" },
      { voterPlayerId: "p3", optionId: "a" },
    ],
  );
});

test("rejects late votes and closes with the current official result", () => {
  const votingState = startWhatWouldYouDoVoting(
    createRound(),
    "2026-06-25T20:00:20.000Z",
  );
  const late = submitWhatWouldYouDoVote(
    votingState,
    {
      playerId: "p1",
      questionId: "q1",
      optionId: "a",
    },
    "2026-06-25T20:00:39.000Z",
  );

  assert.equal(late.ack.accepted, false);
  assert.equal(late.ack.errorCode, "deadline_passed");
  assert.equal(late.state.lifecycleState, "result");
  assert.equal(late.state.result?.totalVotes, 0);
  assert.deepEqual(late.state.result?.winnerOptionIds, []);
});

test("emits a round_finished event from the backend finish hook", () => {
  const finished = finishWhatWouldYouDoRound(
    startWhatWouldYouDoVoting(createRound(), "2026-06-25T20:00:20.000Z"),
    "2026-06-25T20:00:38.000Z",
  );

  assert.equal(finished.state.lifecycleState, "result");
  assert.equal(finished.event?.type, "what_would_you_do.round_finished");
  assert.equal(finished.event?.result.totalVotes, 0);
});

function createRound() {
  return createWhatWouldYouDoRound({
    roomId: "room_1",
    roundId: "round_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    deck,
    questionId: "q1",
  });
}
