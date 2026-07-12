import type { WhatWouldYouDoQuestion } from "../../../../../../packages/contracts/src";

interface QuestionSeed {
  prompt: string;
  options: [string, string];
  contentLevel: "friends" | "bar";
}

const questionSeeds: QuestionSeed[] = [
  seed("O que preferias: ficar um mes sem telemovel ou um ano sem redes sociais?", "Um mes sem telemovel", "Um ano sem redes sociais"),
  seed("O que preferias: ler pensamentos durante um dia ou ficar invisivel durante uma hora?", "Ler pensamentos", "Ficar invisivel"),
  seed("O que preferias: ter bateria infinita sem Internet ou Internet rapida com 1% de bateria?", "Bateria infinita", "Internet rapida"),
  seed("O que preferias: viajar dez anos para o futuro ou dez anos para o passado?", "Ir ao futuro", "Voltar ao passado"),
  seed("O que preferias: dizer sempre o que pensas ou nunca poder dar opiniao?", "Dizer tudo", "Guardar opiniao"),
  seed("O que preferias: saber todos os segredos da mesa ou apagar um segredo teu?", "Saber segredos", "Apagar um segredo", "bar"),
  seed("O que preferias: transportes gratis para sempre ou comida gratis todos os fins de semana?", "Transportes gratis", "Comida gratis"),
  seed("O que preferias: viver junto ao mar sem dinheiro ou no centro com pouco tempo livre?", "Junto ao mar", "No centro"),
  seed("O que preferias: trabalhar quatro dias por semana ou ter ferias mais longas?", "Quatro dias", "Ferias longas"),
  seed("O que preferias: estudar sem exames ou trabalhar sem reunioes?", "Sem exames", "Sem reunioes"),
  seed("O que preferias: os teus amigos verem o teu historico ou a tua galeria?", "Historico aberto", "Galeria aberta", "bar"),
  seed("O que preferias: chegar sempre atrasado ou sempre cedo demais?", "Sempre atrasado", "Sempre cedo"),
  seed("O que preferias: jantar com o teu ex ou sair com a crush de um amigo?", "Jantar com ex", "Crush do amigo", "bar"),
  seed("O que preferias: nunca conseguir mentir ou nunca perceber quando mentem?", "Nunca mentir", "Nunca perceber"),
  seed("O que preferias: ser famoso sem dinheiro ou rico sem ninguem saber?", "Famoso sem dinheiro", "Rico anonimo"),
  seed("O que preferias: falar todos os idiomas ou tocar todos os instrumentos?", "Todos os idiomas", "Todos os instrumentos"),
  seed("O que preferias: casa pequena no centro ou casa enorme longe de tudo?", "Pequena no centro", "Enorme longe"),
  seed("O que preferias: musica alta todos os dias ou silencio total durante um mes?", "Musica alta", "Silencio total"),
  seed("O que preferias: perder todas as passwords ou perder todos os carregadores?", "Perder passwords", "Perder carregadores"),
  seed("O que preferias: so poder mandar audios ou so poder mandar mensagens curtas?", "So audios", "So mensagens"),
  seed("O que preferias: viajar sozinho para um sitio incrivel ou com amigos para um sitio normal?", "Viajar sozinho", "Ir com amigos"),
  seed("O que preferias: apagar uma vergonha antiga ou reviver um dia perfeito?", "Apagar vergonha", "Reviver dia perfeito"),
  seed("O que preferias: nunca sentir vergonha ou nunca sentir medo?", "Sem vergonha", "Sem medo"),
  seed("O que preferias: chuva nas ferias ou calor extremo no trabalho?", "Chuva nas ferias", "Calor no trabalho"),
  seed("O que preferias: voltar a infancia com a cabeca de hoje ou saltar para a reforma?", "Voltar a infancia", "Saltar para reforma"),
  seed("O que preferias: comer pizza todos os dias ou nunca mais comer pizza?", "Pizza todos os dias", "Nunca mais pizza"),
  seed("O que preferias: cafe sempre frio ou agua sempre morna?", "Cafe frio", "Agua morna"),
  seed("O que preferias: ter um cao que fala ou um telemovel que te responde?", "Cao que fala", "Telemovel esperto"),
  seed("O que preferias: o teu melhor amigo ganhar a lotaria ou tu ganhares e nao poderes contar?", "Amigo ganha", "Eu ganho calado", "bar"),
  seed("O que preferias: sair sem bateria ou sair sem carteira?", "Sem bateria", "Sem carteira"),
  seed("O que preferias: contar um segredo teu a todos ou guardar um segredo pesado de outro?", "Contar o meu", "Guardar o outro", "bar"),
  seed("O que preferias: ser elogiado falsamente ou criticado com sinceridade?", "Elogio falso", "Critica sincera"),
  seed("O que preferias: nunca mais tirar fotos ou nunca mais aparecer em fotos?", "Nao tirar fotos", "Nao aparecer"),
  seed("O que preferias: escola sem trabalhos de casa ou escola sem testes?", "Sem trabalhos", "Sem testes"),
  seed("O que preferias: emprego perfeito com chefe terrivel ou emprego medio com chefe incrivel?", "Emprego perfeito", "Chefe incrivel"),
  seed("O que preferias: viver sem vizinhos ou viver sem lojas por perto?", "Sem vizinhos", "Sem lojas"),
  seed("O que preferias: ser motorista de todos ou escolher sempre a musica?", "Ser motorista", "Escolher musica"),
  seed("O que preferias: esquecer sempre nomes ou esquecer sempre caras?", "Esquecer nomes", "Esquecer caras"),
  seed("O que preferias: comprar roupa sem experimentar ou comida sem provar?", "Roupa as cegas", "Comida as cegas"),
  seed("O que preferias: ter um clone preguicoso ou um assistente mandao?", "Clone preguicoso", "Assistente mandao"),
  seed("O que preferias: perder todos os contactos ou todas as fotografias?", "Perder contactos", "Perder fotografias"),
  seed("O que preferias: roupa sempre amarrotada ou cabelo sempre molhado?", "Roupa amarrotada", "Cabelo molhado"),
  seed("O que preferias: Internet perfeita sem bateria ou bateria infinita sem rede?", "Internet perfeita", "Bateria infinita"),
  seed("O que preferias: ficar sem GPS ou ficar sem fones?", "Sem GPS", "Sem fones"),
  seed("O que preferias: ser honesto demais ou educado demais?", "Honesto demais", "Educado demais"),
  seed("O que preferias: date perfeito sem conversa ou date estranho com quimica?", "Perfeito sem conversa", "Estranho com quimica", "bar"),
  seed("O que preferias: festa sem musica ou jantar sem comida?", "Festa sem musica", "Jantar sem comida"),
  seed("O que preferias: falar sempre em rimas ou cantar todas as respostas?", "Falar em rimas", "Cantar respostas"),
  seed("O que preferias: cidade incrivel sem amigos ou amigos numa cidade chata?", "Cidade incrivel", "Amigos perto"),
  seed("O que preferias: ver o futuro das relacoes ou apagar o passado amoroso?", "Ver o futuro", "Apagar passado", "bar"),
  seed("O que preferias: ter sorte no jogo ou sorte no amor?", "Sorte no jogo", "Sorte no amor", "bar"),
  seed("O que preferias: acordar rico sem memoria ou pobre com um plano perfeito?", "Rico sem memoria", "Pobre com plano"),
  seed("O que preferias: tornar todos os teus likes publicos ou todas as pesquisas publicas?", "Likes publicos", "Pesquisas publicas", "bar"),
  seed("O que preferias: nunca mais usar emojis ou nunca mais usar memes?", "Sem emojis", "Sem memes"),
  seed("O que preferias: verao sem ferias ou inverno com ferias longas?", "Verao sem ferias", "Inverno com ferias"),
  seed("O que preferias: cozinhar qualquer prato ou ter comida entregue gratis?", "Cozinhar tudo", "Entrega gratis"),
  seed("O que preferias: falar com animais ou falar com maquinas?", "Falar com animais", "Falar com maquinas"),
  seed("O que preferias: perder sempre o comboio ou apanhar sempre o lugar do meio?", "Perder comboio", "Lugar do meio"),
  seed("O que preferias: saber sempre spoilers ou nunca saber finais?", "Saber spoilers", "Nao saber finais"),
  seed("O que preferias: apresentar sem slides ou cantar karaoke sem letra?", "Apresentar sem slides", "Karaoke sem letra"),
  seed("O que preferias: os teus amigos escolherem o teu outfit ou o algoritmo escolher?", "Amigos escolhem", "Algoritmo escolhe"),
  seed("O que preferias: apagar uma vergonha tua ou saber a verdade sobre um rumor?", "Apagar vergonha", "Saber a verdade", "bar"),
  seed("O que preferias: nunca esperar em filas ou nunca procurar estacionamento?", "Sem filas", "Sem estacionamento"),
  seed("O que preferias: viver num hotel ou numa carrinha equipada?", "Viver num hotel", "Carrinha equipada"),
  seed("O que preferias: teletransportar mas chegar atrasado ou voar muito devagar?", "Teletransportar atrasado", "Voar devagar"),
  seed("O que preferias: ter sono em festas ou fome em reunioes?", "Sono em festas", "Fome em reunioes"),
  seed("O que preferias: ser lembrado pelas piadas ou pelos conselhos?", "Pelas piadas", "Pelos conselhos"),
  seed("O que preferias: nunca usar dinheiro fisico ou nunca usar cartoes?", "Sem dinheiro fisico", "Sem cartoes"),
  seed("O que preferias: uma viagem de luxo por ano ou viagens simples todos os meses?", "Luxo anual", "Viagens mensais"),
  seed("O que preferias: ganhar sempre debates ou nunca entrar em discussoes?", "Ganhar debates", "Evitar discussoes"),
  seed("O que preferias: ficar invisivel so quando ninguem olha ou ler mentes de desconhecidos?", "Invisivel inutil", "Mentes desconhecidas"),
  seed("O que preferias: pausar o tempo por dez segundos ou voltar atras dez segundos?", "Pausar tempo", "Voltar dez segundos"),
  seed("O que preferias: ter sempre roupa certa ou saber sempre a resposta certa?", "Roupa certa", "Resposta certa"),
  seed("O que preferias: ninguem lembrar o teu aniversario ou todos fazerem surpresa enorme?", "Ninguem lembra", "Surpresa enorme"),
  seed("O que preferias: casa sempre cheia de amigos ou tempo sozinho sempre que quiseres?", "Casa cheia", "Tempo sozinho"),
  seed("O que preferias: perder no jogo e pagar rodada ou ganhar e pagar por todos?", "Perder e pagar", "Ganhar e pagar", "bar"),
  seed("O que preferias: ouvir uma confidencia pesada ou descobrir que eras o tema?", "Ouvir confidencia", "Ser o tema", "bar"),
  seed("O que preferias: mensagens lidas em voz alta ou fotos antigas projetadas?", "Mensagens em voz alta", "Fotos projetadas", "bar"),
  seed("O que preferias: verdade dolorosa ou mentira confortavel?", "Verdade dolorosa", "Mentira confortavel", "bar"),
  seed("O que preferias: ter sempre razao ou nunca precisar de discutir?", "Sempre razao", "Sem discussoes"),
  seed("O que preferias: ser responsavel pelo plano ou ir sem saber nada?", "Fazer o plano", "Ir as cegas"),
  seed("O que preferias: mudar uma decisao tua do passado ou melhorar o futuro de um amigo?", "Mudar passado", "Ajudar amigo"),
  seed("O que preferias: vida sem musica ou vida sem filmes?", "Sem musica", "Sem filmes"),
  seed("O que preferias: acordar num pais aleatorio ou viver sempre no mesmo bairro?", "Pais aleatorio", "Mesmo bairro"),
  seed("O que preferias: ser excelente numa coisa ou razoavel em tudo?", "Excelente numa coisa", "Razoavel em tudo"),
  seed("O que preferias: saber o que pensam de ti ou ninguem poder opinar sobre ti?", "Saber pensamentos", "Sem opinioes", "bar"),
  seed("O que preferias: fazer uma promessa impossivel ou admitir logo que nao consegues?", "Promessa impossivel", "Admitir logo"),
  seed("O que preferias: trocar telemoveis com um amigo ou trocar contas de streaming?", "Trocar telemoveis", "Trocar streaming", "bar"),
  seed("O que preferias: chefe que le pensamentos ou colegas que veem o teu calendario?", "Chefe mentalista", "Colegas curiosos"),
  seed("O que preferias: testes surpresa ou trabalhos de grupo eternos?", "Testes surpresa", "Grupos eternos"),
  seed("O que preferias: receber mil euros hoje ou cem euros por mes durante um ano?", "Mil hoje", "Cem por mes"),
  seed("O que preferias: saltar filas com todos a ver ou esperar sem nunca stressar?", "Saltar filas", "Esperar em paz"),
  seed("O que preferias: ter sempre frio ou ter sempre calor?", "Sempre frio", "Sempre calor"),
  seed("O que preferias: rir em momentos serios ou chorar em momentos felizes?", "Rir serio", "Chorar feliz"),
  seed("O que preferias: nunca ficar perdido ou nunca perder objetos?", "Nunca perdido", "Nunca perder objetos"),
  seed("O que preferias: todos saberem o teu salario ou tu saberes o salario de todos?", "Sabem o meu", "Sei o de todos", "bar"),
  seed("O que preferias: esquecer aniversarios ou trocar nomes em publico?", "Esquecer aniversarios", "Trocar nomes"),
  seed("O que preferias: publicar sem querer o ultimo chat ou o ultimo pensamento?", "Ultimo chat", "Ultimo pensamento", "bar"),
  seed("O que preferias: escolher sempre o lugar no jantar ou sempre o tema da conversa?", "Lugar no jantar", "Tema da conversa"),
  seed("O que preferias: entornarem bebida em ti ou tu entornares em alguem?", "Bebida em mim", "Bebida noutro"),
  seed("O que preferias: vizinho DJ todas as noites ou colega que canta de manha?", "Vizinho DJ", "Colega cantor"),
  seed("O que preferias: ser convidado para tudo ou ter paz sem convites?", "Convidado para tudo", "Paz sem convites"),
  seed("O que preferias: armario infinito ou viagens de comboio gratis?", "Armario infinito", "Comboios gratis"),
  seed("O que preferias: manhas sempre perfeitas ou noites sempre epicas?", "Manhas perfeitas", "Noites epicas"),
  seed("O que preferias: saber quando te mentem ou quando estao fartos de ti?", "Detectar mentiras", "Detectar cansaco", "bar"),
  seed("O que preferias: jantar com alguem que fala demais ou com alguem que nao fala?", "Fala demais", "Nao fala"),
  seed("O que preferias: nunca mais ter notificacoes ou receber notificacoes de tudo?", "Sem notificacoes", "Tudo notificado"),
  seed("O que preferias: ter uma memoria perfeita ou esquecer o que te faz mal?", "Memoria perfeita", "Esquecer o mau"),
  seed("O que preferias: ser sempre o primeiro a chegar ou sempre o ultimo a sair?", "Primeiro a chegar", "Ultimo a sair"),
  seed("O que preferias: escolher entre amor e carreira ou amizade e dinheiro?", "Amor ou carreira", "Amizade ou dinheiro", "bar"),
  seed("O que preferias: perder um debate em publico ou ganhar mas parecer arrogante?", "Perder debate", "Parecer arrogante"),
  seed("O que preferias: ter planos todos os dias ou nunca conseguir combinar nada?", "Planos diarios", "Nada combinado"),
  seed("O que preferias: viver sem elevador ou sem micro-ondas?", "Sem elevador", "Sem micro-ondas"),
  seed("O que preferias: ser conhecido por exagerar ou por desaparecer?", "Exagerar", "Desaparecer", "bar"),
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

  const questions = questionSeeds.slice(0, targetCount).map((item, index) => ({
    id: `wwyd_${(index + 1).toString().padStart(4, "0")}`,
    prompt: normalizePrompt(item.prompt),
    options: [
      { id: "a", label: normalizePrompt(item.options[0]) },
      { id: "b", label: normalizePrompt(item.options[1]) },
    ] as WhatWouldYouDoQuestion["options"],
    contentLevel: item.contentLevel,
  }));

  if (new Set(questions.map((question) => question.prompt)).size !== questions.length) {
    throw new Error("What would you do deck contains duplicate prompts.");
  }

  return questions;
}

function seed(
  prompt: string,
  optionA: string,
  optionB: string,
  contentLevel: "friends" | "bar" = "friends",
): QuestionSeed {
  return {
    prompt,
    options: [optionA, optionB],
    contentLevel,
  };
}

function normalizePrompt(prompt: string): string {
  return prompt.replace(/\s+/g, " ").trim();
}
