import assert from "node:assert/strict";
import test from "node:test";
import {
  MOST_LIKELY_DEFAULT_TOTAL_ROUNDS,
} from "../../../../../../packages/contracts/src";
import {
  createMostLikelyQuestionDeck,
  defaultMostLikelyQuestionDeck,
} from "./questionDeck";

test("ships a large most_likely question bank without repeated prompts", () => {
  assert.equal(defaultMostLikelyQuestionDeck.length, 1000);
  assert.equal(
    new Set(defaultMostLikelyQuestionDeck.map((question) => question.prompt)).size,
    defaultMostLikelyQuestionDeck.length,
  );
  assert.equal(
    new Set(defaultMostLikelyQuestionDeck.map((question) => question.id)).size,
    defaultMostLikelyQuestionDeck.length,
  );
  assert.ok(defaultMostLikelyQuestionDeck.length >= MOST_LIKELY_DEFAULT_TOTAL_ROUNDS);
});

test("keeps the default questions in a bar-friendly spicy tone", () => {
  const prompts = defaultMostLikelyQuestionDeck
    .slice(0, 150)
    .map((question) => question.prompt.toLowerCase())
    .join(" ");

  assert.match(prompts, /ex|crush|ciumes|flirte|mensagem|olhares/);
  assert.equal(
    defaultMostLikelyQuestionDeck.every(
      (question) => question.contentLevel === "bar",
    ),
    true,
  );
});

test("can build a smaller deterministic deck for tests and previews", () => {
  const deck = createMostLikelyQuestionDeck(12);

  assert.equal(deck.length, 12);
  assert.equal(deck[0]?.id, "ml_0001");
  assert.equal(new Set(deck.map((question) => question.prompt)).size, 12);
  assert.ok(
    deck.filter((question) => question.prompt.includes("numa noite de bar"))
      .length < deck.length / 2,
  );
});
