import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_STOP_CATEGORIES,
  type PublicPlayer,
} from "../../../../../../packages/contracts/src";
import {
  getStopSessionSnapshot,
  progressStopSession,
  startNextStopRound,
  startStopSession,
  submitStopSessionAnswers,
} from "./stopSession";

const players: PublicPlayer[] = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
];

const categories = DEFAULT_STOP_CATEGORIES.slice(0, 2);

test("starts a configured Stop session with room name, timer, and categories", () => {
  const started = startSession();

  assert.equal(started.state.roomName, "Mesa 29");
  assert.equal(started.state.status, "playing");
  assert.equal(started.state.currentRoundNumber, 1);
  assert.equal(started.state.totalRounds, 2);
  assert.equal(started.state.roundSeconds, 45);
  assert.equal(started.state.currentRound?.letter, "A");
  assert.deepEqual(
    started.events.map((event) => event.type),
    ["stop.round_started"],
  );
});

test("adds round scores into the overall ranking when Stop closes the round", () => {
  const submitted = submitStopSessionAnswers(
    startSession().state,
    {
      playerId: "p1",
      roundId: "room_1_stop_1",
      answers: {
        name: "Ana",
        city: "Aveiro",
      },
      stopRound: true,
    },
    "2026-06-25T20:00:08.000Z",
  );

  assert.equal(submitted.ack.accepted, true);
  assert.deepEqual(
    submitted.events.map((event) => event.type),
    ["stop.answer_received", "stop.round_stopped", "stop.round_finished"],
  );
  assert.deepEqual(
    submitted.state.overallRanking.map((entry) => ({
      playerId: entry.playerId,
      totalScore: entry.totalScore,
      roundsWon: entry.roundsWon,
      lastRoundScore: entry.lastRoundScore,
    })),
    [
      { playerId: "p1", totalScore: 20, roundsWon: 1, lastRoundScore: 20 },
      { playerId: "p2", totalScore: 0, roundsWon: 0, lastRoundScore: 0 },
    ],
  );
  assert.equal(
    submitted.state.currentRound?.result?.overallRanking?.[0]?.playerId,
    "p1",
  );
});

test("progress closes the round at the official deadline", () => {
  const progressed = progressStopSession(
    startSession().state,
    "2026-06-25T20:00:46.000Z",
  );

  assert.equal(progressed.state.currentRound?.lifecycleState, "result");
  assert.deepEqual(
    progressed.events.map((event) => event.type),
    ["stop.round_finished"],
  );
});

test("starts the next round with a fresh letter and finishes after configured rounds", () => {
  const finishedFirst = submitStopSessionAnswers(
    startSession().state,
    {
      playerId: "p1",
      roundId: "room_1_stop_1",
      answers: {
        name: "Ana",
        city: "Aveiro",
      },
      stopRound: true,
    },
    "2026-06-25T20:00:08.000Z",
  ).state;
  const next = startNextStopRound(
    finishedFirst,
    "2026-06-25T20:01:00.000Z",
  );
  const finishedSecond = submitStopSessionAnswers(
    next.state,
    {
      playerId: "p2",
      roundId: "room_1_stop_2",
      answers: {
        name: "Bruno",
        city: "Braga",
      },
      stopRound: true,
    },
    "2026-06-25T20:01:08.000Z",
  ).state;
  const finished = startNextStopRound(
    finishedSecond,
    "2026-06-25T20:02:00.000Z",
  );

  assert.equal(next.state.currentRoundNumber, 2);
  assert.equal(next.state.currentRound?.letter, "B");
  assert.equal(finished.state.status, "finished");
  assert.equal(finished.state.currentRound, undefined);
  assert.deepEqual(
    finished.events.map((event) => event.type),
    ["stop.game_finished"],
  );
});

test("creates a player-specific Stop session snapshot", () => {
  const session = startSession().state;
  const snapshot = getStopSessionSnapshot(
    session,
    "p1",
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(snapshot.roomName, "Mesa 29");
  assert.equal(snapshot.settings.roundSeconds, 45);
  assert.equal(snapshot.currentRound?.playerState?.hasSubmitted, false);
});

function startSession() {
  return startStopSession({
    roomId: "room_1",
    roomName: "Mesa 29",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 2,
    roundSeconds: 45,
    categories,
    letters: ["A", "B"],
  });
}
