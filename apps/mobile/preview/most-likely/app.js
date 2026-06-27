const DEFAULT_ROUNDS = 12;
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const MIN_ROUNDS = 0;
const MAX_ROUNDS = 12;
const DEFAULT_ROOM_NAME = "Es Tu";
const JOIN_CLIENT_ID_KEY = "playpint-most-likely-client-id";

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

const questionTemplates = [
  (action) => `Quem e mais provavel de ${action}?`,
  (action) => `Quem da mesa ia ${action} hoje?`,
  (action) => `Quem era apanhado a ${action}?`,
  (action) => `Quem jurava que nao ia ${action}?`,
  (action) => `Quem tinha coragem de ${action}?`,
  (action) => `Quem acabava por ${action} sem pensar?`,
  (action) => `Quem nao resistia a ${action}?`,
  (action) => `Quem ia ${action} so para provocar?`,
  (action) => `Quem culpava o alcool depois de ${action}?`,
  (action) => `Quem fazia isto antes de ir embora: ${action}?`,
];

const questions = createQuestionBank(1000);
const isJoinView = new URLSearchParams(window.location.search).has("join");
const joinUrl = `${window.location.origin}${window.location.pathname}?join=1`;

let joinedPlayers = [];
let roundLimit = DEFAULT_ROUNDS;
let roundIndex = 0;
let questionCursor = 0;
let phase = isJoinView ? "join" : "setup";
let selectedPlayerId = null;
let seconds = 15;
let roundVotes = createRoundVotes(questionCursor);
let roomName = DEFAULT_ROOM_NAME;
let joinPhotoDataUrl = "";
let joinedPlayerName = "";
let joinedPlayer = null;
let resultRevealed = true;
let roomNameSyncTimer;

window.setInterval(tick, 1000);
window.setInterval(refreshJoinedPlayers, 1500);

const phaseLabel = document.querySelector("#phaseLabel");
const timerLabel = document.querySelector("#timerLabel");
const setupPanel = document.querySelector("#setupPanel");
const setupControls = document.querySelector("#setupControls");
const joinPanel = document.querySelector("#joinPanel");
const joinForm = document.querySelector("#joinForm");
const joinPhotoInput = document.querySelector("#joinPhotoInput");
const joinPhotoPreview = document.querySelector("#joinPhotoPreview");
const joinNameInput = document.querySelector("#joinNameInput");
const joinedPreview = document.querySelector("#joinedPreview");
const joinedPreviewAvatar = document.querySelector("#joinedPreviewAvatar");
const joinedPreviewName = document.querySelector("#joinedPreviewName");
const joinStatus = document.querySelector("#joinStatus");
const eyebrow = document.querySelector("#eyebrow");
const questionPanel = document.querySelector("#questionPanel");
const shuffleQuestion = document.querySelector("#shuffleQuestion");
const prompt = document.querySelector("#prompt");
const playersGrid = document.querySelector("#playersGrid");
const resultPanel = document.querySelector("#resultPanel");
const primaryAction = document.querySelector("#primaryAction");
const resultTitle = document.querySelector("#resultPanel .result-title");
const winnerName = document.querySelector("#winnerName");
const winnerAvatar = document.querySelector("#winnerAvatar");
const winnerPercentage = document.querySelector("#winnerPercentage");
const resultMessage = document.querySelector("#resultMessage");
const resultTable = document.querySelector("#resultTable");

primaryAction.addEventListener("click", () => {
  if (phase === "setup") {
    startGame();
    return;
  }

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

setupControls.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-player]");

  if (removeButton) {
    removeJoinedPlayer(removeButton.dataset.removePlayer);
    return;
  }

  const button = event.target.closest("[data-setting-action]");

  if (!button) {
    return;
  }

  updateSetting(button.dataset.settingAction);
});

setupControls.addEventListener("input", (event) => {
  const input = event.target.closest("[data-room-name]");

  if (!input) {
    return;
  }

  updateRoomName(input.value);
});

joinPhotoInput.addEventListener("change", () => {
  updateJoinPhoto(joinPhotoInput.files?.[0]);
});

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitJoin();
});

shuffleQuestion.addEventListener("click", skipQuestion);

render();
refreshJoinedPlayers();

function updateSetting(action) {
  if (phase !== "setup") {
    return;
  }

  if (action === "rounds-down") {
    roundLimit = Math.max(MIN_ROUNDS, roundLimit - 1);
  }

  if (action === "rounds-up") {
    roundLimit = Math.min(MAX_ROUNDS, roundLimit + 1);
  }

  roundVotes = createRoundVotes(questionCursor);
  render();
}

function updateRoomName(value) {
  roomName = value.trimStart().slice(0, 18);
  window.clearTimeout(roomNameSyncTimer);
  roomNameSyncTimer = window.setTimeout(syncRoomName, 250);
}

async function syncRoomName() {
  try {
    const response = await fetch("/api/most-likely/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: getRoomName() }),
    });

    if (!response.ok) {
      throw new Error("Room name request failed");
    }

    const data = await response.json();
    roomName = data.roomName ?? roomName;
    renderHeader();
  } catch (error) {
    renderHeader();
  }
}

function updateJoinPhoto(file) {
  if (!file) {
    joinPhotoDataUrl = "";
    renderJoinPhotoPreview();
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    joinPhotoDataUrl = typeof reader.result === "string" ? reader.result : "";
    renderJoinPhotoPreview();
  });

  reader.readAsDataURL(file);
}

async function submitJoin() {
  const nickname = joinNameInput.value.trim() || "Jogador";
  const photoUrl = joinPhotoDataUrl;
  joinStatus.textContent = "A entrar...";

  try {
    const response = await fetch("/api/most-likely/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: getJoinClientId(),
        nickname,
        photoUrl,
      }),
    });

    if (!response.ok) {
      throw new Error("Join failed");
    }

    const data = await response.json();
    joinedPlayer = data.player ?? { nickname, photoUrl };
    joinedPlayerName = joinedPlayer.nickname ?? nickname;
    joinStatus.textContent = "Apareces agora no ecra do host.";
    document.body.dataset.joined = "true";
    renderJoin();
  } catch (error) {
    joinStatus.textContent = "Nao consegui entrar. Tenta outra vez.";
  }
}

async function removeJoinedPlayer(playerId) {
  if (phase !== "setup" || !playerId) {
    return;
  }

  joinedPlayers = joinedPlayers.filter((player) => player.playerId !== playerId);
  render();

  try {
    const response = await fetch(`/api/most-likely/players/${encodeURIComponent(playerId)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Remove player request failed");
    }

    const data = await response.json();
    joinedPlayers = Array.isArray(data.players) ? data.players.slice(0, MAX_PLAYERS) : [];
    roundVotes = createRoundVotes(questionCursor);
    render();
  } catch (error) {
    refreshJoinedPlayers();
  }
}

async function refreshJoinedPlayers() {
  if (phase !== "setup" && phase !== "join") {
    return;
  }

  try {
    const response = await fetch("/api/most-likely/players");

    if (!response.ok) {
      throw new Error("Players request failed");
    }

    const data = await response.json();
    const isEditingRoomName = document.activeElement?.matches("[data-room-name]");
    joinedPlayers = Array.isArray(data.players) ? data.players.slice(0, MAX_PLAYERS) : [];
    roomName = isEditingRoomName ? roomName : (data.roomName ?? roomName);
    roundVotes = createRoundVotes(questionCursor);
    if (isEditingRoomName) {
      renderHeader();
      return;
    }

    render();
  } catch (error) {
    if (phase === "setup") {
      joinedPlayers = [];
    }
    render();
  }
}

function startGame() {
  if (getActivePlayers().length < MIN_PLAYERS) {
    return;
  }

  roundIndex = 0;
  questionCursor = 0;
  phase = "question";
  selectedPlayerId = null;
  seconds = 15;
  resultRevealed = true;
  roundVotes = createRoundVotes(questionCursor);
  render();
}

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
  resultRevealed = true;
  roundVotes = createRoundVotes(questionCursor);
  render();
}

function skipQuestion() {
  if (phase !== "question") {
    return;
  }

  questionCursor += 1;
  selectedPlayerId = null;
  roundVotes = createRoundVotes(questionCursor);
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
  roundVotes = createRoundVotes(questionCursor, selectedPlayerId);
  window.setTimeout(showResult, 560);
  render();
}

function showResult() {
  phase = "result";
  resultRevealed = false;
  render();
  window.setTimeout(() => {
    if (phase !== "result") {
      return;
    }

    resultRevealed = true;
    renderResult();
    renderFooter();
  }, 650);
}

function goToNextRound() {
  if (isLastConfiguredRound()) {
    roundIndex = 0;
    questionCursor = 0;
  } else {
    roundIndex += 1;
    questionCursor += 1;
  }

  phase = "question";
  selectedPlayerId = null;
  seconds = 15;
  resultRevealed = true;
  roundVotes = createRoundVotes(questionCursor);
  render();
}

function render() {
  document.body.dataset.phase = phase;
  renderHeader();
  renderJoin();
  renderSetup();
  renderQuestion();
  renderPlayers();
  renderResult();
  renderFooter();
}

function renderHeader() {
  if (phase === "join") {
    phaseLabel.textContent = "Mesa";
    timerLabel.hidden = false;
    timerLabel.textContent = getRoomName();
    timerLabel.classList.add("is-idle");
    return;
  }

  if (phase === "setup") {
    phaseLabel.textContent = "Mesa";
    timerLabel.hidden = false;
    timerLabel.textContent = `${joinedPlayers.length}p`;
    timerLabel.classList.add("is-idle");
    return;
  }

  const roundProgress = `${roundIndex + 1}/${formatRoundLimit()}`;

  phaseLabel.textContent =
    phase === "voting" || phase === "waiting"
      ? `Votacao ${roundProgress}`
      : phase === "result"
        ? `Resultado ${roundProgress}`
        : `Ronda ${roundProgress}`;

  timerLabel.hidden = phase !== "voting";
  timerLabel.textContent = phase === "voting" ? `00:${String(seconds).padStart(2, "0")}` : "";
  timerLabel.classList.toggle("is-idle", phase !== "voting");
}

function renderJoin() {
  joinPanel.classList.toggle("hidden", phase !== "join");

  if (phase !== "join") {
    return;
  }

  const hasJoined = Boolean(joinedPlayerName);
  joinForm.hidden = hasJoined;
  joinedPreview.classList.toggle("hidden", !hasJoined);

  renderJoinPhotoPreview();

  if (hasJoined) {
    renderJoinedPreview();
  }
}

function renderSetup() {
  setupPanel.classList.toggle("hidden", phase !== "setup");

  if (phase !== "setup") {
    return;
  }

  const players = getActivePlayers();

  setupControls.innerHTML = `
    <section class="invite-card">
      <img
        class="invite-qr"
        src="/api/most-likely/qr.svg?url=${encodeURIComponent(joinUrl)}"
        alt="QR da mesa"
      />
      <div class="invite-copy">
        <span>Nome da sala</span>
        <input
          class="room-name-input"
          data-room-name="true"
          maxlength="18"
          value="${escapeHtml(getRoomName())}"
          aria-label="Nome da sala"
        />
        <small>${escapeHtml(getShortJoinUrl())}</small>
      </div>
    </section>
    <div class="setup-counters">
      <article class="setup-counter">
        <span>Entraram</span>
        <strong class="joined-count">${players.length}</strong>
      </article>
      <article class="setup-counter">
        <span>Rondas</span>
        <div class="setup-stepper">
          <button type="button" data-setting-action="rounds-down" ${roundLimit <= MIN_ROUNDS ? "disabled" : ""}>-</button>
          <strong>${formatRoundLimit()}</strong>
          <button type="button" data-setting-action="rounds-up" ${roundLimit >= MAX_ROUNDS ? "disabled" : ""}>+</button>
        </div>
      </article>
    </div>
    <section class="joined-players" aria-label="Jogadores na mesa">
      ${
        players.length === 0
          ? '<div class="empty-table">A espera da mesa</div>'
          : players
              .map(
                (player) => {
                  const name = escapeHtml(getPlayerName(player));

                  return `
                  <article class="joined-player-card">
                    <span class="joined-avatar">${getAvatarMarkup(player)}</span>
                    <strong>${name}</strong>
                    <button
                      class="remove-player"
                      type="button"
                      data-remove-player="${escapeHtml(player.playerId)}"
                      aria-label="Remover ${name}"
                    >
                      x
                    </button>
                  </article>
                `;
                },
              )
              .join("")
      }
    </section>
  `;
}

function renderQuestion() {
  questionPanel.classList.toggle(
    "hidden",
    phase === "result" || phase === "setup" || phase === "join",
  );
  if (phase === "result" || phase === "setup" || phase === "join") {
    return;
  }

  shuffleQuestion.classList.toggle("hidden", phase !== "question");
  prompt.textContent = getCurrentQuestion();
  eyebrow.textContent =
    phase === "voting" || phase === "waiting"
      ? "Escolhe uma pessoa"
      : phase === "result"
        ? "Quem ficou marcado"
        : "Quem e mais provavel?";
}

function renderPlayers() {
  playersGrid.classList.toggle(
    "hidden",
    phase === "result" || phase === "setup" || phase === "join",
  );
  playersGrid.classList.toggle("ready-grid", phase === "question");

  if (phase === "setup" || phase === "result" || phase === "join") {
    playersGrid.innerHTML = "";
    return;
  }

  playersGrid.innerHTML = getActivePlayers()
    .map((player) => {
      const name = escapeHtml(getPlayerName(player));
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
          <span class="avatar">${getAvatarMarkup(player)}</span>
          <span class="player-name">${name}</span>
        </button>
      `;
    })
    .join("");

  playersGrid.querySelectorAll(".player-card").forEach((card) => {
    card.addEventListener("click", () => selectPlayer(card.dataset.playerId));
  });
}

function renderResult() {
  resultPanel.classList.toggle("hidden", phase !== "result");

  if (phase !== "result") {
    return;
  }

  resultPanel.classList.toggle("is-revealing", !resultRevealed);
  resultTitle.textContent = resultRevealed ? "Resultado" : "A mesa decidiu";

  if (!resultRevealed) {
    winnerName.textContent = "...";
    winnerAvatar.textContent = "?";
    winnerPercentage.textContent = "";
    resultMessage.textContent = "";
    resultTable.innerHTML = "";
    return;
  }

  const winner = getWinner();
  const totalVotes = getTotalVotes();
  const winnerVotes = roundVotes[winner.playerId] ?? 0;
  const percentage = totalVotes === 0 ? 0 : Math.round((winnerVotes / totalVotes) * 1000) / 10;

  winnerName.textContent = getPlayerName(winner);
  winnerAvatar.innerHTML = getAvatarMarkup(winner);
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
          <strong>${escapeHtml(getPlayerName(player))}</strong>
          <span>${votes === 1 ? "1 voto" : `${votes} votos`}</span>
          <em>${playerPercentage}%</em>
        </div>
      `;
    })
    .join("");
}

function renderFooter() {
  if (phase === "join") {
    primaryAction.hidden = true;
    primaryAction.disabled = false;
    return;
  }

  if (phase === "setup") {
    primaryAction.hidden = false;
    primaryAction.disabled = getActivePlayers().length < MIN_PLAYERS;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent =
      getActivePlayers().length < MIN_PLAYERS ? "A espera da mesa" : "Comecar jogo";
    return;
  }

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

  if (phase === "result" && !resultRevealed) {
    primaryAction.hidden = true;
    primaryAction.disabled = false;
    return;
  }

  primaryAction.hidden = false;
  primaryAction.disabled = false;
  primaryAction.classList.add("secondary");
  primaryAction.textContent = isLastConfiguredRound() ? "Recomecar" : "Proxima";
}

function createQuestionBank(targetCount) {
  const questionsByPrompt = new Map();

  for (let index = 0; questionsByPrompt.size < targetCount; index += 1) {
    const action = spicyActions[index % spicyActions.length];
    const template =
      questionTemplates[
        (index + Math.floor(index / spicyActions.length)) %
          questionTemplates.length
      ];
    const prompt = template(action).replace(/\s+/g, " ").trim();

    questionsByPrompt.set(prompt, prompt);
  }

  return [...questionsByPrompt.values()];
}

function createRoundVotes(index, selectedTargetId) {
  const players = getActivePlayers();
  const votes = Object.fromEntries(players.map((player) => [player.playerId, 0]));
  const preferredVotes = selectedTargetId ? Math.ceil(players.length / 2) : 0;

  players.forEach((_player, playerIndex) => {
    if (selectedTargetId && playerIndex < preferredVotes) {
      votes[selectedTargetId] += 1;
      return;
    }

    const targetIndex = (index + playerIndex * 2 + 1) % players.length;
    const target = players[targetIndex];
    votes[target.playerId] += 1;
  });

  return votes;
}

function getWinner() {
  return getSortedResults()[0];
}

function getTotalVotes() {
  return Object.values(roundVotes).reduce((total, votes) => total + votes, 0);
}

function getSortedResults() {
  return getActivePlayers()
    .slice()
    .sort(
      (left, right) =>
        (roundVotes[right.playerId] ?? 0) - (roundVotes[left.playerId] ?? 0) ||
        getPlayerName(left).localeCompare(getPlayerName(right)),
    );
}

function getActivePlayers() {
  return joinedPlayers.slice(0, MAX_PLAYERS);
}

function renderJoinPhotoPreview() {
  if (joinPhotoDataUrl) {
    joinPhotoPreview.innerHTML = `<img src="${escapeHtml(joinPhotoDataUrl)}" alt="" />`;
    return;
  }

  joinPhotoPreview.textContent = "Adicionar foto";
}

function renderJoinedPreview() {
  const previewPlayer =
    joinedPlayer ?? {
      nickname: joinedPlayerName || "Jogador",
      photoUrl: joinPhotoDataUrl,
    };

  joinedPreviewName.textContent = getPlayerName(previewPlayer);
  joinedPreviewAvatar.innerHTML = getAvatarMarkup(previewPlayer);
}

function getRoomName() {
  return roomName.trim() || DEFAULT_ROOM_NAME;
}

function getJoinClientId() {
  const existingId = window.localStorage.getItem(JOIN_CLIENT_ID_KEY);

  if (existingId) {
    return existingId;
  }

  const nextId = crypto.randomUUID
    ? crypto.randomUUID()
    : `client_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(JOIN_CLIENT_ID_KEY, nextId);
  return nextId;
}

function getShortJoinUrl() {
  return joinUrl.replace(/^https?:\/\//, "");
}

function getPlayerInitial(player) {
  return (getPlayerName(player).slice(0, 1) || "?").toUpperCase();
}

function getAvatarMarkup(player) {
  if (player.photoUrl) {
    return `<img src="${escapeHtml(player.photoUrl)}" alt="" />`;
  }

  return `<strong>${escapeHtml(getPlayerInitial(player))}</strong>`;
}

function getPlayerName(player) {
  return player.nickname.trim() || "Jogador";
}

function getCurrentQuestion() {
  return questions[questionCursor % questions.length];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function formatRoundLimit() {
  return roundLimit === 0 ? "Livre" : String(roundLimit);
}

function isLastConfiguredRound() {
  return roundLimit > 0 && roundIndex >= roundLimit - 1;
}

function getSarcasticMessage(winner, votes, percentage) {
  const prompt = getCurrentQuestion().toLowerCase();
  const name = getPlayerName(winner);

  if (prompt.includes("ex")) {
    const lines = [
      `${name}, sempre soubemos que o ex faz te falta.`,
      `${name}, esse bloqueio ja vinha tarde.`,
      `${name}, saudade nao se disfarca assim.`,
    ];

    return lines[questionCursor % lines.length];
  }

  if (prompt.includes("ciume")) {
    return `${name}, esse ciume veio com recibo.`;
  }

  if (prompt.includes("crush") || prompt.includes("flertar") || prompt.includes("beijar")) {
    const lines = [
      `${name}, esse charme ja esta a dar nas vistas.`,
      `${name}, a crush percebeu antes de ti.`,
      `${name}, clima negado e clima confirmado.`,
    ];

    return lines[questionCursor % lines.length];
  }

  if (prompt.includes("alcool") || prompt.includes("beber") || prompt.includes("shot")) {
    return `${name}, a culpa hoje vai para o copo.`;
  }

  if (prompt.includes("ghost") || prompt.includes("visto") || prompt.includes("responder seco")) {
    return `${name}, visto dado e reputacao perdida.`;
  }

  if (
    prompt.includes("notificacao") ||
    prompt.includes("print") ||
    prompt.includes("telemovel")
  ) {
    return `${name}, telemovel escondido e quase confissao.`;
  }

  if (prompt.includes("desaparecer") || prompt.includes("sumir") || prompt.includes("sair")) {
    return `${name}, a desaparecer eras profissional.`;
  }

  if (prompt.includes("comida") || prompt.includes("rodada")) {
    return `${name}, a mesa ja contou contigo para pagar.`;
  }

  const lines = [
    `${name}, nao adianta fazer cara de santo.`,
    `${name}, a mesa sabe coisas.`,
    `${name}, foste exposto com carinho.`,
    `${name}, ${percentage}% de suspeitas confirmadas.`,
    `${name}, ${votes} votos e zero surpresa.`,
  ];

  return lines[questionCursor % lines.length];
}
