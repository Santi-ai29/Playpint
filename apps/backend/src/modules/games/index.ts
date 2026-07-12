import {
  MOST_LIKELY_GAME_MODE_ID,
  WHAT_WOULD_YOU_DO_GAME_MODE_ID,
} from "../../../../../packages/contracts/src";
import { createGameModuleRegistry } from "./core";
import { mostLikelyGameModule } from "./most-likely";
import { whatWouldYouDoGameModule } from "./what-would-you-do";

export const MVP_GAME_MODULES = [
  mostLikelyGameModule,
  whatWouldYouDoGameModule,
] as const;

export const gameModuleRegistry = createGameModuleRegistry([
  ...MVP_GAME_MODULES,
]);

export function getMvpGameModeIds(): string[] {
  return gameModuleRegistry.list().map((manifest) => manifest.id);
}

export function isMvpGameMode(gameModeId: string): boolean {
  return (
    gameModeId === MOST_LIKELY_GAME_MODE_ID ||
    gameModeId === WHAT_WOULD_YOU_DO_GAME_MODE_ID
  );
}
