export type GameModeId = string;

export type GameModeCategory =
  | "choice"
  | "deduction"
  | "quiz"
  | "confession"
  | "creative"
  | "sensor"
  | "custom";

export type GameContentLevel = "family" | "friends" | "bar";

export type GameAvailability = "mvp" | "planned" | "experimental" | "disabled";

export type DeviceCapability =
  | "camera"
  | "microphone"
  | "gyroscope"
  | "accelerometer"
  | "touch"
  | "drawing";

export type GameLifecycleState =
  | "preparing"
  | "instructions"
  | "active"
  | "submitting"
  | "submitted"
  | "waiting"
  | "voting"
  | "result"
  | "finished";

export type GameErrorCode =
  | "round_not_active"
  | "round_already_finished"
  | "deadline_passed"
  | "duplicate_submission"
  | "invalid_submission"
  | "player_not_in_room"
  | "not_enough_players"
  | "deck_exhausted"
  | "unauthorized"
  | "internal_error";

export interface GameError {
  code: GameErrorCode;
  message: string;
}

export interface GameModeRules {
  minPlayers: number;
  maxPlayers?: number;
  defaultRoundSeconds: number;
  votingSeconds?: number;
  requiresHostModeration: boolean;
}

export interface GameManifest {
  id: GameModeId;
  title: string;
  shortTitle: string;
  category: GameModeCategory;
  description: string;
  rules: GameModeRules;
  phases: readonly GameLifecycleState[];
  lifecycle?: readonly GameLifecycleState[];
  capabilities: readonly DeviceCapability[];
  contentLevels: readonly GameContentLevel[];
  availability: GameAvailability;
}

export interface RoundClock {
  startsAt: string;
  endsAt: string;
}

export interface MediaAssetReference {
  id: string;
  kind: "avatar" | "photo" | "drawing" | "prompt_image";
  url?: string;
  expiresAt?: string;
}

export interface PlayerSummary {
  playerId: string;
  nickname: string;
  avatar?: MediaAssetReference;
  connected?: boolean;
}

export interface GameScoreDelta {
  playerId: string;
  nickname?: string;
  delta: number;
  reason: string;
}

export interface GameSubmissionAck {
  accepted: boolean;
  gameMode?: GameModeId;
  roomId?: string;
  roundId: string;
  playerId: string;
  lifecycleState?: GameLifecycleState;
  submittedAt?: string;
  acceptedAt?: string;
  errorCode?: GameErrorCode;
  message?: string;
  error?: GameError;
}

export interface GameRoundSnapshot<
  TPublicState = Record<string, never>,
  TPlayerState = Record<string, never>,
> {
  roomId: string;
  roundId: string;
  gameMode?: GameModeId;
  gameModeId?: GameModeId;
  lifecycleState: GameLifecycleState;
  clock: RoundClock;
  serverNow?: string;
  publicState: TPublicState;
  playerState?: TPlayerState;
}

export function isTerminalGameState(state: GameLifecycleState): boolean {
  return state === "result" || state === "finished";
}
