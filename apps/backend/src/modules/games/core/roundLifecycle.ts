import type {
  GameLifecycleState,
  PublicPlayer,
  RoundClock,
  RoundSnapshot,
  SubmissionAck,
} from "../../../../../../packages/contracts/src";

export type DateInput = Date | string | number;

export function createRoundClock(input: {
  now: DateInput;
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

export function isPastDeadline(clock: RoundClock, now: DateInput): boolean {
  return toDate(now).getTime() >= Date.parse(clock.endsAt);
}

export function hasPlayerSubmitted<T>(
  submissions: T[],
  playerId: string,
  getPlayerId: (submission: T) => string,
): boolean {
  return submissions.some((submission) => getPlayerId(submission) === playerId);
}

export function shouldFinishRound(input: {
  clock: RoundClock;
  now: DateInput;
  submittedPlayerIds: string[];
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
  players: PublicPlayer[],
  playerId: string,
): PublicPlayer | undefined {
  return players.find((player) => player.playerId === playerId);
}

export function createSubmissionAck(input: {
  gameMode: string;
  roomId: string;
  roundId: string;
  playerId: string;
  submittedAt: DateInput;
  lifecycleState: GameLifecycleState;
}): SubmissionAck {
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
  gameMode: string;
  roomId: string;
  roundId: string;
  playerId: string;
  code: string;
  message: string;
  lifecycleState: GameLifecycleState;
}): SubmissionAck {
  return {
    accepted: false,
    gameMode: input.gameMode,
    roomId: input.roomId,
    roundId: input.roundId,
    playerId: input.playerId,
    lifecycleState: input.lifecycleState,
    errorCode: input.code,
    message: input.message,
    error: {
      code: input.code,
      message: input.message,
    },
  };
}

export function createRoundSnapshot<TPublicState, TPlayerState>(input: {
  gameMode: string;
  roomId: string;
  roundId: string;
  lifecycleState: GameLifecycleState;
  clock: RoundClock;
  serverNow: DateInput;
  publicState: TPublicState;
  playerState?: TPlayerState;
}): RoundSnapshot<TPublicState, TPlayerState> {
  return {
    gameMode: input.gameMode,
    gameModeId: input.gameMode,
    roomId: input.roomId,
    roundId: input.roundId,
    lifecycleState: input.lifecycleState,
    clock: input.clock,
    serverNow: toDate(input.serverNow).toISOString(),
    publicState: input.publicState,
    playerState: input.playerState,
  };
}

export function toIso(value: DateInput): string {
  return toDate(value).toISOString();
}

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}
