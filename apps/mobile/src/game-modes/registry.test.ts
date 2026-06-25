import assert from "node:assert/strict";
import test from "node:test";
import type { GameManifest } from "../../../../packages/contracts/src";
import { createGameModeRegistry } from "./registry";

const manifest: GameManifest = {
  id: "demo_game",
  title: "Demo Game",
  shortTitle: "Demo",
  category: "custom",
  description: "A test-only manifest.",
  rules: {
    minPlayers: 2,
    defaultRoundSeconds: 15,
    requiresHostModeration: false,
  },
  phases: ["instructions", "active", "result"],
  capabilities: ["touch"],
  contentLevels: ["family"],
  availability: "mvp",
};

test("builds a registry from independent game manifests", () => {
  const registry = createGameModeRegistry([manifest]);

  assert.equal(registry.getAll().length, 1);
  assert.equal(registry.getEnabled().length, 1);
  assert.equal(registry.requireById("demo_game").title, "Demo Game");
});

test("rejects duplicate manifest ids", () => {
  assert.throws(() => createGameModeRegistry([manifest, manifest]));
});
