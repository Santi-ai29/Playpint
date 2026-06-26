import assert from "node:assert/strict";
import test from "node:test";
import {
  MOST_LIKELY_POINTS_PER_RECEIVED_VOTE,
  type MostLikelyQuestion,
  type PublicPlayer,
} from "../../../../../../packages/contracts/src";
import {
  createMostLikelyRound,
  finishMostLikelyRound,
  getMostLikelySnapshot,
  mostLikelyGameModule,
  startMostLikelyVoting,
  submitMostLikelyVote,
} from "./mostLikelyModule";

const players: PublicPlayer[] = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
];

const deck: MostLikelyQuestion[] = [
  {
    id: "q1",
    prompt: "Quem e mais provavel que faca planos em cima da hora?",
    contentLevel: "friends",
  },
];

test("creates an active most_likely round with a 30 second prompt window", () => {
  const state = createRound();
  const snapshot = getMostLikelySnapshot(
    state,
    "p1",
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(mostLikelyGameModule.manifest.id, "most_likely");
  assert.equal(state.lifecycleState, "active");
  assert.equal(snapshot.lifecycleState, "active");
  assert.equal(snapshot.publicState.question.id, "q1");
  assert.equal(snapshot.publicState.submittedCount, 0);
  assert.equal(snapshot.playerState?.hasVoted, false);
  assert.equal(
    Date.parse(state.clock.endsAt) - Date.parse(state.clock.startsAt),
    30_000,
  );
});

test("rejects votes before voting opens", () => {
  const early = submitMostLikelyVote(
    createRound(),
    {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    },
    "2026-06-25T20:00:10.000Z",
  );

  assert.equal(early.ack.accepted, false);
  assert.equal(early.ack.errorCode, "voting_not_open");
  assert.equal(early.state.lifecycleState, "active");
});

test("accepts one vote per player during the 15 second voting window", () => {
  const votingState = startMostLikelyVoting(
    createRound(),
    "2026-06-25T20:00:30.000Z",
  );
  const first = submitMostLikelyVote(
    votingState,
    {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    },
    "2026-06-25T20:00:32.000Z",
  );
  const duplicate = submitMostLikelyVote(
    first.state,
    {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p3",
    },
    "2026-06-25T20:00:33.000Z",
  );
  const invalidTarget = submitMostLikelyVote(
    first.state,
    {
      playerId: "p2",
      questionId: "q1",
      targetPlayerId: "missing",
    },
    "2026-06-25T20:00:34.000Z",
  );

  assert.equal(votingState.lifecycleState, "voting");
  assert.equal(
    Date.parse(votingState.clock.endsAt) -
      Date.parse(votingState.clock.startsAt),
    15_000,
  );
  assert.equal(first.ack.accepted, true);
  assert.equal(first.state.votes.length, 1);
  assert.equal(duplicate.ack.errorCode, "duplicate_vote");
  assert.equal(invalidTarget.ack.errorCode, "target_not_in_room");
});

test("finishes when all players vote and calculates winners, percentages, vote trail, and points", () => {
  const votingState = startMostLikelyVoting(
    createRound(),
    "2026-06-25T20:00:30.000Z",
  );
  const first = submitMostLikelyVote(
    votingState,
    {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    },
    "2026-06-25T20:00:31.000Z",
  );
  const second = submitMostLikelyVote(
    first.state,
    {
      playerId: "p2",
      questionId: "q1",
      targetPlayerId: "p3",
    },
    "2026-06-25T20:00:32.000Z",
  );
  const third = submitMostLikelyVote(
    second.state,
    {
      playerId: "p3",
      questionId: "q1",
      targetPlayerId: "p2",
    },
    "2026-06-25T20:00:33.000Z",
  );

  const result = third.state.result;

  assert.equal(third.state.lifecycleState, "result");
  assert.equal(third.ack.lifecycleState, "result");
  assert.equal(result?.totalVotes, 3);
  assert.deepEqual(result?.winners, [
    {
      playerId: "p2",
      nickname: "Bruno",
      votes: 2,
      percentage: 66.7,
    },
  ]);
  assert.deepEqual(
    result?.voteCounts.map((count) => ({
      playerId: count.playerId,
      votes: count.votes,
      percentage: count.percentage,
    })),
    [
      { playerId: "p2", votes: 2, percentage: 66.7 },
      { playerId: "p3", votes: 1, percentage: 33.3 },
      { playerId: "p1", votes: 0, percentage: 0 },
    ],
  );
  assert.deepEqual(
    result?.votes.map((vote) => ({
      voterPlayerId: vote.voterPlayerId,
      targetPlayerId: vote.targetPlayerId,
    })),
    [
      { voterPlayerId: "p1", targetPlayerId: "p2" },
      { voterPlayerId: "p2", targetPlayerId: "p3" },
      { voterPlayerId: "p3", targetPlayerId: "p2" },
    ],
  );
  assert.equal(
    result?.scoreDeltas.find((delta) => delta.playerId === "p2")?.delta,
    2 * MOST_LIKELY_POINTS_PER_RECEIVED_VOTE,
  );
});

test("rejects late votes and closes with the current official result", () => {
  const votingState = startMostLikelyVoting(
    createRound(),
    "2026-06-25T20:00:30.000Z",
  );
  const late = submitMostLikelyVote(
    votingState,
    {
      playerId: "p1",
      questionId: "q1",
      targetPlayerId: "p2",
    },
    "2026-06-25T20:00:46.000Z",
  );

  assert.equal(late.ack.accepted, false);
  assert.equal(late.ack.errorCode, "deadline_passed");
  assert.equal(late.state.lifecycleState, "result");
  assert.equal(late.state.result?.totalVotes, 0);
  assert.deepEqual(late.state.result?.winners, []);
});

test("emits a round_finished event from the backend finish hook", () => {
  const finished = finishMostLikelyRound(
    startMostLikelyVoting(createRound(), "2026-06-25T20:00:30.000Z"),
    "2026-06-25T20:00:45.000Z",
  );

  assert.equal(finished.state.lifecycleState, "result");
  assert.equal(finished.event?.type, "most_likely.round_finished");
  assert.equal(finished.event?.result.totalVotes, 0);
});

function createRound() {
  return createMostLikelyRound({
    roomId: "room_1",
    roundId: "round_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    deck,
    questionId: "q1",
  });
}
