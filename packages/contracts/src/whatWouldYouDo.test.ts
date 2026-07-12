import assert from "node:assert/strict";
import test from "node:test";
import {
  WHAT_WOULD_YOU_DO_GAME_MANIFEST,
  WHAT_WOULD_YOU_DO_GAME_MODE_ID,
  WHAT_WOULD_YOU_DO_RECOMMENDED_MIN_PLAYERS,
  WHAT_WOULD_YOU_DO_ROUND_SECONDS,
  WHAT_WOULD_YOU_DO_VOTING_SECONDS,
  isWhatWouldYouDoVoteRequest,
  requireWhatWouldYouDoVoteRequest,
} from "./whatWouldYouDo";

test("exports the what_would_you_do MVP manifest with official timers", () => {
  assert.equal(
    WHAT_WOULD_YOU_DO_GAME_MANIFEST.id,
    WHAT_WOULD_YOU_DO_GAME_MODE_ID,
  );
  assert.equal(WHAT_WOULD_YOU_DO_GAME_MANIFEST.availability, "mvp");
  assert.equal(
    WHAT_WOULD_YOU_DO_GAME_MANIFEST.rules.defaultRoundSeconds,
    WHAT_WOULD_YOU_DO_ROUND_SECONDS,
  );
  assert.equal(
    WHAT_WOULD_YOU_DO_GAME_MANIFEST.rules.votingSeconds,
    WHAT_WOULD_YOU_DO_VOTING_SECONDS,
  );
  assert.equal(
    WHAT_WOULD_YOU_DO_GAME_MANIFEST.rules.recommendedMinPlayers,
    WHAT_WOULD_YOU_DO_RECOMMENDED_MIN_PLAYERS,
  );
  assert.deepEqual(WHAT_WOULD_YOU_DO_GAME_MANIFEST.phases, [
    "active",
    "voting",
    "submitted",
    "result",
  ]);
});

test("validates what_would_you_do vote requests at the contract boundary", () => {
  const request = {
    playerId: "player_1",
    questionId: "question_1",
    optionId: "run",
  };

  assert.equal(isWhatWouldYouDoVoteRequest(request), true);
  assert.equal(requireWhatWouldYouDoVoteRequest(request), request);
  assert.equal(isWhatWouldYouDoVoteRequest({ ...request, optionId: "" }), false);
  assert.throws(() => requireWhatWouldYouDoVoteRequest({ playerId: "p1" }));
});
