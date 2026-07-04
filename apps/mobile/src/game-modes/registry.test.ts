import assert from "node:assert/strict";
import test from "node:test";
import {
  MOST_LIKELY_GAME_MANIFEST,
  MOST_LIKELY_GAME_MODE_ID,
  STOP_GAME_MANIFEST,
  STOP_GAME_MODE_ID,
} from "../../../../packages/contracts/src";
import {
  createGameModeRegistry,
  gameModeRegistry,
  getMvpGameModeIds,
  isMvpGameMode,
} from "./registry";

test("exposes most_likely and stop as MVP game modes", () => {
  assert.deepEqual(getMvpGameModeIds(), [
    MOST_LIKELY_GAME_MODE_ID,
    STOP_GAME_MODE_ID,
  ]);
  assert.deepEqual(
    gameModeRegistry.getAll().map((manifest) => manifest.id),
    [MOST_LIKELY_GAME_MODE_ID, STOP_GAME_MODE_ID],
  );
  assert.equal(isMvpGameMode(MOST_LIKELY_GAME_MODE_ID), true);
  assert.equal(isMvpGameMode(STOP_GAME_MODE_ID), true);
  assert.equal(isMvpGameMode("quiz"), false);
});

test("builds a registry from independent game manifests", () => {
  const registry = createGameModeRegistry([
    MOST_LIKELY_GAME_MANIFEST,
    STOP_GAME_MANIFEST,
  ]);

  assert.equal(registry.requireById(MOST_LIKELY_GAME_MODE_ID).title, "Es Tu?");
  assert.equal(registry.requireById(STOP_GAME_MODE_ID).title, "Stop");
  assert.equal(registry.getEnabled().length, 2);
});

test("rejects duplicate manifest ids", () => {
  assert.throws(() =>
    createGameModeRegistry([MOST_LIKELY_GAME_MANIFEST, MOST_LIKELY_GAME_MANIFEST]),
  );
});
