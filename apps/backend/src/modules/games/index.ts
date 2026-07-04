import { createGameModuleRegistry } from "./core";
import { mostLikelyGameModule } from "./most-likely";
import { stopGameModule } from "./stop";

export const MVP_GAME_MODULES = [mostLikelyGameModule, stopGameModule] as const;

export const gameModuleRegistry = createGameModuleRegistry([
  ...MVP_GAME_MODULES,
]);

export function getMvpGameModeIds(): string[] {
  return gameModuleRegistry.list().map((manifest) => manifest.id);
}

export function isMvpGameMode(gameModeId: string): boolean {
  return getMvpGameModeIds().includes(gameModeId);
}
