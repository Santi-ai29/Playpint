import assert from "node:assert/strict";
import test from "node:test";
import {
  MOST_LIKELY_GAME_MANIFEST,
  MOST_LIKELY_GAME_MODE_ID,
} from "../../../../packages/contracts/src";
import {
  createGameModeRegistry,
  gameModeRegistry,
  getMvpGameModeIds,
  isMvpGameMode,
} from "./registry";

test("exposes only most_likely as the MVP game mode", () => {
  assert.deepEqual(getMvpGameModeIds(), [MOST_LIKELY_GAME_MODE_ID]);
  assert.deepEqual(
    gameModeRegistry.getAll().map((manifest) => manifest.id),
    [MOST_LIKELY_GAME_MODE_ID],
  );
  assert.equal(isMvpGameMode(MOST_LIKELY_GAME_MODE_ID), true);
  assert.equal(isMvpGameMode("quiz"), false);
});

test("builds a registry from independent game manifests", () => {
  const registry = createGameModeRegistry([MOST_LIKELY_GAME_MANIFEST]);

  assert.equal(registry.requireById(MOST_LIKELY_GAME_MODE_ID).title, "Es Tu?");
  assert.equal(registry.getEnabled().length, 1);
});

test("rejects duplicate manifest ids", () => {
  assert.throws(() =>
    createGameModeRegistry([MOST_LIKELY_GAME_MANIFEST, MOST_LIKELY_GAME_MANIFEST]),
  );
});
