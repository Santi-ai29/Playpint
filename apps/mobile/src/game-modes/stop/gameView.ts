import type {
  RoundSnapshot,
  StopAnswers,
  StopPlayerState,
  StopPublicState,
  StopSubmitAnswersRequest,
} from "../../../../../packages/contracts/src";
import {
  createStopScreenModel,
  createStopSubmitAnswersAction,
  type StopAnswerFieldModel,
  type StopScreenModel,
} from "./screenModel";
import { stopTheme } from "./theme";

export type StopGameBackgroundStyle = "premium_word_table";

export interface StopGameView {
  backgroundStyle: StopGameBackgroundStyle;
  brand: {
    logoText: string;
    logoAsset: string;
    modeLabel: string;
  };
  header: StopScreenModel["header"];
  status: StopScreenModel["status"];
  hero: {
    letter: string;
    timerLabel: string;
    submittedLabel: string;
    stoppedByLabel?: string;
  };
  answerGrid: Array<
    StopAnswerFieldModel & {
      visualState: "editable" | "locked" | "accent";
    }
  >;
  primaryAction: {
    label: string;
    tone: "orange" | "muted";
    disabled: boolean;
  };
  result?: {
    title: string;
    letter: string;
    stoppedByLabel?: string;
    tableColumns: string[];
    answerRows: Array<{
      playerId: string;
      nickname: string;
      totalLabel: string;
      isWinner: boolean;
      answers: Array<{
        label: string;
        pointsLabel: string;
        valid: boolean;
      }>;
    }>;
    rankingRows: Array<{
      rankLabel: string;
      playerId: string;
      nickname: string;
      totalLabel: string;
      detailLabel: string;
      isLeader: boolean;
    }>;
  };
}

export interface StopSubmitIntent {
  enabled: boolean;
  action?: StopSubmitAnswersRequest;
  reason?: "already_submitted" | "not_active" | "expired";
}

export interface StopAnswerDraft {
  answers: StopAnswers;
  canSubmit: boolean;
  canStop: boolean;
  fields: Array<{
    categoryId: string;
    value: string;
    disabled: boolean;
  }>;
}

export function createStopGameView(
  snapshot: RoundSnapshot<StopPublicState, StopPlayerState>,
  now: Date | string | number,
): StopGameView {
  const model = createStopScreenModel(snapshot, now);

  return {
    backgroundStyle: "premium_word_table",
    brand: {
      logoText: stopTheme.brandLogoText,
      logoAsset: stopTheme.brandLogoAsset,
      modeLabel: stopTheme.modeLabel,
    },
    header: model.header,
    status: model.status,
    hero: {
      letter: model.letter,
      timerLabel: model.header.timerLabel,
      submittedLabel: `${model.submittedCount}/${model.totalPlayers}`,
      stoppedByLabel: model.stoppedByNickname
        ? `${model.stoppedByNickname} carregou Stop`
        : undefined,
    },
    answerGrid: model.fields.map((field) => ({
      ...field,
      visualState: getFieldVisualState(model, field),
    })),
    primaryAction: {
      label:
        model.status === "result"
          ? stopTheme.copy.nextRoundButton
          : stopTheme.copy.stopButton,
      tone: model.canStop ? "orange" : "muted",
      disabled: model.status !== "result" && !model.canStop,
    },
    result: model.result
      ? {
          title: model.result.title,
          letter: model.result.letter,
          stoppedByLabel: model.result.stoppedByLabel,
          tableColumns: model.result.categories.map((category) => category.label),
          answerRows: model.result.answerRows.map((row) => ({
            playerId: row.playerId,
            nickname: row.nickname,
            totalLabel: `${row.totalScore} pts`,
            isWinner: row.isRoundWinner,
            answers: row.cells.map((cell) => ({
              label: cell.answer || "-",
              pointsLabel: `${cell.points}`,
              valid: cell.valid,
            })),
          })),
          rankingRows: model.result.overallRanking.map((row) => ({
            rankLabel: `#${row.rank}`,
            playerId: row.playerId,
            nickname: row.nickname,
            totalLabel: `${row.totalScore} pts`,
            detailLabel:
              row.roundsWon === 1
                ? "1 ronda ganha"
                : `${row.roundsWon} rondas ganhas`,
            isLeader: row.isLeader,
          })),
        }
      : undefined,
  };
}

export function createStopSubmitIntent(input: {
  model: StopScreenModel;
  playerId: string;
  answers: StopAnswers;
  stopRound?: boolean;
}): StopSubmitIntent {
  if (input.model.hasSubmitted) {
    return { enabled: false, reason: "already_submitted" };
  }

  if (input.model.status !== "answering") {
    return { enabled: false, reason: "not_active" };
  }

  if (input.model.isExpired) {
    return { enabled: false, reason: "expired" };
  }

  return {
    enabled: true,
    action: createStopSubmitAnswersAction({
      playerId: input.playerId,
      roundId: input.model.roundId,
      answers: input.answers,
      stopRound: input.stopRound,
    }),
  };
}

export function createStopAnswerDraft(input: {
  model: StopScreenModel;
  answers: StopAnswers;
}): StopAnswerDraft {
  const answers = input.model.fields.reduce<StopAnswers>((draft, field) => {
    draft[field.categoryId] =
      input.answers[field.categoryId] ?? field.value ?? "";

    return draft;
  }, {});
  const hasAnyAnswer = Object.values(answers).some((answer) =>
    String(answer).trim(),
  );

  return {
    answers,
    canSubmit: input.model.canSubmit,
    canStop: input.model.canStop && hasAnyAnswer,
    fields: input.model.fields.map((field) => ({
      categoryId: field.categoryId,
      value: answers[field.categoryId] ?? "",
      disabled: field.disabled,
    })),
  };
}

function getFieldVisualState(
  model: StopScreenModel,
  field: StopAnswerFieldModel,
): "editable" | "locked" | "accent" {
  if (!model.canEdit) {
    return "locked";
  }

  return field.accent === "cyan" ? "accent" : "editable";
}
