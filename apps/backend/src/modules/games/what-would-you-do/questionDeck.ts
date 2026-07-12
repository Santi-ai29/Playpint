import type { WhatWouldYouDoQuestion } from "../../../../../../packages/contracts/src";

interface QuestionSeed {
  prompt: string;
  options: [string, string];
  contentLevel: "friends" | "bar";
}

const questionSeeds: QuestionSeed[] = [
  {
    prompt: "Se um tubarao aparecesse a tua frente, o que fazias?",
    options: ["Fugia", "Ficava paralisado"],
    contentLevel: "friends",
  },
  {
    prompt: "Se o teu crush visse uma mensagem constrangedora tua, o que fazias?",
    options: ["Assumia com charme", "Inventava uma desculpa"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de cantar karaoke sem saber a letra, o que fazias?",
    options: ["Inventava com confianca", "Passava o microfone"],
    contentLevel: "friends",
  },
  {
    prompt: "Se acordasses sem bateria e sem saber onde estas, o que fazias?",
    options: ["Pedia ajuda", "Agia como se fosse normal"],
    contentLevel: "bar",
  },
  {
    prompt: "Se recebesses uma chamada do teu ex durante um encontro, o que fazias?",
    options: ["Ignorava", "Atendia so para ver"],
    contentLevel: "bar",
  },
  {
    prompt: "Se ganhasses uma viagem surpresa hoje, o que fazias?",
    options: ["Ia sem pensar", "Organizava tudo primeiro"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo confessasse uma crush pela tua crush, o que fazias?",
    options: ["Apoiava", "Entrava em modo competitivo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se te dessem o comando da musica da noite, o que fazias?",
    options: ["Punha banger atras de banger", "Passava ao DJ da mesa"],
    contentLevel: "friends",
  },
  {
    prompt: "Se tivesses de escolher entre shot gratis ou sobremesa gratis, o que fazias?",
    options: ["Shot gratis", "Sobremesa gratis"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem mandasse mensagem a dizer 'temos de falar', o que fazias?",
    options: ["Ligava logo", "Fingia que nao vi"],
    contentLevel: "friends",
  },
  {
    prompt: "Se te pedissem para discursar numa festa, o que fazias?",
    options: ["Improvisava", "Fugia para a casa de banho"],
    contentLevel: "friends",
  },
  {
    prompt: "Se a mesa pedisse uma ultima rodada, o que fazias?",
    options: ["Alinhava", "Chamava juizo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se encontrasses 50 euros no chao do bar, o que fazias?",
    options: ["Procurava o dono", "Pagava uma rodada"],
    contentLevel: "bar",
  },
  {
    prompt: "Se o teu telemovel fosse projetado no ecra, o que fazias?",
    options: ["Bloqueava tudo", "Dizia que era arte"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de cozinhar para a mesa inteira, o que fazias?",
    options: ["Arriscava", "Pedia take-away"],
    contentLevel: "friends",
  },
  {
    prompt: "Se alguem te desafiasse para dancar no meio do sitio, o que fazias?",
    options: ["Dancava", "Filmava de longe"],
    contentLevel: "friends",
  },
  {
    prompt: "Se a tua playlist em shuffle revelasse um guilty pleasure, o que fazias?",
    options: ["Cantava ainda mais alto", "Saltava a musica"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um desconhecido te chamasse pelo nome, o que fazias?",
    options: ["Cumprimentava como amigo", "Perguntava quem era"],
    contentLevel: "friends",
  },
  {
    prompt: "Se tivesses de escolher uma desculpa para sair cedo, o que fazias?",
    options: ["Culpava o trabalho", "Dizia a verdade"],
    contentLevel: "bar",
  },
  {
    prompt: "Se uma foto tua antiga voltasse ao grupo, o que fazias?",
    options: ["Ria contigo", "Apagava o grupo"],
    contentLevel: "friends",
  },
  {
    prompt: "Se a tua crush pedisse conselho amoroso, o que fazias?",
    options: ["Dava conselho sincero", "Plantava duvida"],
    contentLevel: "bar",
  },
  {
    prompt: "Se perdesses uma aposta da mesa, o que fazias?",
    options: ["Cumpria logo", "Negociava novas regras"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo dissesse 'confia em mim' antes de pedir favor, o que fazias?",
    options: ["Confiava", "Fazia perguntas"],
    contentLevel: "friends",
  },
  {
    prompt: "Se tivesses de mandar a ultima mensagem primeiro, o que fazias?",
    options: ["Mandava", "Esperava orgulho passar"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a tua encomenda chegasse errada mas melhor, o que fazias?",
    options: ["Aceitava feliz", "Avisava na mesma"],
    contentLevel: "friends",
  },
  {
    prompt: "Se o bar fechasse e a noite ainda estivesse boa, o que fazias?",
    options: ["Procurava after", "Ia dormir com dignidade"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem te desse um elogio inesperado, o que fazias?",
    options: ["Agradecia com estilo", "Ficava sem jeito"],
    contentLevel: "friends",
  },
  {
    prompt: "Se tivesses de escolher a musica de entrada da tua vida, o que fazias?",
    options: ["Escolhia algo epico", "Escolhia algo ridiculo"],
    contentLevel: "friends",
  },
  {
    prompt: "Se aparecesse uma oportunidade perfeita mas arriscada, o que fazias?",
    options: ["Saltava de cabeca", "Pedia mais detalhes"],
    contentLevel: "friends",
  },
  {
    prompt: "Se alguem mandasse uma indireta clara no grupo, o que fazias?",
    options: ["Respondia com outra", "Fingia que nao era comigo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se te oferecessem VIP mas so podias levar uma pessoa, o que fazias?",
    options: ["Levava o mais leal", "Fazia sorteio dramatico"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de trocar de outfit com alguem da mesa, o que fazias?",
    options: ["Escolhia logo", "Recusava diplomaticamente"],
    contentLevel: "friends",
  },
];

export const defaultWhatWouldYouDoQuestionDeck =
  createWhatWouldYouDoQuestionDeck();

export function createWhatWouldYouDoQuestionDeck(
  targetCount = questionSeeds.length,
): WhatWouldYouDoQuestion[] {
  if (!Number.isInteger(targetCount) || targetCount <= 0) {
    throw new Error("What would you do question count must be positive.");
  }

  if (targetCount > questionSeeds.length) {
    throw new Error(
      `What would you do deck only contains ${questionSeeds.length} questions.`,
    );
  }

  const questions = questionSeeds.slice(0, targetCount).map((seed, index) => ({
    id: `wwyd_${(index + 1).toString().padStart(4, "0")}`,
    prompt: normalizePrompt(seed.prompt),
    options: [
      { id: "a", label: normalizePrompt(seed.options[0]) },
      { id: "b", label: normalizePrompt(seed.options[1]) },
    ] as WhatWouldYouDoQuestion["options"],
    contentLevel: seed.contentLevel,
  }));

  if (new Set(questions.map((question) => question.prompt)).size !== questions.length) {
    throw new Error("What would you do deck contains duplicate prompts.");
  }

  return questions;
}

function normalizePrompt(prompt: string): string {
  return prompt.replace(/\s+/g, " ").trim();
}
