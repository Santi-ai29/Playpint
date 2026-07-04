import {
  DEFAULT_STOP_CATEGORIES,
  DEFAULT_STOP_LETTERS,
  STOP_DEFAULT_TOTAL_ROUNDS,
  STOP_GAME_MODE_ID,
  STOP_ROUND_SECONDS,
  type PublicPlayer,
  type RoundSnapshot,
  type StopCategory,
  type StopGameEvent,
  type StopGameFinishedEvent,
  type StopGameSettings,
  type StopOverallRankingEntry,
  type StopPlayerState,
  type StopPublicState,
  type StopSubmitAnswersRequest,
  type SubmissionAck,
} from "../../../../../../packages/contracts/src";
import { createRejectedSubmissionAck, type DateInput } from "../core";
import {
  getStopSnapshot,
  normalizeRoundLetter,
  normalizeStopCategories,
  pickStopLetter,
  type StopRoundState,
} from "./stopModule";
import {
  progressStopRuntimeRound,
  startStopRuntimeRound,
  submitStopRuntimeAnswers,
} from "./stopRuntime";

export interface StopSessionState {
  roomId: string;
  roomName: string;
  status: "playing" | "finished";
  currentRoundNumber: number;
  totalRounds: number;
  roundSeconds: number;
  players: PublicPlayer[];
  categories: StopCategory[];
  letters: string[];
  usedLetters: string[];
  overallRanking: StopOverallRankingEntry[];
  currentRound?: StopRoundState;
}

export interface StartStopSessionInput {
  roomId: string;
  roomName?: string;
  players: PublicPlayer[];
  now: DateInput;
  totalRounds?: number;
  roundSeconds?: number;
  categories?: readonly StopCategory[];
  letters?: readonly string[];
}

export interface StopSessionTransition {
  state: StopSessionState;
  events: StopGameEvent[];
}

export interface StopSessionSubmitResult extends StopSessionTransition {
  ack: SubmissionAck;
}

export function startStopSession(
  input: StartStopSessionInput,
): StopSessionTransition {
  const categories = normalizeStopCategories(
    input.categories ?? DEFAULT_STOP_CATEGORIES,
  );
  const letters = normalizeStopLetters(input.letters ?? DEFAULT_STOP_LETTERS);
  const totalRounds = normalizeTotalRounds(
    input.totalRounds ?? STOP_DEFAULT_TOTAL_ROUNDS,
  );
  const roomName = normalizeRoomName(input.roomName);
  const roundSeconds = normalizeRoundSeconds(
    input.roundSeconds ?? STOP_ROUND_SECONDS,
  );
  const firstLetter = pickUnusedLetter(letters, [], `${input.roomId}:1`);
  const startedRound = startStopRuntimeRound({
    roomId: input.roomId,
    roomName,
    roundId: createSessionRoundId(input.roomId, 1),
    players: input.players,
    now: input.now,
    durationSeconds: roundSeconds,
    categories,
    letter: firstLetter,
    roundNumber: 1,
    totalRounds,
  });

  return {
    state: {
      roomId: input.roomId,
      roomName,
      status: "playing",
      currentRoundNumber: 1,
      totalRounds,
      roundSeconds,
      players: input.players.map((player) => ({ ...player })),
      categories,
      letters,
      usedLetters: [startedRound.state.letter],
      overallRanking: createEmptyRanking(input.players),
      currentRound: startedRound.state,
    },
    events: [startedRound.event],
  };
}

export function progressStopSession(
  state: StopSessionState,
  now: DateInput,
): StopSessionTransition {
  if (state.status === "finished" || !state.currentRound) {
    return {
      state,
      events: [],
    };
  }

  const transition = progressStopRuntimeRound(state.currentRound, now);

  return applyRoundTransition(state, transition.state, transition.events);
}

export function submitStopSessionAnswers(
  state: StopSessionState,
  action: StopSubmitAnswersRequest,
  now: DateInput,
): StopSessionSubmitResult {
  if (state.status === "finished" || !state.currentRound) {
    return {
      state,
      events: [],
      ack: createRejectedSubmissionAck({
        gameMode: STOP_GAME_MODE_ID,
        roomId: state.roomId,
        roundId: state.currentRound?.roundId ?? "finished",
        playerId: action.playerId,
        code: "game_finished",
        message: "This Stop game is already finished.",
        lifecycleState: "finished",
      }),
    };
  }

  const submitResult = submitStopRuntimeAnswers(state.currentRound, action, now);
  const transition = applyRoundTransition(
    state,
    submitResult.state,
    submitResult.events,
  );

  return {
    ...transition,
    ack: submitResult.ack,
  };
}

export function startNextStopRound(
  state: StopSessionState,
  now: DateInput,
): StopSessionTransition {
  if (state.status === "finished") {
    return {
      state,
      events: [],
    };
  }

  if (state.currentRound && state.currentRound.lifecycleState !== "result") {
    return {
      state,
      events: [],
    };
  }

  if (state.currentRoundNumber >= state.totalRounds) {
    return finishStopSession(state);
  }

  const nextRoundNumber = state.currentRoundNumber + 1;
  const nextLetter = pickUnusedLetter(
    state.letters,
    state.usedLetters,
    `${state.roomId}:${nextRoundNumber}`,
  );
  const startedRound = startStopRuntimeRound({
    roomId: state.roomId,
    roomName: state.roomName,
    roundId: createSessionRoundId(state.roomId, nextRoundNumber),
    players: state.players,
    now,
    durationSeconds: state.roundSeconds,
    categories: state.categories,
    letter: nextLetter,
    roundNumber: nextRoundNumber,
    totalRounds: state.totalRounds,
  });

  return {
    state: {
      ...state,
      currentRoundNumber: nextRoundNumber,
      usedLetters: [...state.usedLetters, startedRound.state.letter],
      currentRound: startedRound.state,
    },
    events: [startedRound.event],
  };
}

export function getStopSessionSnapshot(
  state: StopSessionState,
  playerId: string | undefined,
  now: DateInput,
): {
  roomId: string;
  roomName: string;
  status: StopSessionState["status"];
  currentRoundNumber: number;
  totalRounds: number;
  settings: StopGameSettings;
  overallRanking: StopOverallRankingEntry[];
  currentRound?: RoundSnapshot<StopPublicState, StopPlayerState>;
} {
  return {
    roomId: state.roomId,
    roomName: state.roomName,
    status: state.status,
    currentRoundNumber: state.currentRoundNumber,
    totalRounds: state.totalRounds,
    settings: {
      roomName: state.roomName,
      totalRounds: state.totalRounds,
      roundSeconds: state.roundSeconds,
      categories: state.categories.map((category) => ({ ...category })),
    },
    overallRanking: state.overallRanking.map((entry) => ({ ...entry })),
    currentRound: state.currentRound
      ? getStopSnapshot(state.currentRound, playerId, now)
      : undefined,
  };
}

function applyRoundTransition(
  state: StopSessionState,
  round: StopRoundState,
  events: StopGameEvent[],
): StopSessionTransition {
  const roundJustFinished =
    state.currentRound?.lifecycleState !== "result" &&
    round.lifecycleState === "result" &&
    Boolean(round.result);

  if (!roundJustFinished || !round.result) {
    return {
      state: {
        ...state,
        currentRound: round,
      },
      events,
    };
  }

  const overallRanking = updateOverallRanking(
    state.overallRanking,
    state.players,
    round.result.playerScores,
  );
  const roundWithRanking: StopRoundState = {
    ...round,
    result: {
      ...round.result,
      overallRanking,
    },
  };
  const eventsWithRanking = events.map((event) =>
    event.type === "stop.round_finished"
      ? {
          ...event,
          result: {
            ...event.result,
            overallRanking,
          },
        }
      : event,
  );

  return {
    state: {
      ...state,
      overallRanking,
      currentRound: roundWithRanking,
    },
    events: eventsWithRanking,
  };
}

function finishStopSession(
  state: StopSessionState,
): StopSessionTransition {
  const event: StopGameFinishedEvent = {
    type: "stop.game_finished",
    roomId: state.roomId,
    overallRanking: state.overallRanking.map((entry) => ({ ...entry })),
  };

  return {
    state: {
      ...state,
      status: "finished",
      currentRound: undefined,
    },
    events: [event],
  };
}

function updateOverallRanking(
  currentRanking: StopOverallRankingEntry[],
  players: PublicPlayer[],
  roundScores: readonly { playerId: string; totalScore: number }[],
): StopOverallRankingEntry[] {
  const currentByPlayerId = new Map(
    currentRanking.map((entry) => [entry.playerId, entry]),
  );
  const roundScoreByPlayerId = new Map(
    roundScores.map((score) => [score.playerId, score.totalScore]),
  );
  const topRoundScore = Math.max(0, ...roundScores.map((score) => score.totalScore));

  return players
    .map((player) => {
      const previous = currentByPlayerId.get(player.playerId);
      const lastRoundScore = roundScoreByPlayerId.get(player.playerId) ?? 0;
      const wonRound = topRoundScore > 0 && lastRoundScore === topRoundScore;

      return {
        rank: 0,
        playerId: player.playerId,
        nickname: player.nickname,
        ...(player.avatarUrl ? { avatarUrl: player.avatarUrl } : {}),
        totalScore: (previous?.totalScore ?? 0) + lastRoundScore,
        roundsWon: (previous?.roundsWon ?? 0) + (wonRound ? 1 : 0),
        lastRoundScore,
      };
    })
    .sort(
      (left, right) =>
        right.totalScore - left.totalScore ||
        right.roundsWon - left.roundsWon ||
        left.nickname.localeCompare(right.nickname) ||
        left.playerId.localeCompare(right.playerId),
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

function createEmptyRanking(
  players: readonly PublicPlayer[],
): StopOverallRankingEntry[] {
  return players
    .map((player, index) => ({
      rank: index + 1,
      playerId: player.playerId,
      nickname: player.nickname,
      ...(player.avatarUrl ? { avatarUrl: player.avatarUrl } : {}),
      totalScore: 0,
      roundsWon: 0,
      lastRoundScore: 0,
    }))
    .sort(
      (left, right) =>
        left.nickname.localeCompare(right.nickname) ||
        left.playerId.localeCompare(right.playerId),
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

function pickUnusedLetter(
  letters: readonly string[],
  usedLetters: readonly string[],
  seed: string,
): string {
  const unusedLetters = letters.filter((letter) => !usedLetters.includes(letter));

  if (unusedLetters.length > 0) {
    return pickStopLetter(seed, unusedLetters);
  }

  return pickStopLetter(seed, letters);
}

function normalizeStopLetters(letters: readonly string[]): string[] {
  const normalized = [...new Set(letters.map(normalizeRoundLetter))];

  if (normalized.length === 0) {
    throw new Error("Stop requires at least one playable letter.");
  }

  return normalized;
}

function normalizeTotalRounds(totalRounds: number): number {
  if (!Number.isInteger(totalRounds) || totalRounds <= 0) {
    throw new Error("Stop totalRounds must be a positive integer.");
  }

  return Math.min(totalRounds, 30);
}

function normalizeRoundSeconds(roundSeconds: number): number {
  if (!Number.isFinite(roundSeconds) || roundSeconds < 15) {
    throw new Error("Stop roundSeconds must be at least 15.");
  }

  return Math.min(Math.round(roundSeconds), 240);
}

function normalizeRoomName(roomName: string | undefined): string {
  return roomName?.trim().slice(0, 24) || "Stop";
}

function createSessionRoundId(roomId: string, roundNumber: number): string {
  return `${roomId}_stop_${roundNumber}`;
}
