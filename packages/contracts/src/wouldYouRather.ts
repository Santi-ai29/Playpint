import type {
  GameManifest,
  GameRoundSnapshot,
  GameScoreDelta,
  GameSubmissionAck,
  PlayerSummary,
  RoundClock,
} from "./gameCore";

export const WOULD_YOU_RATHER_GAME_ID = "would_you_rather" as const;
export const WOULD_YOU_RATHER_ROUND_SECONDS = 15;

export type WouldYouRatherOptionId = "A" | "B";

export interface WouldYouRatherQuestion {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  contentLevel: "family" | "friends" | "bar";
  tags: string[];
}

export interface WouldYouRatherVoteRequest {
  roomId: string;
  roundId: string;
  playerId: string;
  optionId: WouldYouRatherOptionId;
}

export interface WouldYouRatherVoteAck extends GameSubmissionAck {
  optionId?: WouldYouRatherOptionId;
  alreadySubmitted?: boolean;
}

export interface WouldYouRatherOptionResult {
  optionId: WouldYouRatherOptionId;
  label: string;
  voteCount: number;
  percentage: number;
  players: PlayerSummary[];
  nicknames: string[];
}

export interface WouldYouRatherRoundResult {
  roundId: string;
  totalVotes: number;
  results: [WouldYouRatherOptionResult, WouldYouRatherOptionResult];
  didNotVotePlayers: PlayerSummary[];
  scoreDeltas: GameScoreDelta[];
  finishedAt: string;
}

export interface WouldYouRatherPublicState {
  question: WouldYouRatherQuestion;
  totalPlayers: number;
  submittedCount: number;
  result?: WouldYouRatherRoundResult;
}

export interface WouldYouRatherPlayerState {
  hasSubmitted: boolean;
  selectedOptionId?: WouldYouRatherOptionId;
  scoreDelta?: number;
}

export type WouldYouRatherSnapshot = GameRoundSnapshot<
  WouldYouRatherPublicState,
  WouldYouRatherPlayerState
>;

export interface WouldYouRatherRoundStartedEvent {
  type: "game:would_you_rather_round_started";
  version: 1;
  roomId: string;
  roundId: string;
  question: WouldYouRatherQuestion;
  clock: RoundClock;
}

export interface WouldYouRatherRoundResultEvent {
  type: "game:would_you_rather_round_result";
  version: 1;
  roomId: string;
  roundId: string;
  result: WouldYouRatherRoundResult;
}

export const WOULD_YOU_RATHER_MANIFEST: GameManifest = {
  id: WOULD_YOU_RATHER_GAME_ID,
  title: "Voce Prefere",
  shortTitle: "Prefere",
  category: "choice",
  description:
    "Perguntas com duas opcoes sarcasticas, voto rapido e resultados por percentagem.",
  rules: {
    minPlayers: 2,
    maxPlayers: 12,
    defaultRoundSeconds: WOULD_YOU_RATHER_ROUND_SECONDS,
    votingSeconds: WOULD_YOU_RATHER_ROUND_SECONDS,
    requiresHostModeration: false,
  },
  phases: ["instructions", "active", "waiting", "result"],
  capabilities: ["touch"],
  contentLevels: ["family", "friends", "bar"],
  availability: "mvp",
};

export function isWouldYouRatherOptionId(
  value: unknown,
): value is WouldYouRatherOptionId {
  return value === "A" || value === "B";
}
