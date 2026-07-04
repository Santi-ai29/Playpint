import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_STOP_CATEGORIES,
  type PublicPlayer,
  type StopCategory,
} from "../../../../../../packages/contracts/src";
import {
  createStopRound,
  finishStopRound,
  getStopSnapshot,
  isValidStopAnswer,
  scoreStopRound,
  setStopAnswerReviewDecision,
  stopGameModule,
  submitStopAnswers,
} from "./stopModule";

const players: PublicPlayer[] = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
];

const categories: StopCategory[] = DEFAULT_STOP_CATEGORIES.slice(0, 3).map(
  (category) => ({ ...category }),
);

test("creates an active Stop round with an official letter and categories", () => {
  const state = createRound();
  const snapshot = getStopSnapshot(
    state,
    "p1",
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(stopGameModule.manifest.id, "stop");
  assert.equal(state.lifecycleState, "active");
  assert.equal(state.letter, "A");
  assert.equal(snapshot.publicState.categories.length, 3);
  assert.equal(snapshot.publicState.submittedCount, 0);
  assert.equal(snapshot.playerState?.hasSubmitted, false);
  assert.equal(
    Date.parse(state.clock.endsAt) - Date.parse(state.clock.startsAt),
    60_000,
  );
});

test("scores empty, wrong-letter, duplicate, and unique answers", () => {
  const first = submitStopAnswers(
    createRound(),
    {
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
        city: "Aveiro",
        animal: "Anta",
      },
    },
    "2026-06-25T20:00:10.000Z",
  );
  const second = submitStopAnswers(
    first.state,
    {
      playerId: "p2",
      roundId: "round_1",
      answers: {
        name: "Ana",
        city: "Braga",
        animal: "",
      },
    },
    "2026-06-25T20:00:12.000Z",
  );
  const third = submitStopAnswers(
    second.state,
    {
      playerId: "p3",
      roundId: "round_1",
      answers: {
        name: "Alice",
        city: "Amadora",
        animal: "Arara",
      },
      stopRound: true,
    },
    "2026-06-25T20:00:14.000Z",
  );
  const finished = finishStopRound(third.state, "2026-06-25T20:00:20.000Z");

  assert.equal(third.state.lifecycleState, "submitted");
  assert.equal(third.ack.lifecycleState, "submitted");
  assert.deepEqual(
    finished.state.result?.playerScores.map((score) => ({
      playerId: score.playerId,
      totalScore: score.totalScore,
    })),
    [
      { playerId: "p3", totalScore: 30 },
      { playerId: "p1", totalScore: 25 },
      { playerId: "p2", totalScore: 5 },
    ],
  );
  assert.deepEqual(
    finished.state.result?.categoryResults[0]?.answers.map((answer) => ({
      playerId: answer.playerId,
      points: answer.points,
      reason: answer.reason,
    })),
    [
      { playerId: "p1", points: 5, reason: "duplicate" },
      { playerId: "p2", points: 5, reason: "duplicate" },
      { playerId: "p3", points: 10, reason: "unique" },
    ],
  );
  assert.deepEqual(
    finished.state.result?.categoryResults[1]?.answers.map((answer) => ({
      playerId: answer.playerId,
      points: answer.points,
      reason: answer.reason,
    })),
    [
      { playerId: "p1", points: 10, reason: "unique" },
      { playerId: "p2", points: 0, reason: "wrong_letter" },
      { playerId: "p3", points: 10, reason: "unique" },
    ],
  );
  assert.equal(finished.state.result?.stoppedByNickname, "Carla");
});

test("opens review immediately when a player presses Stop and rejects later edits", () => {
  const stopped = submitStopAnswers(
    createRound(),
    {
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
        city: "Aveiro",
        animal: "Anta",
      },
      stopRound: true,
    },
    "2026-06-25T20:00:09.000Z",
  );
  const late = submitStopAnswers(
    stopped.state,
    {
      playerId: "p2",
      roundId: "round_1",
      answers: {
        name: "Alberto",
      },
    },
    "2026-06-25T20:00:10.000Z",
  );

  assert.equal(stopped.ack.accepted, true);
  assert.equal(stopped.state.lifecycleState, "submitted");
  assert.equal(stopped.state.result, undefined);
  assert.equal(stopped.state.submissions.length, 1);
  assert.equal(
    getStopSnapshot(
      stopped.state,
      "p2",
      "2026-06-25T20:00:10.000Z",
    ).publicState.review?.rows.length,
    3,
  );
  assert.equal(late.ack.accepted, false);
  assert.equal(late.ack.errorCode, "round_already_finished");
});

test("deadline is authoritative and opens review with current submissions", () => {
  const late = submitStopAnswers(
    createRound(),
    {
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
      },
    },
    "2026-06-25T20:01:01.000Z",
  );
  const finished = finishStopRound(
    createRound(),
    "2026-06-25T20:01:01.000Z",
  );

  assert.equal(late.ack.accepted, false);
  assert.equal(late.ack.errorCode, "deadline_passed");
  assert.equal(late.state.lifecycleState, "submitted");
  assert.equal(late.state.result, undefined);
  assert.equal(finished.event?.type, "stop.round_finished");
});

test("allows the host to invalidate an answer before scoring", () => {
  const first = submitStopAnswers(
    createRound(),
    {
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
        city: "Aveiro",
        animal: "Anta",
      },
      stopRound: true,
    },
    "2026-06-25T20:00:10.000Z",
  );
  const reviewed = setStopAnswerReviewDecision(
    first.state,
    {
      roundId: "round_1",
      playerId: "p1",
      categoryId: "city",
      invalidated: true,
    },
    "2026-06-25T20:00:12.000Z",
  );
  const finished = finishStopRound(
    reviewed.state,
    "2026-06-25T20:00:14.000Z",
  );

  assert.equal(reviewed.ack.accepted, true);
  assert.equal(
    getStopSnapshot(
      reviewed.state,
      "p1",
      "2026-06-25T20:00:13.000Z",
    ).publicState.review?.rows[0]?.answers[1]?.invalidated,
    true,
  );
  assert.equal(
    finished.state.result?.categoryResults[1]?.answers[0]?.reason,
    "invalid",
  );
  assert.equal(finished.state.result?.playerScores[0]?.totalScore, 20);
});

test("normalizes accents for first-letter validation", () => {
  assert.equal(isValidStopAnswer("Agueda", "A"), true);
  assert.equal(isValidStopAnswer("Agueda", "B"), false);
  assert.equal(isValidStopAnswer("  ana", "a"), true);
});

test("can score a manually closed round directly", () => {
  const state = submitStopAnswers(
    createRound(),
    {
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
      },
    },
    "2026-06-25T20:00:10.000Z",
  ).state;
  const result = scoreStopRound(state);

  assert.equal(result.playerScores[0]?.playerId, "p1");
  assert.equal(result.playerScores[0]?.totalScore, 10);
});

function createRound() {
  return createStopRound({
    roomId: "room_1",
    roomName: "Mesa Stop",
    roundId: "round_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    durationSeconds: 60,
    letter: "A",
    categories,
  });
}
