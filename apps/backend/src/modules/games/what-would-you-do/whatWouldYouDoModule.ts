import {
  WHAT_WOULD_YOU_DO_GAME_MANIFEST,
  WHAT_WOULD_YOU_DO_GAME_MODE_ID,
  WHAT_WOULD_YOU_DO_ROUND_SECONDS,
  WHAT_WOULD_YOU_DO_VOTING_SECONDS,
  requireWhatWouldYouDoVoteRequest,
  type PublicPlayer,
  type RoundClock,
  type RoundSnapshot,
  type SubmissionAck,
  type WhatWouldYouDoPlayerState,
  type WhatWouldYouDoPublicState,
  type WhatWouldYouDoQuestion,
  type WhatWouldYouDoRoundResult,
  type WhatWouldYouDoRoundResultEvent,
  type WhatWouldYouDoVoteRecord,
  type WhatWouldYouDoVoteRequest,
} from "../../../../../../packages/contracts/src";
import type { GameModule } from "../core";
import {
  createRejectedSubmissionAck,
  createRoundClock,
  createRoundSnapshot,
  createSubmissionAck,
  findPlayer,
  hasPlayerSubmitted,
  isPastDeadline,
  shouldFinishRound,
  toIso,
  type DateInput,
} from "../core";
import { defaultWhatWouldYouDoQuestionDeck } from "./questionDeck";

export interface CreateWhatWouldYouDoRoundInput {
  roomId: string;
  roundId: string;
  players: PublicPlayer[];
  now: DateInput;
  deck?: WhatWouldYouDoQuestion[];
  questionId?: string;
  roundDurationSeconds?: number;
}

export interface WhatWouldYouDoRoundState {
  gameModeId: typeof WHAT_WOULD_YOU_DO_GAME_MODE_ID;
  roomId: string;
  roundId: string;
  lifecycleState: "active" | "voting" | "result";
  clock: RoundClock;
  roundClock: RoundClock;
  votingClock?: RoundClock;
  players: PublicPlayer[];
  question: WhatWouldYouDoQuestion;
  votes: WhatWouldYouDoVoteRecord[];
  result?: WhatWouldYouDoRoundResult;
  closedAt?: string;
}

export const whatWouldYouDoGameModule: GameModule<
  WhatWouldYouDoRoundState,
  WhatWouldYouDoVoteRequest
> = {
  manifest: WHAT_WOULD_YOU_DO_GAME_MANIFEST,
  createRound: createWhatWouldYouDoRound,
  submitAction: submitWhatWouldYouDoVote,
  finishRound: finishWhatWouldYouDoRound,
  getSnapshot: getWhatWouldYouDoSnapshot,
};

export function createWhatWouldYouDoRound(
  input: CreateWhatWouldYouDoRoundInput,
): WhatWouldYouDoRoundState {
  if (input.players.length < WHAT_WOULD_YOU_DO_GAME_MANIFEST.rules.minPlayers) {
    throw new Error("What would you do requires at least two players.");
  }

  const roundClock = createRoundClock({
    now: input.now,
    durationSeconds:
      input.roundDurationSeconds ?? WHAT_WOULD_YOU_DO_ROUND_SECONDS,
  });

  return {
    gameModeId: WHAT_WOULD_YOU_DO_GAME_MODE_ID,
    roomId: input.roomId,
    roundId: input.roundId,
    lifecycleState: "active",
    clock: roundClock,
    roundClock,
    players: input.players.map((player) => ({ ...player })),
    question: selectQuestion(
      input.deck ?? defaultWhatWouldYouDoQuestionDeck,
      input.roundId,
      input.questionId,
    ),
    votes: [],
  };
}

export function startWhatWouldYouDoVoting(
  state: WhatWouldYouDoRoundState,
  now: DateInput = state.roundClock.endsAt,
): WhatWouldYouDoRoundState {
  if (state.lifecycleState === "result" || state.lifecycleState === "voting") {
    return state;
  }

  const votingClock = createRoundClock({
    now,
    durationSeconds: WHAT_WOULD_YOU_DO_VOTING_SECONDS,
  });

  return {
    ...state,
    lifecycleState: "voting",
    clock: votingClock,
    votingClock,
  };
}

export function submitWhatWouldYouDoVote(
  state: WhatWouldYouDoRoundState,
  rawAction: WhatWouldYouDoVoteRequest,
  now: DateInput,
): {
  state: WhatWouldYouDoRoundState;
  ack: SubmissionAck;
} {
  let action: WhatWouldYouDoVoteRequest;

  try {
    action = requireWhatWouldYouDoVoteRequest(rawAction);
  } catch {
    return {
      state,
      ack: rejectWhatWouldYouDoVote(
        state,
        rawAction?.playerId ?? "unknown",
        "invalid_submission",
      ),
    };
  }

  const votingState = ensureVotingWindow(state, now);

  if (votingState.lifecycleState === "active") {
    return {
      state: votingState,
      ack: rejectWhatWouldYouDoVote(
        votingState,
        action.playerId,
        "voting_not_open",
      ),
    };
  }

  if (votingState.lifecycleState === "result") {
    return {
      state: votingState,
      ack: rejectWhatWouldYouDoVote(
        votingState,
        action.playerId,
        "round_already_finished",
      ),
    };
  }

  if (isPastDeadline(votingState.clock, now)) {
    const closedState = closeWhatWouldYouDoRound(votingState, now);

    return {
      state: closedState,
      ack: rejectWhatWouldYouDoVote(
        closedState,
        action.playerId,
        "deadline_passed",
      ),
    };
  }

  const voter = findPlayer(votingState.players, action.playerId);

  if (!voter) {
    return {
      state: votingState,
      ack: rejectWhatWouldYouDoVote(
        votingState,
        action.playerId,
        "player_not_in_room",
      ),
    };
  }

  if (action.questionId !== votingState.question.id) {
    return {
      state: votingState,
      ack: rejectWhatWouldYouDoVote(
        votingState,
        action.playerId,
        "question_mismatch",
      ),
    };
  }

  const option = votingState.question.options.find(
    (item) => item.id === action.optionId,
  );

  if (!option) {
    return {
      state: votingState,
      ack: rejectWhatWouldYouDoVote(
        votingState,
        action.playerId,
        "option_not_in_question",
      ),
    };
  }

  if (
    hasPlayerSubmitted(
      votingState.votes,
      action.playerId,
      (vote) => vote.voterPlayerId,
    )
  ) {
    return {
      state: votingState,
      ack: rejectWhatWouldYouDoVote(
        votingState,
        action.playerId,
        "duplicate_vote",
      ),
    };
  }

  const nextState: WhatWouldYouDoRoundState = {
    ...votingState,
    votes: [
      ...votingState.votes,
      {
        voterPlayerId: voter.playerId,
        voterNickname: voter.nickname,
        optionId: option.id,
        optionLabel: option.label,
        submittedAt: toIso(now),
      },
    ],
  };

  const resolvedState = shouldFinishRound({
    clock: nextState.clock,
    now,
    submittedPlayerIds: nextState.votes.map((vote) => vote.voterPlayerId),
    totalPlayers: nextState.players.length,
  })
    ? closeWhatWouldYouDoRound(nextState, now)
    : nextState;

  return {
    state: resolvedState,
    ack: createSubmissionAck({
      gameMode: WHAT_WOULD_YOU_DO_GAME_MODE_ID,
      roomId: state.roomId,
      roundId: state.roundId,
      playerId: action.playerId,
      submittedAt: now,
      lifecycleState: resolvedState.lifecycleState,
    }),
  };
}

export function finishWhatWouldYouDoRound(
  state: WhatWouldYouDoRoundState,
  now: DateInput,
): {
  state: WhatWouldYouDoRoundState;
  event?: WhatWouldYouDoRoundResultEvent;
} {
  const votingState =
    state.lifecycleState === "active"
      ? startWhatWouldYouDoVoting(state, state.roundClock.endsAt)
      : state;
  const closedState = closeWhatWouldYouDoRound(votingState, now);

  return {
    state: closedState,
    event: closedState.result
      ? {
          type: "what_would_you_do.round_finished",
          roomId: closedState.roomId,
          roundId: closedState.roundId,
          result: closedState.result,
        }
      : undefined,
  };
}

export function getWhatWouldYouDoSnapshot(
  state: WhatWouldYouDoRoundState,
  playerId: string | undefined,
  now: DateInput,
): RoundSnapshot<WhatWouldYouDoPublicState, WhatWouldYouDoPlayerState> {
  return createRoundSnapshot({
    gameMode: WHAT_WOULD_YOU_DO_GAME_MODE_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    lifecycleState: state.lifecycleState,
    clock: state.clock,
    serverNow: now,
    publicState: createPublicState(state),
    playerState: playerId ? createPlayerState(state, playerId) : undefined,
  });
}

function ensureVotingWindow(
  state: WhatWouldYouDoRoundState,
  now: DateInput,
): WhatWouldYouDoRoundState {
  if (state.lifecycleState !== "active") {
    return state;
  }

  return isPastDeadline(state.roundClock, now)
    ? startWhatWouldYouDoVoting(state, state.roundClock.endsAt)
    : state;
}

function closeWhatWouldYouDoRound(
  state: WhatWouldYouDoRoundState,
  now: DateInput,
): WhatWouldYouDoRoundState {
  if (state.lifecycleState === "result" && state.result) {
    return state;
  }

  return {
    ...state,
    lifecycleState: "result",
    result: createWhatWouldYouDoResult(state),
    closedAt: toIso(now),
  };
}

function createPublicState(
  state: WhatWouldYouDoRoundState,
): WhatWouldYouDoPublicState {
  return {
    question: cloneQuestion(state.question),
    submittedCount: state.votes.length,
    totalPlayers: state.players.length,
    result: state.lifecycleState === "result" ? state.result : undefined,
  };
}

function createPlayerState(
  state: WhatWouldYouDoRoundState,
  playerId: string,
): WhatWouldYouDoPlayerState {
  const vote = state.votes.find((item) => item.voterPlayerId === playerId);

  return {
    hasVoted: Boolean(vote),
    selectedOptionId: vote?.optionId,
  };
}

function createWhatWouldYouDoResult(
  state: WhatWouldYouDoRoundState,
): WhatWouldYouDoRoundResult {
  const totalVotes = state.votes.length;
  const baseResults = state.question.options.map((option) => {
    const votes = state.votes.filter((vote) => vote.optionId === option.id).length;

    return {
      optionId: option.id,
      label: option.label,
      votes,
      percentage: calculatePercentage(votes, totalVotes),
      isWinner: false,
    };
  });
  const topVotes = Math.max(...baseResults.map((result) => result.votes), 0);
  const winnerOptionIds =
    topVotes > 0
      ? baseResults
          .filter((result) => result.votes === topVotes)
          .map((result) => result.optionId)
      : [];

  return {
    questionId: state.question.id,
    prompt: state.question.prompt,
    totalVotes,
    winnerOptionIds,
    optionResults: baseResults.map((result) => ({
      ...result,
      isWinner: winnerOptionIds.includes(result.optionId),
    })),
    votes: state.votes.map((vote) => ({ ...vote })),
  };
}

function calculatePercentage(votes: number, totalVotes: number): number {
  if (totalVotes === 0) {
    return 0;
  }

  return Math.round((votes / totalVotes) * 1000) / 10;
}

function selectQuestion(
  deck: WhatWouldYouDoQuestion[],
  roundId: string,
  questionId?: string,
): WhatWouldYouDoQuestion {
  if (deck.length === 0) {
    throw new Error("What would you do deck does not contain questions.");
  }

  const question = questionId
    ? deck.find((item) => item.id === questionId)
    : deck[hashString(roundId) % deck.length];

  if (!question) {
    throw new Error("What would you do deck does not contain a playable question.");
  }

  return cloneQuestion(question);
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

function hashString(value: string): number {
  return [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}

function rejectWhatWouldYouDoVote(
  state: WhatWouldYouDoRoundState,
  playerId: string,
  code: string,
): SubmissionAck {
  return createRejectedSubmissionAck({
    gameMode: WHAT_WOULD_YOU_DO_GAME_MODE_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    playerId,
    code,
    message: getWhatWouldYouDoErrorMessage(code),
    lifecycleState: state.lifecycleState,
  });
}

function getWhatWouldYouDoErrorMessage(code: string): string {
  switch (code) {
    case "invalid_submission":
      return "Vote payload is not valid for this round.";
    case "voting_not_open":
      return "Voting is not open yet.";
    case "round_already_finished":
      return "This what_would_you_do round is already finished.";
    case "deadline_passed":
      return "The voting deadline has passed.";
    case "player_not_in_room":
      return "The voter is not part of this room.";
    case "question_mismatch":
      return "Vote does not match the active question.";
    case "option_not_in_question":
      return "The selected option is not available in this question.";
    case "duplicate_vote":
      return "This player has already voted in this round.";
    default:
      return "Vote rejected.";
  }
}
