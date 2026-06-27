import {
  MOST_LIKELY_DEFAULT_TOTAL_ROUNDS,
} from "../../../../../../packages/contracts/src";
import type {
  MostLikelyGameEvent,
  MostLikelyGameFinishedEvent,
  MostLikelyPlayerState,
  MostLikelyPublicState,
  MostLikelyQuestion,
  MostLikelyVoteRequest,
  PublicPlayer,
  RoundSnapshot,
  SubmissionAck,
} from "../../../../../../packages/contracts/src";
import { createRejectedSubmissionAck, type DateInput } from "../core";
import {
  getMostLikelySnapshot,
  type MostLikelyRoundState,
} from "./mostLikelyModule";
import {
  progressMostLikelyRuntimeRound,
  startMostLikelyRuntimeRound,
  submitMostLikelyRuntimeVote,
} from "./mostLikelyRuntime";
import { defaultMostLikelyQuestionDeck } from "./questionDeck";

export interface MostLikelySessionSettings {
  totalRounds: number;
}

export interface MostLikelySessionState {
  roomId: string;
  status: "playing" | "finished";
  currentRoundNumber: number;
  totalRounds: number;
  players: PublicPlayer[];
  deck: MostLikelyQuestion[];
  usedQuestionIds: string[];
  currentRound?: MostLikelyRoundState;
}

export interface StartMostLikelySessionInput {
  roomId: string;
  players: PublicPlayer[];
  now: DateInput;
  totalRounds?: number;
  deck?: MostLikelyQuestion[];
}

export interface MostLikelySessionTransition {
  state: MostLikelySessionState;
  events: MostLikelyGameEvent[];
}

export interface MostLikelySessionVoteResult extends MostLikelySessionTransition {
  ack: SubmissionAck;
}

export function startMostLikelySession(
  input: StartMostLikelySessionInput,
): MostLikelySessionTransition {
  const deck = input.deck ?? defaultMostLikelyQuestionDeck;
  const totalRounds = normalizeTotalRounds(
    input.totalRounds ?? MOST_LIKELY_DEFAULT_TOTAL_ROUNDS,
    deck.length,
  );
  const roundId = createSessionRoundId(input.roomId, 1);
  const startedRound = startMostLikelyRuntimeRound({
    roomId: input.roomId,
    roundId,
    players: input.players,
    now: input.now,
    deck,
    questionId: pickUnusedQuestion(deck, [], `${input.roomId}:1`),
  });

  return {
    state: {
      roomId: input.roomId,
      status: "playing",
      currentRoundNumber: 1,
      totalRounds,
      players: input.players.map((player) => ({ ...player })),
      deck: deck.map((question) => ({ ...question })),
      usedQuestionIds: [startedRound.state.question.id],
      currentRound: startedRound.state,
    },
    events: [startedRound.event],
  };
}

export function progressMostLikelySession(
  state: MostLikelySessionState,
  now: DateInput,
): MostLikelySessionTransition {
  if (state.status === "finished" || !state.currentRound) {
    return {
      state,
      events: [],
    };
  }

  const transition = progressMostLikelyRuntimeRound(state.currentRound, now);
  return applyRoundTransition(state, transition.state, transition.events);
}

export function submitMostLikelySessionVote(
  state: MostLikelySessionState,
  action: MostLikelyVoteRequest,
  now: DateInput,
): MostLikelySessionVoteResult {
  if (state.status === "finished" || !state.currentRound) {
    return {
      state,
      events: [],
      ack: createRejectedSubmissionAck({
        gameMode: "most_likely",
        roomId: state.roomId,
        roundId: state.currentRound?.roundId ?? "finished",
        playerId: action.playerId,
        code: "game_finished",
        message: "This most_likely game is already finished.",
        lifecycleState: "finished",
      }),
    };
  }

  const voteResult = submitMostLikelyRuntimeVote(state.currentRound, action, now);
  const transition = applyRoundTransition(
    state,
    voteResult.state,
    voteResult.events,
  );

  return {
    ...transition,
    ack: voteResult.ack,
  };
}

export function startNextMostLikelyRound(
  state: MostLikelySessionState,
  now: DateInput,
): MostLikelySessionTransition {
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
    return finishSession(state);
  }

  const nextRoundNumber = state.currentRoundNumber + 1;
  const startedRound = startMostLikelyRuntimeRound({
    roomId: state.roomId,
    roundId: createSessionRoundId(state.roomId, nextRoundNumber),
    players: state.players,
    now,
    deck: state.deck,
    questionId: pickUnusedQuestion(
      state.deck,
      state.usedQuestionIds,
      `${state.roomId}:${nextRoundNumber}`,
    ),
  });

  return {
    state: {
      ...state,
      currentRoundNumber: nextRoundNumber,
      usedQuestionIds: [...state.usedQuestionIds, startedRound.state.question.id],
      currentRound: startedRound.state,
    },
    events: [startedRound.event],
  };
}

export function getMostLikelySessionSnapshot(
  state: MostLikelySessionState,
  playerId: string | undefined,
  now: DateInput,
): {
  roomId: string;
  status: MostLikelySessionState["status"];
  currentRoundNumber: number;
  totalRounds: number;
  currentRound?: RoundSnapshot<MostLikelyPublicState, MostLikelyPlayerState>;
} {
  return {
    roomId: state.roomId,
    status: state.status,
    currentRoundNumber: state.currentRoundNumber,
    totalRounds: state.totalRounds,
    currentRound: state.currentRound
      ? getMostLikelySnapshot(state.currentRound, playerId, now)
      : undefined,
  };
}

function applyRoundTransition(
  state: MostLikelySessionState,
  round: MostLikelyRoundState,
  events: MostLikelyGameEvent[],
): MostLikelySessionTransition {
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

  return {
    state: {
      ...state,
      currentRound: round,
    },
    events,
  };
}

function finishSession(
  state: MostLikelySessionState,
): MostLikelySessionTransition {
  const event: MostLikelyGameFinishedEvent = {
    type: "most_likely.game_finished",
    roomId: state.roomId,
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

function pickUnusedQuestion(
  deck: MostLikelyQuestion[],
  usedQuestionIds: string[],
  seed: string,
): string {
  const unusedQuestions = deck.filter(
    (question) => !usedQuestionIds.includes(question.id),
  );
  const question =
    unusedQuestions[hashString(seed) % Math.max(1, unusedQuestions.length)];

  if (question) {
    return question.id;
  }

  return deck[0]?.id ?? "";
}

function hashString(value: string): number {
  return [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}

function normalizeTotalRounds(totalRounds: number, deckSize: number): number {
  if (!Number.isInteger(totalRounds) || totalRounds <= 0) {
    throw new Error("Most likely totalRounds must be a positive integer.");
  }

  if (deckSize <= 0) {
    throw new Error("Most likely requires at least one question.");
  }

  return Math.min(totalRounds, deckSize);
}

function createSessionRoundId(roomId: string, roundNumber: number): string {
  return `${roomId}_most_likely_${roundNumber}`;
}
