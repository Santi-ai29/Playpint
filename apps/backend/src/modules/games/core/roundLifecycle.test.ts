import assert from "node:assert/strict";
import test from "node:test";

import {
  createRejectedSubmissionAck,
  createRoundClock,
  createRoundSnapshot,
  createSubmissionAck,
  hasPlayerSubmitted,
  isPastDeadline,
  shouldFinishRound,
} from "./roundLifecycle";

test("creates server clocks from a start time and duration", () => {
  const clock = createRoundClock({
    now: "2026-06-25T20:00:00.000Z",
    durationSeconds: 15,
  });

  assert.equal(clock.startsAt, "2026-06-25T20:00:00.000Z");
  assert.equal(clock.endsAt, "2026-06-25T20:00:15.000Z");
});

test("detects deadlines and all-player completion", () => {
  const clock = createRoundClock({
    now: "2026-06-25T20:00:00.000Z",
    durationSeconds: 15,
  });

  assert.equal(isPastDeadline(clock, "2026-06-25T20:00:14.999Z"), false);
  assert.equal(isPastDeadline(clock, "2026-06-25T20:00:15.000Z"), true);
  assert.equal(
    shouldFinishRound({
      clock,
      now: "2026-06-25T20:00:05.000Z",
      submittedPlayerIds: ["p1", "p2"],
      totalPlayers: 2,
    }),
    true,
  );
});

test("tracks duplicate submissions by player", () => {
  assert.equal(
    hasPlayerSubmitted(
      [{ playerId: "p1", submittedAt: "2026-06-25T20:00:01.000Z" }],
      "p1",
    ),
    true,
  );
  assert.equal(hasPlayerSubmitted([], "p1"), false);
});

test("creates accepted and rejected acknowledgements", () => {
  const accepted = createSubmissionAck({
    gameMode: "example_game",
    roomId: "room-1",
    roundId: "round-1",
    playerId: "p1",
    accepted: true,
    submittedAt: "2026-06-25T20:00:01.000Z",
    lifecycleState: "waiting",
  });

  const rejected = createRejectedSubmissionAck({
    gameMode: "example_game",
    roomId: "room-1",
    roundId: "round-1",
    playerId: "p1",
    code: "duplicate_submission",
    message: "Player already submitted.",
  });

  assert.equal(accepted.accepted, true);
  assert.equal(accepted.submittedAt, "2026-06-25T20:00:01.000Z");
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.error?.code, "duplicate_submission");
});

test("creates snapshots without adding hidden state", () => {
  const snapshot = createRoundSnapshot({
    gameMode: "example_game",
    roomId: "room-1",
    roundId: "round-1",
    lifecycleState: "active",
    clock: createRoundClock({
      now: "2026-06-25T20:00:00.000Z",
      durationSeconds: 15,
    }),
    serverNow: "2026-06-25T20:00:05.000Z",
    publicState: { prompt: "Public prompt" },
    playerState: { hasSubmitted: false },
  });

  assert.deepEqual(snapshot.publicState, { prompt: "Public prompt" });
  assert.deepEqual(snapshot.playerState, { hasSubmitted: false });
  assert.equal("secret" in snapshot.publicState, false);
});
