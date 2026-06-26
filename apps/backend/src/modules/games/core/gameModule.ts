import type {
  GameModeManifest,
  PublicPlayer,
  RoundSnapshot,
  SubmissionAck,
} from "../../../../../../packages/contracts/src";
import type { DateInput } from "./roundLifecycle";

export interface CreateGameRoundInput {
  roomId: string;
  roundId: string;
  players: PublicPlayer[];
  now: DateInput;
}

export interface GameActionResult<TState> {
  state: TState;
  ack: SubmissionAck;
  event?: unknown;
}

export interface GameFinishResult<TState> {
  state: TState;
  event?: unknown;
}

export interface GameModule<TState = unknown, TAction = unknown> {
  manifest: GameModeManifest;
  createRound(input: CreateGameRoundInput & Record<string, unknown>): TState;
  submitAction(
    state: TState,
    action: TAction,
    now: DateInput,
  ): GameActionResult<TState>;
  finishRound(state: TState, now: DateInput): GameFinishResult<TState>;
  getSnapshot(
    state: TState,
    playerId: string | undefined,
    now: DateInput,
  ): RoundSnapshot;
}

export class GameModuleRegistry {
  private readonly modules = new Map<string, GameModule>();

  register(module: GameModule): void {
    if (this.modules.has(module.manifest.id)) {
      throw new Error(`Game module already registered: ${module.manifest.id}`);
    }

    this.modules.set(module.manifest.id, module);
  }

  get(gameModeId: string): GameModule {
    const module = this.modules.get(gameModeId);

    if (!module) {
      throw new Error(`Unknown game module: ${gameModeId}`);
    }

    return module;
  }

  list(): GameModeManifest[] {
    return [...this.modules.values()].map((module) => module.manifest);
  }
}

export function createGameModuleRegistry(
  modules: GameModule[] = [],
): GameModuleRegistry {
  const registry = new GameModuleRegistry();

  for (const module of modules) {
    registry.register(module);
  }

  return registry;
}
