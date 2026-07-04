import type {
  GameModeManifest,
  PublicPlayer,
  RoundClock,
  ScoreDelta,
} from "./gameCore";

export const STOP_GAME_MODE_ID = "stop";
export const STOP_ROUND_SECONDS = 90;
export const STOP_FINAL_COUNTDOWN_SECONDS = 0;
export const STOP_MIN_PLAYERS = 2;
export const STOP_RECOMMENDED_MIN_PLAYERS = 3;
export const STOP_DEFAULT_TOTAL_ROUNDS = 6;

export const STOP_CATEGORY_IDS = [
  "name",
  "city",
  "animal",
  "food",
  "object",
  "brand",
  "movie_series",
  "profession",
  "celebrity",
  "spicy",
] as const;

export type StopCategoryId = (typeof STOP_CATEGORY_IDS)[number];

export interface StopCategory {
  id: StopCategoryId;
  label: string;
  placeholder: string;
  tone: "classic" | "culture" | "playpint";
}

export type StopAnswers = Partial<Record<StopCategoryId, string>>;

export interface StopGameSettings {
  roomName: string;
  totalRounds: number;
  roundSeconds: number;
  categories: StopCategory[];
}

export interface StopSubmitAnswersRequest {
  playerId: string;
  roundId: string;
  answers: StopAnswers;
  stopRound?: boolean;
}

export type StopAnswerScoreReason =
  | "empty"
  | "wrong_letter"
  | "duplicate"
  | "unique"
  | "invalid";

export interface StopScoredAnswer {
  playerId: string;
  nickname: string;
  categoryId: StopCategoryId;
  categoryLabel: string;
  answer: string;
  normalizedAnswer: string;
  valid: boolean;
  points: number;
  reason: StopAnswerScoreReason;
}

export interface StopCategoryResult {
  category: StopCategory;
  answers: StopScoredAnswer[];
}

export type StopCategoryScoreMap = Partial<Record<StopCategoryId, number>>;

export interface StopPlayerRoundScore {
  playerId: string;
  nickname: string;
  avatarUrl?: string;
  totalScore: number;
  categoryScores: StopCategoryScoreMap;
}

export interface StopOverallRankingEntry {
  rank: number;
  playerId: string;
  nickname: string;
  avatarUrl?: string;
  totalScore: number;
  roundsWon: number;
  lastRoundScore: number;
}

export interface StopRoundResult {
  letter: string;
  stoppedByPlayerId?: string;
  stoppedByNickname?: string;
  totalSubmissions: number;
  categoryResults: StopCategoryResult[];
  playerScores: StopPlayerRoundScore[];
  scoreDeltas: ScoreDelta[];
  overallRanking?: StopOverallRankingEntry[];
}

export interface StopPublicState {
  roomName?: string;
  letter: string;
  categories: StopCategory[];
  players: PublicPlayer[];
  submittedCount: number;
  totalPlayers: number;
  stoppedByPlayerId?: string;
  stoppedByNickname?: string;
  result?: StopRoundResult;
}

export interface StopPlayerState {
  hasSubmitted: boolean;
  submittedAt?: string;
  answers?: StopAnswers;
}

export interface StopGameSessionPublicState {
  roomId: string;
  roomName: string;
  status: "playing" | "finished";
  currentRoundNumber: number;
  totalRounds: number;
  settings: StopGameSettings;
  overallRanking: StopOverallRankingEntry[];
  currentRound?: StopPublicState;
}

export interface StopRoundStartedEvent {
  type: "stop.round_started";
  roomId: string;
  roundId: string;
  roomName?: string;
  roundNumber?: number;
  totalRounds?: number;
  letter: string;
  categories: StopCategory[];
  players: PublicPlayer[];
  clock: RoundClock;
}

export interface StopAnswerReceivedEvent {
  type: "stop.answer_received";
  roomId: string;
  roundId: string;
  playerId: string;
  submittedCount: number;
  totalPlayers: number;
}

export interface StopRoundStoppedEvent {
  type: "stop.round_stopped";
  roomId: string;
  roundId: string;
  stoppedByPlayerId: string;
  stoppedByNickname: string;
}

export interface StopRoundResultEvent {
  type: "stop.round_finished";
  roomId: string;
  roundId: string;
  result: StopRoundResult;
}

export interface StopGameFinishedEvent {
  type: "stop.game_finished";
  roomId: string;
  overallRanking: StopOverallRankingEntry[];
}

export type StopGameEvent =
  | StopRoundStartedEvent
  | StopAnswerReceivedEvent
  | StopRoundStoppedEvent
  | StopRoundResultEvent
  | StopGameFinishedEvent;

export const STOP_CATEGORY_CATALOG: readonly StopCategory[] = [
  {
    id: "name",
    label: "Nome",
    placeholder: "Nome proprio",
    tone: "classic",
  },
  {
    id: "city",
    label: "Cidade",
    placeholder: "Cidade ou lugar",
    tone: "classic",
  },
  {
    id: "animal",
    label: "Animal",
    placeholder: "Animal",
    tone: "classic",
  },
  {
    id: "food",
    label: "Comida",
    placeholder: "Comida ou bebida",
    tone: "classic",
  },
  {
    id: "object",
    label: "Objeto",
    placeholder: "Objeto da mesa",
    tone: "classic",
  },
  {
    id: "brand",
    label: "Marca",
    placeholder: "Marca",
    tone: "culture",
  },
  {
    id: "movie_series",
    label: "Filme/Serie",
    placeholder: "Filme ou serie",
    tone: "culture",
  },
  {
    id: "profession",
    label: "Profissao",
    placeholder: "Profissao",
    tone: "culture",
  },
  {
    id: "celebrity",
    label: "Celebridade",
    placeholder: "Celebridade",
    tone: "culture",
  },
  {
    id: "spicy",
    label: "Picante",
    placeholder: "Resposta de mesa",
    tone: "playpint",
  },
] as const;

export const DEFAULT_STOP_CATEGORIES: readonly StopCategory[] = [
  STOP_CATEGORY_CATALOG[0],
  STOP_CATEGORY_CATALOG[1],
  STOP_CATEGORY_CATALOG[2],
  STOP_CATEGORY_CATALOG[3],
  STOP_CATEGORY_CATALOG[4],
  STOP_CATEGORY_CATALOG[5],
] as const;

export const DEFAULT_STOP_LETTERS: readonly string[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "I",
  "J",
  "L",
  "M",
  "N",
  "O",
  "P",
  "R",
  "S",
  "T",
  "V",
] as const;

export const STOP_GAME_MANIFEST: GameModeManifest = {
  id: STOP_GAME_MODE_ID,
  title: "Stop",
  shortTitle: "Stop",
  category: "word_race",
  description:
    "Preenche categorias com a letra da ronda, carrega Stop e disputa pontos por respostas unicas.",
  rules: {
    minPlayers: STOP_MIN_PLAYERS,
    recommendedMinPlayers: STOP_RECOMMENDED_MIN_PLAYERS,
    defaultRoundSeconds: STOP_ROUND_SECONDS,
    requiresHostModeration: false,
  },
  phases: ["active", "submitted", "result"],
  capabilities: ["touch", "text_input"],
  contentLevels: ["friends", "bar"],
  availability: "mvp",
};

export function isStopSubmitAnswersRequest(
  value: unknown,
): value is StopSubmitAnswersRequest {
  if (!isRecord(value) || !isRecord(value.answers)) {
    return false;
  }

  if (
    typeof value.playerId !== "string" ||
    value.playerId.length === 0 ||
    typeof value.roundId !== "string" ||
    value.roundId.length === 0
  ) {
    return false;
  }

  if (
    "stopRound" in value &&
    typeof value.stopRound !== "undefined" &&
    typeof value.stopRound !== "boolean"
  ) {
    return false;
  }

  return Object.entries(value.answers).every(
    ([categoryId, answer]) =>
      isStopCategoryId(categoryId) && typeof answer === "string",
  );
}

export function requireStopSubmitAnswersRequest(
  value: unknown,
): StopSubmitAnswersRequest {
  if (!isStopSubmitAnswersRequest(value)) {
    throw new Error("Invalid stop submit answers request.");
  }

  return value;
}

export function isStopCategoryId(value: string): value is StopCategoryId {
  return STOP_CATEGORY_IDS.includes(value as StopCategoryId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
