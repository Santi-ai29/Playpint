import type {
  RoundSnapshot,
  WhatWouldYouDoPlayerState,
  WhatWouldYouDoPublicState,
  WhatWouldYouDoVoteRequest,
} from "../../../../../packages/contracts/src";
import {
  createWhatWouldYouDoScreenModel,
  createWhatWouldYouDoVoteAction,
  type WhatWouldYouDoOptionModel,
  type WhatWouldYouDoScreenModel,
} from "./screenModel";
import { whatWouldYouDoTheme } from "./theme";

export type WhatWouldYouDoGameBackgroundStyle = "premium_illustrated_bar";

export interface WhatWouldYouDoGameView {
  backgroundStyle: WhatWouldYouDoGameBackgroundStyle;
  brand: {
    logoText: string;
    logoAsset: string;
    modeLabel: string;
  };
  header: WhatWouldYouDoScreenModel["header"];
  status: WhatWouldYouDoScreenModel["status"];
  prompt: {
    text: string;
  };
  optionLayout: "duel_buttons" | "result_bars";
  options: Array<
    WhatWouldYouDoOptionModel & {
      visualState: "selected" | "enabled" | "disabled" | "winner";
    }
  >;
  footer?: {
    tone: "orange" | "muted" | "cyan";
    text: string;
  };
  result?: {
    title: string;
    leadingOptionLabel?: string;
    winnerLabel: string;
    leadingPercentage?: string;
    socialLine?: string;
    bars: Array<{
      optionId: string;
      label: string;
      votesLabel: string;
      percentageLabel: string;
      percentage: number;
      isWinner: boolean;
    }>;
  };
}

export interface WhatWouldYouDoVoteIntent {
  enabled: boolean;
  action?: WhatWouldYouDoVoteRequest;
  reason?: "not_voting" | "already_voted" | "expired" | "unknown_option";
}

export interface WhatWouldYouDoVoteDraft {
  selectedOptionId?: string;
  canConfirm: boolean;
  options: Array<{
    optionId: string;
    selected: boolean;
    disabled: boolean;
  }>;
}

export function createWhatWouldYouDoGameView(
  snapshot: RoundSnapshot<WhatWouldYouDoPublicState, WhatWouldYouDoPlayerState>,
  now: Date | string | number,
): WhatWouldYouDoGameView {
  const model = createWhatWouldYouDoScreenModel(snapshot, now);

  return {
    backgroundStyle: "premium_illustrated_bar",
    brand: {
      logoText: whatWouldYouDoTheme.brandLogoText,
      logoAsset: whatWouldYouDoTheme.brandLogoAsset,
      modeLabel: whatWouldYouDoTheme.modeLabel,
    },
    header: model.header,
    status: model.status,
    prompt: {
      text: model.prompt,
    },
    optionLayout: model.status === "result" ? "result_bars" : "duel_buttons",
    options: model.options.map((option) => ({
      ...option,
      visualState: getOptionVisualState(model.status, option),
    })),
    footer: createFooter(model),
    result: model.resultSummary
      ? {
          title: model.resultSummary.title,
          leadingOptionLabel: model.resultSummary.leadingOptionLabel,
          winnerLabel: model.resultSummary.winnerLabel,
          leadingPercentage:
            typeof model.resultSummary.leadingPercentage === "number"
              ? `${model.resultSummary.leadingPercentage}%`
              : undefined,
          socialLine: model.resultSummary.socialLine,
          bars: model.resultRows.map((row) => ({
            optionId: row.optionId,
            label: row.label,
            votesLabel: row.votes === 1 ? "1 voto" : `${row.votes} votos`,
            percentageLabel: `${row.percentage}%`,
            percentage: row.percentage,
            isWinner: row.isWinner,
          })),
        }
      : undefined,
  };
}

export function createWhatWouldYouDoVoteIntent(input: {
  model: WhatWouldYouDoScreenModel;
  playerId: string;
  optionId: string;
}): WhatWouldYouDoVoteIntent {
  if (input.model.hasVoted) {
    return { enabled: false, reason: "already_voted" };
  }

  if (input.model.status !== "voting") {
    return { enabled: false, reason: "not_voting" };
  }

  if (input.model.isExpired) {
    return { enabled: false, reason: "expired" };
  }

  if (!input.model.options.some((option) => option.optionId === input.optionId)) {
    return { enabled: false, reason: "unknown_option" };
  }

  return {
    enabled: true,
    action: createWhatWouldYouDoVoteAction({
      playerId: input.playerId,
      questionId: input.model.questionId,
      optionId: input.optionId,
    }),
  };
}

export function createWhatWouldYouDoVoteDraft(input: {
  model: WhatWouldYouDoScreenModel;
  selectedOptionId?: string;
}): WhatWouldYouDoVoteDraft {
  const canChoose =
    input.model.status === "voting" &&
    !input.model.hasVoted &&
    !input.model.isExpired;

  const hasValidSelection = Boolean(
    input.selectedOptionId &&
      input.model.options.some(
        (option) => option.optionId === input.selectedOptionId,
      ),
  );

  return {
    selectedOptionId: input.selectedOptionId,
    canConfirm: canChoose && hasValidSelection,
    options: input.model.options.map((option) => ({
      optionId: option.optionId,
      selected: option.optionId === input.selectedOptionId,
      disabled: !canChoose,
    })),
  };
}

function getOptionVisualState(
  status: WhatWouldYouDoScreenModel["status"],
  option: WhatWouldYouDoOptionModel,
): "selected" | "enabled" | "disabled" | "winner" {
  if (status === "result" && option.isWinner) {
    return "winner";
  }

  if (option.selected) {
    return "selected";
  }

  return option.disabled ? "disabled" : "enabled";
}

function createFooter(
  model: WhatWouldYouDoScreenModel,
): WhatWouldYouDoGameView["footer"] {
  if (model.status === "waiting_question") {
    return {
      tone: "muted",
      text: whatWouldYouDoTheme.copy.waitingTitle,
    };
  }

  if (model.status === "voting") {
    return {
      tone: "cyan",
      text: `${model.submittedCount}/${model.totalPlayers} votos`,
    };
  }

  if (model.status === "submitted") {
    return {
      tone: "orange",
      text: whatWouldYouDoTheme.copy.voteSent,
    };
  }

  return undefined;
}
