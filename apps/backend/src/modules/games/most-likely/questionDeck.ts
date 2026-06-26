import type { MostLikelyQuestion } from "../../../../../../packages/contracts/src";

const TARGET_QUESTION_COUNT = 1000;

const spicyActions = [
  "mandar mensagem ao ex",
  "stalkar o ex",
  "voltar para o ex",
  "negar uma crush",
  "ter uma crush secreta",
  "fazer ciumes",
  "dar ghost",
  "responder seco",
  "mandar audio longo",
  "apagar mensagens",
  "meter like antigo",
  "mandar indireta",
  "flertar sem admitir",
  "pedir o instagram",
  "chamar amor sem querer",
  "beijar e fingir que nada aconteceu",
  "criar clima do nada",
  "ficar com vergonha de uma mensagem",
  "perder a cabeca por uma resposta",
  "inventar desculpa para sair",
  "aparecer so para ver alguem",
  "sair sem avisar",
  "chegar atrasado",
  "dizer so mais uma",
  "pagar uma rodada",
  "pedir comida para todos",
  "sumir com o copo",
  "virar DJ",
  "cantar alto",
  "fazer drama",
  "contar segredo",
  "exagerar uma historia",
  "prometer juizo",
  "quebrar o juizo",
  "rir na hora errada",
  "tirar foto de tudo",
  "mandar mensagem no grupo errado",
  "responder ao crush rapido demais",
  "fingir que nao se importa",
  "decorar a vida do crush",
  "guardar prints",
  "pedir conselho e ignorar",
  "fazer cena por pouca coisa",
  "chamar alguem para conversar e desaparecer",
  "ficar online e nao responder",
  "mandar emoji perigoso",
  "mandar 'estas acordado?'",
  "confundir amizade com sinal",
  "ter plano B",
  "sair para fumar e desaparecer",
  "voltar com historia mal contada",
  "beijar alguem no canto",
  "ficar ciumento sem motivo",
  "dizer que nao e ciumento",
  "jurar que mudou",
  "voltar a fazer igual",
  "pedir desculpa com charme",
  "usar charme para escapar",
  "cair na conversa errada",
  "prometer nao beber muito",
  "beber mais do que devia",
  "pedir shot",
  "puxar conversa com desconhecido",
  "apaixonar-se em 10 minutos",
  "trocar olhares",
  "ter contacto guardado com nome falso",
  "esconder notificacao",
  "virar o telemovel para baixo",
  "rir de nervoso",
  "ficar vermelho",
  "mandar mensagem e apagar",
  "seguir alguem so por curiosidade",
  "criar teoria de casal",
  "perceber o clima primeiro",
  "estragar o clima sem querer",
  "confessar demais",
  "chamar ex de amigo",
  "dizer que superou",
  "provar que nao superou",
  "desaparecer do radar",
  "reaparecer como nada fosse",
  "pedir segunda oportunidade",
  "aceitar convite perigoso",
  "deixar visto de proposito",
  "responder so de madrugada",
  "mudar de assunto quando apertam",
  "mandar print para o grupo",
  "pedir opiniao sobre outfit",
  "arranjar crush em ferias",
  "achar que tudo e sinal",
  "fazer match e congelar",
  "mandar cantada fraca",
  "ganhar bebida no charme",
  "fazer brinde suspeito",
  "inventar after",
  "fechar o bar",
  "acordar arrependido",
  "culpar o alcool",
  "lembrar de tudo menos do que convem",
  "dizer 'eu avisei'",
];

const questionFlavors = [
  "",
  "hoje",
  "no grupo",
  "numa festa",
  "depois de beber",
  "sem pensar duas vezes",
  "so para provocar",
  "e negar depois",
  "quando toca a musica certa",
  "antes de ir embora",
];

export const defaultMostLikelyQuestionDeck: MostLikelyQuestion[] =
  createMostLikelyQuestionDeck();

export function createMostLikelyQuestionDeck(
  targetCount = TARGET_QUESTION_COUNT,
): MostLikelyQuestion[] {
  const questions = new Map<string, MostLikelyQuestion>();
  const totalCombinations = spicyActions.length * questionFlavors.length;

  if (targetCount > totalCombinations) {
    throw new Error(
      `Most likely question bank can only produce ${totalCombinations} questions.`,
    );
  }

  for (let index = 0; questions.size < targetCount; index += 1) {
    const action = spicyActions[index % spicyActions.length];
    const flavor =
      questionFlavors[Math.floor(index / spicyActions.length) % questionFlavors.length];
    const prompt = createPrompt(action, flavor);

    if (!questions.has(prompt)) {
      questions.set(prompt, {
        id: `ml_${(questions.size + 1).toString().padStart(4, "0")}`,
        prompt,
        contentLevel: "bar",
      });
    }
  }

  return [...questions.values()];
}

function normalizePrompt(prompt: string): string {
  return prompt.replace(/\s+/g, " ").trim();
}

function createPrompt(action: string, flavor: string): string {
  return normalizePrompt(
    `Quem e mais provavel de ${action}${flavor ? ` ${flavor}` : ""}?`,
  );
}
