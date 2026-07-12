const VOTING_SECONDS = 18;
const QUESTION_SECONDS = 20;
const players = ["Ana", "Bruno", "Carla", "Diogo", "Marta"];
const currentPlayerId = "preview_me";

const questionCategories = {
  dinheiro: { id: "dinheiro", label: "Dinheiro" },
  tecnologia: { id: "tecnologia", label: "Tecnologia" },
  social: { id: "social", label: "Social" },
  picantes: { id: "picantes", label: "Picantes" },
  escola: { id: "escola", label: "Escola" },
  trabalho: { id: "trabalho", label: "Trabalho" },
  viagens: { id: "viagens", label: "Viagens" },
  comida: { id: "comida", label: "Comida" },
  absurdas: { id: "absurdas", label: "Absurdas" },
  dia_a_dia: { id: "dia_a_dia", label: "Dia a dia" },
};

const questions = [
  {
    id: "wwyd_0001",
    prompt: "O que preferias: ficar um mes sem telemovel ou um ano sem redes sociais?",
    options: [
      { id: "a", label: "Um mes sem telemovel" },
      { id: "b", label: "Um ano sem redes sociais" },
    ],
  },
  {
    id: "wwyd_0002",
    prompt: "O que preferias: ler pensamentos durante um dia ou ficar invisivel durante uma hora?",
    options: [
      { id: "a", label: "Ler pensamentos" },
      { id: "b", label: "Ficar invisivel" },
    ],
  },
  {
    id: "wwyd_0003",
    prompt: "O que preferias: ter bateria infinita sem Internet ou Internet rapida com 1% de bateria?",
    options: [
      { id: "a", label: "Bateria infinita" },
      { id: "b", label: "Internet rapida" },
    ],
  },
  {
    id: "wwyd_0004",
    prompt: "O que preferias: viajar dez anos para o futuro ou dez anos para o passado?",
    options: [
      { id: "a", label: "Ir ao futuro" },
      { id: "b", label: "Voltar ao passado" },
    ],
  },
  {
    id: "wwyd_0005",
    prompt: "O que preferias: dizer sempre o que pensas ou nunca poder dar opiniao?",
    options: [
      { id: "a", label: "Dizer tudo" },
      { id: "b", label: "Guardar opiniao" },
    ],
  },
  {
    id: "wwyd_0006",
    prompt: "O que preferias: saber todos os segredos da mesa ou apagar um segredo teu?",
    options: [
      { id: "a", label: "Saber segredos" },
      { id: "b", label: "Apagar um segredo" },
    ],
  },
  {
    id: "wwyd_0007",
    prompt: "O que preferias: transportes gratis para sempre ou comida gratis todos os fins de semana?",
    options: [
      { id: "a", label: "Transportes gratis" },
      { id: "b", label: "Comida gratis" },
    ],
  },
  {
    id: "wwyd_0008",
    prompt: "O que preferias: viver junto ao mar sem dinheiro ou no centro com pouco tempo livre?",
    options: [
      { id: "a", label: "Junto ao mar" },
      { id: "b", label: "No centro" },
    ],
  },
  {
    id: "wwyd_0009",
    prompt: "O que preferias: trabalhar quatro dias por semana ou ter ferias mais longas?",
    options: [
      { id: "a", label: "Quatro dias" },
      { id: "b", label: "Ferias longas" },
    ],
  },
  {
    id: "wwyd_0010",
    prompt: "O que preferias: estudar sem exames ou trabalhar sem reunioes?",
    options: [
      { id: "a", label: "Sem exames" },
      { id: "b", label: "Sem reunioes" },
    ],
  },
  {
    id: "wwyd_0011",
    prompt: "O que preferias: os teus amigos verem o teu historico ou a tua galeria?",
    options: [
      { id: "a", label: "Historico aberto" },
      { id: "b", label: "Galeria aberta" },
    ],
  },
  {
    id: "wwyd_0012",
    prompt: "O que preferias: chegar sempre atrasado ou sempre cedo demais?",
    options: [
      { id: "a", label: "Sempre atrasado" },
      { id: "b", label: "Sempre cedo" },
    ],
  },
  {
    id: "wwyd_0013",
    prompt: "O que preferias: jantar com o teu ex ou sair com a crush de um amigo?",
    options: [
      { id: "a", label: "Jantar com ex" },
      { id: "b", label: "Crush do amigo" },
    ],
  },
  {
    id: "wwyd_0014",
    prompt: "O que preferias: nunca conseguir mentir ou nunca perceber quando mentem?",
    options: [
      { id: "a", label: "Nunca mentir" },
      { id: "b", label: "Nunca perceber" },
    ],
  },
  {
    id: "wwyd_0015",
    prompt: "O que preferias: ser famoso sem dinheiro ou rico sem ninguem saber?",
    options: [
      { id: "a", label: "Famoso sem dinheiro" },
      { id: "b", label: "Rico anonimo" },
    ],
  },
  {
    id: "wwyd_0016",
    prompt: "O que preferias: falar todos os idiomas ou tocar todos os instrumentos?",
    options: [
      { id: "a", label: "Todos os idiomas" },
      { id: "b", label: "Todos os instrumentos" },
    ],
  },
].map(withQuestionCategory);

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
  eyebrow.textContent = question.category.label;
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
    primaryAction.textContent = "COMEÇAR";
    primaryAction.setAttribute("aria-label", "Começar jogo");
    return;
  }

  if (phase === "waiting") {
    primaryAction.hidden = false;
    primaryAction.disabled = false;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Abrir votação";
    primaryAction.setAttribute("aria-label", "Abrir votação");
    return;
  }

  if (phase === "voting") {
    primaryAction.hidden = false;
    primaryAction.disabled = !selectedOptionId;
    primaryAction.classList.remove("secondary");
    primaryAction.textContent = "Confirmar voto";
    primaryAction.setAttribute("aria-label", "Confirmar voto");
    return;
  }

  if (phase === "submitted" || (phase === "result" && !resultRevealed)) {
    primaryAction.hidden = true;
    return;
  }

  primaryAction.hidden = false;
  primaryAction.disabled = false;
  primaryAction.classList.add("secondary");
  primaryAction.textContent = "Próxima";
  primaryAction.setAttribute("aria-label", "Próxima pergunta");
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
    return "Ninguem quis comprometer-se. Isso tambem diz muito.";
  }

  if (isTie) {
    return "A mesa dividiu-se. Isto merece defesa oral.";
  }

  const question = getCurrentQuestion().prompt.toLowerCase();
  const label = winner.label.toLowerCase();

  if (question.includes("telemovel") || question.includes("internet") || label.includes("bateria")) {
    return "A mesa escolheu o caos digital menos doloroso.";
  }

  if (question.includes("ex") || question.includes("crush") || question.includes("segredo")) {
    return "A mesa escolheu drama com alguma dignidade.";
  }

  return "A mesa escolheu um lado. Agora e defender a escolha.";
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

function withQuestionCategory(question) {
  return {
    ...question,
    category: getQuestionCategory(question.prompt),
  };
}

function getQuestionCategory(promptText) {
  const normalized = promptText.toLowerCase();

  if (matchesAny(normalized, ["dinheiro", "euros", "rico", "salario", "lotaria"])) {
    return questionCategories.dinheiro;
  }

  if (matchesAny(normalized, ["telemovel", "internet", "passwords", "carregadores", "gps", "fones", "algoritmo", "notificacoes"])) {
    return questionCategories.tecnologia;
  }

  if (matchesAny(normalized, ["crush", "ex", "date", "amor", "relacoes"])) {
    return questionCategories.picantes;
  }

  if (matchesAny(normalized, ["escola", "testes", "trabalhos de casa", "trabalhos de grupo"])) {
    return questionCategories.escola;
  }

  if (matchesAny(normalized, ["trabalho", "emprego", "chefe", "reunioes", "colegas"])) {
    return questionCategories.trabalho;
  }

  if (matchesAny(normalized, ["viagem", "viajar", "pais", "hotel", "carrinha", "comboio"])) {
    return questionCategories.viagens;
  }

  if (matchesAny(normalized, ["comida", "pizza", "cafe", "jantar", "cozinhar"])) {
    return questionCategories.comida;
  }

  if (matchesAny(normalized, ["amigos", "amigo", "mesa", "segredo", "rumor", "aniversario", "conversa"])) {
    return questionCategories.social;
  }

  if (matchesAny(normalized, ["invisivel", "ler mentes", "teletransportar", "voar", "tempo", "cao que fala", "clone"])) {
    return questionCategories.absurdas;
  }

  return questionCategories.dia_a_dia;
}

function matchesAny(value, needles) {
  return needles.some((needle) => value.includes(needle));
}
