import type { MostLikelyQuestion } from "../../../../../../packages/contracts/src";

const TARGET_QUESTION_COUNT = 1000;

const spicySetups = [
  "mande mensagem ao ex depois de dizer que superou",
  "meta like numa foto antiga e tente fingir que foi sem querer",
  "flirte com alguem so para ganhar uma bebida",
  "faca ciumes e depois diga que nao era nada",
  "tenha uma crush secreta nesta mesa",
  "se apaixone por alguem que acabou de conhecer",
  "mande um audio demasiado honesto depois do segundo copo",
  "apague uma conversa antes de mostrar o telemovel",
  "diga que nao quer nada serio e depois fique com ciumes",
  "arranje desculpa para sentar ao lado de quem quer",
  "troque olhares a noite toda e diga que era coincidencia",
  "mande mensagem so com 'estas acordado?'",
  "finja que nao viu uma mensagem comprometida",
  "fique nervoso quando alguem pega no telemovel dele",
  "use charme para sair de uma situacao complicada",
  "deixe alguem em visto e depois apareca como se nada fosse",
  "prometa que vai embora cedo e acabe por fechar o bar",
  "diga que e so amizade mas aja de forma suspeita",
  "conte um segredo e depois peca para ninguem contar",
  "seja apanhado a olhar para quem nao devia",
  "mande indiretas nas stories e negue ate ao fim",
  "volte para uma pessoa que jurou nunca mais responder",
  "diga 'eu nao sou assim' antes de fazer exatamente isso",
  "invente uma desculpa so para fugir de um date",
  "se arrependa de uma mensagem logo depois de enviar",
  "faca drama por uma resposta seca",
  "fique todo feliz com uma notificacao especifica",
  "tenha um plano B romantico sem admitir",
  "leve uma rejeicao com estilo e depois conte outra versao",
  "mande um emoji perigoso sem pensar nas consequencias",
  "crie clima num assunto que nao tinha clima nenhum",
  "diga que nao esta interessado e pergunte por essa pessoa cinco minutos depois",
  "faca uma cena de filme por alguem que mal conhece",
  "guarde prints para usar como prova",
  "seja o primeiro a reparar em casal novo no grupo",
  "arranje um crush em ferias e chame de destino",
  "diga que so vai ver uma pessoa e volte tres horas depois",
  "faca uma pergunta inocente com segunda intencao",
  "use o alcool como desculpa para dizer a verdade",
  "mande mensagem e depois apague para parecer misterioso",
  "diga que nao sente saudades mas saiba tudo da vida da pessoa",
  "fique com vergonha quando alguem le a ultima conversa",
  "transforme uma brincadeira numa tensao estranha",
  "faca match e depois nao saiba o que dizer",
  "finja maturidade mas fique a espera de resposta",
  "desapareca da mesa para atender uma chamada suspeita",
  "volte de uma ida ao balcao com uma historia mal contada",
  "diga que vai ficar tranquilo e cause o caos romantico",
  "tenha sempre uma pessoa proibida na cabeca",
  "faca amizade depressa demais com alguem atraente",
];

const spicyTwists = [
  "numa noite de bar",
  "quando ninguem esta a ver",
  "e ainda ache perfeitamente normal",
  "e depois negue com conviccao",
  "antes de ir embora",
  "durante uma festa",
  "no grupo de amigos",
  "com o telemovel virado para baixo",
  "so porque tocou a musica certa",
  "e conte a historia de forma muito diferente no dia seguinte",
  "sem perceber que toda a mesa reparou",
  "e depois diga que foi so brincadeira",
  "por pura curiosidade",
  "para provar um ponto que ninguem pediu",
  "e acabe por se meter em confusao",
  "com a maior cara de inocente",
  "e ainda peca conselhos ao grupo",
  "quando devia estar a agir com juizo",
  "e faca de conta que tinha tudo controlado",
  "so para ver no que dava",
  "e depois culpe o ambiente",
  "quando a noite ja esta perigosa",
];

export const defaultMostLikelyQuestionDeck: MostLikelyQuestion[] =
  createMostLikelyQuestionDeck();

export function createMostLikelyQuestionDeck(
  targetCount = TARGET_QUESTION_COUNT,
): MostLikelyQuestion[] {
  const questions = new Map<string, MostLikelyQuestion>();
  const totalCombinations = spicySetups.length * spicyTwists.length;

  if (targetCount > totalCombinations) {
    throw new Error(
      `Most likely question bank can only produce ${totalCombinations} questions.`,
    );
  }

  for (let index = 0; questions.size < targetCount; index += 1) {
    const setup = spicySetups[index % spicySetups.length];
    const twist =
      spicyTwists[Math.floor(index / spicySetups.length) % spicyTwists.length];
    const prompt = normalizePrompt(`Quem e mais provavel que ${setup} ${twist}?`);

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
