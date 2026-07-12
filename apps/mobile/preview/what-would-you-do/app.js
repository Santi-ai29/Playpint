const VOTING_SECONDS = 18;
const QUESTION_SECONDS = 20;
const players = ["Ana", "Bruno", "Carla", "Diogo", "Marta"];
const currentPlayerId = "preview_me";

const questions = [
  {
    id: "wwyd_0001",
    prompt: "Se um tubarao aparecesse a tua frente, o que fazias?",
    options: [
      { id: "a", label: "Fugia" },
      { id: "b", label: "Ficava paralisado" },
    ],
  },
  {
    id: "wwyd_0002",
    prompt: "Se o teu crush visse uma mensagem constrangedora tua, o que fazias?",
    options: [
      { id: "a", label: "Assumia com charme" },
      { id: "b", label: "Inventava uma desculpa" },
    ],
  },
  {
    id: "wwyd_0003",
    prompt: "Se tivesses de cantar karaoke sem saber a letra, o que fazias?",
    options: [
      { id: "a", label: "Inventava com confianca" },
      { id: "b", label: "Passava o microfone" },
    ],
  },
  {
    id: "wwyd_0004",
    prompt: "Se a mesa pedisse uma ultima rodada, o que fazias?",
    options: [
      { id: "a", label: "Alinhava" },
      { id: "b", label: "Chamava juizo" },
    ],
  },
  {
    id: "wwyd_0005",
    prompt: "Se o teu telemovel fosse projetado no ecra, o que fazias?",
    options: [
      { id: "a", label: "Bloqueava tudo" },
      { id: "b", label: "Dizia que era arte" },
    ],
  },
  {
    id: "wwyd_0006",
    prompt: "Se o teu ex entrasse no mesmo bar, o que fazias?",
    options: [
      { id: "a", label: "Ignorava com classe" },
      { id: "b", label: "Fazia questao de ser visto" },
    ],
  },
  {
    id: "wwyd_0007",
    prompt: "Se a tua crush elogiasse o teu amigo, o que fazias?",
    options: [
      { id: "a", label: "Ficava tranquilo" },
      { id: "b", label: "Mudava de assunto" },
    ],
  },
  {
    id: "wwyd_0008",
    prompt: "Se alguem pedisse para ver a tua ultima conversa, o que fazias?",
    options: [
      { id: "a", label: "Mostrava sem medo" },
      { id: "b", label: "Bloqueava o telemovel" },
    ],
  },
  {
    id: "wwyd_0009",
    prompt: "Se a mesa te acusasse de estar com ciumes, o que fazias?",
    options: [
      { id: "a", label: "Negava ate ao fim" },
      { id: "b", label: "Assumia um bocadinho" },
    ],
  },
  {
    id: "wwyd_0010",
    prompt: "Se recebesses uma mensagem de 'saudades', o que fazias?",
    options: [
      { id: "a", label: "Respondia" },
      { id: "b", label: "Mandava para o grupo" },
    ],
  },
  {
    id: "wwyd_0011",
    prompt: "Se o teu amigo mandasse mensagem ao teu ex, o que fazias?",
    options: [
      { id: "a", label: "Perguntava por que" },
      { id: "b", label: "Cortava a confianca" },
    ],
  },
  {
    id: "wwyd_0012",
    prompt: "Se tivesses de entregar o telemovel desbloqueado por 1 minuto, o que fazias?",
    options: [
      { id: "a", label: "Entregava" },
      { id: "b", label: "Preferia pagar castigo" },
    ],
  },
  {
    id: "wwyd_0013",
    prompt: "Se a mesa votasse em quem e mais falso, o que fazias?",
    options: [
      { id: "a", label: "Votava sincero" },
      { id: "b", label: "Votava seguro" },
    ],
  },
  {
    id: "wwyd_0014",
    prompt: "Se tivesses de escolher quem nunca superou o ex, o que fazias?",
    options: [
      { id: "a", label: "Dizia a verdade" },
      { id: "b", label: "Protegia a pessoa" },
    ],
  },
  {
    id: "wwyd_0015",
    prompt: "Se a tua crush perguntasse se estas solteiro, o que fazias?",
    options: [
      { id: "a", label: "Respondia direto" },
      { id: "b", label: "Respondia com charme" },
    ],
  },
  {
    id: "wwyd_0016",
    prompt: "Se descobrisses que foste assunto numa conversa, o que fazias?",
    options: [
      { id: "a", label: "Pedia prints" },
      { id: "b", label: "Ia perguntar direto" },
    ],
  },
];

let phase = "intro";
let questionOrder = createQuestionOrder(questions.length);
let questionCursor = 0;
let selectedOptionId = null;
let hasVoted = false;
let seconds = QUESTION_SECONDS;
let votes = [];
let resultRevealed = true;

const phaseLabel = document.querySelector("#phaseLabel");
const timerLabel = document.querySelector("#timerLabel");
const introPanel = document.querySelector("#introPanel");
const questionPanel = document.querySelector("#questionPanel");
const eyebrow = document.querySelector("#eyebrow");
const prompt = document.querySelector("#prompt");
const optionsPanel = document.querySelector("#optionsPanel");
const statusPanel = document.querySelector("#statusPanel");
const voteCountLabel = document.querySelector("#voteCountLabel");
const resultPanel = document.querySelector("#resultPanel");
const winnerName = document.querySelector("#winnerName");
const winnerLabel = document.querySelector("#winnerLabel");
const winnerPercentage = document.querySelector("#winnerPercentage");
const resultMessage = document.querySelector("#resultMessage");
const resultBars = document.querySelector("#resultBars");
const primaryAction = document.querySelector("#primaryAction");

window.setInterval(tick, 1000);

primaryAction.addEventListener("click", () => {
  if (phase === "intro") {
    startIntroQuestion();
    return;
  }

  if (phase === "waiting") {
    openVoting();
    return;
  }

  if (phase === "voting") {
    submitVote();
    return;
  }

  if (phase === "result") {
    nextQuestion();
  }
});

render();

function tick() {
  if (phase !== "voting" && phase !== "waiting") {
    return;
  }

  seconds = Math.max(0, seconds - 1);

  if (phase === "waiting" && seconds === 0) {
    openVoting();
    return;
  }

  if (phase === "voting" && seconds === 0) {
    if (selectedOptionId && !hasVoted) {
      submitVote();
      return;
    }

    showResult();
    return;
  }

  renderHeader();
}

function startIntroQuestion() {
  phase = "waiting";
  selectedOptionId = null;
  hasVoted = false;
  votes = [];
  seconds = QUESTION_SECONDS;
  resultRevealed = true;
  render();
}

function openVoting() {
  phase = "voting";
  selectedOptionId = null;
  hasVoted = false;
  votes = [];
  seconds = VOTING_SECONDS;
  resultRevealed = true;
  render();
}

function selectOption(optionId) {
  if (phase !== "voting" || hasVoted) {
    return;
  }

  selectedOptionId = optionId;
  renderOptions();
  renderFooter();
}

function submitVote() {
  if (phase !== "voting" || !selectedOptionId || hasVoted) {
    return;
  }

  hasVoted = true;
  phase = "submitted";
  votes = [
    {
      voterPlayerId: currentPlayerId,
      voterNickname: "Tu",
      optionId: selectedOptionId,
    },
  ];
  render();
  window.setTimeout(() => {
    addPreviewTableVotes();
    showResult();
  }, 780);
}

function addPreviewTableVotes() {
  const question = getCurrentQuestion();
  const baseOffset = getCurrentQuestionIndex() + (selectedOptionId === "a" ? 0 : 1);

  players.forEach((nickname, index) => {
    const option = question.options[(baseOffset + index) % question.options.length];
    votes.push({
      voterPlayerId: `preview_${index}`,
      voterNickname: nickname,
      optionId: option.id,
    });
  });
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
  }, 520);
}

function nextQuestion() {
  advanceQuestion();
  phase = "waiting";
  selectedOptionId = null;
  hasVoted = false;
  seconds = QUESTION_SECONDS;
  votes = [];
  resultRevealed = true;
  render();
}

function render() {
  document.body.dataset.phase = phase;
  renderHeader();
  renderIntro();
  renderQuestion();
  renderOptions();
  renderStatus();
  renderResult();
  renderFooter();
}

function renderHeader() {
  const round = questionCursor + 1;

  phaseLabel.textContent =
    phase === "intro"
      ? "Intro"
      : phase === "voting"
      ? `Votacao ${round}`
      : phase === "submitted"
        ? "Voto enviado"
        : phase === "result"
          ? "Resultado"
          : `Pergunta ${round}`;
  timerLabel.textContent =
    phase === "voting" || phase === "waiting"
      ? `00:${String(seconds).padStart(2, "0")}`
      : phase === "result" || phase === "submitted"
        ? `${votes.length}/${players.length + 1}`
        : "";
  timerLabel.classList.toggle("is-idle", phase !== "voting" && phase !== "waiting");
}

function renderIntro() {
  introPanel.classList.toggle("hidden", phase !== "intro");
}

function renderQuestion() {
  const question = getCurrentQuestion();

  questionPanel.classList.toggle(
    "hidden",
    phase === "intro" || phase === "result",
  );
  if (phase === "intro" || phase === "result") {
    return;
  }

  questionPanel.classList.toggle("is-compact", phase === "result");
  prompt.textContent = question.prompt;
  eyebrow.textContent =
    phase === "voting"
      ? "Votacao ativa"
      : phase === "submitted"
        ? "Voto enviado"
        : phase === "result"
          ? "Resultado"
          : "Aguardando pergunta";
}

function renderOptions() {
  const question = getCurrentQuestion();

  optionsPanel.classList.toggle(
    "hidden",
    phase === "intro" || phase === "result" || phase === "submitted",
  );
  if (phase === "intro" || phase === "result" || phase === "submitted") {
    optionsPanel.innerHTML = "";
    return;
  }

  optionsPanel.innerHTML = question.options
    .map((option, index) => {
      const selected = selectedOptionId === option.id;
      const disabled = phase !== "voting" || hasVoted;
      const classes = [
        "option-button",
        index === 0 ? "option-a" : "option-b",
        selected ? "selected" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <button
          class="${classes}"
          type="button"
          data-option-id="${option.id}"
          ${disabled ? "disabled" : ""}
        >
          <span>${index === 0 ? "A" : "B"}</span>
          <strong>${escapeHtml(option.label)}</strong>
        </button>
      `;
    })
    .join("");

  optionsPanel.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => selectOption(button.dataset.optionId));
  });
}

function renderStatus() {
  statusPanel.classList.toggle("hidden", phase !== "submitted");

  if (phase !== "submitted") {
    return;
  }

  voteCountLabel.textContent = `${votes.length}/${players.length + 1} votos`;
}

function renderResult() {
  resultPanel.classList.toggle("hidden", phase !== "result");

  if (phase !== "result") {
    return;
  }

  resultPanel.classList.toggle("is-revealing", !resultRevealed);

  if (!resultRevealed) {
    winnerName.textContent = "...";
    winnerLabel.textContent = "a contar votos";
    winnerPercentage.textContent = "";
    resultMessage.textContent = "";
    resultBars.innerHTML = "";
    return;
  }

  const results = getResults();
  const winners = results.filter((result) => result.isWinner);
  const winner = winners[0];
  const isTie = winners.length > 1;

  winnerName.textContent = isTie ? "Empate" : winner?.label ?? "Sem votos";
  winnerLabel.textContent = isTie ? "empate tecnico" : "opcao mais escolhida";
  winnerPercentage.textContent = winner ? `${winner.percentage}%` : "0%";
  resultMessage.textContent = getResultMessage(winner, isTie);
  resultBars.innerHTML = results
    .map(
      (result) => `
        <article class="result-bar ${result.isWinner ? "is-winner" : ""}">
          <div class="result-bar-top">
            <strong>${escapeHtml(result.label)}</strong>
            <span>${result.votes === 1 ? "1 voto" : `${result.votes} votos`}</span>
          </div>
          <div class="bar-track">
            <span style="width: ${result.percentage}%"></span>
          </div>
          <em>${result.percentage}%</em>
        </article>
      `,
    )
    .join("");
}

function renderFooter() {
  if (phase === "intro") {
    primaryAction.hidden = false;
    primaryAction.disabled = false;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Comecar";
    return;
  }

  if (phase === "waiting") {
    primaryAction.hidden = false;
    primaryAction.disabled = false;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Abrir votacao";
    return;
  }

  if (phase === "voting") {
    primaryAction.hidden = false;
    primaryAction.disabled = !selectedOptionId;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Confirmar voto";
    return;
  }

  if (phase === "submitted" || (phase === "result" && !resultRevealed)) {
    primaryAction.hidden = true;
    return;
  }

  primaryAction.hidden = false;
  primaryAction.disabled = false;
  primaryAction.classList.add("secondary");
  primaryAction.textContent = "Proxima";
}

function getResults() {
  const question = getCurrentQuestion();
  const totalVotes = votes.length;
  const optionResults = question.options.map((option) => {
    const optionVotes = votes.filter((vote) => vote.optionId === option.id).length;

    return {
      optionId: option.id,
      label: option.label,
      votes: optionVotes,
      percentage: totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 1000) / 10,
      isWinner: false,
    };
  });
  const topVotes = Math.max(...optionResults.map((result) => result.votes), 0);

  return optionResults.map((result) => ({
    ...result,
    isWinner: topVotes > 0 && result.votes === topVotes,
  }));
}

function getResultMessage(winner, isTie) {
  if (!winner) {
    return "Ninguem quis comprometer-se. Corajoso, de certa forma.";
  }

  if (isTie) {
    return "A mesa dividiu-se. Isto merece defesa oral.";
  }

  if (winner.label.toLowerCase().includes("fugia")) {
    return "Instinto de sobrevivencia ganhou sem grande debate.";
  }

  return "A mesa falou. Agora e fingir que era obvio.";
}

function getCurrentQuestion() {
  return questions[getCurrentQuestionIndex()];
}

function getCurrentQuestionIndex() {
  return questionOrder[questionCursor % questionOrder.length] ?? 0;
}

function advanceQuestion() {
  const previousQuestionIndex = getCurrentQuestionIndex();
  questionCursor += 1;

  if (questionCursor < questionOrder.length) {
    return;
  }

  questionOrder = createQuestionOrder(questions.length, previousQuestionIndex);
  questionCursor = 0;
}

function createQuestionOrder(length, avoidFirstIndex) {
  const order = Array.from({ length }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomInt(index + 1);
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  if (order.length > 1 && order[0] === avoidFirstIndex) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  return order;
}

function getRandomInt(limit) {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % limit;
  }

  return Math.floor(Math.random() * limit);
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
