import {
  STOP_GAME_MANIFEST,
  STOP_GAME_MODE_ID,
  type RoundSnapshot,
  type StopAnswers,
  type StopCategoryId,
  type StopPlayerState,
  type StopPublicState,
  type StopSubmitAnswersRequest,
} from "../../../../../packages/contracts/src";
import { createRoundTimerModel } from "../core";
import { stopTheme } from "./theme";

export type StopScreenStatus = "answering" | "submitted" | "review" | "result";

export interface StopAnswerFieldModel {
  categoryId: StopCategoryId;
  label: string;
  value: string;
  disabled: boolean;
  placeholder: string;
  accent: "yellow" | "cyan";
}

export interface StopResultAnswerCellModel {
  categoryId: StopCategoryId;
  answer: string;
  points: number;
  reason: string;
  valid: boolean;
}

export interface StopScreenModel {
  gameModeId: typeof STOP_GAME_MODE_ID;
  title: string;
  header: {
    brandLogoText: string;
    brandLogoAsset: string;
    modeLabel: string;
    phaseLabel: string;
    timerLabel: string;
  };
  copy: typeof stopTheme.copy;
  status: StopScreenStatus;
  roomName?: string;
  roundId: string;
  letter: string;
  remainingSeconds: number;
  isExpired: boolean;
  progress: number;
  submittedCount: number;
  totalPlayers: number;
  stoppedByNickname?: string;
  hasSubmitted: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canStop: boolean;
  fields: StopAnswerFieldModel[];
  result?: {
    title: string;
    letter: string;
    stoppedByLabel?: string;
    categories: Array<{
      categoryId: StopCategoryId;
      label: string;
    }>;
    answerRows: Array<{
      playerId: string;
      nickname: string;
      totalScore: number;
      isRoundWinner: boolean;
      cells: StopResultAnswerCellModel[];
    }>;
    roundRanking: Array<{
      rank: number;
      playerId: string;
      nickname: string;
      totalScore: number;
      isWinner: boolean;
    }>;
    overallRanking: Array<{
      rank: number;
      playerId: string;
      nickname: string;
      totalScore: number;
      roundsWon: number;
      lastRoundScore: number;
      isLeader: boolean;
    }>;
  };
  review?: {
    title: string;
    stoppedByLabel?: string;
    categories: Array<{
      categoryId: StopCategoryId;
      label: string;
    }>;
    rows: Array<{
      playerId: string;
      nickname: string;
      answers: Array<{
        categoryId: StopCategoryId;
        label: string;
        value: string;
        startsWithLetter: boolean;
        invalidated: boolean;
      }>;
    }>;
  };
  animation: {
    letterEntry: "pop";
    stopHighlight: boolean;
    rankingReveal: boolean;
  };
}

export function createStopScreenModel(
  snapshot: RoundSnapshot<StopPublicState, StopPlayerState>,
  now: Date | string | number,
): StopScreenModel {
  const timer = createRoundTimerModel(snapshot.clock, now);
  const result = snapshot.publicState.result;
  const hasSubmitted = Boolean(snapshot.playerState?.hasSubmitted);
  const isActive = snapshot.lifecycleState === "active" && !timer.isExpired;
  const isReview = snapshot.lifecycleState === "submitted";
  const canSubmit = isActive && !hasSubmitted;
  const answers = snapshot.playerState?.answers ?? {};

  return {
    gameModeId: STOP_GAME_MODE_ID,
    title: STOP_GAME_MANIFEST.title,
    header: {
      brandLogoText: stopTheme.brandLogoText,
      brandLogoAsset: stopTheme.brandLogoAsset,
      modeLabel: stopTheme.modeLabel,
      phaseLabel: getPhaseLabel(snapshot, hasSubmitted),
      timerLabel: formatTimerLabel(timer.remainingSeconds),
    },
    copy: stopTheme.copy,
    status: getStatus(Boolean(result), isReview, hasSubmitted),
    roomName: snapshot.publicState.roomName,
    roundId: snapshot.roundId,
    letter: snapshot.publicState.letter,
    remainingSeconds: timer.remainingSeconds,
    isExpired: timer.isExpired,
    progress: timer.progress,
    submittedCount: snapshot.publicState.submittedCount,
    totalPlayers: snapshot.publicState.totalPlayers,
    stoppedByNickname: snapshot.publicState.stoppedByNickname,
    hasSubmitted,
    canEdit: canSubmit,
    canSubmit,
    canStop: canSubmit,
    fields: snapshot.publicState.categories.map((category, index) => ({
      categoryId: category.id,
      label: category.label,
      value: answers[category.id] ?? "",
      disabled: !canSubmit,
      placeholder: `${category.placeholder} com ${snapshot.publicState.letter}`,
      accent: index % 3 === 1 ? "cyan" : "yellow",
    })),
    review: snapshot.publicState.review
      ? {
          title: "Rever respostas",
          stoppedByLabel: snapshot.publicState.review.stoppedByNickname
            ? `${snapshot.publicState.review.stoppedByNickname} carregou Stop`
            : undefined,
          categories: snapshot.publicState.review.categories.map((category) => ({
            categoryId: category.id,
            label: category.label,
          })),
          rows: snapshot.publicState.review.rows.map((row) => ({
            playerId: row.playerId,
            nickname: row.nickname,
            answers: row.answers.map((answer) => ({
              categoryId: answer.categoryId,
              label: answer.categoryLabel,
              value: answer.answer,
              startsWithLetter: answer.startsWithLetter,
              invalidated: answer.invalidated,
            })),
          })),
        }
      : undefined,
    result: result ? createResultModel(snapshot.publicState) : undefined,
    animation: {
      letterEntry: "pop",
      stopHighlight: Boolean(snapshot.publicState.stoppedByNickname),
      rankingReveal: Boolean(result),
    },
  };
}

export function createStopSubmitAnswersAction(input: {
  playerId: string;
  roundId: string;
  answers: StopAnswers;
  stopRound?: boolean;
}): StopSubmitAnswersRequest {
  return {
    playerId: input.playerId,
    roundId: input.roundId,
    answers: input.answers,
    stopRound: input.stopRound,
  };
}

function getStatus(
  hasResult: boolean,
  isReview: boolean,
  hasSubmitted: boolean,
): StopScreenStatus {
  if (hasResult) {
    return "result";
  }

  if (isReview) {
    return "review";
  }

  return hasSubmitted ? "submitted" : "answering";
}

function getPhaseLabel(
  snapshot: RoundSnapshot<StopPublicState, StopPlayerState>,
  hasSubmitted: boolean,
): string {
  if (snapshot.lifecycleState === "result") {
    return stopTheme.copy.resultTitle;
  }

  if (snapshot.lifecycleState === "submitted") {
    return "Revisao";
  }

  if (hasSubmitted) {
    return stopTheme.copy.submittedTitle;
  }

  return stopTheme.copy.answeringTitle;
}

function formatTimerLabel(remainingSeconds: number): string {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function createResultModel(
  publicState: StopPublicState,
): NonNullable<StopScreenModel["result"]> {
  const result = publicState.result;

  if (!result) {
    throw new Error("Cannot create Stop result model without a result.");
  }

  const topRoundScore = result.playerScores[0]?.totalScore ?? 0;
  const leadingOverallScore = result.overallRanking?.[0]?.totalScore ?? 0;

  return {
    title: stopTheme.copy.resultTitle,
    letter: result.letter,
    stoppedByLabel: result.stoppedByNickname
      ? `${result.stoppedByNickname} carregou Stop`
      : undefined,
    categories: publicState.categories.map((category) => ({
      categoryId: category.id,
      label: category.label,
    })),
    answerRows: result.playerScores.map((score) => ({
      playerId: score.playerId,
      nickname: score.nickname,
      totalScore: score.totalScore,
      isRoundWinner: topRoundScore > 0 && score.totalScore === topRoundScore,
      cells: publicState.categories.map((category) => {
        const scoredAnswer = result.categoryResults
          .find((item) => item.category.id === category.id)
          ?.answers.find((answer) => answer.playerId === score.playerId);

        return {
          categoryId: category.id,
          answer: scoredAnswer?.answer ?? "",
          points: scoredAnswer?.points ?? 0,
          reason: scoredAnswer?.reason ?? "empty",
          valid: scoredAnswer?.valid ?? false,
        };
      }),
    })),
    roundRanking: result.playerScores.map((score, index) => ({
      rank: index + 1,
      playerId: score.playerId,
      nickname: score.nickname,
      totalScore: score.totalScore,
      isWinner: topRoundScore > 0 && score.totalScore === topRoundScore,
    })),
    overallRanking:
      result.overallRanking?.map((entry) => ({
        rank: entry.rank,
        playerId: entry.playerId,
        nickname: entry.nickname,
        totalScore: entry.totalScore,
        roundsWon: entry.roundsWon,
        lastRoundScore: entry.lastRoundScore,
        isLeader:
          leadingOverallScore > 0 && entry.totalScore === leadingOverallScore,
      })) ?? [],
  };
}
