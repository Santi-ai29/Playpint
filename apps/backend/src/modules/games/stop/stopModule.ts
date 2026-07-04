import {
  DEFAULT_STOP_CATEGORIES,
  DEFAULT_STOP_LETTERS,
  STOP_GAME_MANIFEST,
  STOP_GAME_MODE_ID,
  STOP_ROUND_SECONDS,
  isStopCategoryId,
  requireStopSubmitAnswersRequest,
  type PublicPlayer,
  type RoundClock,
  type RoundSnapshot,
  type StopAnswers,
  type StopCategory,
  type StopCategoryId,
  type StopCategoryResult,
  type StopPlayerRoundScore,
  type StopPlayerState,
  type StopPublicState,
  type StopRoundResult,
  type StopRoundResultEvent,
  type StopScoredAnswer,
  type StopSubmitAnswersRequest,
} from "../../../../../../packages/contracts/src";
import type { GameActionResult, GameModule } from "../core";
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

export interface CreateStopRoundInput {
  roomId: string;
  roundId: string;
  players: PublicPlayer[];
  now: DateInput;
  roomName?: string;
  durationSeconds?: number;
  letter?: string;
  categories?: readonly StopCategory[];
}

export interface StopSubmissionRecord {
  playerId: string;
  answers: StopAnswers;
  submittedAt: string;
  stoppedRound: boolean;
}

export interface StopRoundState {
  gameModeId: typeof STOP_GAME_MODE_ID;
  roomId: string;
  roomName?: string;
  roundId: string;
  lifecycleState: "active" | "result";
  clock: RoundClock;
  players: PublicPlayer[];
  letter: string;
  categories: StopCategory[];
  submissions: StopSubmissionRecord[];
  stoppedByPlayerId?: string;
  result?: StopRoundResult;
  closedAt?: string;
}

export const stopGameModule: GameModule<
  StopRoundState,
  StopSubmitAnswersRequest
> = {
  manifest: STOP_GAME_MANIFEST,
  createRound: createStopRound,
  submitAction: submitStopAnswers,
  finishRound: finishStopRound,
  getSnapshot: getStopSnapshot,
};

export function createStopRound(input: CreateStopRoundInput): StopRoundState {
  if (input.players.length < STOP_GAME_MANIFEST.rules.minPlayers) {
    throw new Error("Stop requires at least two players.");
  }

  const categories = normalizeStopCategories(
    input.categories ?? DEFAULT_STOP_CATEGORIES,
  );

  return {
    gameModeId: STOP_GAME_MODE_ID,
    roomId: input.roomId,
    roomName: input.roomName,
    roundId: input.roundId,
    lifecycleState: "active",
    clock: createRoundClock({
      now: input.now,
      durationSeconds: input.durationSeconds ?? STOP_ROUND_SECONDS,
    }),
    players: input.players.map((player) => ({ ...player })),
    letter: normalizeRoundLetter(input.letter ?? pickStopLetter(input.roundId)),
    categories,
    submissions: [],
  };
}

export function submitStopAnswers(
  state: StopRoundState,
  rawAction: StopSubmitAnswersRequest,
  now: DateInput,
): GameActionResult<StopRoundState> {
  let action: StopSubmitAnswersRequest;

  try {
    action = requireStopSubmitAnswersRequest(rawAction);
  } catch {
    return {
      state,
      ack: rejectStopAnswers(
        state,
        getRawPlayerId(rawAction),
        "invalid_submission",
      ),
    };
  }

  if (state.lifecycleState !== "active") {
    return {
      state,
      ack: rejectStopAnswers(state, action.playerId, "round_already_finished"),
    };
  }

  if (action.roundId !== state.roundId) {
    return {
      state,
      ack: rejectStopAnswers(state, action.playerId, "round_mismatch"),
    };
  }

  if (isPastDeadline(state.clock, now)) {
    const closedState = closeStopRound(state, now);

    return {
      state: closedState,
      ack: rejectStopAnswers(closedState, action.playerId, "deadline_passed"),
    };
  }

  const player = findPlayer(state.players, action.playerId);

  if (!player) {
    return {
      state,
      ack: rejectStopAnswers(state, action.playerId, "player_not_in_room"),
    };
  }

  if (
    hasPlayerSubmitted(
      state.submissions,
      action.playerId,
      (submission) => submission.playerId,
    )
  ) {
    return {
      state,
      ack: rejectStopAnswers(state, action.playerId, "duplicate_submission"),
    };
  }

  const nextState: StopRoundState = {
    ...state,
    submissions: [
      ...state.submissions,
      {
        playerId: player.playerId,
        answers: normalizeStopAnswers(action.answers, state.categories),
        submittedAt: toIso(now),
        stoppedRound: Boolean(action.stopRound),
      },
    ],
    stoppedByPlayerId: action.stopRound
      ? player.playerId
      : state.stoppedByPlayerId,
  };

  const shouldClose =
    Boolean(action.stopRound) ||
    shouldFinishRound({
      clock: nextState.clock,
      now,
      submittedPlayerIds: nextState.submissions.map(
        (submission) => submission.playerId,
      ),
      totalPlayers: nextState.players.length,
    });
  const resolvedState = shouldClose ? closeStopRound(nextState, now) : nextState;

  return {
    state: resolvedState,
    ack: createSubmissionAck({
      gameMode: STOP_GAME_MODE_ID,
      roomId: state.roomId,
      roundId: state.roundId,
      playerId: action.playerId,
      submittedAt: now,
      lifecycleState: resolvedState.lifecycleState,
    }),
  };
}

export function finishStopRound(
  state: StopRoundState,
  now: DateInput,
): {
  state: StopRoundState;
  event?: StopRoundResultEvent;
} {
  const closedState = closeStopRound(state, now);

  return {
    state: closedState,
    event: closedState.result
      ? {
          type: "stop.round_finished",
          roomId: closedState.roomId,
          roundId: closedState.roundId,
          result: closedState.result,
        }
      : undefined,
  };
}

export function getStopSnapshot(
  state: StopRoundState,
  playerId: string | undefined,
  now: DateInput,
): RoundSnapshot<StopPublicState, StopPlayerState> {
  return createRoundSnapshot({
    gameMode: STOP_GAME_MODE_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    lifecycleState: state.lifecycleState,
    clock: state.clock,
    serverNow: now,
    publicState: createStopPublicState(state),
    playerState: playerId ? createStopPlayerState(state, playerId) : undefined,
  });
}

export function scoreStopRound(state: StopRoundState): StopRoundResult {
  const categoryResults = state.categories.map((category) =>
    scoreStopCategory(state, category),
  );
  const totals = new Map<string, StopPlayerRoundScore>(
    state.players.map((player) => [
      player.playerId,
      {
        playerId: player.playerId,
        nickname: player.nickname,
        ...(player.avatarUrl ? { avatarUrl: player.avatarUrl } : {}),
        totalScore: 0,
        categoryScores: {},
      },
    ]),
  );

  for (const categoryResult of categoryResults) {
    for (const answer of categoryResult.answers) {
      const current = totals.get(answer.playerId);

      if (!current) {
        continue;
      }

      current.totalScore += answer.points;
      current.categoryScores[categoryResult.category.id] = answer.points;
    }
  }

  const playerScores = sortStopPlayerScores([...totals.values()]);
  const stoppedBy = state.stoppedByPlayerId
    ? findPlayer(state.players, state.stoppedByPlayerId)
    : undefined;

  return {
    letter: state.letter,
    stoppedByPlayerId: stoppedBy?.playerId,
    stoppedByNickname: stoppedBy?.nickname,
    totalSubmissions: state.submissions.length,
    categoryResults,
    playerScores,
    scoreDeltas: playerScores.map((score) => ({
      playerId: score.playerId,
      nickname: score.nickname,
      delta: score.totalScore,
      reason: "Stop round score",
    })),
  };
}

export function scoreStopCategory(
  state: StopRoundState,
  category: StopCategory,
): StopCategoryResult {
  const submissionsByPlayerId = new Map(
    state.submissions.map((submission) => [submission.playerId, submission]),
  );
  const validAnswerCounts = new Map<string, number>();

  for (const submission of state.submissions) {
    const answer = submission.answers[category.id] ?? "";
    const normalizedAnswer = normalizeStopAnswerForComparison(answer);

    if (isValidStopAnswer(answer, state.letter)) {
      validAnswerCounts.set(
        normalizedAnswer,
        (validAnswerCounts.get(normalizedAnswer) ?? 0) + 1,
      );
    }
  }

  return {
    category: { ...category },
    answers: state.players.map((player) => {
      const answer =
        submissionsByPlayerId.get(player.playerId)?.answers[category.id] ?? "";
      const normalizedAnswer = normalizeStopAnswerForComparison(answer);

      if (!answer.trim()) {
        return createScoredAnswer(player, category, answer, 0, "empty");
      }

      if (!isValidStopAnswer(answer, state.letter)) {
        return createScoredAnswer(player, category, answer, 0, "wrong_letter");
      }

      const isDuplicate = (validAnswerCounts.get(normalizedAnswer) ?? 0) > 1;

      return createScoredAnswer(
        player,
        category,
        answer,
        isDuplicate ? 5 : 10,
        isDuplicate ? "duplicate" : "unique",
      );
    }),
  };
}

export function pickStopLetter(
  seed: string,
  letters: readonly string[] = DEFAULT_STOP_LETTERS,
): string {
  if (letters.length === 0) {
    throw new Error("Stop requires at least one playable letter.");
  }

  return normalizeRoundLetter(letters[hashString(seed) % letters.length]);
}

export function normalizeRoundLetter(letter: string): string {
  const normalized = normalizeStopAnswerForComparison(letter);

  if (!/^[A-Z]$/.test(normalized)) {
    throw new Error("Stop round letter must be a single letter.");
  }

  return normalized;
}

export function normalizeStopAnswerForComparison(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}

export function isValidStopAnswer(answer: string, letter: string): boolean {
  const normalizedAnswer = normalizeStopAnswerForComparison(answer);

  return (
    normalizedAnswer.length > 0 &&
    normalizedAnswer.startsWith(normalizeRoundLetter(letter))
  );
}

export function normalizeStopCategories(
  categories: readonly StopCategory[],
): StopCategory[] {
  const seen = new Set<StopCategoryId>();
  const normalized: StopCategory[] = [];

  for (const category of categories) {
    if (!isStopCategoryId(category.id) || seen.has(category.id)) {
      continue;
    }

    seen.add(category.id);
    normalized.push({
      id: category.id,
      label: category.label,
      placeholder: category.placeholder,
      tone: category.tone,
    });
  }

  if (normalized.length === 0) {
    throw new Error("Stop requires at least one active category.");
  }

  return normalized;
}

function closeStopRound(
  state: StopRoundState,
  now: DateInput,
): StopRoundState {
  if (state.lifecycleState === "result" && state.result) {
    return state;
  }

  return {
    ...state,
    lifecycleState: "result",
    result: scoreStopRound(state),
    closedAt: toIso(now),
  };
}

function createStopPublicState(state: StopRoundState): StopPublicState {
  const stoppedBy = state.stoppedByPlayerId
    ? findPlayer(state.players, state.stoppedByPlayerId)
    : undefined;

  return {
    roomName: state.roomName,
    letter: state.letter,
    categories: state.categories.map((category) => ({ ...category })),
    players: state.players.map((player) => ({ ...player })),
    submittedCount: state.submissions.length,
    totalPlayers: state.players.length,
    stoppedByPlayerId: stoppedBy?.playerId,
    stoppedByNickname: stoppedBy?.nickname,
    result: state.lifecycleState === "result" ? state.result : undefined,
  };
}

function createStopPlayerState(
  state: StopRoundState,
  playerId: string,
): StopPlayerState {
  const submission = state.submissions.find(
    (item) => item.playerId === playerId,
  );

  return {
    hasSubmitted: Boolean(submission),
    submittedAt: submission?.submittedAt,
    answers: submission ? { ...submission.answers } : undefined,
  };
}

function normalizeStopAnswers(
  answers: StopAnswers,
  categories: readonly StopCategory[],
): StopAnswers {
  const normalized: StopAnswers = {};

  for (const category of categories) {
    const answer = answers[category.id];

    normalized[category.id] = typeof answer === "string" ? answer.trim() : "";
  }

  return normalized;
}

function createScoredAnswer(
  player: PublicPlayer,
  category: StopCategory,
  answer: string,
  points: number,
  reason: StopScoredAnswer["reason"],
): StopScoredAnswer {
  return {
    playerId: player.playerId,
    nickname: player.nickname,
    categoryId: category.id,
    categoryLabel: category.label,
    answer,
    normalizedAnswer: normalizeStopAnswerForComparison(answer),
    valid: reason === "duplicate" || reason === "unique",
    points,
    reason,
  };
}

function sortStopPlayerScores(
  scores: StopPlayerRoundScore[],
): StopPlayerRoundScore[] {
  return scores.sort(
    (left, right) =>
      right.totalScore - left.totalScore ||
      left.nickname.localeCompare(right.nickname) ||
      left.playerId.localeCompare(right.playerId),
  );
}

function rejectStopAnswers(
  state: StopRoundState,
  playerId: string,
  code: StopActionRejectionCode,
) {
  return createRejectedSubmissionAck({
    gameMode: STOP_GAME_MODE_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    playerId,
    code,
    message: getStopErrorMessage(code),
    lifecycleState: state.lifecycleState,
  });
}

type StopActionRejectionCode =
  | "invalid_submission"
  | "round_already_finished"
  | "round_mismatch"
  | "deadline_passed"
  | "player_not_in_room"
  | "duplicate_submission";

function getStopErrorMessage(code: StopActionRejectionCode): string {
  switch (code) {
    case "invalid_submission":
      return "Stop answers payload is not valid for this round.";
    case "round_already_finished":
      return "This Stop round is already finished.";
    case "round_mismatch":
      return "Stop answers do not match the active round.";
    case "deadline_passed":
      return "The Stop round deadline has passed.";
    case "player_not_in_room":
      return "This player is not part of the room.";
    case "duplicate_submission":
      return "This player has already submitted Stop answers.";
  }
}

function getRawPlayerId(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "playerId" in value &&
    typeof value.playerId === "string"
  ) {
    return value.playerId;
  }

  return "unknown";
}

function hashString(value: string): number {
  return [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}
