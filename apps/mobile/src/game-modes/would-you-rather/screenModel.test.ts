import assert from "node:assert/strict";
import test from "node:test";

import {
  finishWouldYouRatherRound,
  getWouldYouRatherSnapshot,
  startWouldYouRatherRound,
  submitWouldYouRatherVote,
} from "../../../../backend/src/modules/games/would-you-rather";
import { createWouldYouRatherScreenModel } from "./screenModel";

const players = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
];

test("shows the answer phase before the player votes", () => {
  const round = startWouldYouRatherRound({
    roomId: "room-1",
    roundId: "round-1",
    players,
    now: "2026-06-25T12:00:00.000Z",
  }).state;
  const model = createWouldYouRatherScreenModel(
    getWouldYouRatherSnapshot(round, "p1", "2026-06-25T12:00:05.000Z"),
    "2026-06-25T12:00:05.000Z",
  );

  assert.equal(model.phase, "answer");
  assert.equal(model.secondsRemaining, 10);
  assert.equal(model.options[0].disabled, false);
});

test("locks the options after a submitted vote", () => {
  const round = startWouldYouRatherRound({
    roomId: "room-1",
    roundId: "round-2",
    players,
    now: "2026-06-25T12:00:00.000Z",
  }).state;
  const voted = submitWouldYouRatherVote(
    round,
    { roomId: "room-1", roundId: "round-2", playerId: "p1", optionId: "B" },
    "2026-06-25T12:00:01.000Z",
  ).state;
  const model = createWouldYouRatherScreenModel(
    getWouldYouRatherSnapshot(voted, "p1", "2026-06-25T12:00:02.000Z"),
    "2026-06-25T12:00:02.000Z",
  );

  assert.equal(model.phase, "waiting");
  assert.equal(model.options[1].selected, true);
  assert.equal(model.options[0].disabled, true);
});

test("renders official result percentages and nicknames", () => {
  let round = startWouldYouRatherRound({
    roomId: "room-1",
    roundId: "round-3",
    players,
    now: "2026-06-25T12:00:00.000Z",
  }).state;
  round = submitWouldYouRatherVote(
    round,
    { roomId: "room-1", roundId: "round-3", playerId: "p1", optionId: "A" },
    "2026-06-25T12:00:01.000Z",
  ).state;
  const finished = finishWouldYouRatherRound(round, "2026-06-25T12:00:15.000Z")
    .state;
  const model = createWouldYouRatherScreenModel(
    getWouldYouRatherSnapshot(finished, "p1"),
  );

  assert.equal(model.phase, "result");
  assert.equal(model.totalVotes, 1);
  assert.equal(model.options[0].percentage, 100);
  assert.deepEqual(model.options[0].nicknames, ["Ana"]);
});
