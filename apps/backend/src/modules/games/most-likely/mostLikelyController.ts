import type {
  MostLikelyGameEvent,
  MostLikelyQuestion,
  MostLikelyVoteRequest,
  PublicPlayer,
  SubmissionAck,
} from "../../../../../../packages/contracts/src";
import type { DateInput } from "../core";
import {
  getMostLikelySessionSnapshot,
  progressMostLikelySession,
  startMostLikelySession,
  startNextMostLikelyRound,
  submitMostLikelySessionVote,
  type MostLikelySessionState,
} from "./mostLikelySession";

export interface CreateMostLikelyControllerInput {
  roomId: string;
  players: PublicPlayer[];
  now: DateInput;
  totalRounds?: number;
  deck?: MostLikelyQuestion[];
}

export interface MostLikelyControllerStart {
  controller: MostLikelyGameController;
  events: MostLikelyGameEvent[];
}

export interface MostLikelyControllerTransition {
  events: MostLikelyGameEvent[];
}

export interface MostLikelyControllerVoteResult
  extends MostLikelyControllerTransition {
  ack: SubmissionAck;
}

export class MostLikelyGameController {
  private state: MostLikelySessionState;

  constructor(initialState: MostLikelySessionState) {
    this.state = initialState;
  }

  getState(): MostLikelySessionState {
    return cloneSessionState(this.state);
  }

  getSnapshot(playerId: string | undefined, now: DateInput) {
    return getMostLikelySessionSnapshot(this.state, playerId, now);
  }

  tick(now: DateInput): MostLikelyControllerTransition {
    const transition = progressMostLikelySession(this.state, now);
    this.state = transition.state;

    return {
      events: transition.events,
    };
  }

  submitVote(
    action: MostLikelyVoteRequest,
    now: DateInput,
  ): MostLikelyControllerVoteResult {
    const result = submitMostLikelySessionVote(this.state, action, now);
    this.state = result.state;

    return {
      ack: result.ack,
      events: result.events,
    };
  }

  nextRound(now: DateInput): MostLikelyControllerTransition {
    const transition = startNextMostLikelyRound(this.state, now);
    this.state = transition.state;

    return {
      events: transition.events,
    };
  }
}

export function createMostLikelyGameController(
  input: CreateMostLikelyControllerInput,
): MostLikelyControllerStart {
  const started = startMostLikelySession(input);

  return {
    controller: new MostLikelyGameController(started.state),
    events: started.events,
  };
}

function cloneSessionState(
  state: MostLikelySessionState,
): MostLikelySessionState {
  return {
    ...state,
    players: state.players.map((player) => ({ ...player })),
    deck: state.deck.map((question) => ({ ...question })),
    usedQuestionIds: [...state.usedQuestionIds],
    currentRound: state.currentRound
      ? {
          ...state.currentRound,
          players: state.currentRound.players.map((player) => ({ ...player })),
          question: { ...state.currentRound.question },
          votes: state.currentRound.votes.map((vote) => ({ ...vote })),
          result: state.currentRound.result
            ? {
                ...state.currentRound.result,
                winners: state.currentRound.result.winners.map((winner) => ({
                  ...winner,
                })),
                voteCounts: state.currentRound.result.voteCounts.map((count) => ({
                  ...count,
                })),
                votes: state.currentRound.result.votes.map((vote) => ({
                  ...vote,
                })),
                scoreDeltas: state.currentRound.result.scoreDeltas.map(
                  (delta) => ({ ...delta }),
                ),
              }
            : undefined,
        }
      : undefined,
    scoreboard: state.scoreboard.map((row) => ({ ...row })),
  };
}
