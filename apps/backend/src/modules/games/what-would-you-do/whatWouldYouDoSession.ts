import {
  WHAT_WOULD_YOU_DO_DEFAULT_TOTAL_ROUNDS,
} from "../../../../../../packages/contracts/src";
import type {
  PublicPlayer,
  RoundSnapshot,
  SubmissionAck,
  WhatWouldYouDoGameEvent,
  WhatWouldYouDoGameFinishedEvent,
  WhatWouldYouDoPlayerState,
  WhatWouldYouDoPublicState,
  WhatWouldYouDoQuestion,
  WhatWouldYouDoVoteRequest,
} from "../../../../../../packages/contracts/src";
import { createRejectedSubmissionAck, type DateInput } from "../core";
import {
  getWhatWouldYouDoSnapshot,
  type WhatWouldYouDoRoundState,
} from "./whatWouldYouDoModule";
import {
  progressWhatWouldYouDoRuntimeRound,
  startWhatWouldYouDoRuntimeRound,
  submitWhatWouldYouDoRuntimeVote,
} from "./whatWouldYouDoRuntime";
import { defaultWhatWouldYouDoQuestionDeck } from "./questionDeck";

export interface WhatWouldYouDoSessionSettings {
  totalRounds: number;
}

export interface WhatWouldYouDoSessionState {
  roomId: string;
  status: "playing" | "finished";
  currentRoundNumber: number;
  totalRounds: number;
  players: PublicPlayer[];
  deck: WhatWouldYouDoQuestion[];
  usedQuestionIds: string[];
  currentRound?: WhatWouldYouDoRoundState;
}

export interface StartWhatWouldYouDoSessionInput {
  roomId: string;
  players: PublicPlayer[];
  now: DateInput;
  totalRounds?: number;
  deck?: WhatWouldYouDoQuestion[];
}

export interface WhatWouldYouDoSessionTransition {
  state: WhatWouldYouDoSessionState;
  events: WhatWouldYouDoGameEvent[];
}

export interface WhatWouldYouDoSessionVoteResult
  extends WhatWouldYouDoSessionTransition {
  ack: SubmissionAck;
}

export function startWhatWouldYouDoSession(
  input: StartWhatWouldYouDoSessionInput,
): WhatWouldYouDoSessionTransition {
  const deck = input.deck ?? defaultWhatWouldYouDoQuestionDeck;
  const totalRounds = normalizeTotalRounds(
    input.totalRounds ?? WHAT_WOULD_YOU_DO_DEFAULT_TOTAL_ROUNDS,
    deck.length,
  );
  const roundId = createSessionRoundId(input.roomId, 1);
  const startedRound = startWhatWouldYouDoRuntimeRound({
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
      deck: deck.map(cloneQuestion),
      usedQuestionIds: [startedRound.state.question.id],
      currentRound: startedRound.state,
    },
    events: [startedRound.event],
  };
}

export function progressWhatWouldYouDoSession(
  state: WhatWouldYouDoSessionState,
  now: DateInput,
): WhatWouldYouDoSessionTransition {
  if (state.status === "finished" || !state.currentRound) {
    return {
      state,
      events: [],
    };
  }

  const transition = progressWhatWouldYouDoRuntimeRound(state.currentRound, now);

  return {
    state: {
      ...state,
      currentRound: transition.state,
    },
    events: transition.events,
  };
}

export function submitWhatWouldYouDoSessionVote(
  state: WhatWouldYouDoSessionState,
  action: WhatWouldYouDoVoteRequest,
  now: DateInput,
): WhatWouldYouDoSessionVoteResult {
  if (state.status === "finished" || !state.currentRound) {
    return {
      state,
      events: [],
      ack: createRejectedSubmissionAck({
        gameMode: "what_would_you_do",
        roomId: state.roomId,
        roundId: state.currentRound?.roundId ?? "finished",
        playerId: action.playerId,
        code: "game_finished",
        message: "This what_would_you_do game is already finished.",
        lifecycleState: "finished",
      }),
    };
  }

  const voteResult = submitWhatWouldYouDoRuntimeVote(
    state.currentRound,
    action,
    now,
  );

  return {
    state: {
      ...state,
      currentRound: voteResult.state,
    },
    events: voteResult.events,
    ack: voteResult.ack,
  };
}

export function startNextWhatWouldYouDoRound(
  state: WhatWouldYouDoSessionState,
  now: DateInput,
): WhatWouldYouDoSessionTransition {
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
  const startedRound = startWhatWouldYouDoRuntimeRound({
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

export function getWhatWouldYouDoSessionSnapshot(
  state: WhatWouldYouDoSessionState,
  playerId: string | undefined,
  now: DateInput,
): {
  roomId: string;
  status: WhatWouldYouDoSessionState["status"];
  currentRoundNumber: number;
  totalRounds: number;
  currentRound?: RoundSnapshot<WhatWouldYouDoPublicState, WhatWouldYouDoPlayerState>;
} {
  return {
    roomId: state.roomId,
    status: state.status,
    currentRoundNumber: state.currentRoundNumber,
    totalRounds: state.totalRounds,
    currentRound: state.currentRound
      ? getWhatWouldYouDoSnapshot(state.currentRound, playerId, now)
      : undefined,
  };
}

function finishSession(
  state: WhatWouldYouDoSessionState,
): WhatWouldYouDoSessionTransition {
  const event: WhatWouldYouDoGameFinishedEvent = {
    type: "what_would_you_do.game_finished",
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
  deck: WhatWouldYouDoQuestion[],
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
    throw new Error("What would you do totalRounds must be a positive integer.");
  }

  if (deckSize <= 0) {
    throw new Error("What would you do requires at least one question.");
  }

  return Math.min(totalRounds, deckSize);
}

function createSessionRoundId(roomId: string, roundNumber: number): string {
  return `${roomId}_what_would_you_do_${roundNumber}`;
}

function cloneQuestion(question: WhatWouldYouDoQuestion): WhatWouldYouDoQuestion {
  return {
    ...question,
    options: [
      { ...question.options[0] },
      { ...question.options[1] },
    ],
  };
}
