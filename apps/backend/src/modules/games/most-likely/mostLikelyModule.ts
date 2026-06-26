import {
  MOST_LIKELY_GAME_MANIFEST,
  MOST_LIKELY_GAME_MODE_ID,
  MOST_LIKELY_POINTS_PER_RECEIVED_VOTE,
  MOST_LIKELY_ROUND_SECONDS,
  MOST_LIKELY_VOTING_SECONDS,
  requireMostLikelyVoteRequest,
  type MostLikelyPlayerState,
  type MostLikelyPublicState,
  type MostLikelyQuestion,
  type MostLikelyRoundResult,
  type MostLikelyRoundResultEvent,
  type MostLikelyVoteRecord,
  type MostLikelyVoteRequest,
  type PublicPlayer,
  type RoundClock,
  type RoundSnapshot,
  type ScoreDelta,
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
import { defaultMostLikelyQuestionDeck } from "./questionDeck";

export interface CreateMostLikelyRoundInput {
  roomId: string;
  roundId: string;
  players: PublicPlayer[];
  now: DateInput;
  deck?: MostLikelyQuestion[];
  questionId?: string;
  roundDurationSeconds?: number;
}

export interface MostLikelyRoundState {
  gameModeId: typeof MOST_LIKELY_GAME_MODE_ID;
  roomId: string;
  roundId: string;
  lifecycleState: "active" | "voting" | "result";
  clock: RoundClock;
  roundClock: RoundClock;
  votingClock?: RoundClock;
  players: PublicPlayer[];
  question: MostLikelyQuestion;
  votes: MostLikelyVoteRecord[];
  result?: MostLikelyRoundResult;
  closedAt?: string;
}

export const mostLikelyGameModule: GameModule<
  MostLikelyRoundState,
  MostLikelyVoteRequest
> = {
  manifest: MOST_LIKELY_GAME_MANIFEST,
  createRound: createMostLikelyRound,
  submitAction: submitMostLikelyVote,
  finishRound: finishMostLikelyRound,
  getSnapshot: getMostLikelySnapshot,
};

export function createMostLikelyRound(
  input: CreateMostLikelyRoundInput,
): MostLikelyRoundState {
  if (input.players.length < MOST_LIKELY_GAME_MANIFEST.rules.minPlayers) {
    throw new Error("Most likely requires at least two players.");
  }

  const roundClock = createRoundClock({
    now: input.now,
    durationSeconds:
      input.roundDurationSeconds ?? MOST_LIKELY_ROUND_SECONDS,
  });

  return {
    gameModeId: MOST_LIKELY_GAME_MODE_ID,
    roomId: input.roomId,
    roundId: input.roundId,
    lifecycleState: "active",
    clock: roundClock,
    roundClock,
    players: input.players.map((player) => ({ ...player })),
    question: selectQuestion(
      input.deck ?? defaultMostLikelyQuestionDeck,
      input.roundId,
      input.questionId,
    ),
    votes: [],
  };
}

export function startMostLikelyVoting(
  state: MostLikelyRoundState,
  now: DateInput = state.roundClock.endsAt,
): MostLikelyRoundState {
  if (state.lifecycleState === "result") {
    return state;
  }

  if (state.lifecycleState === "voting") {
    return state;
  }

  const votingClock = createRoundClock({
    now,
    durationSeconds: MOST_LIKELY_VOTING_SECONDS,
  });

  return {
    ...state,
    lifecycleState: "voting",
    clock: votingClock,
    votingClock,
  };
}

export function submitMostLikelyVote(
  state: MostLikelyRoundState,
  rawAction: MostLikelyVoteRequest,
  now: DateInput,
): {
  state: MostLikelyRoundState;
  ack: ReturnType<typeof createSubmissionAck> | ReturnType<typeof createRejectedSubmissionAck>;
} {
  let action: MostLikelyVoteRequest;

  try {
    action = requireMostLikelyVoteRequest(rawAction);
  } catch {
    return {
      state,
      ack: rejectMostLikelyVote(
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
      ack: rejectMostLikelyVote(votingState, action.playerId, "voting_not_open"),
    };
  }

  if (votingState.lifecycleState === "result") {
    return {
      state: votingState,
      ack: rejectMostLikelyVote(
        votingState,
        action.playerId,
        "round_already_finished",
      ),
    };
  }

  if (isPastDeadline(votingState.clock, now)) {
    const closedState = closeMostLikelyRound(votingState, now);

    return {
      state: closedState,
      ack: rejectMostLikelyVote(
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
      ack: rejectMostLikelyVote(
        votingState,
        action.playerId,
        "player_not_in_room",
      ),
    };
  }

  if (action.questionId !== votingState.question.id) {
    return {
      state: votingState,
      ack: rejectMostLikelyVote(
        votingState,
        action.playerId,
        "question_mismatch",
      ),
    };
  }

  const target = findPlayer(votingState.players, action.targetPlayerId);

  if (!target) {
    return {
      state: votingState,
      ack: rejectMostLikelyVote(
        votingState,
        action.playerId,
        "target_not_in_room",
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
      ack: rejectMostLikelyVote(
        votingState,
        action.playerId,
        "duplicate_vote",
      ),
    };
  }

  const nextState: MostLikelyRoundState = {
    ...votingState,
    votes: [
      ...votingState.votes,
      {
        voterPlayerId: voter.playerId,
        voterNickname: voter.nickname,
        targetPlayerId: target.playerId,
        targetNickname: target.nickname,
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
    ? closeMostLikelyRound(nextState, now)
    : nextState;

  return {
    state: resolvedState,
    ack: createSubmissionAck({
      gameMode: MOST_LIKELY_GAME_MODE_ID,
      roomId: state.roomId,
      roundId: state.roundId,
      playerId: action.playerId,
      submittedAt: now,
      lifecycleState: resolvedState.lifecycleState,
    }),
  };
}

export function finishMostLikelyRound(
  state: MostLikelyRoundState,
  now: DateInput,
): {
  state: MostLikelyRoundState;
  event?: MostLikelyRoundResultEvent;
} {
  const votingState =
    state.lifecycleState === "active"
      ? startMostLikelyVoting(state, state.roundClock.endsAt)
      : state;
  const closedState = closeMostLikelyRound(votingState, now);

  return {
    state: closedState,
    event: closedState.result
      ? {
          type: "most_likely.round_finished",
          roomId: closedState.roomId,
          roundId: closedState.roundId,
          result: closedState.result,
        }
      : undefined,
  };
}

export function getMostLikelySnapshot(
  state: MostLikelyRoundState,
  playerId: string | undefined,
  now: DateInput,
): RoundSnapshot<MostLikelyPublicState, MostLikelyPlayerState> {
  return createRoundSnapshot({
    gameMode: MOST_LIKELY_GAME_MODE_ID,
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
  state: MostLikelyRoundState,
  now: DateInput,
): MostLikelyRoundState {
  if (state.lifecycleState !== "active") {
    return state;
  }

  return isPastDeadline(state.roundClock, now)
    ? startMostLikelyVoting(state, state.roundClock.endsAt)
    : state;
}

function closeMostLikelyRound(
  state: MostLikelyRoundState,
  now: DateInput,
): MostLikelyRoundState {
  if (state.lifecycleState === "result" && state.result) {
    return state;
  }

  return {
    ...state,
    lifecycleState: "result",
    result: createMostLikelyResult(state),
    closedAt: toIso(now),
  };
}

function createPublicState(state: MostLikelyRoundState): MostLikelyPublicState {
  return {
    question: state.question,
    players: state.players.map((player) => ({ ...player })),
    submittedCount: state.votes.length,
    totalPlayers: state.players.length,
    result: state.lifecycleState === "result" ? state.result : undefined,
  };
}

function createPlayerState(
  state: MostLikelyRoundState,
  playerId: string,
): MostLikelyPlayerState {
  const vote = state.votes.find((item) => item.voterPlayerId === playerId);
  const scoreDelta = state.result?.scoreDeltas.find(
    (item) => item.playerId === playerId,
  );

  return {
    hasVoted: Boolean(vote),
    selectedTargetPlayerId: vote?.targetPlayerId,
    points: scoreDelta?.delta,
  };
}

function createMostLikelyResult(
  state: MostLikelyRoundState,
): MostLikelyRoundResult {
  const totalVotes = state.votes.length;
  const voteCounts = state.players
    .map((player) => {
      const votes = state.votes.filter(
        (vote) => vote.targetPlayerId === player.playerId,
      ).length;

      return {
        playerId: player.playerId,
        nickname: player.nickname,
        ...(player.avatarUrl ? { avatarUrl: player.avatarUrl } : {}),
        votes,
        percentage: calculatePercentage(votes, totalVotes),
      };
    })
    .sort(
      (left, right) =>
        right.votes - left.votes ||
        left.nickname.localeCompare(right.nickname) ||
        left.playerId.localeCompare(right.playerId),
    );

  const topVotes = voteCounts[0]?.votes ?? 0;
  const winners =
    topVotes > 0
      ? voteCounts
          .filter((count) => count.votes === topVotes)
          .map((count) => ({ ...count }))
      : [];

  return {
    questionId: state.question.id,
    prompt: state.question.prompt,
    totalVotes,
    winners,
    voteCounts,
    votes: [...state.votes],
    scoreDeltas: createScoreDeltas(voteCounts),
  };
}

function createScoreDeltas(voteCounts: MostLikelyRoundResult["voteCounts"]): ScoreDelta[] {
  return voteCounts
    .map((count) => ({
      playerId: count.playerId,
      nickname: count.nickname,
      delta: count.votes * MOST_LIKELY_POINTS_PER_RECEIVED_VOTE,
      reason:
        count.votes === 1
          ? "Received 1 most_likely vote"
          : `Received ${count.votes} most_likely votes`,
    }))
    .sort(
      (left, right) =>
        right.delta - left.delta ||
        left.nickname.localeCompare(right.nickname) ||
        left.playerId.localeCompare(right.playerId),
    );
}

function calculatePercentage(votes: number, totalVotes: number): number {
  if (totalVotes === 0) {
    return 0;
  }

  return Math.round((votes / totalVotes) * 1000) / 10;
}

function selectQuestion(
  deck: MostLikelyQuestion[],
  roundId: string,
  questionId?: string,
): MostLikelyQuestion {
  const question = questionId
    ? deck.find((item) => item.id === questionId)
    : deck[hashString(roundId) % deck.length];

  if (!question) {
    throw new Error("Most likely deck does not contain a playable question.");
  }

  return { ...question };
}

function hashString(value: string): number {
  return [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}

function rejectMostLikelyVote(
  state: MostLikelyRoundState,
  playerId: string,
  code: string,
): ReturnType<typeof createRejectedSubmissionAck> {
  return createRejectedSubmissionAck({
    gameMode: MOST_LIKELY_GAME_MODE_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    playerId,
    code,
    message: getMostLikelyErrorMessage(code),
    lifecycleState: state.lifecycleState,
  });
}

function getMostLikelyErrorMessage(code: string): string {
  switch (code) {
    case "invalid_submission":
      return "Vote payload is not valid for this round.";
    case "voting_not_open":
      return "Voting is not open yet.";
    case "round_already_finished":
      return "This most_likely round is already finished.";
    case "deadline_passed":
      return "The voting deadline has passed.";
    case "player_not_in_room":
      return "The voter is not part of this room.";
    case "question_mismatch":
      return "Vote does not match the active question.";
    case "target_not_in_room":
      return "The selected player is not part of this room.";
    case "duplicate_vote":
      return "This player has already voted in this round.";
    default:
      return "Vote rejected.";
  }
}
