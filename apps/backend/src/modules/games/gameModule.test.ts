import assert from "node:assert/strict";
import test from "node:test";

import type { GameManifest, GameRoundSnapshot } from "../../../../../packages/contracts/src";
import {
  createGameModuleRegistry,
  type GameModule,
  type GameRoundContext,
} from "./gameModule";

const manifest: GameManifest = {
  id: "would_you_rather",
  title: "Voce Prefere",
  shortTitle: "Prefere",
  category: "choice",
  description: "Modulo falso usado apenas para testar o registo.",
  rules: {
    minPlayers: 2,
    defaultRoundSeconds: 15,
    requiresHostModeration: false,
  },
  phases: ["instructions", "active", "result"],
  capabilities: ["touch"],
  contentLevels: ["family", "friends", "bar"],
  availability: "mvp",
};

interface FakeState {
  roundId: string;
}

const fakeModule: GameModule<unknown, unknown, FakeState> = {
  manifest,
  startRound(_input: unknown, context: GameRoundContext) {
    const state = { roundId: context.roundId };
    return { state, snapshot: snapshot(context) };
  },
  submit(state: FakeState, _submission: unknown, playerId: string) {
    return {
      state,
      ack: {
        accepted: true,
        roundId: state.roundId,
        playerId,
        submittedAt: "2026-06-25T12:00:00.000Z",
      },
    };
  },
  finishRound(state: FakeState) {
    return {
      state,
      snapshot: {
        ...snapshot({ roomId: "room_1", roundId: state.roundId }),
        lifecycleState: "result",
      },
    };
  },
  getSnapshot(_state: FakeState) {
    return snapshot({ roomId: "room_1", roundId: "round_1" });
  },
};

test("registers and returns game modules by manifest id", () => {
  const registry = createGameModuleRegistry([fakeModule]);

  assert.equal(registry.get("would_you_rather"), fakeModule);
  assert.deepEqual(registry.list(), [manifest]);
});

test("rejects duplicate game modules", () => {
  assert.throws(
    () => createGameModuleRegistry([fakeModule, fakeModule]),
    /already registered/,
  );
});

function snapshot(input: Partial<GameRoundContext>): GameRoundSnapshot {
  return {
    roomId: input.roomId ?? "room_1",
    roundId: input.roundId ?? "round_1",
    gameMode: "would_you_rather",
    lifecycleState: "active",
    clock: {
      startsAt: input.startsAt ?? "2026-06-25T12:00:00.000Z",
      endsAt: input.endsAt ?? "2026-06-25T12:00:15.000Z",
    },
    publicState: {},
  };
}
