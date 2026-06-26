import {
  MOST_LIKELY_GAME_MANIFEST,
  MOST_LIKELY_GAME_MODE_ID,
  type MostLikelyPlayerState,
  type MostLikelyPublicState,
  type MostLikelyVoteRequest,
  type RoundSnapshot,
} from "../../../../../packages/contracts/src";
import { createRoundTimerModel } from "../core";
import { mostLikelyTheme } from "./theme";

export type MostLikelyScreenStatus =
  | "question"
  | "voting"
  | "waiting"
  | "result";

export interface MostLikelyPlayerOptionModel {
  playerId: string;
  nickname: string;
  avatarUrl?: string;
  selected: boolean;
  disabled: boolean;
  votes?: number;
  percentage?: number;
  isWinner: boolean;
}

export interface MostLikelyScreenModel {
  gameModeId: typeof MOST_LIKELY_GAME_MODE_ID;
  title: string;
  header: {
    brandLogoText: string;
    modeLabel: string;
    phaseLabel: string;
    timerLabel: string;
  };
  copy: {
    votingTitle: string;
    voteSent: string;
  };
  status: MostLikelyScreenStatus;
  questionId: string;
  prompt: string;
  remainingSeconds: number;
  isExpired: boolean;
  progress: number;
  submittedCount: number;
  totalPlayers: number;
  hasVoted: boolean;
  canVote: boolean;
  selectedTargetPlayerId?: string;
  players: MostLikelyPlayerOptionModel[];
  winners: string[];
  resultSummary?: {
    title: string;
    winnerNickname?: string;
    winnerLabel: string;
    winnerPercentage?: number;
    sarcasticLine?: string;
  };
  resultRows: Array<{
    playerId: string;
    nickname: string;
    votes: number;
    percentage: number;
    isWinner: boolean;
  }>;
  voteTrail: Array<{
    voterNickname: string;
    targetNickname: string;
  }>;
}

export function createMostLikelyScreenModel(
  snapshot: RoundSnapshot<MostLikelyPublicState, MostLikelyPlayerState>,
  now: Date | string | number,
): MostLikelyScreenModel {
  const timer = createRoundTimerModel(snapshot.clock, now);
  const result = snapshot.publicState.result;
  const playerState = snapshot.playerState;
  const hasVoted = Boolean(playerState?.hasVoted);
  const isVoting = snapshot.lifecycleState === "voting";
  const canVote = isVoting && !timer.isExpired && !hasVoted;
  const winnerIds = new Set(
    result?.winners.map((winner) => winner.playerId) ?? [],
  );

  return {
    gameModeId: MOST_LIKELY_GAME_MODE_ID,
    title: MOST_LIKELY_GAME_MANIFEST.title,
    header: {
      brandLogoText: mostLikelyTheme.brandLogoText,
      modeLabel: mostLikelyTheme.modeLabel,
      phaseLabel: getPhaseLabel(snapshot.lifecycleState),
      timerLabel: formatTimerLabel(timer.remainingSeconds),
    },
    copy: {
      votingTitle: mostLikelyTheme.copy.votingTitle,
      voteSent: mostLikelyTheme.copy.voteSent,
    },
    status: getStatus(Boolean(result), isVoting, hasVoted),
    questionId: snapshot.publicState.question.id,
    prompt: snapshot.publicState.question.prompt,
    remainingSeconds: timer.remainingSeconds,
    isExpired: timer.isExpired,
    progress: timer.progress,
    submittedCount: snapshot.publicState.submittedCount,
    totalPlayers: snapshot.publicState.totalPlayers,
    hasVoted,
    canVote,
    selectedTargetPlayerId: playerState?.selectedTargetPlayerId,
    players: snapshot.publicState.players.map((player) => {
      const count = result?.voteCounts.find(
        (item) => item.playerId === player.playerId,
      );

      return {
        playerId: player.playerId,
        nickname: player.nickname,
        avatarUrl: player.avatarUrl,
        selected: playerState?.selectedTargetPlayerId === player.playerId,
        disabled: !canVote,
        votes: count?.votes,
        percentage: count?.percentage,
        isWinner: winnerIds.has(player.playerId),
      };
    }),
    winners: result?.winners.map((winner) => winner.nickname) ?? [],
    resultSummary: result ? createResultSummary(result) : undefined,
    resultRows:
      result?.voteCounts.map((count) => ({
        playerId: count.playerId,
        nickname: count.nickname,
        votes: count.votes,
        percentage: count.percentage,
        isWinner: winnerIds.has(count.playerId),
      })) ?? [],
    voteTrail:
      result?.votes.map((vote) => ({
        voterNickname: vote.voterNickname,
        targetNickname: vote.targetNickname,
      })) ?? [],
  };
}

export function createMostLikelyVoteAction(
  input: MostLikelyVoteRequest,
): MostLikelyVoteRequest {
  return {
    playerId: input.playerId,
    questionId: input.questionId,
    targetPlayerId: input.targetPlayerId,
  };
}

function getStatus(
  hasResult: boolean,
  isVoting: boolean,
  hasVoted: boolean,
): MostLikelyScreenStatus {
  if (hasResult) {
    return "result";
  }

  if (hasVoted) {
    return "waiting";
  }

  return isVoting ? "voting" : "question";
}

function getPhaseLabel(lifecycleState: string): string {
  switch (lifecycleState) {
    case "voting":
      return "Votacao";
    case "result":
      return mostLikelyTheme.copy.resultTitle;
    default:
      return "Ronda";
  }
}

function formatTimerLabel(remainingSeconds: number): string {
  return `00:${remainingSeconds.toString().padStart(2, "0")}`;
}

function createResultSummary(
  result: NonNullable<MostLikelyPublicState["result"]>,
): NonNullable<MostLikelyScreenModel["resultSummary"]> {
  const winner = result.winners[0];

  return {
    title: mostLikelyTheme.copy.resultTitle,
    winnerNickname: winner?.nickname,
    winnerLabel: mostLikelyTheme.copy.winnerLabel,
    winnerPercentage: winner?.percentage,
    sarcasticLine: winner
      ? `${winner.nickname} foi apanhado no radar da mesa. Esses olhares nao se explicam sozinhos.`
      : "A mesa ficou em silencio. Suspeito.",
  };
}
