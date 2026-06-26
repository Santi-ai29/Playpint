import assert from "node:assert/strict";
import test from "node:test";
import type {
  MostLikelyQuestion,
  PublicPlayer,
} from "../../../../../../packages/contracts/src";
import { createMostLikelyGameController } from "./mostLikelyController";

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
  {
    id: "q2",
    prompt: "Quem e mais provavel que peca mais uma rodada?",
    contentLevel: "bar",
  },
];

test("plays a complete most_likely game through the backend controller", () => {
  const started = createMostLikelyGameController({
    roomId: "room_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 2,
    deck,
  });

  assert.deepEqual(
    started.events.map((event) => event.type),
    ["most_likely.round_started"],
  );

  const opened = started.controller.tick("2026-06-25T20:00:31.000Z");
  assert.deepEqual(
    opened.events.map((event) => event.type),
    ["most_likely.voting_started"],
  );
  const firstQuestionId =
    started.controller.getState().currentRound?.question.id ?? "missing";

  started.controller.submitVote(
    { playerId: "p1", questionId: firstQuestionId, targetPlayerId: "p2" },
    "2026-06-25T20:00:32.000Z",
  );
  started.controller.submitVote(
    { playerId: "p2", questionId: firstQuestionId, targetPlayerId: "p3" },
    "2026-06-25T20:00:33.000Z",
  );
  const roundFinished = started.controller.submitVote(
    { playerId: "p3", questionId: firstQuestionId, targetPlayerId: "p2" },
    "2026-06-25T20:00:34.000Z",
  );

  assert.deepEqual(
    roundFinished.events.map((event) => event.type),
    [
      "most_likely.vote_received",
      "most_likely.round_finished",
    ],
  );

  const secondRound = started.controller.nextRound("2026-06-25T20:01:00.000Z");
  assert.deepEqual(
    secondRound.events.map((event) => event.type),
    ["most_likely.round_started"],
  );

  const state = started.controller.getState();
  assert.equal(state.currentRoundNumber, 2);
  assert.notEqual(state.currentRound?.question.id, firstQuestionId);
});

test("returns player-specific snapshots from the controller", () => {
  const started = createMostLikelyGameController({
    roomId: "room_1",
    players,
    now: "2026-06-25T20:00:00.000Z",
    totalRounds: 1,
    deck,
  });
  started.controller.tick("2026-06-25T20:00:31.000Z");

  const snapshot = started.controller.getSnapshot(
    "p1",
    "2026-06-25T20:00:32.000Z",
  );

  assert.equal(snapshot.status, "playing");
  assert.ok(snapshot.currentRound?.publicState.question.id);
  assert.equal(snapshot.currentRound?.playerState?.hasVoted, false);
});
