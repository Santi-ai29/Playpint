import {
  MOST_LIKELY_GAME_MANIFEST,
  MOST_LIKELY_GAME_MODE_ID,
  WHAT_WOULD_YOU_DO_GAME_MANIFEST,
  WHAT_WOULD_YOU_DO_GAME_MODE_ID,
  type GameModeManifest,
} from "../../../../packages/contracts/src";

export interface GameModeRegistry {
  getAll(): GameModeManifest[];
  getEnabled(): GameModeManifest[];
  getById(gameModeId: string): GameModeManifest | undefined;
  requireById(gameModeId: string): GameModeManifest;
}

export function createGameModeRegistry(
  manifests: readonly GameModeManifest[],
): GameModeRegistry {
  const byId = new Map<string, GameModeManifest>();

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

export const MVP_GAME_MODE_MANIFESTS = [
  MOST_LIKELY_GAME_MANIFEST,
  WHAT_WOULD_YOU_DO_GAME_MANIFEST,
] as const;

export const gameModeRegistry = createGameModeRegistry(MVP_GAME_MODE_MANIFESTS);

export function getMvpGameModeIds(): string[] {
  return gameModeRegistry.getEnabled().map((manifest) => manifest.id);
}

export function isMvpGameMode(gameModeId: string): boolean {
  return (
    gameModeId === MOST_LIKELY_GAME_MODE_ID ||
    gameModeId === WHAT_WOULD_YOU_DO_GAME_MODE_ID
  );
}
