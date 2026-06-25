import type {
  WouldYouRatherOptionId,
  WouldYouRatherQuestion,
  WouldYouRatherSnapshot,
} from "../../../../../packages/contracts/src";
import { createRoundTimerModel } from "../core";

export interface WouldYouRatherOptionModel {
  optionId: WouldYouRatherOptionId;
  label: string;
  disabled: boolean;
  selected: boolean;
  percentage?: number;
  nicknames?: string[];
}

export interface WouldYouRatherScreenModel {
  phase: "answer" | "waiting" | "result" | "closed";
  prompt: string;
  secondsRemaining: number;
  statusLabel: string;
  options: [WouldYouRatherOptionModel, WouldYouRatherOptionModel];
  totalVotes?: number;
  scoreDelta?: number;
}

export function createWouldYouRatherScreenModel(
  snapshot: WouldYouRatherSnapshot,
  now: Date | string = new Date(),
): WouldYouRatherScreenModel {
  const timer = createRoundTimerModel(snapshot.clock, now);
  const selectedOptionId = snapshot.playerState?.selectedOptionId;
  const hasSubmitted = snapshot.playerState?.hasSubmitted ?? false;
  const result = snapshot.publicState.result;

  if (snapshot.lifecycleState === "result" && result) {
    return {
      phase: "result",
      prompt: snapshot.publicState.question.prompt,
      secondsRemaining: 0,
      statusLabel: "Resultado oficial da ronda.",
      options: result.results.map((option) => ({
        optionId: option.optionId,
        label: option.label,
        disabled: true,
        selected: option.optionId === selectedOptionId,
        percentage: option.percentage,
        nicknames: option.nicknames,
      })) as [WouldYouRatherOptionModel, WouldYouRatherOptionModel],
      totalVotes: result.totalVotes,
      scoreDelta: snapshot.playerState?.scoreDelta,
    };
  }

  const phase = hasSubmitted ? "waiting" : timer.isExpired ? "closed" : "answer";
  const disabled = phase !== "answer";

  return {
    phase,
    prompt: snapshot.publicState.question.prompt,
    secondsRemaining: timer.remainingSeconds,
    statusLabel: hasSubmitted
      ? "Voto enviado. A espera dos resultados."
      : `${snapshot.publicState.submittedCount}/${snapshot.publicState.totalPlayers} votos enviados.`,
    options: createOptionModels(
      snapshot.publicState.question,
      disabled,
      selectedOptionId,
    ),
  };
}

function createOptionModels(
  question: WouldYouRatherQuestion,
  disabled: boolean,
  selectedOptionId?: WouldYouRatherOptionId,
): [WouldYouRatherOptionModel, WouldYouRatherOptionModel] {
  return [
    {
      optionId: "A",
      label: question.optionA,
      disabled,
      selected: selectedOptionId === "A",
    },
    {
      optionId: "B",
      label: question.optionB,
      disabled,
      selected: selectedOptionId === "B",
    },
  ];
}
