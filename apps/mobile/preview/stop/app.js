const MIN_PLAYERS = 2;
const MAX_ROUND_CATEGORIES = 6;
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "I", "J", "L", "M", "N", "O", "P", "R", "S", "T", "V"];
const ROUND_LETTERS = ["B", "A", "P", "S", "M", "R"];
const categoryCatalog = [
  { id: "name", label: "Nome", placeholder: "Nome proprio" },
  { id: "city", label: "Cidade", placeholder: "Cidade" },
  { id: "animal", label: "Animal", placeholder: "Animal" },
  { id: "food", label: "Comida", placeholder: "Comida" },
  { id: "object", label: "Objeto", placeholder: "Objeto" },
  { id: "profession", label: "Profissao", placeholder: "Profissao" },
  { id: "brand", label: "Marca", placeholder: "Marca" },
  { id: "movie_series", label: "Filme/Serie", placeholder: "Filme ou serie" },
  { id: "celebrity", label: "Celebridade", placeholder: "Celebridade" },
  { id: "spicy", label: "Picante", placeholder: "Resposta de mesa" },
];
const wordBank = {
  A: {
    name: ["Ana", "Alice", "Antonio", "Andre"],
    city: ["Aveiro", "Amadora", "Almada", "Anadia"],
    animal: ["Anta", "Arara", "Abelha", "Atum"],
    food: ["Arroz", "Amendoim", "Ananas", "Azeitona"],
    object: ["Anel", "Agenda", "Agrafador", "Almofada"],
    profession: ["Ator", "Arquiteto", "Advogado", "Arbitro"],
    brand: ["Apple", "Adidas", "Audi", "Asus"],
    movie_series: ["Avatar", "Alien", "Atlanta", "Anatomia"],
    celebrity: ["Adele", "Anitta", "Al Pacino", "Ariana"],
    spicy: ["After", "Amasso", "Atrevimento", "Amor"],
  },
  B: {
    name: ["Bruno", "Beatriz", "Bia", "Bernardo"],
    city: ["Braga", "Barcelos", "Beja", "Berlin"],
    animal: ["Burro", "Baleia", "Borboleta", "Bufalo"],
    food: ["Bacalhau", "Banana", "Bife", "Brigadeiro"],
    object: ["Bola", "Bolsa", "Banco", "Botao"],
    profession: ["Barman", "Bombeiro", "Barbeiro", "Bailarino"],
    brand: ["BMW", "Bershka", "Bic", "Bolt"],
    movie_series: ["Breaking Bad", "Barbie", "Batman", "Bridgerton"],
    celebrity: ["Beyonce", "Brad Pitt", "Bad Bunny", "Billie"],
    spicy: ["Beijo", "Bloqueio", "Brinde", "Bora"],
  },
  M: {
    name: ["Marta", "Miguel", "Maria", "Mauro"],
    city: ["Madrid", "Matosinhos", "Maia", "Monaco"],
    animal: ["Macaco", "Morcego", "Mosca", "Melro"],
    food: ["Massa", "Melancia", "Mousse", "Milho"],
    object: ["Mesa", "Mala", "Martelo", "Mochila"],
    profession: ["Medico", "Musico", "Motorista", "Modelo"],
    brand: ["Mercedes", "Mango", "Microsoft", "McDonalds"],
    movie_series: ["Matrix", "Mad Men", "Mulan", "Manifest"],
    celebrity: ["Madonna", "Messi", "Miley", "Morgan Freeman"],
    spicy: ["Match", "Mimo", "Mensagem", "Mistura"],
  },
  P: {
    name: ["Pedro", "Paula", "Patricia", "Pilar"],
    city: ["Porto", "Paris", "Portimao", "Praga"],
    animal: ["Pato", "Panda", "Porco", "Pinguim"],
    food: ["Pizza", "Pasta", "Pudim", "Pao"],
    object: ["Prato", "Pente", "Pulseira", "Porta"],
    profession: ["Professor", "Piloto", "Padeiro", "Policia"],
    brand: ["Puma", "Pepsi", "PlayStation", "Pingo Doce"],
    movie_series: ["Prison Break", "Pulp Fiction", "Parasitas", "Pokemon"],
    celebrity: ["Post Malone", "Pedro Pascal", "Pink", "Pele"],
    spicy: ["Paixao", "Pedido", "Plano", "Provocar"],
  },
  R: {
    name: ["Rita", "Rafael", "Ricardo", "Ruben"],
    city: ["Roma", "Rio", "Roterdam", "Rabat"],
    animal: ["Rato", "Raposa", "Rena", "Rinoceronte"],
    food: ["Risotto", "Rabanada", "Robalo", "Ravioli"],
    object: ["Relogio", "Radio", "Regua", "Roupa"],
    profession: ["Radialista", "Rececionista", "Rapper", "Realizador"],
    brand: ["Rolex", "Renault", "Reebok", "Ryanair"],
    movie_series: ["Rocky", "Ratatui", "Roma", "Riverdale"],
    celebrity: ["Rihanna", "Ronaldo", "Rosalia", "Ryan Gosling"],
    spicy: ["Risco", "Romance", "Resposta", "Ritmo"],
  },
  S: {
    name: ["Sara", "Sofia", "Samuel", "Simone"],
    city: ["Setubal", "Sevilha", "Sintra", "Sydney"],
    animal: ["Sapo", "Serpente", "Salmao", "Suricata"],
    food: ["Sushi", "Sopa", "Salada", "Salsicha"],
    object: ["Sapato", "Sofa", "Saco", "Sabonete"],
    profession: ["Soldado", "Sapateiro", "Surfista", "Socorrista"],
    brand: ["Samsung", "Seat", "Sony", "Spotify"],
    movie_series: ["Shrek", "Suits", "Saw", "Stranger Things"],
    celebrity: ["Selena", "Shakira", "Snoop Dogg", "Sandra Bullock"],
    spicy: ["Segredo", "Saudade", "Sinal", "Sussurro"],
  },
};

let state = {
  phase: "intro",
  roomName: "Mesa Stop",
  roundLimit: 6,
  roundSeconds: 90,
  roundIndex: 0,
  seconds: 90,
  players: [
    { playerId: "p1", nickname: "Ana" },
    { playerId: "p2", nickname: "Bruno" },
    { playerId: "p3", nickname: "Carla" },
    { playerId: "p4", nickname: "Dinis" },
  ],
  activeCategoryIds: ["name", "city", "animal", "food", "object", "profession"],
  letter: "A",
  rouletteCursor: 0,
  rouletteDone: false,
  rouletteSequence: [],
  answers: {},
  submissions: [],
  reviewCategoryId: "name",
  invalidatedAnswers: {},
  roundResult: null,
  overallScores: {},
  scoresAppliedForRound: false,
};

let rouletteTimer = null;

const phaseLabel = document.querySelector("#phaseLabel");
const timerLabel = document.querySelector("#timerLabel");
const introPanel = document.querySelector("#introPanel");
const roulettePanel = document.querySelector("#roulettePanel");
const roundPanel = document.querySelector("#roundPanel");
const resultPanel = document.querySelector("#resultPanel");
const scorePanel = document.querySelector("#scorePanel");
const rouletteSpotlight = document.querySelector("#rouletteSpotlight");
const roulettePrevious = document.querySelector("#roulettePrevious");
const rouletteNext = document.querySelector("#rouletteNext");
const rouletteStatus = document.querySelector("#rouletteStatus");
const roundLetter = document.querySelector("#roundLetter");
const submissionCount = document.querySelector("#submissionCount");
const answersForm = document.querySelector("#answersForm");
const primaryAction = document.querySelector("#primaryAction");
const reviewLetterLabel = document.querySelector("#reviewLetterLabel");
const reviewTitle = document.querySelector("#reviewTitle");
const reviewSubtitle = document.querySelector("#reviewSubtitle");
const reviewTabs = document.querySelector("#reviewTabs");
const reviewBoard = document.querySelector("#reviewBoard");
const scoreLetterLabel = document.querySelector("#scoreLetterLabel");
const scoreWinner = document.querySelector("#scoreWinner");
const scoreSubtitle = document.querySelector("#scoreSubtitle");
const roundScores = document.querySelector("#roundScores");
const rankingList = document.querySelector("#rankingList");

window.setInterval(tick, 1000);

reviewTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-category]");

  if (!button) {
    return;
  }

  state.reviewCategoryId = button.dataset.reviewCategory;
  renderReview();
  renderFooter();
});

reviewBoard.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-toggle]");

  if (!button) {
    return;
  }

  const key = button.dataset.reviewToggle;
  state.invalidatedAnswers[key] = !state.invalidatedAnswers[key];
  renderReview();
});

primaryAction.addEventListener("click", () => {
  if (state.phase === "intro") {
    startGame();
    return;
  }

  if (state.phase === "roulette") {
    if (state.rouletteDone) {
      startRound();
    }
    return;
  }

  if (state.phase === "round") {
    stopRound();
    return;
  }

  if (state.phase === "review") {
    advanceReview();
    return;
  }

  if (state.phase === "score") {
    nextRound();
  }
});

answersForm.addEventListener("input", (event) => {
  const input = event.target.closest("[data-answer]");

  if (!input) {
    return;
  }

  state.answers[input.dataset.answer] = input.value.slice(0, 28);
  renderFooter();
});

render();

function startGame() {
  if (state.players.length < MIN_PLAYERS) {
    return;
  }

  state.overallScores = Object.fromEntries(
    state.players.map((player) => [
      player.playerId,
      {
        playerId: player.playerId,
        nickname: player.nickname,
        totalScore: 0,
        roundsWon: 0,
        lastRoundScore: 0,
      },
    ]),
  );
  state.roundIndex = 0;
  beginLetterRoulette();
}

function beginLetterRoulette() {
  clearRouletteTimer();
  state.phase = "roulette";
  state.letter = pickRoundLetter();
  state.rouletteCursor = 0;
  state.rouletteDone = false;
  state.rouletteSequence = createRouletteSequence(state.letter);
  state.answers = {};
  state.submissions = [];
  state.invalidatedAnswers = {};
  state.roundResult = null;
  state.reviewCategoryId = getActiveCategories()[0]?.id ?? "name";
  state.scoresAppliedForRound = false;
  render();
  spinRouletteStep(0);
}

function startRound() {
  clearRouletteTimer();
  state.phase = "round";
  state.seconds = state.roundSeconds;
  state.answers = {};
  state.submissions = [];
  state.invalidatedAnswers = {};
  state.roundResult = null;
  state.reviewCategoryId = getActiveCategories()[0]?.id ?? "name";
  state.scoresAppliedForRound = false;
  render();
}

function tick() {
  if (state.phase !== "round") {
    return;
  }

  state.seconds = Math.max(0, state.seconds - 1);

  if (state.seconds === 0) {
    finishInputs(null);
    return;
  }

  renderHeader();
}

function stopRound() {
  if (state.phase !== "round") {
    return;
  }

  finishInputs(state.players[0]);
}

function finishInputs(stoppedBy) {
  state.submissions = createPreviewSubmissions(stoppedBy);
  state.phase = "review";
  render();
}

function showScores() {
  state.roundResult = scoreRound(state.submissions);

  if (!state.scoresAppliedForRound) {
    state.overallScores = applyOverallScores(state.roundResult.playerScores);
    state.scoresAppliedForRound = true;
  }

  state.phase = "score";
  render();
}

function advanceReview() {
  const categories = getActiveCategories();
  const currentIndex = getCurrentReviewCategoryIndex(categories);

  if (currentIndex < categories.length - 1) {
    state.reviewCategoryId = categories[currentIndex + 1].id;
    render();
    return;
  }

  showScores();
}

function nextRound() {
  if (state.roundIndex >= state.roundLimit - 1) {
    resetGameIntro();
    return;
  }

  state.roundIndex += 1;
  beginLetterRoulette();
}

function resetGameIntro() {
  clearRouletteTimer();
  state.phase = "intro";
  state.roundIndex = 0;
  state.seconds = state.roundSeconds;
  state.answers = {};
  state.submissions = [];
  state.invalidatedAnswers = {};
  state.roundResult = null;
  state.reviewCategoryId = getActiveCategories()[0]?.id ?? "name";
  state.overallScores = {};
  state.scoresAppliedForRound = false;
  render();
}

function spinRouletteStep(index) {
  if (state.phase !== "roulette") {
    return;
  }

  const sequenceLetter = state.rouletteSequence[index] ?? state.letter;
  state.rouletteCursor = Math.max(0, LETTERS.indexOf(sequenceLetter));
  renderRoulette();

  if (index >= state.rouletteSequence.length - 1) {
    state.rouletteDone = true;
    state.rouletteCursor = LETTERS.indexOf(state.letter);
    renderRoulette();
    renderFooter();
    return;
  }

  const progress = index / Math.max(1, state.rouletteSequence.length - 1);
  const delay = 34 + Math.round(progress * progress * 155);
  rouletteTimer = window.setTimeout(() => spinRouletteStep(index + 1), delay);
}

function render() {
  document.body.dataset.phase = state.phase;
  renderHeader();
  renderIntro();
  renderRoulette();
  renderRound();
  renderReview();
  renderScores();
  renderFooter();
}

function renderHeader() {
  if (state.phase === "intro") {
    phaseLabel.textContent = "A seguir";
    timerLabel.textContent = "Stop";
    return;
  }

  if (state.phase === "roulette") {
    phaseLabel.textContent = `Ronda ${state.roundIndex + 1}/${state.roundLimit}`;
    timerLabel.textContent = "Sorteio";
    return;
  }

  const roundLabel = `${state.roundIndex + 1}/${state.roundLimit}`;
  phaseLabel.textContent =
    state.phase === "round"
      ? `Ronda ${roundLabel}`
      : state.phase === "review"
        ? `Revisao ${roundLabel}`
        : `Pontos ${roundLabel}`;
  timerLabel.textContent =
    state.phase === "round" ? formatTimer(state.seconds) : state.roomName;
}

function renderIntro() {
  introPanel.classList.toggle("hidden", state.phase !== "intro");
}

function renderRoulette() {
  roulettePanel.classList.toggle("hidden", state.phase !== "roulette");
  roulettePanel.classList.toggle("settled", state.rouletteDone);

  if (state.phase !== "roulette") {
    return;
  }

  const activeIndex = state.rouletteCursor;
  const activeLetter = LETTERS[activeIndex] ?? state.letter;
  const previousLetter = LETTERS[(activeIndex - 1 + LETTERS.length) % LETTERS.length];
  const nextLetter = LETTERS[(activeIndex + 1) % LETTERS.length];

  roulettePanel.dataset.spinTick = String(activeIndex % 2);
  roulettePrevious.textContent = state.rouletteDone
    ? previousLetterFor(state.letter)
    : previousLetter;
  rouletteSpotlight.textContent = state.rouletteDone ? state.letter : activeLetter;
  rouletteNext.textContent = state.rouletteDone ? nextLetterFor(state.letter) : nextLetter;
  rouletteStatus.textContent = state.rouletteDone
    ? `Letra ${state.letter}. Tudo pronto.`
    : "A escolher a letra";
}

function renderRound() {
  roundPanel.classList.toggle("hidden", state.phase !== "round");

  if (state.phase !== "round") {
    return;
  }

  const categories = getActiveCategories();
  roundLetter.textContent = state.letter;
  submissionCount.textContent = `0/${state.players.length}`;
  answersForm.innerHTML = categories
    .map(
      (category) => `
        <div class="answer-field">
          <label for="answer-${category.id}">${escapeHtml(category.label)}</label>
          <input
            id="answer-${category.id}"
            data-answer="${category.id}"
            autocomplete="off"
            maxlength="28"
            placeholder="${escapeHtml(category.placeholder)} com ${state.letter}"
            value="${escapeHtml(state.answers[category.id] ?? "")}"
          />
        </div>
      `,
    )
    .join("");
}

function renderReview() {
  resultPanel.classList.toggle("hidden", state.phase !== "review");

  if (state.phase !== "review") {
    return;
  }

  const categories = getActiveCategories();
  const selectedCategory =
    categories.find((category) => category.id === state.reviewCategoryId) ??
    categories[0];

  if (!selectedCategory) {
    return;
  }

  reviewLetterLabel.textContent = `Letra ${state.letter}`;
  reviewTitle.textContent = selectedCategory.label;
  reviewSubtitle.textContent = getStoppedBy()
    ? `${getStoppedBy().nickname} carregou Stop`
    : "Tempo esgotado";
  reviewTabs.innerHTML = categories
    .map(
      (category) => `
        <button
          class="${category.id === selectedCategory.id ? "active" : ""}"
          type="button"
          data-review-category="${category.id}"
        >
          ${escapeHtml(category.label)}
        </button>
      `,
    )
    .join("");
  reviewBoard.innerHTML = state.submissions
    .map((submission, index) => {
      const answer = submission.answers[selectedCategory.id] ?? "";
      const key = getReviewKey(submission.player.playerId, selectedCategory.id);
      const invalidated = Boolean(state.invalidatedAnswers[key]);
      const validLetter = isValidAnswer(answer);
      const stateLabel = invalidated
        ? "Anulada"
        : validLetter
          ? "Valida"
          : answer.trim()
            ? "Letra errada"
            : "Vazia";

      return `
        <article class="review-row ${invalidated ? "invalidated" : ""}" style="--enter-index: ${index}">
          <div class="review-player">
            <span class="player-avatar">${escapeHtml(getInitial(submission.player.nickname))}</span>
            <strong>${escapeHtml(submission.player.nickname)}</strong>
          </div>
          <div class="review-answer">
            <span>${escapeHtml(answer || "-")}</span>
            <em>${stateLabel}</em>
          </div>
          <button
            class="review-toggle ${invalidated ? "restore" : ""}"
            type="button"
            data-review-toggle="${escapeHtml(key)}"
          >
            ${invalidated ? "Repor" : "Anular"}
          </button>
        </article>
      `;
    })
    .join("");
}

function renderScores() {
  scorePanel.classList.toggle("hidden", state.phase !== "score");

  if (state.phase !== "score" || !state.roundResult) {
    return;
  }

  const winner = state.roundResult.playerScores[0];
  const ranking = getOverallRanking();
  scoreLetterLabel.textContent = `Letra ${state.roundResult.letter}`;
  scoreWinner.textContent = winner
    ? `${winner.nickname} venceu`
    : "Ronda fechada";
  scoreSubtitle.textContent = "Pontuacao acumulada";
  roundScores.innerHTML = state.roundResult.playerScores
    .map(
      (score, index) => `
        <article class="score-row ${index === 0 && score.totalScore > 0 ? "leader" : ""}" style="--enter-index: ${index}">
          <span class="rank">#${index + 1}</span>
          <strong>${escapeHtml(score.nickname)}</strong>
          <em>+${score.totalScore}</em>
        </article>
      `,
    )
    .join("");
  rankingList.innerHTML = ranking
    .map(
      (entry, index) => `
        <article class="ranking-row ${index === 0 && entry.totalScore > 0 ? "leader" : ""}" style="--enter-index: ${index}">
          <span class="rank">#${index + 1}</span>
          <strong>${escapeHtml(entry.nickname)}</strong>
          <span>${entry.totalScore} pts</span>
        </article>
      `,
    )
    .join("");
}

function renderFooter() {
  if (state.phase === "intro") {
    primaryAction.textContent =
      state.players.length < MIN_PLAYERS ? "A espera da mesa" : "Sortear letra";
    primaryAction.disabled = state.players.length < MIN_PLAYERS;
    primaryAction.classList.remove("secondary", "spinning");
    return;
  }

  if (state.phase === "roulette") {
    primaryAction.textContent = state.rouletteDone
      ? "Comecar ronda"
      : "A sortear letra";
    primaryAction.disabled = !state.rouletteDone;
    primaryAction.classList.toggle("spinning", !state.rouletteDone);
    primaryAction.classList.remove("secondary");
    return;
  }

  if (state.phase === "round") {
    primaryAction.textContent = "STOP";
    primaryAction.disabled = !Object.values(state.answers).some((answer) => answer.trim());
    primaryAction.classList.remove("secondary", "spinning");
    return;
  }

  if (state.phase === "review") {
    primaryAction.textContent = getReviewPrimaryActionLabel();
    primaryAction.disabled = false;
    primaryAction.classList.remove("secondary", "spinning");
    return;
  }

  primaryAction.textContent =
    state.roundIndex >= state.roundLimit - 1 ? "Novo jogo" : "Sortear proxima letra";
  primaryAction.disabled = false;
  primaryAction.classList.add("secondary");
  primaryAction.classList.remove("spinning");
}

function createPreviewSubmissions(stoppedBy) {
  const categories = getActiveCategories();

  return state.players.map((player, playerIndex) => {
    const isLocal = playerIndex === 0;
    const answers = {};

    for (const category of categories) {
      answers[category.id] = isLocal
        ? state.answers[category.id] ?? ""
        : pickPreviewAnswer(category.id, playerIndex);
    }

    return {
      player,
      answers,
      stoppedRound: stoppedBy?.playerId === player.playerId,
    };
  });
}

function pickPreviewAnswer(categoryId, playerIndex) {
  const bank = wordBank[state.letter] ?? wordBank.A;
  const values = bank[categoryId] ?? [`${state.letter}${categoryId}`];

  if (playerIndex === 2 && values[0]) {
    return values[0];
  }

  if (playerIndex === 3 && categoryId === "city") {
    return "Lisboa";
  }

  return values[(state.roundIndex + playerIndex) % values.length];
}

function scoreRound(submissions) {
  const categories = getActiveCategories();
  const categoryResults = categories.map((category) => {
    const validCounts = new Map();

    for (const submission of submissions) {
      const answer = submission.answers[category.id] ?? "";
      const normalized = normalizeAnswer(answer);
      const invalidated = Boolean(
        state.invalidatedAnswers[getReviewKey(submission.player.playerId, category.id)],
      );

      if (!invalidated && isValidAnswer(answer)) {
        validCounts.set(normalized, (validCounts.get(normalized) ?? 0) + 1);
      }
    }

    return {
      category,
      answers: submissions.map((submission) => {
        const answer = submission.answers[category.id] ?? "";
        const normalized = normalizeAnswer(answer);
        const invalidated = Boolean(
          state.invalidatedAnswers[getReviewKey(submission.player.playerId, category.id)],
        );

        if (invalidated) {
          return scoredAnswer(submission.player, category, answer, 0, "invalid");
        }

        if (!answer.trim()) {
          return scoredAnswer(submission.player, category, answer, 0, "empty");
        }

        if (!isValidAnswer(answer)) {
          return scoredAnswer(submission.player, category, answer, 0, "wrong_letter");
        }

        const duplicate = (validCounts.get(normalized) ?? 0) > 1;

        return scoredAnswer(
          submission.player,
          category,
          answer,
          duplicate ? 5 : 10,
          duplicate ? "duplicate" : "unique",
        );
      }),
    };
  });
  const totals = new Map(
    state.players.map((player) => [
      player.playerId,
      {
        playerId: player.playerId,
        nickname: player.nickname,
        totalScore: 0,
      },
    ]),
  );

  for (const categoryResult of categoryResults) {
    for (const answer of categoryResult.answers) {
      totals.get(answer.playerId).totalScore += answer.points;
    }
  }

  return {
    letter: state.letter,
    categoryResults,
    playerScores: [...totals.values()].sort(
      (left, right) =>
        right.totalScore - left.totalScore ||
        left.nickname.localeCompare(right.nickname),
    ),
  };
}

function scoredAnswer(player, category, answer, points, reason) {
  return {
    playerId: player.playerId,
    nickname: player.nickname,
    categoryId: category.id,
    answer,
    points,
    reason,
    valid: reason === "duplicate" || reason === "unique",
  };
}

function applyOverallScores(playerScores) {
  const nextScores = { ...state.overallScores };
  const topScore = playerScores[0]?.totalScore ?? 0;

  for (const score of playerScores) {
    const previous = nextScores[score.playerId] ?? {
      playerId: score.playerId,
      nickname: score.nickname,
      totalScore: 0,
      roundsWon: 0,
      lastRoundScore: 0,
    };

    nextScores[score.playerId] = {
      ...previous,
      totalScore: previous.totalScore + score.totalScore,
      roundsWon:
        previous.roundsWon + (topScore > 0 && score.totalScore === topScore ? 1 : 0),
      lastRoundScore: score.totalScore,
    };
  }

  return nextScores;
}

function getOverallRanking() {
  return Object.values(state.overallScores).sort(
    (left, right) =>
      right.totalScore - left.totalScore ||
      right.roundsWon - left.roundsWon ||
      left.nickname.localeCompare(right.nickname),
  );
}

function createRouletteSequence(finalLetter) {
  const seed = state.roundIndex * 3 + 2;
  const sequence = [];

  for (let index = 0; index < 42; index += 1) {
    sequence.push(LETTERS[(seed + index * 5) % LETTERS.length]);
  }

  sequence.push(finalLetter);
  return sequence;
}

function pickRoundLetter() {
  return ROUND_LETTERS[state.roundIndex % ROUND_LETTERS.length];
}

function clearRouletteTimer() {
  window.clearTimeout(rouletteTimer);
  rouletteTimer = null;
}

function previousLetterFor(letter) {
  const index = Math.max(0, LETTERS.indexOf(letter));

  return LETTERS[(index - 1 + LETTERS.length) % LETTERS.length];
}

function nextLetterFor(letter) {
  const index = Math.max(0, LETTERS.indexOf(letter));

  return LETTERS[(index + 1) % LETTERS.length];
}

function getStoppedBy() {
  return state.submissions.find((submission) => submission.stoppedRound)?.player;
}

function getReviewPrimaryActionLabel() {
  const categories = getActiveCategories();
  const currentIndex = getCurrentReviewCategoryIndex(categories);
  const nextCategory = categories[currentIndex + 1];

  return nextCategory ? `Proximo: ${nextCategory.label}` : "Calcular pontos";
}

function getCurrentReviewCategoryIndex(categories = getActiveCategories()) {
  const index = categories.findIndex(
    (category) => category.id === state.reviewCategoryId,
  );

  return index >= 0 ? index : 0;
}

function getActiveCategories() {
  return categoryCatalog.filter((category) =>
    state.activeCategoryIds.includes(category.id),
  );
}

function getReviewKey(playerId, categoryId) {
  return `${playerId}:${categoryId}`;
}

function isValidAnswer(answer) {
  return normalizeAnswer(answer).startsWith(state.letter);
}

function normalizeAnswer(answer) {
  return String(answer)
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function getInitial(name) {
  return name.slice(0, 1).toUpperCase() || "?";
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
