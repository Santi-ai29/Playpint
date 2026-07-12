import type {
  GameModeManifest,
  RoundClock,
} from "./gameCore";

export const WHAT_WOULD_YOU_DO_GAME_MODE_ID = "what_would_you_do";
export const WHAT_WOULD_YOU_DO_ROUND_SECONDS = 20;
export const WHAT_WOULD_YOU_DO_VOTING_SECONDS = 18;
export const WHAT_WOULD_YOU_DO_MIN_PLAYERS = 2;
export const WHAT_WOULD_YOU_DO_RECOMMENDED_MIN_PLAYERS = 3;
export const WHAT_WOULD_YOU_DO_DEFAULT_TOTAL_ROUNDS = 10;

export const WHAT_WOULD_YOU_DO_GAME_MANIFEST: GameModeManifest = {
  id: WHAT_WOULD_YOU_DO_GAME_MODE_ID,
  title: "O Que Tu Fazias?",
  shortTitle: "O Que Tu Fazias?",
  category: "party_choice",
  description:
    "Escolhe uma de duas opcoes num dilema hipotetico e revela o consenso da mesa.",
  rules: {
    minPlayers: WHAT_WOULD_YOU_DO_MIN_PLAYERS,
    recommendedMinPlayers: WHAT_WOULD_YOU_DO_RECOMMENDED_MIN_PLAYERS,
    defaultRoundSeconds: WHAT_WOULD_YOU_DO_ROUND_SECONDS,
    votingSeconds: WHAT_WOULD_YOU_DO_VOTING_SECONDS,
    requiresHostModeration: false,
  },
  phases: ["active", "voting", "submitted", "result"],
  capabilities: ["touch"],
  contentLevels: ["friends", "bar"],
  availability: "mvp",
};

export interface WhatWouldYouDoOption {
  id: string;
  label: string;
}

export type WhatWouldYouDoCategoryId =
  | "dinheiro"
  | "tecnologia"
  | "social"
  | "picantes"
  | "escola"
  | "trabalho"
  | "viagens"
  | "comida"
  | "absurdas"
  | "dia_a_dia";

export interface WhatWouldYouDoQuestionCategory {
  id: WhatWouldYouDoCategoryId;
  label: string;
}

export interface WhatWouldYouDoQuestion {
  id: string;
  prompt: string;
  options: [WhatWouldYouDoOption, WhatWouldYouDoOption];
  contentLevel: "friends" | "bar";
  category?: WhatWouldYouDoQuestionCategory;
}

export interface WhatWouldYouDoVoteRequest {
  playerId: string;
  questionId: string;
  optionId: string;
}

export interface WhatWouldYouDoVoteRecord {
  voterPlayerId: string;
  voterNickname: string;
  optionId: string;
  optionLabel: string;
  submittedAt: string;
}

export interface WhatWouldYouDoOptionResult {
  optionId: string;
  label: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
}

export interface WhatWouldYouDoRoundResult {
  questionId: string;
  prompt: string;
  totalVotes: number;
  winnerOptionIds: string[];
  optionResults: WhatWouldYouDoOptionResult[];
  votes: WhatWouldYouDoVoteRecord[];
}

export interface WhatWouldYouDoGameSettings {
  totalRounds: number;
}

export interface WhatWouldYouDoGameSessionPublicState {
  roomId: string;
  status: "playing" | "finished";
  currentRoundNumber: number;
  totalRounds: number;
  currentRound?: WhatWouldYouDoPublicState;
}

export interface WhatWouldYouDoPublicState {
  question: WhatWouldYouDoQuestion;
  submittedCount: number;
  totalPlayers: number;
  result?: WhatWouldYouDoRoundResult;
}

export interface WhatWouldYouDoPlayerState {
  hasVoted: boolean;
  selectedOptionId?: string;
}

export interface WhatWouldYouDoRoundStartedEvent {
  type: "what_would_you_do.round_started";
  roomId: string;
  roundId: string;
  question: WhatWouldYouDoQuestion;
  clock: RoundClock;
}

export interface WhatWouldYouDoVotingStartedEvent {
  type: "what_would_you_do.voting_started";
  roomId: string;
  roundId: string;
  questionId: string;
  clock: RoundClock;
}

export interface WhatWouldYouDoVoteReceivedEvent {
  type: "what_would_you_do.vote_received";
  roomId: string;
  roundId: string;
  voterPlayerId: string;
  optionId: string;
  submittedCount: number;
  totalPlayers: number;
}

export interface WhatWouldYouDoRoundResultEvent {
  type: "what_would_you_do.round_finished";
  roomId: string;
  roundId: string;
  result: WhatWouldYouDoRoundResult;
}

export interface WhatWouldYouDoGameFinishedEvent {
  type: "what_would_you_do.game_finished";
  roomId: string;
}

export type WhatWouldYouDoGameEvent =
  | WhatWouldYouDoRoundStartedEvent
  | WhatWouldYouDoVotingStartedEvent
  | WhatWouldYouDoVoteReceivedEvent
  | WhatWouldYouDoRoundResultEvent
  | WhatWouldYouDoGameFinishedEvent;

export function isWhatWouldYouDoVoteRequest(
  value: unknown,
): value is WhatWouldYouDoVoteRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.playerId === "string" &&
    value.playerId.length > 0 &&
    typeof value.questionId === "string" &&
    value.questionId.length > 0 &&
    typeof value.optionId === "string" &&
    value.optionId.length > 0
  );
}

export function requireWhatWouldYouDoVoteRequest(
  value: unknown,
): WhatWouldYouDoVoteRequest {
  if (!isWhatWouldYouDoVoteRequest(value)) {
    throw new Error("Invalid what_would_you_do vote request.");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
