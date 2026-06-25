import type {
  GameContentLevel,
  GameScoreDelta,
  PlayerSummary,
  WouldYouRatherOptionId,
  WouldYouRatherPlayerState,
  WouldYouRatherPublicState,
  WouldYouRatherQuestion,
  WouldYouRatherRoundResult,
  WouldYouRatherRoundResultEvent,
  WouldYouRatherRoundStartedEvent,
  WouldYouRatherSnapshot,
  WouldYouRatherVoteAck,
  WouldYouRatherVoteRequest,
} from "../../../../../../packages/contracts/src";
import {
  isWouldYouRatherOptionId,
  WOULD_YOU_RATHER_GAME_ID,
  WOULD_YOU_RATHER_MANIFEST,
  WOULD_YOU_RATHER_ROUND_SECONDS,
} from "../../../../../../packages/contracts/src";
import type { GameModule, GameRoundContext } from "../gameModule";
import {
  createRejectedSubmissionAck,
  createRoundClock,
  createRoundSnapshot,
  createSubmissionAck,
  findPlayer,
  isPastDeadline,
  shouldFinishRound,
} from "../core/roundLifecycle";
import { WOULD_YOU_RATHER_QUESTION_BANK } from "./questionBank";

export interface WouldYouRatherVoteRecord {
  playerId: string;
  optionId: WouldYouRatherOptionId;
  submittedAt: string;
}

export interface WouldYouRatherRoundState {
  roomId: string;
  roundId: string;
  lifecycleState: "active" | "result";
  question: WouldYouRatherQuestion;
  clock: {
    startsAt: string;
    endsAt: string;
  };
  players: PlayerSummary[];
  votesByPlayerId: Record<string, WouldYouRatherVoteRecord>;
  result?: WouldYouRatherRoundResult;
}

export interface StartWouldYouRatherRoundInput {
  roomId: string;
  roundId: string;
  players: PlayerSummary[];
  now: Date | string;
  contentLevel?: GameContentLevel;
  durationSeconds?: number;
  usedQuestionIds?: readonly string[];
  questionBank?: readonly WouldYouRatherQuestion[];
}

export interface StartWouldYouRatherRoundResult {
  state: WouldYouRatherRoundState;
  event: WouldYouRatherRoundStartedEvent;
}

export interface SubmitWouldYouRatherVoteResult {
  state: WouldYouRatherRoundState;
  ack: WouldYouRatherVoteAck;
}

export interface FinishWouldYouRatherRoundResult {
  state: WouldYouRatherRoundState;
  event?: WouldYouRatherRoundResultEvent;
}

export const WOULD_YOU_RATHER_SCORING = {
  participationPoints: 1,
  majorityBonusPoints: 2,
} as const;

export function startWouldYouRatherRound(
  input: StartWouldYouRatherRoundInput,
): StartWouldYouRatherRoundResult {
  if (input.players.length < WOULD_YOU_RATHER_MANIFEST.rules.minPlayers) {
    throw new Error("Voce Prefere precisa de pelo menos 2 jogadores.");
  }

  const question = selectWouldYouRatherQuestion({
    questionBank: input.questionBank ?? WOULD_YOU_RATHER_QUESTION_BANK,
    contentLevel: input.contentLevel ?? "friends",
    usedQuestionIds: input.usedQuestionIds ?? [],
  });
  const clock = createRoundClock({
    now: input.now,
    durationSeconds: input.durationSeconds ?? WOULD_YOU_RATHER_ROUND_SECONDS,
  });
  const state: WouldYouRatherRoundState = {
    roomId: input.roomId,
    roundId: input.roundId,
    lifecycleState: "active",
    question,
    clock,
    players: input.players.map((player) => ({ ...player })),
    votesByPlayerId: {},
  };

  return {
    state,
    event: {
      type: "game:would_you_rather_round_started",
      version: 1,
      roomId: input.roomId,
      roundId: input.roundId,
      question,
      clock,
    },
  };
}

export function submitWouldYouRatherVote(
  state: WouldYouRatherRoundState,
  request: WouldYouRatherVoteRequest,
  now: Date | string = new Date(),
): SubmitWouldYouRatherVoteResult {
  if (state.lifecycleState !== "active") {
    return rejected(state, request, "round_not_active", "A ronda ja terminou.");
  }

  if (request.roomId !== state.roomId || request.roundId !== state.roundId) {
    return rejected(state, request, "invalid_submission", "Voto enviado para a ronda errada.");
  }

  if (!findPlayer(state.players, request.playerId)) {
    return rejected(state, request, "player_not_in_room", "Jogador nao pertence a esta sala.");
  }

  if (!isWouldYouRatherOptionId(request.optionId)) {
    return rejected(state, request, "invalid_submission", "Opcao de voto invalida.");
  }

  if (isPastDeadline(state.clock, now)) {
    return rejected(state, request, "deadline_passed", "O tempo de voto terminou.");
  }

  const existingVote = state.votesByPlayerId[request.playerId];
  if (existingVote) {
    return {
      state,
      ack: {
        ...createRejectedSubmissionAck({
          gameMode: WOULD_YOU_RATHER_GAME_ID,
          roomId: state.roomId,
          roundId: state.roundId,
          playerId: request.playerId,
          code: "duplicate_submission",
          message: "Este jogador ja votou nesta ronda.",
          lifecycleState: state.lifecycleState,
        }),
        optionId: existingVote.optionId,
        alreadySubmitted: true,
      },
    };
  }

  const submittedAt = new Date(now).toISOString();
  const nextState: WouldYouRatherRoundState = {
    ...state,
    votesByPlayerId: {
      ...state.votesByPlayerId,
      [request.playerId]: {
        playerId: request.playerId,
        optionId: request.optionId,
        submittedAt,
      },
    },
  };
  const finalState = shouldFinishRound({
    clock: nextState.clock,
    now,
    submittedPlayerIds: Object.keys(nextState.votesByPlayerId),
    totalPlayers: nextState.players.length,
  })
    ? finishWouldYouRatherRound(nextState, now).state
    : nextState;

  return {
    state: finalState,
    ack: {
      ...createSubmissionAck({
        gameMode: WOULD_YOU_RATHER_GAME_ID,
        roomId: state.roomId,
        roundId: state.roundId,
        playerId: request.playerId,
        accepted: true,
        submittedAt,
        lifecycleState: finalState.lifecycleState,
      }),
      optionId: request.optionId,
      alreadySubmitted: false,
    },
  };
}

export function maybeFinishWouldYouRatherRound(
  state: WouldYouRatherRoundState,
  now: Date | string = new Date(),
): WouldYouRatherRoundState {
  return shouldFinishRound({
    clock: state.clock,
    now,
    submittedPlayerIds: Object.keys(state.votesByPlayerId),
    totalPlayers: state.players.length,
  })
    ? finishWouldYouRatherRound(state, now).state
    : state;
}

export function finishWouldYouRatherRound(
  state: WouldYouRatherRoundState,
  now: Date | string = new Date(),
): FinishWouldYouRatherRoundResult {
  if (state.lifecycleState === "result" && state.result) {
    return { state };
  }

  const result = calculateWouldYouRatherResult(state, now);
  const nextState: WouldYouRatherRoundState = {
    ...state,
    lifecycleState: "result",
    result,
  };

  return {
    state: nextState,
    event: {
      type: "game:would_you_rather_round_result",
      version: 1,
      roomId: state.roomId,
      roundId: state.roundId,
      result,
    },
  };
}

export function getWouldYouRatherSnapshot(
  state: WouldYouRatherRoundState,
  playerId?: string,
  now: Date | string = new Date(),
): WouldYouRatherSnapshot {
  const vote = playerId ? state.votesByPlayerId[playerId] : undefined;
  const scoreDelta = state.result?.scoreDeltas.find(
    (delta) => delta.playerId === playerId,
  )?.delta;
  const playerState: WouldYouRatherPlayerState | undefined = playerId
    ? {
        hasSubmitted: Boolean(vote),
        ...(vote ? { selectedOptionId: vote.optionId } : {}),
        ...(scoreDelta !== undefined ? { scoreDelta } : {}),
      }
    : undefined;

  return createRoundSnapshot<WouldYouRatherPublicState, WouldYouRatherPlayerState>({
    gameMode: WOULD_YOU_RATHER_GAME_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    lifecycleState: state.lifecycleState,
    clock: state.clock,
    serverNow: now,
    publicState: {
      question: state.question,
      totalPlayers: state.players.length,
      submittedCount: Object.keys(state.votesByPlayerId).length,
      ...(state.result ? { result: state.result } : {}),
    },
    playerState,
  });
}

export function calculateWouldYouRatherResult(
  state: WouldYouRatherRoundState,
  now: Date | string = new Date(),
): WouldYouRatherRoundResult {
  const votes = Object.values(state.votesByPlayerId);
  const votesA = votes.filter((vote) => vote.optionId === "A");
  const votesB = votes.filter((vote) => vote.optionId === "B");
  const [percentageA, percentageB] = calculateTwoOptionPercentages(
    votesA.length,
    votesB.length,
  );

  return {
    roundId: state.roundId,
    totalVotes: votes.length,
    results: [
      optionResult(state, "A", state.question.optionA, votesA, percentageA),
      optionResult(state, "B", state.question.optionB, votesB, percentageB),
    ],
    didNotVotePlayers: state.players.filter(
      (player) => !state.votesByPlayerId[player.playerId],
    ),
    scoreDeltas: calculateScoreDeltas(state, votesA.length, votesB.length),
    finishedAt: new Date(now).toISOString(),
  };
}

export function selectWouldYouRatherQuestion(input: {
  questionBank: readonly WouldYouRatherQuestion[];
  contentLevel: GameContentLevel;
  usedQuestionIds?: readonly string[];
}): WouldYouRatherQuestion {
  const used = new Set(input.usedQuestionIds ?? []);
  const allowedLevels = getAllowedContentLevels(input.contentLevel);
  const question = input.questionBank.find(
    (candidate) =>
      allowedLevels.includes(candidate.contentLevel) && !used.has(candidate.id),
  );

  if (!question) {
    throw new Error("Nao ha perguntas disponiveis para esta configuracao.");
  }

  if (!question.prompt.trim() || !question.optionA.trim() || !question.optionB.trim()) {
    throw new Error("Pergunta e opcoes sao obrigatorias.");
  }

  return question;
}

export const WOULD_YOU_RATHER_GAME_MODULE: GameModule<
  Partial<StartWouldYouRatherRoundInput>,
  Omit<WouldYouRatherVoteRequest, "roomId" | "roundId" | "playerId">,
  WouldYouRatherRoundState,
  WouldYouRatherPublicState,
  WouldYouRatherPlayerState
> = {
  manifest: WOULD_YOU_RATHER_MANIFEST,
  startRound(input, context: GameRoundContext) {
    const result = startWouldYouRatherRound({
      roomId: context.roomId,
      roundId: context.roundId,
      players: context.players,
      now: context.startsAt,
      ...input,
    });

    return {
      state: result.state,
      snapshot: getWouldYouRatherSnapshot(result.state),
    };
  },
  submit(state, submission, playerId) {
    const result = submitWouldYouRatherVote(state, {
      roomId: state.roomId,
      roundId: state.roundId,
      playerId,
      optionId: submission.optionId,
    });

    return {
      state: result.state,
      ack: result.ack,
      snapshot: getWouldYouRatherSnapshot(result.state, playerId),
    };
  },
  finishRound(state) {
    const result = finishWouldYouRatherRound(state);

    return {
      state: result.state,
      snapshot: getWouldYouRatherSnapshot(result.state),
    };
  },
  getSnapshot: getWouldYouRatherSnapshot,
};

function rejected(
  state: WouldYouRatherRoundState,
  request: WouldYouRatherVoteRequest,
  code: "round_not_active" | "invalid_submission" | "player_not_in_room" | "deadline_passed",
  message: string,
): SubmitWouldYouRatherVoteResult {
  return {
    state,
    ack: createRejectedSubmissionAck({
      gameMode: WOULD_YOU_RATHER_GAME_ID,
      roomId: state.roomId,
      roundId: state.roundId,
      playerId: request.playerId,
      code,
      message,
      lifecycleState: state.lifecycleState,
    }) as WouldYouRatherVoteAck,
  };
}

function getAllowedContentLevels(contentLevel: GameContentLevel): GameContentLevel[] {
  if (contentLevel === "family") {
    return ["family"];
  }
  if (contentLevel === "friends") {
    return ["family", "friends"];
  }
  return ["family", "friends", "bar"];
}

function optionResult(
  state: WouldYouRatherRoundState,
  optionId: WouldYouRatherOptionId,
  label: string,
  votes: WouldYouRatherVoteRecord[],
  percentage: number,
) {
  const players = votes
    .map((vote) => findPlayer(state.players, vote.playerId))
    .filter((player): player is PlayerSummary => Boolean(player));

  return {
    optionId,
    label,
    voteCount: votes.length,
    percentage,
    players,
    nicknames: players.map((player) => player.nickname),
  };
}

function calculateScoreDeltas(
  state: WouldYouRatherRoundState,
  optionACount: number,
  optionBCount: number,
): GameScoreDelta[] {
  const majorityOption =
    optionACount === optionBCount ? undefined : optionACount > optionBCount ? "A" : "B";

  return Object.values(state.votesByPlayerId).map((vote) => {
    const player = findPlayer(state.players, vote.playerId);
    const majorityBonus =
      majorityOption && vote.optionId === majorityOption
        ? WOULD_YOU_RATHER_SCORING.majorityBonusPoints
        : 0;

    return {
      playerId: vote.playerId,
      nickname: player?.nickname,
      delta: WOULD_YOU_RATHER_SCORING.participationPoints + majorityBonus,
      reason: majorityBonus > 0 ? "participation_majority" : "participation",
    };
  });
}

function calculateTwoOptionPercentages(
  countA: number,
  countB: number,
): [number, number] {
  const total = countA + countB;
  if (total === 0) {
    return [0, 0];
  }

  const exactA = (countA / total) * 100;
  const exactB = (countB / total) * 100;
  const floorA = Math.floor(exactA);
  const floorB = Math.floor(exactB);
  const missing = 100 - floorA - floorB;

  if (missing === 0) {
    return [floorA, floorB];
  }

  return exactA - floorA >= exactB - floorB
    ? [floorA + missing, floorB]
    : [floorA, floorB + missing];
}
