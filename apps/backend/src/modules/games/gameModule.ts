import type {
  GameManifest,
  GameModeId,
  GameRoundSnapshot,
  GameSubmissionAck,
  PlayerSummary,
} from "../../../../../packages/contracts/src";

export interface GameRoundContext {
  roomId: string;
  roundId: string;
  players: PlayerSummary[];
  startsAt: string;
  endsAt: string;
}

export interface GameStartResult<
  TState,
  TPublicState = unknown,
  TPlayerState = unknown,
> {
  state: TState;
  snapshot: GameRoundSnapshot<TPublicState, TPlayerState>;
}

export interface GameSubmissionResult<
  TState,
  TPublicState = unknown,
  TPlayerState = unknown,
> {
  state: TState;
  ack: GameSubmissionAck;
  snapshot?: GameRoundSnapshot<TPublicState, TPlayerState>;
}

export interface GameFinishResult<
  TState,
  TPublicState = unknown,
  TPlayerState = unknown,
> {
  state: TState;
  snapshot: GameRoundSnapshot<TPublicState, TPlayerState>;
}

export interface GameModule<
  TStartInput = unknown,
  TSubmission = unknown,
  TState = unknown,
  TPublicState = unknown,
  TPlayerState = unknown,
> {
  manifest: GameManifest;
  startRound(
    input: TStartInput,
    context: GameRoundContext,
  ): GameStartResult<TState, TPublicState, TPlayerState>;
  submit(
    state: TState,
    submission: TSubmission,
    playerId: string,
  ): GameSubmissionResult<TState, TPublicState, TPlayerState>;
  finishRound(state: TState): GameFinishResult<TState, TPublicState, TPlayerState>;
  getSnapshot(state: TState, playerId?: string): GameRoundSnapshot<TPublicState, TPlayerState>;
}

export class GameModuleRegistry {
  private readonly modules = new Map<GameModeId, GameModule>();

  register(module: GameModule): void {
    if (this.modules.has(module.manifest.id)) {
      throw new Error(`Game module already registered: ${module.manifest.id}`);
    }

    this.modules.set(module.manifest.id, module);
  }

  get(gameModeId: GameModeId): GameModule {
    const module = this.modules.get(gameModeId);

    if (!module) {
      throw new Error(`Unknown game module: ${gameModeId}`);
    }

    return module;
  }

  list(): GameManifest[] {
    return [...this.modules.values()].map((module) => module.manifest);
  }
}

export function createGameModuleRegistry(
  modules: readonly GameModule[] = [],
): GameModuleRegistry {
  const registry = new GameModuleRegistry();

  for (const module of modules) {
    registry.register(module);
  }

  return registry;
}
