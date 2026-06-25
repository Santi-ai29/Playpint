import type {
  GameManifest,
  GameRoundSnapshot,
  GameSubmissionAck,
  PlayerSummary,
} from "../../../../../../packages/contracts/src";

export interface CreateGameRoundInput {
  roomId: string;
  roundId: string;
  players: PlayerSummary[];
  now: Date | string;
}

export interface SubmitGameActionResult<TRoundState> {
  state: TRoundState;
  ack: GameSubmissionAck;
}

export interface FinishGameRoundResult<TRoundState, TResultEvent = unknown> {
  state: TRoundState;
  event?: TResultEvent;
}

export interface GameModule<
  TRoundState,
  TAction,
  TPublicState = Record<string, never>,
  TPlayerState = Record<string, never>,
> {
  manifest: GameManifest;
  createRound(input: CreateGameRoundInput): TRoundState;
  submitAction(
    state: TRoundState,
    action: TAction,
    now: Date | string,
  ): SubmitGameActionResult<TRoundState>;
  finishRound(
    state: TRoundState,
    now: Date | string,
  ): FinishGameRoundResult<TRoundState>;
  getSnapshot(
    state: TRoundState,
    playerId: string | undefined,
    now: Date | string,
  ): GameRoundSnapshot<TPublicState, TPlayerState>;
}
