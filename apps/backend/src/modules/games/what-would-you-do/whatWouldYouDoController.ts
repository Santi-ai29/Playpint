import type {
  PublicPlayer,
  SubmissionAck,
  WhatWouldYouDoGameEvent,
  WhatWouldYouDoQuestion,
  WhatWouldYouDoVoteRequest,
} from "../../../../../../packages/contracts/src";
import type { DateInput } from "../core";
import {
  getWhatWouldYouDoSessionSnapshot,
  progressWhatWouldYouDoSession,
  startNextWhatWouldYouDoRound,
  startWhatWouldYouDoSession,
  submitWhatWouldYouDoSessionVote,
  type WhatWouldYouDoSessionState,
} from "./whatWouldYouDoSession";

export interface CreateWhatWouldYouDoControllerInput {
  roomId: string;
  players: PublicPlayer[];
  now: DateInput;
  totalRounds?: number;
  deck?: WhatWouldYouDoQuestion[];
}

export interface WhatWouldYouDoControllerStart {
  controller: WhatWouldYouDoGameController;
  events: WhatWouldYouDoGameEvent[];
}

export interface WhatWouldYouDoControllerTransition {
  events: WhatWouldYouDoGameEvent[];
}

export interface WhatWouldYouDoControllerVoteResult
  extends WhatWouldYouDoControllerTransition {
  ack: SubmissionAck;
}

export class WhatWouldYouDoGameController {
  private state: WhatWouldYouDoSessionState;

  constructor(initialState: WhatWouldYouDoSessionState) {
    this.state = initialState;
  }

  getState(): WhatWouldYouDoSessionState {
    return cloneSessionState(this.state);
  }

  getSnapshot(playerId: string | undefined, now: DateInput) {
    return getWhatWouldYouDoSessionSnapshot(this.state, playerId, now);
  }

  tick(now: DateInput): WhatWouldYouDoControllerTransition {
    const transition = progressWhatWouldYouDoSession(this.state, now);
    this.state = transition.state;

    return {
      events: transition.events,
    };
  }

  submitVote(
    action: WhatWouldYouDoVoteRequest,
    now: DateInput,
  ): WhatWouldYouDoControllerVoteResult {
    const result = submitWhatWouldYouDoSessionVote(this.state, action, now);
    this.state = result.state;

    return {
      ack: result.ack,
      events: result.events,
    };
  }

  nextRound(now: DateInput): WhatWouldYouDoControllerTransition {
    const transition = startNextWhatWouldYouDoRound(this.state, now);
    this.state = transition.state;

    return {
      events: transition.events,
    };
  }
}

export function createWhatWouldYouDoGameController(
  input: CreateWhatWouldYouDoControllerInput,
): WhatWouldYouDoControllerStart {
  const started = startWhatWouldYouDoSession(input);

  return {
    controller: new WhatWouldYouDoGameController(started.state),
    events: started.events,
  };
}

function cloneSessionState(
  state: WhatWouldYouDoSessionState,
): WhatWouldYouDoSessionState {
  return {
    ...state,
    players: state.players.map((player) => ({ ...player })),
    deck: state.deck.map((question) => ({
      ...question,
      options: [
        { ...question.options[0] },
        { ...question.options[1] },
      ],
    })),
    usedQuestionIds: [...state.usedQuestionIds],
    currentRound: state.currentRound
      ? {
          ...state.currentRound,
          players: state.currentRound.players.map((player) => ({ ...player })),
          question: {
            ...state.currentRound.question,
            options: [
              { ...state.currentRound.question.options[0] },
              { ...state.currentRound.question.options[1] },
            ],
          },
          votes: state.currentRound.votes.map((vote) => ({ ...vote })),
          result: state.currentRound.result
            ? {
                ...state.currentRound.result,
                winnerOptionIds: [
                  ...state.currentRound.result.winnerOptionIds,
                ],
                optionResults:
                  state.currentRound.result.optionResults.map((option) => ({
                    ...option,
                  })),
                votes: state.currentRound.result.votes.map((vote) => ({
                  ...vote,
                })),
              }
            : undefined,
        }
      : undefined,
  };
}
