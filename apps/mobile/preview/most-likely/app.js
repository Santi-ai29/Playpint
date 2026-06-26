const PREVIEW_ROUNDS = 12;

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
  playersGrid.classList.toggle("avatar-strip", phase === "question");
  playersGrid.innerHTML = basePlayers
    .map((player) => {
      const intro = phase === "question";
      const selected = selectedPlayerId === player.playerId;
      const disabled = phase !== "voting";
      const winner = phase === "result" && player.playerId === getWinner().playerId;
      const classes = [
        "player-card",
        intro ? "avatar-chip" : "",
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
    const setup = spicySetups[index % spicySetups.length];
    const twist = spicyTwists[getTwistIndex(index)];
    const prompt = `Quem e mais provavel que ${setup} ${twist}?`
      .replace(/\s+/g, " ")
      .trim();

    questionsByPrompt.set(prompt, prompt);
  }

  return [...questionsByPrompt.values()];
}

function getTwistIndex(index) {
  return (
    (index + 1) * 7 +
    Math.floor(index / spicySetups.length)
  ) % spicyTwists.length;
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
  const lines = [
    `${winner.nickname} foi apanhado no radar da mesa. Esses olhares nao se explicam sozinhos.`,
    `${winner.nickname} tentou fazer cara de santo, mas a mesa viu o resto.`,
    `${winner.nickname}, guarda o telemovel. A reputacao ja ficou exposta.`,
    `${winner.nickname} levou ${percentage}% dos votos. Isto cheira a historia mal contada.`,
    `${votes} votos para ${winner.nickname}. A mesa sentiu o clima e nao perdoou.`,
  ];

  return lines[roundIndex % lines.length];
}
