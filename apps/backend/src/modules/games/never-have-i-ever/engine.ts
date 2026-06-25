import type {
  GameContentLevel,
  GameErrorCode,
  GameScoreDelta,
  GameSubmissionAck,
  NeverHaveIEverAnswer,
  NeverHaveIEverAnswerRecord,
  NeverHaveIEverAnswerRequest,
  NeverHaveIEverPlayerState,
  NeverHaveIEverPrompt,
  NeverHaveIEverPublicState,
  NeverHaveIEverRoundResult,
  NeverHaveIEverSnapshot,
  PlayerSummary,
  RoundClock,
} from "../../../../../../packages/contracts/src";
import {
  isNeverHaveIEverAnswer,
  NEVER_HAVE_I_EVER_GAME_ID,
  NEVER_HAVE_I_EVER_MANIFEST,
  NEVER_HAVE_I_EVER_ROUND_SECONDS,
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
} from "../core";
import { NEVER_HAVE_I_EVER_PROMPTS } from "./prompts";

export interface NeverHaveIEverRoundState {
  roomId: string;
  roundId: string;
  prompt: NeverHaveIEverPrompt;
  players: PlayerSummary[];
  clock: RoundClock;
  lifecycleState: "active" | "result";
  answers: NeverHaveIEverAnswerRecord[];
  usedPromptIds: string[];
  result?: NeverHaveIEverRoundResult;
}

export interface CreateNeverHaveIEverRoundInput {
  roomId: string;
  roundId: string;
  players: PlayerSummary[];
  now: Date | string;
  contentLevel?: GameContentLevel;
  promptDeck?: readonly NeverHaveIEverPrompt[];
  usedPromptIds?: readonly string[];
  durationSeconds?: number;
}

export const neverHaveIEverGameModule: GameModule<
  NeverHaveIEverRoundState,
  NeverHaveIEverAnswerRequest,
  NeverHaveIEverPublicState,
  NeverHaveIEverPlayerState
> = {
  manifest: NEVER_HAVE_I_EVER_MANIFEST,
  createRound: createNeverHaveIEverRound,
  submitAction: submitNeverHaveIEverAnswer,
  finishRound: (state, now) => ({ state: finishNeverHaveIEverRound(state, now) }),
  getSnapshot: getNeverHaveIEverSnapshot,
};

export function createNeverHaveIEverRound(input: CreateNeverHaveIEverRoundInput): NeverHaveIEverRoundState {
  if (input.players.length < NEVER_HAVE_I_EVER_MANIFEST.rules.minPlayers) {
    throw new Error("Eu Nunca needs at least 3 players.");
  }

  const prompt = selectNeverHaveIEverPrompt({
    promptDeck: input.promptDeck ?? NEVER_HAVE_I_EVER_PROMPTS,
    usedPromptIds: input.usedPromptIds ?? [],
    contentLevel: input.contentLevel ?? "friends",
  });

  return {
    roomId: input.roomId,
    roundId: input.roundId,
    prompt,
    players: input.players.map((player) => ({ ...player })),
    clock: createRoundClock({
      now: input.now,
      durationSeconds: input.durationSeconds ?? NEVER_HAVE_I_EVER_ROUND_SECONDS,
    }),
    lifecycleState: "active",
    answers: [],
    usedPromptIds: [...(input.usedPromptIds ?? []), prompt.id],
  };
}

export function submitNeverHaveIEverAnswer(
  state: NeverHaveIEverRoundState,
  action: NeverHaveIEverAnswerRequest,
  now: Date | string,
): { state: NeverHaveIEverRoundState; ack: GameSubmissionAck } {
  const rejected = validateAnswerAction(state, action, now);
  if (rejected) {
    return { state, ack: rejected };
  }

  const submittedAt = toIso(now);
  const nextState: NeverHaveIEverRoundState = {
    ...state,
    answers: [...state.answers, { playerId: action.playerId, answer: action.answer, submittedAt }],
  };
  const maybeFinished = shouldFinishRound({
    clock: nextState.clock,
    now,
    submittedPlayerIds: nextState.answers.map((answer) => answer.playerId),
    totalPlayers: nextState.players.length,
  })
    ? finishNeverHaveIEverRound(nextState, now)
    : nextState;

  return {
    state: maybeFinished,
    ack: createSubmissionAck({
      gameMode: NEVER_HAVE_I_EVER_GAME_ID,
      roomId: state.roomId,
      roundId: state.roundId,
      playerId: action.playerId,
      accepted: true,
      submittedAt,
      lifecycleState: maybeFinished.lifecycleState,
    }),
  };
}

export function finishNeverHaveIEverRound(
  state: NeverHaveIEverRoundState,
  now: Date | string = new Date(),
): NeverHaveIEverRoundState {
  if (state.lifecycleState === "result" && state.result) {
    return state;
  }

  return {
    ...state,
    lifecycleState: "result",
    result: calculateNeverHaveIEverResult(state, now),
  };
}

export function getNeverHaveIEverSnapshot(
  state: NeverHaveIEverRoundState,
  playerId: string | undefined,
  now: Date | string,
): NeverHaveIEverSnapshot {
  const answer = playerId ? state.answers.find((item) => item.playerId === playerId) : undefined;
  const scoreDelta = playerId
    ? state.result?.scoreDeltas.find((delta) => delta.playerId === playerId)
    : undefined;

  return createRoundSnapshot({
    gameMode: NEVER_HAVE_I_EVER_GAME_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    lifecycleState: state.lifecycleState,
    clock: state.clock,
    serverNow: now,
    publicState:
      state.lifecycleState === "result" && state.result
        ? { phase: "result", prompt: state.prompt, result: state.result }
        : {
            phase: "active",
            prompt: state.prompt,
            submittedCount: state.answers.length,
            totalPlayers: state.players.length,
          },
    playerState: {
      hasSubmitted: Boolean(answer),
      ...(answer ? { answer: answer.answer } : {}),
      ...(scoreDelta ? { scoreDelta: scoreDelta.delta } : {}),
    },
  });
}

export function calculateNeverHaveIEverResult(
  state: NeverHaveIEverRoundState,
  now: Date | string,
): NeverHaveIEverRoundResult {
  const haveDonePlayers = getPlayersForAnswer(state, "have_done_it");
  const neverDonePlayers = getPlayersForAnswer(state, "never_done_it");
  const [haveDonePercentage, neverDonePercentage] = calculatePercentages(
    haveDonePlayers.length,
    neverDonePlayers.length,
  );
  const answeredPlayerIds = new Set(state.answers.map((answer) => answer.playerId));
  const scoreDeltas: GameScoreDelta[] = state.answers.map((answer) => {
    const player = findPlayer(state.players, answer.playerId);
    return { playerId: answer.playerId, nickname: player?.nickname, delta: 1, reason: "Resposta enviada" };
  });

  return {
    roundId: state.roundId,
    totalAnswers: state.answers.length,
    options: [
      {
        answer: "have_done_it",
        label: "Ja fiz",
        count: haveDonePlayers.length,
        percentage: haveDonePercentage,
        players: haveDonePlayers,
        nicknames: haveDonePlayers.map((player) => player.nickname),
      },
      {
        answer: "never_done_it",
        label: "Nunca fiz",
        count: neverDonePlayers.length,
        percentage: neverDonePercentage,
        players: neverDonePlayers,
        nicknames: neverDonePlayers.map((player) => player.nickname),
      },
    ],
    abstainedPlayers: state.players.filter((player) => !answeredPlayerIds.has(player.playerId)),
    scoreDeltas,
    finishedAt: toIso(now),
  };
}

export function selectNeverHaveIEverPrompt(input: {
  promptDeck: readonly NeverHaveIEverPrompt[];
  usedPromptIds: readonly string[];
  contentLevel: GameContentLevel;
}): NeverHaveIEverPrompt {
  const used = new Set(input.usedPromptIds);
  const levels = getAllowedContentLevels(input.contentLevel);
  const prompt = input.promptDeck.find(
    (candidate) =>
      !used.has(candidate.id) &&
      levels.includes(candidate.contentLevel) &&
      candidate.text.trim().length > 0,
  );

  if (!prompt) {
    throw new Error("No Eu Nunca prompts are available for this content level.");
  }

  return prompt;
}

function validateAnswerAction(
  state: NeverHaveIEverRoundState,
  action: NeverHaveIEverAnswerRequest,
  now: Date | string,
): GameSubmissionAck | undefined {
  if (state.lifecycleState !== "active") {
    return reject(state, action.playerId, "round_not_active", "Ronda fechada.");
  }
  if (action.roomId !== state.roomId || action.roundId !== state.roundId) {
    return reject(state, action.playerId, "invalid_submission", "Resposta enviada para a sala ou ronda errada.");
  }
  if (!findPlayer(state.players, action.playerId)) {
    return reject(state, action.playerId, "player_not_in_room", "Jogador nao pertence a esta sala.");
  }
  if (isPastDeadline(state.clock, now)) {
    return reject(state, action.playerId, "deadline_passed", "O tempo desta ronda terminou.");
  }
  if (!isNeverHaveIEverAnswer(action.answer)) {
    return reject(state, action.playerId, "invalid_submission", "Resposta invalida para Eu Nunca.");
  }
  if (hasPlayerSubmitted(state.answers, action.playerId)) {
    return reject(state, action.playerId, "duplicate_submission", "Este jogador ja respondeu.");
  }

  return undefined;
}

function reject(
  state: NeverHaveIEverRoundState,
  playerId: string,
  code: GameErrorCode,
  message: string,
): GameSubmissionAck {
  return createRejectedSubmissionAck({
    gameMode: NEVER_HAVE_I_EVER_GAME_ID,
    roomId: state.roomId,
    roundId: state.roundId,
    playerId,
    code,
    message,
    lifecycleState: state.lifecycleState,
  });
}

function getPlayersForAnswer(
  state: NeverHaveIEverRoundState,
  answer: NeverHaveIEverAnswer,
): PlayerSummary[] {
  return state.answers
    .filter((item) => item.answer === answer)
    .map((item) => findPlayer(state.players, item.playerId))
    .filter((player): player is PlayerSummary => Boolean(player));
}

function calculatePercentages(countA: number, countB: number): [number, number] {
  const total = countA + countB;
  if (total === 0) {
    return [0, 0];
  }

  const percentageA = Math.round((countA / total) * 100);
  return [percentageA, 100 - percentageA];
}

function getAllowedContentLevels(contentLevel: GameContentLevel): readonly GameContentLevel[] {
  if (contentLevel === "family") {
    return ["family"];
  }
  if (contentLevel === "friends") {
    return ["family", "friends"];
  }
  return ["family", "friends", "bar"];
}

function toIso(value: Date | string): string {
  return new Date(value).toISOString();
}

