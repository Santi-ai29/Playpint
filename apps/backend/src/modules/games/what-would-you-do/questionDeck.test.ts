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
  assert.ok(defaultWhatWouldYouDoQuestionDeck.length >= 100);
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

test("keeps the default questions as would-you-rather dilemmas in Portuguese", () => {
  const prompts = defaultWhatWouldYouDoQuestionDeck
    .map((question) => question.prompt.toLowerCase())
    .join(" ");

  assert.match(
    prompts,
    /telemovel|internet|amigos|trabalho|viagem|crush|segredo|dinheiro/,
  );
  assert.equal(
    defaultWhatWouldYouDoQuestionDeck.every(
      (question) =>
        question.prompt.startsWith("O que preferias") &&
        question.prompt.endsWith("?") &&
        question.options.length === 2 &&
        question.options[0].label !== question.options[1].label,
    ),
    true,
  );
});

test("starts with a dilemma and keeps option ids stable", () => {
  const deck = createWhatWouldYouDoQuestionDeck(3);

  assert.equal(deck[0]?.id, "wwyd_0001");
  assert.equal(
    deck[0]?.prompt,
    "O que preferias: ficar um mes sem telemovel ou um ano sem redes sociais?",
  );
  assert.deepEqual(deck[0]?.options, [
    { id: "a", label: "Um mes sem telemovel" },
    { id: "b", label: "Um ano sem redes sociais" },
  ]);
  assert.equal(deck[1]?.options[0].id, "a");
  assert.equal(deck[1]?.options[1].id, "b");
});

test("rejects impossible deck sizes", () => {
  assert.throws(() => createWhatWouldYouDoQuestionDeck(0));
  assert.throws(() => createWhatWouldYouDoQuestionDeck(10_000));
});
