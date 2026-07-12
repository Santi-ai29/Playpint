import assert from "node:assert/strict";
import test from "node:test";
import {
  WHAT_WOULD_YOU_DO_DEFAULT_TOTAL_ROUNDS,
} from "../../../../../../packages/contracts/src";
import {
  createWhatWouldYouDoQuestionDeck,
  defaultWhatWouldYouDoQuestionDeck,
} from "./questionDeck";

test("ships an initial what_would_you_do question deck with two options each", () => {
  assert.ok(
    defaultWhatWouldYouDoQuestionDeck.length >=
      WHAT_WOULD_YOU_DO_DEFAULT_TOTAL_ROUNDS,
  );
  assert.equal(
    new Set(defaultWhatWouldYouDoQuestionDeck.map((question) => question.prompt)).size,
    defaultWhatWouldYouDoQuestionDeck.length,
  );
  assert.equal(
    new Set(defaultWhatWouldYouDoQuestionDeck.map((question) => question.id)).size,
    defaultWhatWouldYouDoQuestionDeck.length,
  );
  assert.equal(
    defaultWhatWouldYouDoQuestionDeck.every(
      (question) => question.options.length === 2,
    ),
    true,
  );
});

test("starts with the requested shark example and keeps option ids stable", () => {
  const deck = createWhatWouldYouDoQuestionDeck(3);

  assert.equal(deck[0]?.id, "wwyd_0001");
  assert.equal(
    deck[0]?.prompt,
    "Se um tubarao aparecesse a tua frente, o que fazias?",
  );
  assert.deepEqual(deck[0]?.options, [
    { id: "a", label: "Fugia" },
    { id: "b", label: "Ficava paralisado" },
  ]);
  assert.equal(deck[1]?.options[0].id, "a");
  assert.equal(deck[1]?.options[1].id, "b");
});

test("rejects impossible deck sizes", () => {
  assert.throws(() => createWhatWouldYouDoQuestionDeck(0));
  assert.throws(() => createWhatWouldYouDoQuestionDeck(10_000));
});
