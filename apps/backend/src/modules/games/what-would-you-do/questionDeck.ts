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
  {
    prompt: "Se descobrisses que um amigo ficou com a tua crush, o que fazias?",
    options: ["Fingia calma", "Chamava para conversar"],
    contentLevel: "bar",
  },
  {
    prompt: "Se o teu ex entrasse no mesmo bar, o que fazias?",
    options: ["Ignorava com classe", "Fazia questao de ser visto"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa desse like antigo no teu perfil, o que fazias?",
    options: ["Perguntava logo", "Guardava para atacar depois"],
    contentLevel: "bar",
  },
  {
    prompt: "Se recebesses uma mensagem suspeita durante a noite, o que fazias?",
    options: ["Mostrava a mesa", "Virava o telemovel"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher entre lealdade e uma crush, o que fazias?",
    options: ["Escolhia lealdade", "Arriscava a crush"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem dissesse que o teu outfit esta fraco, o que fazias?",
    options: ["Defendia o look", "Atacava o outfit dele"],
    contentLevel: "friends",
  },
  {
    prompt: "Se o grupo descobrisse uma mentira tua, o que fazias?",
    options: ["Assumia logo", "Dizia que era estrategia"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a tua crush elogiasse o teu amigo, o que fazias?",
    options: ["Ficava tranquilo", "Mudava de assunto"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem te deixasse em visto a noite toda, o que fazias?",
    options: ["Nao respondia mais", "Mandava outra mensagem"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem paga a rodada, o que fazias?",
    options: ["Escolhia o atrasado", "Fazia sorteio injusto"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um segredo teu fosse parar ao grupo, o que fazias?",
    options: ["Perguntava quem contou", "Ria para disfarcar"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um amigo flertasse com alguem que tu querias, o que fazias?",
    options: ["Deixava rolar", "Entrava na disputa"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses prova de uma mentira da mesa, o que fazias?",
    options: ["Mostrava o print", "Guardava para o momento certo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem pedisse para ver a tua ultima conversa, o que fazias?",
    options: ["Mostrava sem medo", "Bloqueava o telemovel"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa te acusasse de estar com ciumes, o que fazias?",
    options: ["Negava ate ao fim", "Assumia um bocadinho"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher entre verdade e paz, o que fazias?",
    options: ["Dizia a verdade", "Mantinha a paz"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo cancelasse planos por uma crush, o que fazias?",
    options: ["Perdoava", "Cobrava publicamente"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa dissesse que manda melhor mensagem que tu, o que fazias?",
    options: ["Aceitava o desafio", "Chamava isso de mentira"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher o mais dramatico da mesa, o que fazias?",
    options: ["Apontava logo", "Fingia neutralidade"],
    contentLevel: "friends",
  },
  {
    prompt: "Se a tua crush chamasse outro de engracado, o que fazias?",
    options: ["Ria junto", "Virava comediante"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem mandasse uma indireta sobre ti, o que fazias?",
    options: ["Respondia direto", "Mandava outra indireta"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem tem mais segredos, o que fazias?",
    options: ["Dizia o nome", "Protegia a pessoa"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo pedisse para mentires por ele, o que fazias?",
    options: ["Cobria o amigo", "Nao me metia"],
    contentLevel: "bar",
  },
  {
    prompt: "Se o teu par ideal estivesse com outra pessoa, o que fazias?",
    options: ["Respeitava", "Tentava chamar atencao"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa dissesse que tu mudas quando bebes, o que fazias?",
    options: ["Negava tudo", "Pedia exemplos"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a tua ultima pesquisa aparecesse no ecra, o que fazias?",
    options: ["Apagava rapido", "Defendia a pesquisa"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de entregar o teu telemovel desbloqueado por 1 minuto, o que fazias?",
    options: ["Entregava", "Preferia pagar castigo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um amigo dissesse que o teu gosto e duvidoso, o que fazias?",
    options: ["Defendia com orgulho", "Atacava o gosto dele"],
    contentLevel: "friends",
  },
  {
    prompt: "Se a mesa votasse em quem e mais falso, o que fazias?",
    options: ["Votava sincero", "Votava seguro"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher entre perdoar ou expor, o que fazias?",
    options: ["Perdoava", "Expunha tudo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um amigo roubasse a tua piada e todos rissem, o que fazias?",
    options: ["Deixava passar", "Reclamava credito"],
    contentLevel: "friends",
  },
  {
    prompt: "Se recebesses uma mensagem de 'saudades', o que fazias?",
    options: ["Respondia", "Mandava para o grupo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem te chamasse de segunda opcao, o que fazias?",
    options: ["Ria da audacia", "Cortava contacto"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a pessoa errada te desse match, o que fazias?",
    options: ["Desfazia logo", "Investigava primeiro"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem nunca superou o ex, o que fazias?",
    options: ["Dizia a verdade", "Protegia a pessoa"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa te chamasse toxico a brincar, o que fazias?",
    options: ["Entrava na piada", "Pedia explicacao"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de decidir quem manda pior audio, o que fazias?",
    options: ["Nomeava alguem", "Recusava julgar"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo desse em cima de alguem comprometido, o que fazias?",
    options: ["Travava o amigo", "Deixava aprender"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa descobrisse o teu contacto mais suspeito, o que fazias?",
    options: ["Explicava tudo", "Mudava de assunto"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem revelasse que ja gostou de ti, o que fazias?",
    options: ["Ficava curioso", "Fingia surpresa"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem da mesa beija melhor, o que fazias?",
    options: ["Votava com coragem", "Fingia que nao sei"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um amigo pedisse opiniao sobre uma mensagem para o crush, o que fazias?",
    options: ["Editava tudo", "Mandava como estava"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem dissesse que tu gostas de drama, o que fazias?",
    options: ["Negava", "Pedia detalhes"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem se apaixona mais rapido, o que fazias?",
    options: ["Apontava sem pena", "Dizia que somos todos"],
    contentLevel: "friends",
  },
  {
    prompt: "Se o teu amigo mandasse mensagem ao teu ex, o que fazias?",
    options: ["Perguntava por que", "Cortava a confianca"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa pedisse para veres os teus arquivados, o que fazias?",
    options: ["Mostrava", "Dizia que nao existem"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem te dissesse 'tu sabes o que fizeste', o que fazias?",
    options: ["Fingia calma", "Perguntava logo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de defender o teu pior comportamento, o que fazias?",
    options: ["Assumia erro", "Chamava personalidade"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um amigo ficasse com alguem que tu recusaste, o que fazias?",
    options: ["Aplaudia", "Julgava em silencio"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa te acusasse de escolher sempre mal, o que fazias?",
    options: ["Defendia escolhas", "Aceitava o historico"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de dizer quem faz mais show, o que fazias?",
    options: ["Dizia o nome", "Dizia que sou eu"],
    contentLevel: "friends",
  },
  {
    prompt: "Se alguem te desse unfollow depois da noite, o que fazias?",
    options: ["Perguntava", "Dava unfollow tambem"],
    contentLevel: "bar",
  },
  {
    prompt: "Se recebesses uma chamada privada durante o jogo, o que fazias?",
    options: ["Atendia fora", "Deixava tocar"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem guarda mais prints, o que fazias?",
    options: ["Apontava logo", "Protegia o arquivo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem dissesse que o teu crush nao combina contigo, o que fazias?",
    options: ["Defendia a crush", "Ficava a pensar"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa descobrisse uma conversa antiga tua, o que fazias?",
    options: ["Dava contexto", "Pedia para parar"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher entre orgulho e saudade, o que fazias?",
    options: ["Escolhia orgulho", "Mandava mensagem"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um amigo fizesse cena por pouca coisa, o que fazias?",
    options: ["Chamava a atencao", "Dava palco"],
    contentLevel: "friends",
  },
  {
    prompt: "Se alguem te chamasse intenso demais, o que fazias?",
    options: ["Aceitava", "Dizia que e paixao"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem mente melhor, o que fazias?",
    options: ["Votava sem medo", "Nao alimentava isso"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a tua crush pedisse para ver o teu Instagram, o que fazias?",
    options: ["Entregava logo", "Revista antes"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa dissesse que tu das sinais confusos, o que fazias?",
    options: ["Negava", "Assumia estrategia"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem tem mais cara de santo, o que fazias?",
    options: ["Escolhia o mais suspeito", "Escolhia o mais calmo"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo se aproximasse da tua pessoa favorita, o que fazias?",
    options: ["Confiava", "Ficava atento"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa lesse a tua ultima nota do telemovel, o que fazias?",
    options: ["Apagava antes", "Dizia que e poesia"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher entre amizade e oportunidade, o que fazias?",
    options: ["Escolhia amizade", "Aproveitava oportunidade"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem confessasse que falou mal de ti, o que fazias?",
    options: ["Queria saber tudo", "Cortava conversa"],
    contentLevel: "bar",
  },
  {
    prompt: "Se o teu amigo voltasse para o ex, o que fazias?",
    options: ["Apoiava", "Dizia 'eu avisei'"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem e mais ciumento, o que fazias?",
    options: ["Votava sincero", "Votava em mim"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa te pedisse desculpa por mensagem, o que fazias?",
    options: ["Respondia na hora", "Deixava pensar"],
    contentLevel: "friends",
  },
  {
    prompt: "Se tivesses de escolher quem causa mais problemas no grupo, o que fazias?",
    options: ["Dizia o nome", "Dizia que e energia"],
    contentLevel: "friends",
  },
  {
    prompt: "Se a tua crush aparecesse com alguem novo, o que fazias?",
    options: ["Fingia normalidade", "Ia embora cedo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se um amigo pedisse segredo e fosse demasiado bom, o que fazias?",
    options: ["Guardava", "Contava so a um"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem te mandasse mensagem so de madrugada, o que fazias?",
    options: ["Respondia", "Perguntava intencao"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem tem mais contatinhos, o que fazias?",
    options: ["Apontava logo", "Fingia nao saber"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa te chamasse de emocionado, o que fazias?",
    options: ["Aceitava com orgulho", "Defendia a intensidade"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem dissesse que tu foges de conversa seria, o que fazias?",
    options: ["Mudava de assunto", "Provava o contrario"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem mais exagera historias, o que fazias?",
    options: ["Escolhia sem duvida", "Dizia que todos exageram"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo te trocasse por um date, o que fazias?",
    options: ["Desejava sorte", "Cobrava depois"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa dissesse que tu gostas de complicar, o que fazias?",
    options: ["Complicava mais", "Fingia maturidade"],
    contentLevel: "friends",
  },
  {
    prompt: "Se tivesses de escolher quem e mais perigoso solteiro, o que fazias?",
    options: ["Dizia o nome", "Dizia que depende da noite"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a tua crush perguntasse se estas solteiro, o que fazias?",
    options: ["Respondia direto", "Respondia com charme"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem pedisse o teu historico de chamadas, o que fazias?",
    options: ["Mostrava", "Dizia que e privado"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem mais promete e nao cumpre, o que fazias?",
    options: ["Apontava logo", "Dava segunda chance"],
    contentLevel: "friends",
  },
  {
    prompt: "Se um amigo se metesse numa relacao confusa, o que fazias?",
    options: ["Avisava", "Deixava viver"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa descobrisse o teu pior date, o que fazias?",
    options: ["Contava tudo", "Cortava detalhes"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem flerta por desporto, o que fazias?",
    options: ["Nomeava alguem", "Dizia que e simpatia"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem te perguntasse se ainda pensas no ex, o que fazias?",
    options: ["Negava rapido", "Dizia a verdade"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa te desse carta branca para expor alguem, o que fazias?",
    options: ["Usava com cuidado", "Abriria o arquivo"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem mais cria clima do nada, o que fazias?",
    options: ["Dizia o nome", "Dizia que e talento"],
    contentLevel: "bar",
  },
  {
    prompt: "Se uma pessoa que te ignorou voltasse a falar contigo, o que fazias?",
    options: ["Ignorava tambem", "Respondia curioso"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem dissesse que tu tens padroes baixos, o que fazias?",
    options: ["Defendia escolhas", "Culpava a fase"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher entre vinganca e elegancia, o que fazias?",
    options: ["Escolhia elegancia", "Planeava vinganca"],
    contentLevel: "bar",
  },
  {
    prompt: "Se o grupo perguntasse quem nao devia voltar para o ex, o que fazias?",
    options: ["Dizia o nome", "Fingia que nao ouvi"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa te pedisse para desbloquear uma pessoa, o que fazias?",
    options: ["Desbloqueava", "Mantinha bloqueado"],
    contentLevel: "bar",
  },
  {
    prompt: "Se tivesses de escolher quem mais manda indiretas, o que fazias?",
    options: ["Apontava sem medo", "Dizia que e arte"],
    contentLevel: "bar",
  },
  {
    prompt: "Se descobrisses que foste assunto numa conversa, o que fazias?",
    options: ["Pedia prints", "Ia perguntar direto"],
    contentLevel: "bar",
  },
  {
    prompt: "Se a mesa pedisse para veres a tua galeria, o que fazias?",
    options: ["Mostrava fotos recentes", "Recusava imediatamente"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem dissesse que tu gostas de atencao, o que fazias?",
    options: ["Assumia", "Dizia que e carisma"],
    contentLevel: "friends",
  },
  {
    prompt: "Se tivesses de escolher quem e mais dificil de conquistar, o que fazias?",
    options: ["Escolhia o exigente", "Escolhia o indeciso"],
    contentLevel: "bar",
  },
  {
    prompt: "Se alguem da mesa te fizesse uma pergunta demasiado direta, o que fazias?",
    options: ["Respondia", "Devolvia pior"],
    contentLevel: "bar",
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
