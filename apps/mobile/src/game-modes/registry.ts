import type { GameManifest, GameModeId } from "../../../../packages/contracts/src";

export interface GameModeRegistry {
  getAll(): readonly GameManifest[];
  getEnabled(): readonly GameManifest[];
  getById(gameModeId: GameModeId): GameManifest | undefined;
  requireById(gameModeId: GameModeId): GameManifest;
}

export function createGameModeRegistry(
  manifests: readonly GameManifest[],
): GameModeRegistry {
  const byId = new Map<GameModeId, GameManifest>();

  for (const manifest of manifests) {
    if (byId.has(manifest.id)) {
      throw new Error(`Duplicate game manifest id: ${manifest.id}`);
    }
    byId.set(manifest.id, manifest);
  }

  return {
    getAll: () => [...byId.values()],
    getEnabled: () =>
      [...byId.values()].filter((manifest) => manifest.availability === "mvp"),
    getById: (gameModeId) => byId.get(gameModeId),
    requireById: (gameModeId) => {
      const manifest = byId.get(gameModeId);
      if (!manifest) {
        throw new Error(`Unknown game mode: ${gameModeId}`);
      }
      return manifest;
    },
  };
}

export const EMPTY_GAME_MODE_REGISTRY = createGameModeRegistry([]);
