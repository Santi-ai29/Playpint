import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_STOP_CATEGORIES,
  STOP_DEFAULT_TOTAL_ROUNDS,
  STOP_GAME_MANIFEST,
  STOP_GAME_MODE_ID,
  STOP_RECOMMENDED_MIN_PLAYERS,
  STOP_ROUND_SECONDS,
  isStopAnswerReviewDecisionRequest,
  isStopCategoryId,
  isStopSubmitAnswersRequest,
  requireStopAnswerReviewDecisionRequest,
  requireStopSubmitAnswersRequest,
} from "./stop";

test("exports the Stop manifest and default settings", () => {
  assert.equal(STOP_GAME_MANIFEST.id, STOP_GAME_MODE_ID);
  assert.equal(STOP_GAME_MANIFEST.availability, "mvp");
  assert.equal(STOP_GAME_MANIFEST.rules.defaultRoundSeconds, STOP_ROUND_SECONDS);
  assert.equal(
    STOP_GAME_MANIFEST.rules.recommendedMinPlayers,
    STOP_RECOMMENDED_MIN_PLAYERS,
  );
  assert.equal(STOP_DEFAULT_TOTAL_ROUNDS, 6);
  assert.deepEqual(
    DEFAULT_STOP_CATEGORIES.map((category) => category.id),
    ["name", "city", "animal", "food", "object", "brand"],
  );
});

test("validates Stop submit requests at the contract boundary", () => {
  const request = {
    playerId: "p1",
    roundId: "round_1",
    answers: {
      name: "Ana",
      city: "Aveiro",
      animal: "",
    },
    stopRound: true,
  };

  assert.equal(isStopSubmitAnswersRequest(request), true);
  assert.equal(requireStopSubmitAnswersRequest(request), request);
  assert.equal(isStopSubmitAnswersRequest({ ...request, playerId: "" }), false);
  assert.equal(
    isStopSubmitAnswersRequest({
      ...request,
      answers: { unknown: "Ana" },
    }),
    false,
  );
  assert.equal(
    isStopSubmitAnswersRequest({
      ...request,
      answers: { name: 12 },
    }),
    false,
  );
  assert.throws(() => requireStopSubmitAnswersRequest({ playerId: "p1" }));
});

test("recognizes the shared Stop category ids", () => {
  assert.equal(isStopCategoryId("movie_series"), true);
  assert.equal(isStopCategoryId("picante"), false);
});

test("validates Stop review decisions at the contract boundary", () => {
  const request = {
    roundId: "round_1",
    playerId: "p1",
    categoryId: "city",
    invalidated: true,
  };

  assert.equal(isStopAnswerReviewDecisionRequest(request), true);
  assert.equal(requireStopAnswerReviewDecisionRequest(request), request);
  assert.equal(
    isStopAnswerReviewDecisionRequest({ ...request, invalidated: "yes" }),
    false,
  );
  assert.equal(
    isStopAnswerReviewDecisionRequest({ ...request, categoryId: "unknown" }),
    false,
  );
  assert.throws(() => requireStopAnswerReviewDecisionRequest({ playerId: "p1" }));
});
