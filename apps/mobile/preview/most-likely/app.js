const questions = [
  "Quem e mais provavel que chegue atrasado?",
  "Quem e mais provavel que transforme qualquer musica em karaoke?",
  "Quem e mais provavel que peca comida para a mesa toda?",
  "Quem e mais provavel que perca o telemovel estando com ele na mao?",
  "Quem e mais provavel que diga 'so mais uma' e fique ate ao fim?",
  "Quem e mais provavel que fique sem bateria antes da noite comecar?",
  "Quem e mais provavel que mande mensagem no grupo errado?",
  "Quem e mais provavel que assuma a musica como DJ da casa?",
  "Quem e mais provavel que conte uma historia simples como novela?",
  "Quem e mais provavel que desapareca e volte com comida?",
  "Quem e mais provavel que discuta as regras como advogado da mesa?",
  "Quem e mais provavel que invente planos para depois disto?",
];

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
const prompt = document.querySelector("#prompt");
const subtitle = document.querySelector("#subtitle");
const playersGrid = document.querySelector("#playersGrid");
const resultPanel = document.querySelector("#resultPanel");
const rankingList = document.querySelector("#rankingList");
const primaryAction = document.querySelector("#primaryAction");
const statusText = document.querySelector("#statusText");
const winnerName = document.querySelector("#winnerName");
const winnerAvatar = document.querySelector("#winnerAvatar");
const winnerPercentage = document.querySelector("#winnerPercentage");
const pointsLine = document.querySelector("#pointsLine");

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
  window.setTimeout(showResult, 850);
  render();
}

function showResult() {
  phase = "result";
  render();
}

function goToNextRound() {
  if (roundIndex >= questions.length - 1) {
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
  renderHeader();
  renderQuestion();
  renderPlayers();
  renderResult();
  renderFooter();
}

function renderHeader() {
  phaseLabel.textContent =
    phase === "voting" || phase === "waiting"
      ? `Votacao ${roundIndex + 1}/12`
      : phase === "result"
        ? `Resultado ${roundIndex + 1}/12`
        : `Ronda ${roundIndex + 1}/12`;

  timerLabel.textContent = phase === "voting" ? `00:${String(seconds).padStart(2, "0")}` : "15s voto";
  timerLabel.classList.toggle("is-idle", phase !== "voting");
}

function renderQuestion() {
  prompt.textContent = questions[roundIndex];
  eyebrow.textContent =
    phase === "voting" || phase === "waiting"
      ? "Escolhe uma pessoa"
      : phase === "result"
        ? "Quem ficou marcado"
        : "Quem e mais provavel?";
  subtitle.textContent =
    phase === "waiting"
      ? "Voto enviado."
      : phase === "result"
        ? "Resultado oficial da ronda."
        : phase === "voting"
          ? "O cronometro esta a contar."
          : "Sem cronometro. Le a pergunta e abre a votacao.";
}

function renderPlayers() {
  playersGrid.classList.toggle("hidden", phase === "result");
  playersGrid.innerHTML = basePlayers
    .map((player) => {
      const selected = selectedPlayerId === player.playerId;
      const disabled = phase !== "voting";
      const winner = phase === "result" && player.playerId === getWinner().playerId;
      const classes = [
        "player-card",
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
          <span class="player-meta">${getPlayerMeta(player)}</span>
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
  pointsLine.textContent = `+${winnerVotes * 10} pontos`;
  rankingList.innerHTML = basePlayers
    .slice()
    .sort(
      (left, right) =>
        (roundVotes[right.playerId] ?? 0) - (roundVotes[left.playerId] ?? 0) ||
        left.nickname.localeCompare(right.nickname),
    )
    .map((player) => {
      const votes = roundVotes[player.playerId] ?? 0;
      return `
        <div class="ranking-row">
          <strong>${player.nickname}</strong>
          <span>${votes === 1 ? "1 voto" : `${votes} votos`}</span>
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
    primaryAction.textContent = "Comecar votacao";
    statusText.textContent = "A pergunta fica parada ate alguem abrir a votacao.";
    return;
  }

  if (phase === "voting") {
    primaryAction.hidden = false;
    primaryAction.disabled = !selectedPlayerId;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Confirmar voto";
    statusText.textContent = selectedPlayerId
      ? "Podes trocar antes de confirmar."
      : "Escolhe uma pessoa. Ainda nao enviaste o voto.";
    return;
  }

  if (phase === "waiting") {
    primaryAction.hidden = true;
    primaryAction.disabled = false;
    statusText.textContent = "Voto enviado.";
    return;
  }

  primaryAction.hidden = false;
  primaryAction.disabled = false;
  primaryAction.classList.add("secondary");
  primaryAction.textContent =
    roundIndex >= questions.length - 1 ? "Recomecar jogo" : "Proxima ronda";
  statusText.textContent =
    roundIndex >= questions.length - 1
      ? "Fim das 12 rondas da preview."
      : `${questions.length - roundIndex - 1} rondas por jogar.`;
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
  return basePlayers
    .slice()
    .sort(
      (left, right) =>
        (roundVotes[right.playerId] ?? 0) - (roundVotes[left.playerId] ?? 0) ||
        left.nickname.localeCompare(right.nickname),
    )[0];
}

function getTotalVotes() {
  return Object.values(roundVotes).reduce((total, votes) => total + votes, 0);
}
