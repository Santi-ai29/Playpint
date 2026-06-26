import type {
  GameModeManifest,
  PublicPlayer,
  RoundClock,
  ScoreDelta,
} from "./gameCore";

export const MOST_LIKELY_GAME_MODE_ID = "most_likely";
export const MOST_LIKELY_ROUND_SECONDS = 30;
export const MOST_LIKELY_VOTING_SECONDS = 15;
export const MOST_LIKELY_MIN_PLAYERS = 2;
export const MOST_LIKELY_RECOMMENDED_MIN_PLAYERS = 3;
export const MOST_LIKELY_POINTS_PER_RECEIVED_VOTE = 10;

export const MOST_LIKELY_GAME_MANIFEST: GameModeManifest = {
  id: MOST_LIKELY_GAME_MODE_ID,
  title: "Es Tu?",
  shortTitle: "Es Tu?",
  category: "party_vote",
  description:
    "Vota em quem e mais provavel para a pergunta da ronda e revela o consenso do grupo.",
  rules: {
    minPlayers: MOST_LIKELY_MIN_PLAYERS,
    recommendedMinPlayers: MOST_LIKELY_RECOMMENDED_MIN_PLAYERS,
    defaultRoundSeconds: MOST_LIKELY_ROUND_SECONDS,
    votingSeconds: MOST_LIKELY_VOTING_SECONDS,
    requiresHostModeration: false,
  },
  phases: ["active", "voting", "result"],
  capabilities: ["touch"],
  contentLevels: ["friends", "bar"],
  availability: "mvp",
};

export interface MostLikelyQuestion {
  id: string;
  prompt: string;
  contentLevel: "friends" | "bar";
}

export interface MostLikelyVoteRequest {
  playerId: string;
  questionId: string;
  targetPlayerId: string;
}

export interface MostLikelyVoteRecord {
  voterPlayerId: string;
  voterNickname: string;
  targetPlayerId: string;
  targetNickname: string;
  submittedAt: string;
}

export interface MostLikelyVoteCount {
  playerId: string;
  nickname: string;
  avatarUrl?: string;
  votes: number;
  percentage: number;
}

export interface MostLikelyWinner {
  playerId: string;
  nickname: string;
  avatarUrl?: string;
  votes: number;
  percentage: number;
}

export interface MostLikelyRoundResult {
  questionId: string;
  prompt: string;
  totalVotes: number;
  winners: MostLikelyWinner[];
  voteCounts: MostLikelyVoteCount[];
  votes: MostLikelyVoteRecord[];
  scoreDeltas: ScoreDelta[];
}

export interface MostLikelyPublicState {
  question: MostLikelyQuestion;
  players: PublicPlayer[];
  submittedCount: number;
  totalPlayers: number;
  result?: MostLikelyRoundResult;
}

export interface MostLikelyPlayerState {
  hasVoted: boolean;
  selectedTargetPlayerId?: string;
  points?: number;
}

export interface MostLikelyRoundStartedEvent {
  type: "most_likely.round_started";
  roomId: string;
  roundId: string;
  question: MostLikelyQuestion;
  players: PublicPlayer[];
  clock: RoundClock;
}

export interface MostLikelyVotingStartedEvent {
  type: "most_likely.voting_started";
  roomId: string;
  roundId: string;
  questionId: string;
  clock: RoundClock;
}

export interface MostLikelyVoteReceivedEvent {
  type: "most_likely.vote_received";
  roomId: string;
  roundId: string;
  voterPlayerId: string;
  submittedCount: number;
  totalPlayers: number;
}

export interface MostLikelyRoundResultEvent {
  type: "most_likely.round_finished";
  roomId: string;
  roundId: string;
  result: MostLikelyRoundResult;
}

export function isMostLikelyVoteRequest(
  value: unknown,
): value is MostLikelyVoteRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.playerId === "string" &&
    value.playerId.length > 0 &&
    typeof value.questionId === "string" &&
    value.questionId.length > 0 &&
    typeof value.targetPlayerId === "string" &&
    value.targetPlayerId.length > 0
  );
}

export function requireMostLikelyVoteRequest(
  value: unknown,
): MostLikelyVoteRequest {
  if (!isMostLikelyVoteRequest(value)) {
    throw new Error("Invalid most_likely vote request.");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
