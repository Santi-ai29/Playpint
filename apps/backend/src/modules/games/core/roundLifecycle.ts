import type {
  GameErrorCode,
  GameLifecycleState,
  GameModeId,
  GameRoundSnapshot,
  GameSubmissionAck,
  PlayerSummary,
  RoundClock,
} from "../../../../../../packages/contracts/src";

export interface TrackedSubmission {
  playerId: string;
  submittedAt: string;
}

export function createRoundClock(input: {
  now: Date | string;
  durationSeconds: number;
}): RoundClock {
  if (!Number.isFinite(input.durationSeconds) || input.durationSeconds <= 0) {
    throw new Error("durationSeconds must be greater than zero");
  }

  const startsAt = toDate(input.now);
  return {
    startsAt: startsAt.toISOString(),
    endsAt: new Date(
      startsAt.getTime() + input.durationSeconds * 1000,
    ).toISOString(),
  };
}

export function isPastDeadline(clock: RoundClock, now: Date | string): boolean {
  return toDate(now).getTime() >= Date.parse(clock.endsAt);
}

export function hasPlayerSubmitted(
  submissions: readonly TrackedSubmission[],
  playerId: string,
): boolean {
  return submissions.some((submission) => submission.playerId === playerId);
}

export function shouldFinishRound(input: {
  clock: RoundClock;
  now: Date | string;
  submittedPlayerIds: readonly string[];
  totalPlayers: number;
  finishWhenAllSubmitted?: boolean;
}): boolean {
  if (isPastDeadline(input.clock, input.now)) {
    return true;
  }

  return (
    input.finishWhenAllSubmitted !== false &&
    input.totalPlayers > 0 &&
    input.submittedPlayerIds.length >= input.totalPlayers
  );
}

export function findPlayer(
  players: readonly PlayerSummary[],
  playerId: string,
): PlayerSummary | undefined {
  return players.find((player) => player.playerId === playerId);
}

export function createSubmissionAck(input: {
  gameMode: GameModeId;
  roomId: string;
  roundId: string;
  playerId: string;
  accepted: true;
  submittedAt: Date | string;
  lifecycleState?: GameLifecycleState;
}): GameSubmissionAck {
  return {
    accepted: true,
    gameMode: input.gameMode,
    roomId: input.roomId,
    roundId: input.roundId,
    playerId: input.playerId,
    submittedAt: toDate(input.submittedAt).toISOString(),
    lifecycleState: input.lifecycleState,
  };
}

export function createRejectedSubmissionAck(input: {
  gameMode: GameModeId;
  roomId: string;
  roundId: string;
  playerId: string;
  code: GameErrorCode;
  message: string;
  lifecycleState?: GameLifecycleState;
}): GameSubmissionAck {
  return {
    accepted: false,
    gameMode: input.gameMode,
    roomId: input.roomId,
    roundId: input.roundId,
    playerId: input.playerId,
    lifecycleState: input.lifecycleState,
    error: {
      code: input.code,
      message: input.message,
    },
  };
}

export function createRoundSnapshot<TPublicState, TPlayerState>(input: {
  gameMode: GameModeId;
  roomId: string;
  roundId: string;
  lifecycleState: GameLifecycleState;
  clock: RoundClock;
  serverNow: Date | string;
  publicState: TPublicState;
  playerState?: TPlayerState;
}): GameRoundSnapshot<TPublicState, TPlayerState> {
  return {
    gameMode: input.gameMode,
    roomId: input.roomId,
    roundId: input.roundId,
    lifecycleState: input.lifecycleState,
    clock: input.clock,
    serverNow: toDate(input.serverNow).toISOString(),
    publicState: input.publicState,
    playerState: input.playerState,
  };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}
