import type {
  NeverHaveIEverAnswer,
  NeverHaveIEverSnapshot,
} from "../../../../../packages/contracts/src";
import { NEVER_HAVE_I_EVER_MANIFEST } from "../../../../../packages/contracts/src";
import { createGameShellState } from "../core";

export interface NeverHaveIEverAnswerButtonModel {
  answer: NeverHaveIEverAnswer;
  label: string;
  disabled: boolean;
  selected: boolean;
}

export interface NeverHaveIEverResultRowModel {
  answer: NeverHaveIEverAnswer;
  label: string;
  count: number;
  percentage: number;
  nicknames: string[];
  selectedByPlayer: boolean;
}

export interface NeverHaveIEverViewModel {
  screen: "answer" | "submitted" | "closed" | "result";
  title: string;
  prompt: string;
  secondsRemaining: number;
  canSubmit: boolean;
  answerButtons: [NeverHaveIEverAnswerButtonModel, NeverHaveIEverAnswerButtonModel];
  resultRows?: [NeverHaveIEverResultRowModel, NeverHaveIEverResultRowModel];
  totalAnswers?: number;
  scoreDelta?: number;
}

export function createNeverHaveIEverViewModel(
  snapshot: NeverHaveIEverSnapshot,
  now: Date | string = new Date(),
): NeverHaveIEverViewModel {
  const shell = createGameShellState({
    manifest: NEVER_HAVE_I_EVER_MANIFEST,
    snapshot,
    now,
  });
  const playerAnswer = snapshot.playerState?.answer;

  if (snapshot.publicState.phase === "result") {
    return {
      screen: "result",
      title: shell.gameTitle,
      prompt: snapshot.publicState.prompt.text,
      secondsRemaining: 0,
      canSubmit: false,
      answerButtons: createAnswerButtons(true, playerAnswer),
      resultRows: snapshot.publicState.result.options.map((option) => ({
        answer: option.answer,
        label: option.label,
        count: option.count,
        percentage: option.percentage,
        nicknames: option.nicknames,
        selectedByPlayer: option.answer === playerAnswer,
      })) as [NeverHaveIEverResultRowModel, NeverHaveIEverResultRowModel],
      totalAnswers: snapshot.publicState.result.totalAnswers,
      scoreDelta: snapshot.playerState?.scoreDelta,
    };
  }

  const hasSubmitted = snapshot.playerState?.hasSubmitted ?? false;
  const canSubmit = !shell.actionLocked && !hasSubmitted;

  return {
    screen: hasSubmitted ? "submitted" : shell.secondsRemaining === 0 ? "closed" : "answer",
    title: shell.gameTitle,
    prompt: snapshot.publicState.prompt.text,
    secondsRemaining: shell.secondsRemaining,
    canSubmit,
    answerButtons: createAnswerButtons(!canSubmit, playerAnswer),
  };
}

function createAnswerButtons(
  disabled: boolean,
  playerAnswer?: NeverHaveIEverAnswer,
): [NeverHaveIEverAnswerButtonModel, NeverHaveIEverAnswerButtonModel] {
  return [
    {
      answer: "have_done_it",
      label: "Ja fiz",
      disabled,
      selected: playerAnswer === "have_done_it",
    },
    {
      answer: "never_done_it",
      label: "Nunca fiz",
      disabled,
      selected: playerAnswer === "never_done_it",
    },
  ];
}

