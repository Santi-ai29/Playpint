import assert from "node:assert/strict";
import test from "node:test";
import type { GameModeManifest, RoundSnapshot } from "../../../../../../packages/contracts/src";
import { createGameModuleRegistry, type GameModule } from "./gameModule";

const manifest: GameModeManifest = {
  id: "demo_game",
  title: "Demo Game",
  shortTitle: "Demo",
  category: "demo",
  description: "Test-only module.",
  rules: {
    minPlayers: 2,
    defaultRoundSeconds: 15,
    requiresHostModeration: false,
  },
  phases: ["active", "result"],
  capabilities: ["touch"],
  contentLevels: ["friends"],
  availability: "mvp",
};

const fakeModule: GameModule<Record<string, string>, { playerId: string }> = {
  manifest,
  createRound: () => ({ roundId: "round_1" }),
  submitAction: (state, action) => ({
    state,
    ack: {
      accepted: true,
      gameMode: manifest.id,
      roomId: "room_1",
      roundId: state.roundId,
      playerId: action.playerId,
      lifecycleState: "active",
    },
  }),
  finishRound: (state) => ({ state }),
  getSnapshot: (): RoundSnapshot => ({
    gameMode: manifest.id,
    gameModeId: manifest.id,
    roomId: "room_1",
    roundId: "round_1",
    lifecycleState: "active",
    clock: {
      startsAt: "2026-06-25T20:00:00.000Z",
      endsAt: "2026-06-25T20:00:15.000Z",
    },
    serverNow: "2026-06-25T20:00:01.000Z",
    publicState: {},
  }),
};

test("registers and returns game modules by manifest id", () => {
  const registry = createGameModuleRegistry([fakeModule]);

  assert.equal(registry.get("demo_game"), fakeModule);
  assert.deepEqual(registry.list(), [manifest]);
});

test("rejects duplicate game modules", () => {
  assert.throws(
    () => createGameModuleRegistry([fakeModule, fakeModule]),
    /already registered/,
  );
});
