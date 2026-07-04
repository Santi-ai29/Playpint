import type {
  StopAnswerReceivedEvent,
  StopGameEvent,
  StopRoundReviewStartedEvent,
  StopRoundResultEvent,
  StopRoundStartedEvent,
  StopRoundStoppedEvent,
  StopSubmitAnswersRequest,
} from "../../../../../../packages/contracts/src";
import { isPastDeadline, type DateInput } from "../core";
import {
  closeStopRoundForReview,
  createStopRoundReview,
  createStopRound,
  finishStopRound,
  submitStopAnswers,
  type CreateStopRoundInput,
  type StopRoundState,
} from "./stopModule";

export interface StopRuntimeStart {
  state: StopRoundState;
  event: StopRoundStartedEvent;
}

export interface StopRuntimeTransition {
  state: StopRoundState;
  events: StopGameEvent[];
}

export interface StopRuntimeSubmitResult extends StopRuntimeTransition {
  ack: ReturnType<typeof submitStopAnswers>["ack"];
}

export function startStopRuntimeRound(
  input: CreateStopRoundInput & {
    roundNumber?: number;
    totalRounds?: number;
  },
): StopRuntimeStart {
  const state = createStopRound(input);

  return {
    state,
    event: createRoundStartedEvent(state, input.roundNumber, input.totalRounds),
  };
}

export function progressStopRuntimeRound(
  state: StopRoundState,
  now: DateInput,
): StopRuntimeTransition {
  if (state.lifecycleState === "active" && isPastDeadline(state.clock, now)) {
    const reviewState = closeStopRoundForReview(state, now);

    return {
      state: reviewState,
      events: [createReviewStartedEvent(reviewState)],
    };
  }

  return {
    state,
    events: [],
  };
}

export function submitStopRuntimeAnswers(
  state: StopRoundState,
  action: StopSubmitAnswersRequest,
  now: DateInput,
): StopRuntimeSubmitResult {
  const previousLifecycleState = state.lifecycleState;
  const previousStoppedByPlayerId = state.stoppedByPlayerId;
  const result = submitStopAnswers(state, action, now);
  const events: StopGameEvent[] = [];

  if (result.ack.accepted) {
    events.push(createAnswerReceivedEvent(result.state, action.playerId));
  }

  if (
    !previousStoppedByPlayerId &&
    result.state.stoppedByPlayerId &&
    result.state.lifecycleState === "submitted"
  ) {
    events.push(createRoundStoppedEvent(result.state));
  }

  if (
    previousLifecycleState === "active" &&
    result.state.lifecycleState === "submitted"
  ) {
    events.push(createReviewStartedEvent(result.state));
  }

  return {
    state: result.state,
    ack: result.ack,
    events,
  };
}

function createRoundStartedEvent(
  state: StopRoundState,
  roundNumber?: number,
  totalRounds?: number,
): StopRoundStartedEvent {
  return {
    type: "stop.round_started",
    roomId: state.roomId,
    roundId: state.roundId,
    roomName: state.roomName,
    roundNumber,
    totalRounds,
    letter: state.letter,
    categories: state.categories.map((category) => ({ ...category })),
    players: state.players.map((player) => ({ ...player })),
    clock: state.clock,
  };
}

function createAnswerReceivedEvent(
  state: StopRoundState,
  playerId: string,
): StopAnswerReceivedEvent {
  return {
    type: "stop.answer_received",
    roomId: state.roomId,
    roundId: state.roundId,
    playerId,
    submittedCount: state.submissions.length,
    totalPlayers: state.players.length,
  };
}

function createRoundStoppedEvent(
  state: StopRoundState,
): StopRoundStoppedEvent {
  const stoppedBy = state.stoppedByPlayerId
    ? state.players.find((player) => player.playerId === state.stoppedByPlayerId)
    : undefined;

  if (!stoppedBy) {
    throw new Error("Cannot emit stop event without a stopper.");
  }

  return {
    type: "stop.round_stopped",
    roomId: state.roomId,
    roundId: state.roundId,
    stoppedByPlayerId: stoppedBy.playerId,
    stoppedByNickname: stoppedBy.nickname,
  };
}

function createReviewStartedEvent(
  state: StopRoundState,
): StopRoundReviewStartedEvent {
  return {
    type: "stop.review_started",
    roomId: state.roomId,
    roundId: state.roundId,
    review: createStopRoundReview(state),
  };
}

function createRoundFinishedEvent(
  state: StopRoundState,
): StopRoundResultEvent {
  if (!state.result) {
    throw new Error("Cannot emit stop result event before result exists.");
  }

  return {
    type: "stop.round_finished",
    roomId: state.roomId,
    roundId: state.roundId,
    result: state.result,
  };
}
