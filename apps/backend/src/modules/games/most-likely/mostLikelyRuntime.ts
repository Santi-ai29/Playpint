import type {
  MostLikelyGameEvent,
  MostLikelyRoundResultEvent,
  MostLikelyRoundStartedEvent,
  MostLikelyVoteReceivedEvent,
  MostLikelyVoteRequest,
  MostLikelyVotingStartedEvent,
} from "../../../../../../packages/contracts/src";
import { isPastDeadline, type DateInput } from "../core";
import {
  createMostLikelyRound,
  finishMostLikelyRound,
  startMostLikelyVoting,
  submitMostLikelyVote,
  type CreateMostLikelyRoundInput,
  type MostLikelyRoundState,
} from "./mostLikelyModule";

export interface MostLikelyRuntimeStart {
  state: MostLikelyRoundState;
  event: MostLikelyRoundStartedEvent;
}

export interface MostLikelyRuntimeTransition {
  state: MostLikelyRoundState;
  events: MostLikelyGameEvent[];
}

export interface MostLikelyRuntimeVoteResult extends MostLikelyRuntimeTransition {
  ack: ReturnType<typeof submitMostLikelyVote>["ack"];
}

export function startMostLikelyRuntimeRound(
  input: CreateMostLikelyRoundInput,
): MostLikelyRuntimeStart {
  const state = createMostLikelyRound(input);

  return {
    state,
    event: createRoundStartedEvent(state),
  };
}

export function progressMostLikelyRuntimeRound(
  state: MostLikelyRoundState,
  now: DateInput,
): MostLikelyRuntimeTransition {
  if (state.lifecycleState === "active" && isPastDeadline(state.roundClock, now)) {
    return openMostLikelyRuntimeVoting(state, state.roundClock.endsAt);
  }

  if (state.lifecycleState === "voting" && isPastDeadline(state.clock, now)) {
    const finished = finishMostLikelyRound(state, now);

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

export function openMostLikelyRuntimeVoting(
  state: MostLikelyRoundState,
  now: DateInput,
): MostLikelyRuntimeTransition {
  const nextState = startMostLikelyVoting(state, now);

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

export function submitMostLikelyRuntimeVote(
  state: MostLikelyRoundState,
  action: MostLikelyVoteRequest,
  now: DateInput,
): MostLikelyRuntimeVoteResult {
  const previousLifecycleState = state.lifecycleState;
  const result = submitMostLikelyVote(state, action, now);
  const events: MostLikelyGameEvent[] = [];

  if (result.ack.accepted) {
    events.push(createVoteReceivedEvent(result.state, action.playerId));
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
  state: MostLikelyRoundState,
): MostLikelyRoundStartedEvent {
  return {
    type: "most_likely.round_started",
    roomId: state.roomId,
    roundId: state.roundId,
    question: state.question,
    players: state.players.map((player) => ({ ...player })),
    clock: state.roundClock,
  };
}

function createVotingStartedEvent(
  state: MostLikelyRoundState,
): MostLikelyVotingStartedEvent {
  return {
    type: "most_likely.voting_started",
    roomId: state.roomId,
    roundId: state.roundId,
    questionId: state.question.id,
    clock: state.clock,
  };
}

function createVoteReceivedEvent(
  state: MostLikelyRoundState,
  voterPlayerId: string,
): MostLikelyVoteReceivedEvent {
  return {
    type: "most_likely.vote_received",
    roomId: state.roomId,
    roundId: state.roundId,
    voterPlayerId,
    submittedCount: state.votes.length,
    totalPlayers: state.players.length,
  };
}

function createRoundFinishedEvent(
  state: MostLikelyRoundState,
): MostLikelyRoundResultEvent {
  if (!state.result) {
    throw new Error("Cannot emit most_likely result event before result exists.");
  }

  return {
    type: "most_likely.round_finished",
    roomId: state.roomId,
    roundId: state.roundId,
    result: state.result,
  };
}
