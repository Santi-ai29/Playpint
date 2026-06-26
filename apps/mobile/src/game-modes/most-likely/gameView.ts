import type {
  MostLikelyPlayerState,
  MostLikelyPublicState,
  MostLikelyVoteRequest,
  RoundSnapshot,
} from "../../../../../packages/contracts/src";
import {
  createMostLikelyScreenModel,
  createMostLikelyVoteAction,
  type MostLikelyPlayerOptionModel,
  type MostLikelyScreenModel,
} from "./screenModel";
import { mostLikelyTheme } from "./theme";

export type MostLikelyGameBackgroundStyle = "premium_illustrated_bar";

export interface MostLikelyGameView {
  backgroundStyle: MostLikelyGameBackgroundStyle;
  brand: {
    logoText: string;
    modeLabel: string;
  };
  header: MostLikelyScreenModel["header"];
  status: MostLikelyScreenModel["status"];
  prompt: {
    text: string;
  };
  playerGrid: Array<
    MostLikelyPlayerOptionModel & {
      visualState: "selected" | "enabled" | "disabled" | "winner";
    }
  >;
  footer?: {
    tone: "orange" | "muted";
    text: string;
  };
  result?: {
    title: string;
    winnerNickname?: string;
    winnerLabel: string;
    winnerPercentage?: string;
    sarcasticLine?: string;
    tableRows: Array<{
      playerId: string;
      label: string;
      votesLabel: string;
      percentageLabel: string;
      isWinner: boolean;
    }>;
  };
}

export interface MostLikelyVoteIntent {
  enabled: boolean;
  action?: MostLikelyVoteRequest;
  reason?: "not_voting" | "already_voted" | "expired" | "unknown_target";
}

export interface MostLikelyVoteDraft {
  selectedTargetPlayerId?: string;
  canConfirm: boolean;
  options: Array<{
    playerId: string;
    selected: boolean;
    disabled: boolean;
  }>;
}

export function createMostLikelyGameView(
  snapshot: RoundSnapshot<MostLikelyPublicState, MostLikelyPlayerState>,
  now: Date | string | number,
): MostLikelyGameView {
  const model = createMostLikelyScreenModel(snapshot, now);

  return {
    backgroundStyle: "premium_illustrated_bar",
    brand: {
      logoText: mostLikelyTheme.brandLogoText,
      modeLabel: mostLikelyTheme.modeLabel,
    },
    header: model.header,
    status: model.status,
    prompt: {
      text: model.prompt,
    },
    playerGrid: model.players.map((player) => ({
      ...player,
      visualState: getPlayerVisualState(model.status, player),
    })),
    footer: createFooter(model),
    result: model.resultSummary
      ? {
          title: model.resultSummary.title,
          winnerNickname: model.resultSummary.winnerNickname,
          winnerLabel: model.resultSummary.winnerLabel,
          winnerPercentage:
            typeof model.resultSummary.winnerPercentage === "number"
              ? `${model.resultSummary.winnerPercentage}%`
              : undefined,
          sarcasticLine: model.resultSummary.sarcasticLine,
          tableRows: model.resultRows.map((row) => ({
            playerId: row.playerId,
            label: row.nickname,
            votesLabel: row.votes === 1 ? "1 voto" : `${row.votes} votos`,
            percentageLabel: `${row.percentage}%`,
            isWinner: row.isWinner,
          })),
        }
      : undefined,
  };
}

export function createMostLikelyVoteIntent(input: {
  model: MostLikelyScreenModel;
  playerId: string;
  targetPlayerId: string;
}): MostLikelyVoteIntent {
  if (input.model.hasVoted) {
    return { enabled: false, reason: "already_voted" };
  }

  if (input.model.status !== "voting") {
    return { enabled: false, reason: "not_voting" };
  }

  if (input.model.isExpired) {
    return { enabled: false, reason: "expired" };
  }

  if (!input.model.players.some((player) => player.playerId === input.targetPlayerId)) {
    return { enabled: false, reason: "unknown_target" };
  }

  return {
    enabled: true,
    action: createMostLikelyVoteAction({
      playerId: input.playerId,
      questionId: input.model.questionId,
      targetPlayerId: input.targetPlayerId,
    }),
  };
}

export function createMostLikelyVoteDraft(input: {
  model: MostLikelyScreenModel;
  selectedTargetPlayerId?: string;
}): MostLikelyVoteDraft {
  const canChoose =
    input.model.status === "voting" &&
    !input.model.hasVoted &&
    !input.model.isExpired;

  const hasValidSelection = Boolean(
    input.selectedTargetPlayerId &&
      input.model.players.some(
        (player) => player.playerId === input.selectedTargetPlayerId,
      ),
  );

  return {
    selectedTargetPlayerId: input.selectedTargetPlayerId,
    canConfirm: canChoose && hasValidSelection,
    options: input.model.players.map((player) => ({
      playerId: player.playerId,
      selected: player.playerId === input.selectedTargetPlayerId,
      disabled: !canChoose,
    })),
  };
}

function getPlayerVisualState(
  status: MostLikelyScreenModel["status"],
  player: MostLikelyPlayerOptionModel,
): "selected" | "enabled" | "disabled" | "winner" {
  if (status === "result" && player.isWinner) {
    return "winner";
  }

  if (player.selected) {
    return "selected";
  }

  return player.disabled ? "disabled" : "enabled";
}

function createFooter(
  model: MostLikelyScreenModel,
): MostLikelyGameView["footer"] {
  if (model.status === "voting") {
    return {
      tone: "muted",
      text: mostLikelyTheme.copy.votingTitle,
    };
  }

  if (model.status === "waiting") {
    return {
      tone: "orange",
      text: mostLikelyTheme.copy.voteSent,
    };
  }

  return undefined;
}
