import type {
  PublicPlayer,
  StopCategory,
  StopGameEvent,
  StopAnswerReviewDecisionRequest,
  StopSubmitAnswersRequest,
  SubmissionAck,
} from "../../../../../../packages/contracts/src";
import type { DateInput } from "../core";
import {
  finishStopSessionReview,
  getStopSessionSnapshot,
  progressStopSession,
  setStopSessionAnswerReviewDecision,
  startNextStopRound,
  startStopSession,
  submitStopSessionAnswers,
  type StopSessionState,
} from "./stopSession";

export interface CreateStopControllerInput {
  roomId: string;
  roomName?: string;
  players: PublicPlayer[];
  now: DateInput;
  totalRounds?: number;
  roundSeconds?: number;
  categories?: readonly StopCategory[];
}

export interface StopControllerStart {
  controller: StopGameController;
  events: StopGameEvent[];
}

export interface StopControllerTransition {
  events: StopGameEvent[];
}

export interface StopControllerSubmitResult extends StopControllerTransition {
  ack: SubmissionAck;
}

export interface StopControllerReviewDecisionResult
  extends StopControllerTransition {
  ack: SubmissionAck;
}

export class StopGameController {
  private state: StopSessionState;

  constructor(initialState: StopSessionState) {
    this.state = initialState;
  }

  getState(): StopSessionState {
    return cloneStopSessionState(this.state);
  }

  getSnapshot(playerId: string | undefined, now: DateInput) {
    return getStopSessionSnapshot(this.state, playerId, now);
  }

  tick(now: DateInput): StopControllerTransition {
    const transition = progressStopSession(this.state, now);
    this.state = transition.state;

    return {
      events: transition.events,
    };
  }

  submitAnswers(
    action: StopSubmitAnswersRequest,
    now: DateInput,
  ): StopControllerSubmitResult {
    const result = submitStopSessionAnswers(this.state, action, now);
    this.state = result.state;

    return {
      ack: result.ack,
      events: result.events,
    };
  }

  setAnswerReviewDecision(
    action: StopAnswerReviewDecisionRequest,
    now: DateInput,
  ): StopControllerReviewDecisionResult {
    const result = setStopSessionAnswerReviewDecision(this.state, action, now);
    this.state = result.state;

    return {
      ack: result.ack,
      events: result.events,
    };
  }

  finishReview(now: DateInput): StopControllerTransition {
    const transition = finishStopSessionReview(this.state, now);
    this.state = transition.state;

    return {
      events: transition.events,
    };
  }

  nextRound(now: DateInput): StopControllerTransition {
    const transition = startNextStopRound(this.state, now);
    this.state = transition.state;

    return {
      events: transition.events,
    };
  }
}

export function createStopGameController(
  input: CreateStopControllerInput,
): StopControllerStart {
  const started = startStopSession(input);

  return {
    controller: new StopGameController(started.state),
    events: started.events,
  };
}

function cloneStopSessionState(state: StopSessionState): StopSessionState {
  return {
    ...state,
    players: state.players.map((player) => ({ ...player })),
    categories: state.categories.map((category) => ({ ...category })),
    letters: [...state.letters],
    usedLetters: [...state.usedLetters],
    overallRanking: state.overallRanking.map((entry) => ({ ...entry })),
    currentRound: state.currentRound
      ? {
          ...state.currentRound,
          players: state.currentRound.players.map((player) => ({ ...player })),
          categories: state.currentRound.categories.map((category) => ({
            ...category,
          })),
          submissions: state.currentRound.submissions.map((submission) => ({
            ...submission,
            answers: { ...submission.answers },
          })),
          reviewDecisions: state.currentRound.reviewDecisions.map(
            (decision) => ({ ...decision }),
          ),
          result: state.currentRound.result
            ? {
                ...state.currentRound.result,
                categoryResults:
                  state.currentRound.result.categoryResults.map((result) => ({
                    category: { ...result.category },
                    answers: result.answers.map((answer) => ({ ...answer })),
                  })),
                playerScores: state.currentRound.result.playerScores.map(
                  (score) => ({
                    ...score,
                    categoryScores: { ...score.categoryScores },
                  }),
                ),
                scoreDeltas: state.currentRound.result.scoreDeltas.map(
                  (delta) => ({ ...delta }),
                ),
                overallRanking:
                  state.currentRound.result.overallRanking?.map((entry) => ({
                    ...entry,
                  })),
              }
            : undefined,
        }
      : undefined,
  };
}
