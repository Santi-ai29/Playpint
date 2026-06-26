const PREVIEW_ROUNDS = 12;

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

const questions = createQuestionBank(1000);

const basePlayers = [
  { playerId: "p1", nickname: "Ana" },
  { playerId: "p2", nickname: "Bruno" },
  { playerId: "p3", nickname: "Carla" },
  { playerId: "p4", nickname: "Miguel" },
];

let roundIndex = 0;
let phase = "question";
let selectedPlayerId = null;
let seconds = 15;
let roundVotes = createRoundVotes(roundIndex);

window.setInterval(tick, 1000);

const phaseLabel = document.querySelector("#phaseLabel");
const timerLabel = document.querySelector("#timerLabel");
const eyebrow = document.querySelector("#eyebrow");
const questionPanel = document.querySelector("#questionPanel");
const prompt = document.querySelector("#prompt");
const playersGrid = document.querySelector("#playersGrid");
const resultPanel = document.querySelector("#resultPanel");
const primaryAction = document.querySelector("#primaryAction");
const winnerName = document.querySelector("#winnerName");
const winnerAvatar = document.querySelector("#winnerAvatar");
const winnerPercentage = document.querySelector("#winnerPercentage");
const resultMessage = document.querySelector("#resultMessage");
const resultTable = document.querySelector("#resultTable");

primaryAction.addEventListener("click", () => {
  if (phase === "question") {
    openVoting();
    return;
  }

  if (phase === "voting") {
    confirmVote();
    return;
  }

  if (phase === "result") {
    goToNextRound();
  }
});

render();

function tick() {
  if (phase !== "voting") {
    return;
  }

  seconds = Math.max(0, seconds - 1);

  if (seconds === 0) {
    if (selectedPlayerId) {
      confirmVote();
      return;
    }

    showResult();
    return;
  }

  renderHeader();
}

function openVoting() {
  phase = "voting";
  seconds = 15;
  selectedPlayerId = null;
  roundVotes = createRoundVotes(roundIndex);
  render();
}

function selectPlayer(playerId) {
  if (phase !== "voting") {
    return;
  }

  selectedPlayerId = playerId;
  render();
}

function confirmVote() {
  if (phase !== "voting" || !selectedPlayerId) {
    return;
  }

  phase = "waiting";
  roundVotes = createRoundVotes(roundIndex, selectedPlayerId);
  window.setTimeout(showResult, 560);
  render();
}

function showResult() {
  phase = "result";
  render();
}

function goToNextRound() {
  if (roundIndex >= PREVIEW_ROUNDS - 1) {
    roundIndex = 0;
  } else {
    roundIndex += 1;
  }

  phase = "question";
  selectedPlayerId = null;
  seconds = 15;
  roundVotes = createRoundVotes(roundIndex);
  render();
}

function render() {
  document.body.dataset.phase = phase;
  renderHeader();
  renderQuestion();
  renderPlayers();
  renderResult();
  renderFooter();
}

function renderHeader() {
  phaseLabel.textContent =
    phase === "voting" || phase === "waiting"
      ? `Votacao ${roundIndex + 1}/${PREVIEW_ROUNDS}`
      : phase === "result"
        ? `Resultado ${roundIndex + 1}/${PREVIEW_ROUNDS}`
        : `Ronda ${roundIndex + 1}/${PREVIEW_ROUNDS}`;

  timerLabel.hidden = phase === "result";
  timerLabel.textContent =
    phase === "voting" ? `00:${String(seconds).padStart(2, "0")}` : "15s voto";
  timerLabel.classList.toggle("is-idle", phase !== "voting");
}

function renderQuestion() {
  questionPanel.classList.toggle("hidden", phase === "result");
  if (phase === "result") {
    return;
  }

  prompt.textContent = questions[roundIndex];
  eyebrow.textContent =
    phase === "voting" || phase === "waiting"
      ? "Escolhe uma pessoa"
      : phase === "result"
        ? "Quem ficou marcado"
        : "Quem e mais provavel?";
}

function renderPlayers() {
  playersGrid.classList.toggle("hidden", phase === "result");
  playersGrid.classList.toggle("ready-grid", phase === "question");
  playersGrid.innerHTML = basePlayers
    .map((player) => {
      const intro = phase === "question";
      const selected = selectedPlayerId === player.playerId;
      const disabled = phase !== "voting";
      const winner = phase === "result" && player.playerId === getWinner().playerId;
      const classes = [
        "player-card",
        intro ? "ready-player" : "",
        selected ? "selected" : "",
        winner ? "winner" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <button class="${classes}" type="button" ${disabled ? "disabled" : ""} data-player-id="${player.playerId}">
          ${selected ? '<span class="selected-tag">OK</span>' : ""}
          <span class="avatar">${player.nickname.slice(0, 1)}</span>
          <span class="player-name">${player.nickname}</span>
          ${intro ? "" : `<span class="player-meta">${getPlayerMeta(player)}</span>`}
        </button>
      `;
    })
    .join("");

  playersGrid.querySelectorAll(".player-card").forEach((card) => {
    card.addEventListener("click", () => selectPlayer(card.dataset.playerId));
  });
}

function getPlayerMeta(player) {
  if (phase === "result") {
    const votes = roundVotes[player.playerId] ?? 0;
    return votes === 1 ? "1 voto" : `${votes} votos`;
  }

  if (selectedPlayerId === player.playerId) {
    return "Selecionado";
  }

  if (phase === "voting") {
    return selectedPlayerId ? "Toca para trocar" : "Disponivel";
  }

  return "Jogador";
}

function renderResult() {
  resultPanel.classList.toggle("hidden", phase !== "result");

  if (phase !== "result") {
    return;
  }

  const winner = getWinner();
  const totalVotes = getTotalVotes();
  const winnerVotes = roundVotes[winner.playerId] ?? 0;
  const percentage = totalVotes === 0 ? 0 : Math.round((winnerVotes / totalVotes) * 1000) / 10;

  winnerName.textContent = winner.nickname;
  winnerAvatar.textContent = winner.nickname.slice(0, 1);
  winnerPercentage.textContent = `${percentage}%`;
  resultMessage.textContent = getSarcasticMessage(winner, winnerVotes, percentage);
  resultTable.innerHTML = getSortedResults()
    .map((player, index) => {
      const votes = roundVotes[player.playerId] ?? 0;
      const playerPercentage =
        totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 1000) / 10;
      const isWinner = player.playerId === winner.playerId;

      return `
        <div class="result-row ${isWinner ? "is-winner" : ""}">
          <span class="result-rank">${index + 1}</span>
          <strong>${player.nickname}</strong>
          <span>${votes === 1 ? "1 voto" : `${votes} votos`}</span>
          <em>${playerPercentage}%</em>
        </div>
      `;
    })
    .join("");
}

function renderFooter() {
  if (phase === "question") {
    primaryAction.hidden = false;
    primaryAction.disabled = false;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Comecar";
    return;
  }

  if (phase === "voting") {
    primaryAction.hidden = false;
    primaryAction.disabled = !selectedPlayerId;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Confirmar";
    return;
  }

  if (phase === "waiting") {
    primaryAction.hidden = true;
    primaryAction.disabled = false;
    return;
  }

  primaryAction.hidden = false;
  primaryAction.disabled = false;
  primaryAction.classList.add("secondary");
  primaryAction.textContent =
    roundIndex >= PREVIEW_ROUNDS - 1 ? "Recomecar" : "Proxima";
}

function createQuestionBank(targetCount) {
  const questionsByPrompt = new Map();

  for (let index = 0; questionsByPrompt.size < targetCount; index += 1) {
    const action = spicyActions[index % spicyActions.length];
    const flavor =
      questionFlavors[Math.floor(index / spicyActions.length) % questionFlavors.length];
    const prompt = `Quem e mais provavel de ${action}${flavor ? ` ${flavor}` : ""}?`
      .replace(/\s+/g, " ")
      .trim();

    questionsByPrompt.set(prompt, prompt);
  }

  return [...questionsByPrompt.values()];
}

function createRoundVotes(index, selectedTargetId) {
  const patterns = [
    { p1: 0, p2: 2, p3: 1, p4: 0 },
    { p1: 1, p2: 0, p3: 2, p4: 0 },
    { p1: 0, p2: 1, p3: 0, p4: 2 },
    { p1: 2, p2: 0, p3: 1, p4: 0 },
  ];
  const votes = { ...patterns[index % patterns.length] };

  if (selectedTargetId) {
    votes[selectedTargetId] = Math.max(votes[selectedTargetId] ?? 0, 2);
  }

  return votes;
}

function getWinner() {
  return getSortedResults()[0];
}

function getTotalVotes() {
  return Object.values(roundVotes).reduce((total, votes) => total + votes, 0);
}

function getSortedResults() {
  return basePlayers
    .slice()
    .sort(
      (left, right) =>
        (roundVotes[right.playerId] ?? 0) - (roundVotes[left.playerId] ?? 0) ||
        left.nickname.localeCompare(right.nickname),
    );
}

function getSarcasticMessage(winner, votes, percentage) {
  const prompt = questions[roundIndex].toLowerCase();

  if (prompt.includes("ex")) {
    return `${winner.nickname}, sempre soubemos que o ex faz te falta.`;
  }

  if (prompt.includes("ciume")) {
    return `${winner.nickname}, esse ciume veio com recibo.`;
  }

  if (prompt.includes("crush")) {
    return `${winner.nickname}, essa crush ja nem e segredo.`;
  }

  if (prompt.includes("alcool") || prompt.includes("beber") || prompt.includes("shot")) {
    return `${winner.nickname}, a culpa hoje vai para o copo.`;
  }

  const lines = [
    `${winner.nickname}, nao adianta fazer cara de santo.`,
    `${winner.nickname}, a mesa sabe coisas.`,
    `${winner.nickname}, hoje foste apanhado.`,
    `${winner.nickname}, ${percentage}% de suspeitas confirmadas.`,
    `${winner.nickname}, ${votes} votos e zero surpresa.`,
  ];

  return lines[roundIndex % lines.length];
}
