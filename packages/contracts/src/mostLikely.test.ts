import assert from "node:assert/strict";
import test from "node:test";
import {
  MOST_LIKELY_GAME_MANIFEST,
  MOST_LIKELY_GAME_MODE_ID,
  MOST_LIKELY_RECOMMENDED_MIN_PLAYERS,
  MOST_LIKELY_ROUND_SECONDS,
  MOST_LIKELY_VOTING_SECONDS,
  isMostLikelyVoteRequest,
  requireMostLikelyVoteRequest,
} from "./mostLikely";

test("exports the MVP most_likely manifest with official timers", () => {
  assert.equal(MOST_LIKELY_GAME_MANIFEST.id, MOST_LIKELY_GAME_MODE_ID);
  assert.equal(MOST_LIKELY_GAME_MANIFEST.availability, "mvp");
  assert.equal(
    MOST_LIKELY_GAME_MANIFEST.rules.defaultRoundSeconds,
    MOST_LIKELY_ROUND_SECONDS,
  );
  assert.equal(
    MOST_LIKELY_GAME_MANIFEST.rules.votingSeconds,
    MOST_LIKELY_VOTING_SECONDS,
  );
  assert.equal(
    MOST_LIKELY_GAME_MANIFEST.rules.recommendedMinPlayers,
    MOST_LIKELY_RECOMMENDED_MIN_PLAYERS,
  );
});

test("validates most_likely vote requests at the contract boundary", () => {
  const request = {
    playerId: "player_1",
    questionId: "question_1",
    targetPlayerId: "player_2",
  };

  assert.equal(isMostLikelyVoteRequest(request), true);
  assert.equal(requireMostLikelyVoteRequest(request), request);
  assert.equal(isMostLikelyVoteRequest({ ...request, targetPlayerId: "" }), false);
  assert.throws(() => requireMostLikelyVoteRequest({ playerId: "player_1" }));
});
