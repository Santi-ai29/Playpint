import type {
  WhatWouldYouDoGameEvent,
  WhatWouldYouDoRoundResultEvent,
  WhatWouldYouDoRoundStartedEvent,
  WhatWouldYouDoVoteReceivedEvent,
  WhatWouldYouDoVoteRequest,
  WhatWouldYouDoVotingStartedEvent,
} from "../../../../../../packages/contracts/src";
import { isPastDeadline, type DateInput } from "../core";
import {
  createWhatWouldYouDoRound,
  finishWhatWouldYouDoRound,
  startWhatWouldYouDoVoting,
  submitWhatWouldYouDoVote,
  type CreateWhatWouldYouDoRoundInput,
  type WhatWouldYouDoRoundState,
} from "./whatWouldYouDoModule";

export interface WhatWouldYouDoRuntimeStart {
  state: WhatWouldYouDoRoundState;
  event: WhatWouldYouDoRoundStartedEvent;
}

export interface WhatWouldYouDoRuntimeTransition {
  state: WhatWouldYouDoRoundState;
  events: WhatWouldYouDoGameEvent[];
}

export interface WhatWouldYouDoRuntimeVoteResult
  extends WhatWouldYouDoRuntimeTransition {
  ack: ReturnType<typeof submitWhatWouldYouDoVote>["ack"];
}

export function startWhatWouldYouDoRuntimeRound(
  input: CreateWhatWouldYouDoRoundInput,
): WhatWouldYouDoRuntimeStart {
  const state = createWhatWouldYouDoRound(input);

  return {
    state,
    event: createRoundStartedEvent(state),
  };
}

export function progressWhatWouldYouDoRuntimeRound(
  state: WhatWouldYouDoRoundState,
  now: DateInput,
): WhatWouldYouDoRuntimeTransition {
  if (state.lifecycleState === "active" && isPastDeadline(state.roundClock, now)) {
    return openWhatWouldYouDoRuntimeVoting(state, state.roundClock.endsAt);
  }

  if (state.lifecycleState === "voting" && isPastDeadline(state.clock, now)) {
    const finished = finishWhatWouldYouDoRound(state, now);

    return {
      state: finished.state,
      events: finished.event ? [finished.event] : [],
    };
  }

  return {
    state,
    events: [],
  };
}

export function openWhatWouldYouDoRuntimeVoting(
  state: WhatWouldYouDoRoundState,
  now: DateInput,
): WhatWouldYouDoRuntimeTransition {
  const nextState = startWhatWouldYouDoVoting(state, now);

  if (state.lifecycleState !== "active" || nextState.lifecycleState !== "voting") {
    return {
      state: nextState,
      events: [],
    };
  }

  return {
    state: nextState,
    events: [createVotingStartedEvent(nextState)],
  };
}

export function submitWhatWouldYouDoRuntimeVote(
  state: WhatWouldYouDoRoundState,
  action: WhatWouldYouDoVoteRequest,
  now: DateInput,
): WhatWouldYouDoRuntimeVoteResult {
  const previousLifecycleState = state.lifecycleState;
  const result = submitWhatWouldYouDoVote(state, action, now);
  const events: WhatWouldYouDoGameEvent[] = [];

  if (result.ack.accepted) {
    events.push(createVoteReceivedEvent(result.state, action.playerId, action.optionId));
  }

  if (
    previousLifecycleState !== "result" &&
    result.state.lifecycleState === "result" &&
    result.state.result
  ) {
    events.push(createRoundFinishedEvent(result.state));
  }

  return {
    state: result.state,
    ack: result.ack,
    events,
  };
}

function createRoundStartedEvent(
  state: WhatWouldYouDoRoundState,
): WhatWouldYouDoRoundStartedEvent {
  return {
    type: "what_would_you_do.round_started",
    roomId: state.roomId,
    roundId: state.roundId,
    question: state.question,
    clock: state.roundClock,
  };
}

function createVotingStartedEvent(
  state: WhatWouldYouDoRoundState,
): WhatWouldYouDoVotingStartedEvent {
  return {
    type: "what_would_you_do.voting_started",
    roomId: state.roomId,
    roundId: state.roundId,
    questionId: state.question.id,
    clock: state.clock,
  };
}

function createVoteReceivedEvent(
  state: WhatWouldYouDoRoundState,
  voterPlayerId: string,
  optionId: string,
): WhatWouldYouDoVoteReceivedEvent {
  return {
    type: "what_would_you_do.vote_received",
    roomId: state.roomId,
    roundId: state.roundId,
    voterPlayerId,
    optionId,
    submittedCount: state.votes.length,
    totalPlayers: state.players.length,
  };
}

function createRoundFinishedEvent(
  state: WhatWouldYouDoRoundState,
): WhatWouldYouDoRoundResultEvent {
  if (!state.result) {
    throw new Error("Cannot emit what_would_you_do result event before result exists.");
  }

  return {
    type: "what_would_you_do.round_finished",
    roomId: state.roomId,
    roundId: state.roundId,
    result: state.result,
  };
}
