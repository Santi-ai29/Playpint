import type {
  GameErrorCode,
  GameManifest,
  GameRoundSnapshot,
  GameSubmissionAck,
} from "../../../../../packages/contracts/src";
import { createRoundTimerModel } from "./roundTimer";

export interface GameShellState {
  gameTitle: string;
  lifecycleState: GameRoundSnapshot["lifecycleState"];
  secondsRemaining: number;
  actionLocked: boolean;
  lastErrorCode?: GameErrorCode;
}

export function createGameShellState(input: {
  manifest: GameManifest;
  snapshot: GameRoundSnapshot;
  now: Date | string;
  submissionPending?: boolean;
  lastAck?: GameSubmissionAck;
}): GameShellState {
  const hasRejectedAck = input.lastAck && !input.lastAck.accepted;

  return {
    gameTitle: input.manifest.title,
    lifecycleState: input.snapshot.lifecycleState,
    secondsRemaining: createRoundTimerModel(input.snapshot.clock, input.now)
      .remainingSeconds,
    actionLocked:
      Boolean(input.submissionPending) ||
      input.snapshot.lifecycleState !== "active",
    lastErrorCode: hasRejectedAck ? input.lastAck?.errorCode : undefined,
  };
}
