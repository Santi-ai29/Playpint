import type {
  GameContentLevel,
  GameManifest,
  GameRoundSnapshot,
  GameScoreDelta,
  PlayerSummary,
} from "./gameCore";

export const NEVER_HAVE_I_EVER_GAME_ID = "never_have_i_ever" as const;
export const NEVER_HAVE_I_EVER_ROUND_SECONDS = 30;

export const NEVER_HAVE_I_EVER_MANIFEST: GameManifest = {
  id: NEVER_HAVE_I_EVER_GAME_ID,
  title: "Eu Nunca",
  shortTitle: "Eu Nunca",
  category: "confession",
  description:
    "Rondas leves de confissao: quem ja fez responde em segredo e o grupo ve o resultado.",
  rules: {
    minPlayers: 3,
    maxPlayers: 12,
    defaultRoundSeconds: NEVER_HAVE_I_EVER_ROUND_SECONDS,
    votingSeconds: NEVER_HAVE_I_EVER_ROUND_SECONDS,
    requiresHostModeration: true,
  },
  phases: ["instructions", "active", "submitted", "result"],
  capabilities: ["touch"],
  contentLevels: ["family", "friends", "bar"],
  availability: "mvp",
};

export type NeverHaveIEverAnswer = "have_done_it" | "never_done_it";

export interface NeverHaveIEverPrompt {
  id: string;
  text: string;
  contentLevel: GameContentLevel;
  tags: string[];
}

export interface NeverHaveIEverAnswerRequest {
  roomId: string;
  roundId: string;
  playerId: string;
  answer: NeverHaveIEverAnswer;
}

export interface NeverHaveIEverAnswerRecord {
  playerId: string;
  answer: NeverHaveIEverAnswer;
  submittedAt: string;
}

export interface NeverHaveIEverOptionResult {
  answer: NeverHaveIEverAnswer;
  label: string;
  count: number;
  percentage: number;
  players: PlayerSummary[];
  nicknames: string[];
}

export interface NeverHaveIEverRoundResult {
  roundId: string;
  totalAnswers: number;
  options: [NeverHaveIEverOptionResult, NeverHaveIEverOptionResult];
  abstainedPlayers: PlayerSummary[];
  scoreDeltas: GameScoreDelta[];
  finishedAt: string;
}

export interface NeverHaveIEverActivePublicState {
  phase: "active";
  prompt: NeverHaveIEverPrompt;
  submittedCount: number;
  totalPlayers: number;
}

export interface NeverHaveIEverResultPublicState {
  phase: "result";
  prompt: NeverHaveIEverPrompt;
  result: NeverHaveIEverRoundResult;
}

export type NeverHaveIEverPublicState =
  | NeverHaveIEverActivePublicState
  | NeverHaveIEverResultPublicState;

export interface NeverHaveIEverPlayerState {
  hasSubmitted: boolean;
  answer?: NeverHaveIEverAnswer;
  scoreDelta?: number;
}

export type NeverHaveIEverSnapshot = GameRoundSnapshot<
  NeverHaveIEverPublicState,
  NeverHaveIEverPlayerState
>;

export function isNeverHaveIEverAnswer(
  value: unknown,
): value is NeverHaveIEverAnswer {
  return value === "have_done_it" || value === "never_done_it";
}

