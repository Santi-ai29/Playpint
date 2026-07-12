import assert from "node:assert/strict";
import test from "node:test";
import type {
  PublicPlayer,
  WhatWouldYouDoQuestion,
} from "../../../../../../packages/contracts/src";
import { createWhatWouldYouDoGameController } from "./whatWouldYouDoController";

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
  {
    id: "q2",
    prompt: "Se a mesa pedisse uma ultima rodada, o que fazias?",
    options: [
      { id: "a", label: "Alinhava" },
      { id: "b", label: "Chamava juizo" },
    ],
    contentLevel: "bar",
  },
];

test("plays a complete what_would_you_do round through the backend controller", () => {
  const started = createWhatWouldYouDoGameController({
    roomId: "room_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 2,
    deck,
  });

  assert.deepEqual(
    started.events.map((event) => event.type),
    ["what_would_you_do.round_started"],
  );

  const opened = started.controller.tick("2026-06-25T20:00:21.000Z");
  assert.deepEqual(
    opened.events.map((event) => event.type),
    ["what_would_you_do.voting_started"],
  );
  const firstQuestionId =
    started.controller.getState().currentRound?.question.id ?? "missing";

  started.controller.submitVote(
    { playerId: "p1", questionId: firstQuestionId, optionId: "a" },
    "2026-06-25T20:00:22.000Z",
  );
  started.controller.submitVote(
    { playerId: "p2", questionId: firstQuestionId, optionId: "b" },
    "2026-06-25T20:00:23.000Z",
  );
  const roundFinished = started.controller.submitVote(
    { playerId: "p3", questionId: firstQuestionId, optionId: "a" },
    "2026-06-25T20:00:24.000Z",
  );

  assert.deepEqual(
    roundFinished.events.map((event) => event.type),
    [
      "what_would_you_do.vote_received",
      "what_would_you_do.round_finished",
    ],
  );

  const secondRound = started.controller.nextRound("2026-06-25T20:01:00.000Z");
  assert.deepEqual(
    secondRound.events.map((event) => event.type),
    ["what_would_you_do.round_started"],
  );

  const state = started.controller.getState();
  assert.equal(state.currentRoundNumber, 2);
  assert.notEqual(state.currentRound?.question.id, firstQuestionId);
});

test("returns player-specific snapshots from the controller", () => {
  const started = createWhatWouldYouDoGameController({
    roomId: "room_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 1,
    deck,
  });
  started.controller.tick("2026-06-25T20:00:21.000Z");

  const snapshot = started.controller.getSnapshot(
    "p1",
    "2026-06-25T20:00:22.000Z",
  );

  assert.equal(snapshot.status, "playing");
  assert.ok(snapshot.currentRound?.publicState.question.id);
  assert.equal(snapshot.currentRound?.playerState?.hasVoted, false);
});
