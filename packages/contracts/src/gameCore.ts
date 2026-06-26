export type GameLifecycleState =
  | "instructions"
  | "active"
  | "voting"
  | "submitted"
  | "result"
  | "finished";

export type GameModeAvailability = "mvp" | "planned";

export interface GameModeRules {
  minPlayers: number;
  recommendedMinPlayers?: number;
  defaultRoundSeconds: number;
  votingSeconds?: number;
  requiresHostModeration: boolean;
}

export interface GameModeManifest {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  rules: GameModeRules;
  phases: GameLifecycleState[];
  capabilities: string[];
  contentLevels: string[];
  availability: GameModeAvailability;
}

export interface PublicPlayer {
  playerId: string;
  nickname: string;
  avatarUrl?: string;
}

export interface RoundClock {
  startsAt: string;
  endsAt: string;
}

export interface ScoreDelta {
  playerId: string;
  nickname: string;
  delta: number;
  reason: string;
}

export interface SubmissionAck {
  accepted: boolean;
  gameMode: string;
  roomId: string;
  roundId: string;
  playerId: string;
  submittedAt?: string;
  lifecycleState: GameLifecycleState;
  errorCode?: string;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface RoundSnapshot<TPublicState = unknown, TPlayerState = unknown> {
  gameMode: string;
  gameModeId: string;
  roomId: string;
  roundId: string;
  lifecycleState: GameLifecycleState;
  clock: RoundClock;
  serverNow: string;
  publicState: TPublicState;
  playerState?: TPlayerState;
}

export function isTerminalGameState(state: GameLifecycleState): boolean {
  return state === "result" || state === "finished";
}
