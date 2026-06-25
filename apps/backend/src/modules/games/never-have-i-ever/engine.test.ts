import assert from "node:assert/strict";
import { test } from "node:test";

import type { PlayerSummary } from "../../../../../../packages/contracts/src";
import {
  createNeverHaveIEverRound,
  finishNeverHaveIEverRound,
  getNeverHaveIEverSnapshot,
  selectNeverHaveIEverPrompt,
  submitNeverHaveIEverAnswer,
} from "./engine";
import { NEVER_HAVE_I_EVER_PROMPTS } from "./prompts";

const players: PlayerSummary[] = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
];

test("creates a round with a safe prompt and a 30 second deadline", () => {
  const round = createRound();

  assert.equal(round.prompt.contentLevel, "family");
  assert.equal(round.clock.startsAt, "2026-06-25T12:00:00.000Z");
  assert.equal(round.clock.endsAt, "2026-06-25T12:00:30.000Z");
});

test("accepts one answer per player and rejects duplicates", () => {
  const first = submitNeverHaveIEverAnswer(
    createRound(),
    answer("p1", "have_done_it"),
    "2026-06-25T12:00:05.000Z",
  );

  assert.equal(first.ack.accepted, true);

  const duplicate = submitNeverHaveIEverAnswer(
    first.state,
    answer("p1", "never_done_it"),
    "2026-06-25T12:00:06.000Z",
  );

  assert.equal(duplicate.ack.accepted, false);
  assert.equal(duplicate.ack.error?.code, "duplicate_submission");
});

test("rejects invalid answers, outsiders and late answers", () => {
  const round = createRound();

  const invalid = submitNeverHaveIEverAnswer(
    round,
    answer("p1", "maybe" as "have_done_it"),
    "2026-06-25T12:00:05.000Z",
  );
  assert.equal(invalid.ack.error?.code, "invalid_submission");

  const outsider = submitNeverHaveIEverAnswer(
    round,
    answer("p4", "have_done_it"),
    "2026-06-25T12:00:05.000Z",
  );
  assert.equal(outsider.ack.error?.code, "player_not_in_room");

  const late = submitNeverHaveIEverAnswer(
    round,
    answer("p1", "have_done_it"),
    "2026-06-25T12:00:30.000Z",
  );
  assert.equal(late.ack.error?.code, "deadline_passed");
});

test("keeps active snapshots private and restores the viewer answer", () => {
  const submitted = submitNeverHaveIEverAnswer(
    createRound(),
    answer("p1", "have_done_it"),
    "2026-06-25T12:00:05.000Z",
  ).state;
  const ownSnapshot = getNeverHaveIEverSnapshot(
    submitted,
    "p1",
    "2026-06-25T12:00:06.000Z",
  );
  const otherSnapshot = getNeverHaveIEverSnapshot(
    submitted,
    "p2",
    "2026-06-25T12:00:06.000Z",
  );

  assert.equal(ownSnapshot.publicState.phase, "active");
  assert.equal(ownSnapshot.playerState?.answer, "have_done_it");
  assert.equal(otherSnapshot.playerState?.answer, undefined);
});

test("finishes when all players answer and calculates official result", () => {
  let round = createRound();
  round = submitNeverHaveIEverAnswer(round, answer("p1", "have_done_it"), "2026-06-25T12:00:01.000Z").state;
  round = submitNeverHaveIEverAnswer(round, answer("p2", "never_done_it"), "2026-06-25T12:00:02.000Z").state;
  round = submitNeverHaveIEverAnswer(round, answer("p3", "have_done_it"), "2026-06-25T12:00:03.000Z").state;

  assert.equal(round.lifecycleState, "result");
  assert.equal(round.result?.totalAnswers, 3);
  assert.deepEqual(round.result?.options.map((option) => option.percentage), [67, 33]);
  assert.deepEqual(round.result?.options[0].nicknames, ["Ana", "Carla"]);
  assert.deepEqual(round.result?.scoreDeltas.map((delta) => delta.delta), [1, 1, 1]);
});

test("finishes manually with zero answers and keeps the operation idempotent", () => {
  const finished = finishNeverHaveIEverRound(
    createRound(),
    "2026-06-25T12:00:30.000Z",
  );
  const finishedAgain = finishNeverHaveIEverRound(
    finished,
    "2026-06-25T12:00:31.000Z",
  );

  assert.equal(finished.result?.totalAnswers, 0);
  assert.deepEqual(finished.result?.options.map((option) => option.percentage), [0, 0]);
  assert.equal(finished.result?.abstainedPlayers.length, 3);
  assert.equal(finishedAgain.result?.finishedAt, finished.result?.finishedAt);
});

test("selects prompts by content level and reports exhausted decks", () => {
  const first = selectNeverHaveIEverPrompt({
    promptDeck: NEVER_HAVE_I_EVER_PROMPTS,
    usedPromptIds: [],
    contentLevel: "family",
  });

  assert.equal(first.contentLevel, "family");
  assert.throws(() =>
    selectNeverHaveIEverPrompt({
      promptDeck: [first],
      usedPromptIds: [first.id],
      contentLevel: "family",
    }),
  );
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

function answer(
  playerId: string,
  answerValue: "have_done_it" | "never_done_it",
) {
  return {
    roomId: "room-1",
    roundId: "round-1",
    playerId,
    answer: answerValue,
  };
}

