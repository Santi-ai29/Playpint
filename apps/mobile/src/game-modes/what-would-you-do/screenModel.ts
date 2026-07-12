import {
  WHAT_WOULD_YOU_DO_GAME_MANIFEST,
  WHAT_WOULD_YOU_DO_GAME_MODE_ID,
  type RoundSnapshot,
  type WhatWouldYouDoPlayerState,
  type WhatWouldYouDoPublicState,
  type WhatWouldYouDoVoteRequest,
} from "../../../../../packages/contracts/src";
import { createRoundTimerModel } from "../core";
import { whatWouldYouDoTheme } from "./theme";

export type WhatWouldYouDoScreenStatus =
  | "waiting_question"
  | "voting"
  | "submitted"
  | "result";

export interface WhatWouldYouDoOptionModel {
  optionId: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  votes?: number;
  percentage?: number;
  isWinner: boolean;
}

export interface WhatWouldYouDoScreenModel {
  gameModeId: typeof WHAT_WOULD_YOU_DO_GAME_MODE_ID;
  title: string;
  header: {
    brandLogoText: string;
    brandLogoAsset: string;
    modeLabel: string;
    phaseLabel: string;
    timerLabel: string;
  };
  copy: {
    waitingTitle: string;
    votingTitle: string;
    voteSent: string;
  };
  status: WhatWouldYouDoScreenStatus;
  questionId: string;
  prompt: string;
  remainingSeconds: number;
  isExpired: boolean;
  progress: number;
  submittedCount: number;
  totalPlayers: number;
  hasVoted: boolean;
  canVote: boolean;
  selectedOptionId?: string;
  options: WhatWouldYouDoOptionModel[];
  resultSummary?: {
    title: string;
    leadingOptionLabel?: string;
    winnerLabel: string;
    leadingPercentage?: number;
    isTie: boolean;
    socialLine?: string;
  };
  resultRows: Array<{
    optionId: string;
    label: string;
    votes: number;
    percentage: number;
    isWinner: boolean;
  }>;
  voteTrail: Array<{
    voterNickname: string;
    optionLabel: string;
  }>;
}

export function createWhatWouldYouDoScreenModel(
  snapshot: RoundSnapshot<WhatWouldYouDoPublicState, WhatWouldYouDoPlayerState>,
  now: Date | string | number,
): WhatWouldYouDoScreenModel {
  const timer = createRoundTimerModel(snapshot.clock, now);
  const result = snapshot.publicState.result;
  const playerState = snapshot.playerState;
  const hasVoted = Boolean(playerState?.hasVoted);
  const isVoting = snapshot.lifecycleState === "voting";
  const canVote = isVoting && !timer.isExpired && !hasVoted;
  const winnerOptionIds = new Set(result?.winnerOptionIds ?? []);

  return {
    gameModeId: WHAT_WOULD_YOU_DO_GAME_MODE_ID,
    title: WHAT_WOULD_YOU_DO_GAME_MANIFEST.title,
    header: {
      brandLogoText: whatWouldYouDoTheme.brandLogoText,
      brandLogoAsset: whatWouldYouDoTheme.brandLogoAsset,
      modeLabel: whatWouldYouDoTheme.modeLabel,
      phaseLabel: getPhaseLabel(snapshot.lifecycleState, hasVoted),
      timerLabel: formatTimerLabel(timer.remainingSeconds),
    },
    copy: {
      waitingTitle: whatWouldYouDoTheme.copy.waitingTitle,
      votingTitle: whatWouldYouDoTheme.copy.votingTitle,
      voteSent: whatWouldYouDoTheme.copy.voteSent,
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
    selectedOptionId: playerState?.selectedOptionId,
    options: snapshot.publicState.question.options.map((option) => {
      const count = result?.optionResults.find(
        (item) => item.optionId === option.id,
      );

      return {
        optionId: option.id,
        label: option.label,
        selected: playerState?.selectedOptionId === option.id,
        disabled: !canVote,
        votes: count?.votes,
        percentage: count?.percentage,
        isWinner: winnerOptionIds.has(option.id),
      };
    }),
    resultSummary: result ? createResultSummary(result) : undefined,
    resultRows:
      result?.optionResults.map((row) => ({
        optionId: row.optionId,
        label: row.label,
        votes: row.votes,
        percentage: row.percentage,
        isWinner: row.isWinner,
      })) ?? [],
    voteTrail:
      result?.votes.map((vote) => ({
        voterNickname: vote.voterNickname,
        optionLabel: vote.optionLabel,
      })) ?? [],
  };
}

export function createWhatWouldYouDoVoteAction(
  input: WhatWouldYouDoVoteRequest,
): WhatWouldYouDoVoteRequest {
  return {
    playerId: input.playerId,
    questionId: input.questionId,
    optionId: input.optionId,
  };
}

function getStatus(
  hasResult: boolean,
  isVoting: boolean,
  hasVoted: boolean,
): WhatWouldYouDoScreenStatus {
  if (hasResult) {
    return "result";
  }

  if (hasVoted) {
    return "submitted";
  }

  return isVoting ? "voting" : "waiting_question";
}

function getPhaseLabel(lifecycleState: string, hasVoted: boolean): string {
  if (lifecycleState === "voting" && hasVoted) {
    return "Voto enviado";
  }

  switch (lifecycleState) {
    case "voting":
      return "Votacao";
    case "result":
      return whatWouldYouDoTheme.copy.resultTitle;
    default:
      return "Pergunta";
  }
}

function formatTimerLabel(remainingSeconds: number): string {
  return `00:${remainingSeconds.toString().padStart(2, "0")}`;
}

function createResultSummary(
  result: NonNullable<WhatWouldYouDoPublicState["result"]>,
): NonNullable<WhatWouldYouDoScreenModel["resultSummary"]> {
  const winners = result.optionResults.filter((option) => option.isWinner);
  const leadingOption = winners[0];
  const isTie = winners.length > 1;

  return {
    title: whatWouldYouDoTheme.copy.resultTitle,
    leadingOptionLabel: isTie ? "Empate" : leadingOption?.label,
    winnerLabel: isTie
      ? whatWouldYouDoTheme.copy.tieLabel
      : whatWouldYouDoTheme.copy.winnerLabel,
    leadingPercentage: leadingOption?.percentage,
    isTie,
    socialLine: createSocialLine(result, leadingOption, isTie),
  };
}

function createSocialLine(
  result: NonNullable<WhatWouldYouDoPublicState["result"]>,
  leadingOption: NonNullable<WhatWouldYouDoPublicState["result"]>["optionResults"][number] | undefined,
  isTie: boolean,
): string {
  if (!leadingOption) {
    return "A mesa ficou em silencio. Ainda mais suspeito.";
  }

  if (isTie) {
    return "A mesa dividiu-se. Isto merece defesa oral.";
  }

  const prompt = result.prompt.toLowerCase();
  const label = leadingOption.label.toLowerCase();

  if (prompt.includes("tubarao") || label.includes("fugia")) {
    return "Instinto de sobrevivencia ganhou sem grande debate.";
  }

  if (prompt.includes("crush") || prompt.includes("ex")) {
    return "A mesa escolheu drama com alguma dignidade.";
  }

  if (prompt.includes("rodada") || prompt.includes("bar")) {
    return "A decisao tem cheiro a noite longa.";
  }

  return "A mesa falou. Agora e fingir que era obvio.";
}
