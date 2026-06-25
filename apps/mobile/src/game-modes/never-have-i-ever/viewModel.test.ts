import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createNeverHaveIEverRound,
  getNeverHaveIEverSnapshot,
  submitNeverHaveIEverAnswer,
} from "../../../../backend/src/modules/games/never-have-i-ever";
import { createNeverHaveIEverViewModel } from "./viewModel";

const players = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
];

test("renders the active answer state", () => {
  const round = createRound();
  const model = createNeverHaveIEverViewModel(
    getNeverHaveIEverSnapshot(round, "p1", "2026-06-25T12:00:05.000Z"),
    "2026-06-25T12:00:05.000Z",
  );

  assert.equal(model.screen, "answer");
  assert.equal(model.canSubmit, true);
  assert.equal(model.secondsRemaining, 25);
});

test("locks buttons after the viewer submits", () => {
  const round = submitNeverHaveIEverAnswer(
    createRound(),
    { roomId: "room-1", roundId: "round-1", playerId: "p1", answer: "never_done_it" },
    "2026-06-25T12:00:05.000Z",
  ).state;
  const model = createNeverHaveIEverViewModel(
    getNeverHaveIEverSnapshot(round, "p1", "2026-06-25T12:00:06.000Z"),
    "2026-06-25T12:00:06.000Z",
  );

  assert.equal(model.screen, "submitted");
  assert.equal(model.canSubmit, false);
  assert.equal(model.answerButtons[1].selected, true);
});

test("renders official result rows from the backend snapshot", () => {
  let round = createRound();
  round = submitNeverHaveIEverAnswer(
    round,
    { roomId: "room-1", roundId: "round-1", playerId: "p1", answer: "have_done_it" },
    "2026-06-25T12:00:01.000Z",
  ).state;
  round = submitNeverHaveIEverAnswer(
    round,
    { roomId: "room-1", roundId: "round-1", playerId: "p2", answer: "have_done_it" },
    "2026-06-25T12:00:02.000Z",
  ).state;
  round = submitNeverHaveIEverAnswer(
    round,
    { roomId: "room-1", roundId: "round-1", playerId: "p3", answer: "never_done_it" },
    "2026-06-25T12:00:03.000Z",
  ).state;

  const model = createNeverHaveIEverViewModel(
    getNeverHaveIEverSnapshot(round, "p1", "2026-06-25T12:00:04.000Z"),
    "2026-06-25T12:00:04.000Z",
  );

  assert.equal(model.screen, "result");
  assert.equal(model.totalAnswers, 3);
  assert.deepEqual(model.resultRows?.[0].nicknames, ["Ana", "Bruno"]);
  assert.equal(model.resultRows?.[0].percentage, 67);
  assert.equal(model.scoreDelta, 1);
});

function createRound() {
  return createNeverHaveIEverRound({
    roomId: "room-1",
    roundId: "round-1",
    players,
    contentLevel: "family",
    now: "2026-06-25T12:00:00.000Z",
  });
}

