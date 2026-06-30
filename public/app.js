const STORAGE_KEY = "jeopardy-matematico-state-v1";
const TIMER_SECONDS = 30;
const MAX_IMAGE_BYTES = 1_200_000;
const PUBLIC_BUZZER_URL = "https://jeopardy-matematico-web.onrender.com/buzzer";

const defaultGame = {
  title: "Jeopardy Matematico",
  logoImage: "",
  final: {
    category: "Reto final",
    question: "Encuentra el valor de $x$ si $$2x+5=17.$$",
    answer: "$x=6$",
    explanation: "Restamos 5 en ambos lados para obtener $2x=12$ y luego dividimos entre 2."
  },
  teams: [
    { id: "team-1", name: "Equipo Azul", score: 0, color: "#1f88b5" },
    { id: "team-2", name: "Equipo Verde", score: 0, color: "#2ea66f" },
    { id: "team-3", name: "Equipo Coral", score: 0, color: "#ef8a62" }
  ],
  categories: [
    {
      title: "Numeros naturales",
      clues: [
        clue(100, "Calcula $24+18$.", "$42$", "Suma decenas y unidades.", "$24+18=(20+10)+(4+8)=30+12=42$."),
        clue(200, "Escribe el sucesor de $999$.", "$1000$", "Va justo despues.", "El sucesor se obtiene sumando $1$: $999+1=1000$."),
        clue(300, "Calcula $12\\times 8$.", "$96$", "Puedes usar $12\\times(10-2)$.", "$12\\times8=12\\times(10-2)=120-24=96$."),
        clue(400, "Cuantos divisores tiene $12$?", "$6$: $1,2,3,4,6,12$.", "Haz una lista ordenada.", "Los divisores son los numeros que dividen a $12$ sin residuo: $1,2,3,4,6,12$."),
        clue(500, "El minimo comun multiplo de $8$ y $12$ es...", "$24$", "Busca el primer multiplo compartido.", "Multiples de $8$: $8,16,24$. Multiples de $12$: $12,24$. El primero comun es $24$.")
      ]
    },
    {
      title: "Numeros enteros",
      clues: [
        clue(100, "Calcula $-7+12$.", "$5$", "Avanza 12 desde -7.", "Desde $-7$, avanzar $12$ unidades llega a $5$."),
        clue(200, "Calcula $-4\\times 6$.", "$-24$", "Signos distintos dan negativo.", "El producto de signos distintos es negativo y $4\\times6=24$."),
        clue(300, "Ordena de menor a mayor: $-2, 5, -8, 0$.", "$-8, -2, 0, 5$", "Mas a la izquierda en la recta numerica es menor.", "En la recta numerica, $-8$ esta mas a la izquierda que $-2$, luego viene $0$ y despues $5$."),
        clue(400, "Calcula $|-15|+|-3|$.", "$18$", "El valor absoluto es distancia a cero.", "$|-15|=15$ y $|-3|=3$, por eso $15+3=18$."),
        clue(500, "Resuelve $x-9=-14$.", "$x=-5$", "Suma 9 a ambos lados.", "Al sumar $9$ en ambos lados queda $x=-14+9=-5$.")
      ]
    },
    {
      title: "Fracciones",
      clues: [
        clue(100, "Simplifica $\\frac{6}{8}$.", "$\\frac{3}{4}$", "Divide numerador y denominador por 2.", "$\\frac{6}{8}=\\frac{6\\div2}{8\\div2}=\\frac{3}{4}$."),
        clue(200, "Calcula $\\frac{1}{3}+\\frac{1}{6}$.", "$\\frac{1}{2}$", "Usa denominador comun 6.", "$\\frac{1}{3}=\\frac{2}{6}$, entonces $\\frac{2}{6}+\\frac{1}{6}=\\frac{3}{6}=\\frac{1}{2}$."),
        clue(300, "Calcula $\\frac{5}{7}-\\frac{2}{7}$.", "$\\frac{3}{7}$", "Mismo denominador.", "Con denominadores iguales, se restan numeradores: $\\frac{5-2}{7}=\\frac{3}{7}$."),
        clue(400, "Multiplica $\\frac{3}{5}\\cdot\\frac{10}{9}$.", "$\\frac{2}{3}$", "Puedes simplificar cruzado.", "$\\frac{3\\cdot10}{5\\cdot9}=\\frac{30}{45}=\\frac{2}{3}$."),
        clue(500, "Convierte $1.25$ a fraccion simplificada.", "$\\frac{5}{4}$", "$1.25=\\frac{125}{100}$.", "$1.25=\\frac{125}{100}$ y al dividir entre $25$ queda $\\frac{5}{4}$.")
      ]
    },
    {
      title: "Algebra",
      clues: [
        clue(100, "Si $x=4$, calcula $3x+2$.", "$14$", "Sustituye $x$ por 4.", "$3(4)+2=12+2=14$."),
        clue(200, "Resuelve $x+7=19$.", "$x=12$", "Resta 7.", "Al restar $7$ en ambos lados queda $x=19-7=12$."),
        clue(300, "Factoriza $x^2+5x$.", "$x(x+5)$", "Busca factor comun.", "Ambos terminos tienen factor $x$, por eso $x^2+5x=x(x+5)$."),
        clue(400, "Resuelve $3x=\\frac{27}{2}$.", "$x=\\frac{9}{2}$", "Divide por 3.", "$x=\\frac{27}{2}\\div3=\\frac{27}{2}\\cdot\\frac{1}{3}=\\frac{9}{2}$."),
        clue(500, "Expande $(x+3)^2$.", "$x^2+6x+9$", "Cuadrado de binomio.", "$(x+3)^2=(x+3)(x+3)=x^2+3x+3x+9=x^2+6x+9$.")
      ]
    },
    {
      title: "Areas",
      clues: [
        clue(100, "Area de un rectangulo con base $8$ y altura $5$.", "$40$", "$A=bh$.", "$A=8\\cdot5=40$ unidades cuadradas."),
        clue(200, "Formula del area de un triangulo.", "$A=\\frac{bh}{2}$", "Es la mitad de un rectangulo.", "Un triangulo con la misma base y altura ocupa la mitad del rectangulo: $A=\\frac{bh}{2}$."),
        clue(300, "Area de un circulo de radio $r$.", "$A=\\pi r^2$", "Depende del radio al cuadrado.", "La formula del area circular usa el radio al cuadrado: $A=\\pi r^2$."),
        clue(400, "Area de un trapecio con bases $B,b$ y altura $h$.", "$A=\\frac{(B+b)h}{2}$", "Promedio de bases por altura.", "Se promedian las bases y se multiplica por la altura: $A=\\frac{(B+b)h}{2}$."),
        clue(500, "Un cuadrado tiene area $81$. Cual es su lado?", "$9$", "El lado es la raiz cuadrada del area.", "En un cuadrado $A=l^2$. Si $l^2=81$, entonces $l=\\sqrt{81}=9$.")
      ]
    },
    {
      title: "Sorpresa",
      clues: [
        clue(100, "Que numero primo es par?", "$2$", "Solo uno.", "$2$ es primo porque solo tiene divisores $1$ y $2$, y es el unico primo par."),
        clue(200, "Calcula $2^5$.", "$32$", "$2\\cdot2\\cdot2\\cdot2\\cdot2$.", "$2^5$ significa multiplicar cinco factores de $2$: $2\\cdot2\\cdot2\\cdot2\\cdot2=32$."),
        clue(300, "Si una razon es $3:4$, el total de partes es...", "$7$", "Suma las partes.", "La razon tiene $3$ partes de un tipo y $4$ de otro: $3+4=7$."),
        clue(400, "La media de $4, 8, 10, 18$ es...", "$10$", "Suma y divide entre 4.", "La media es $\\frac{4+8+10+18}{4}=\\frac{40}{4}=10$."),
        clue(500, "Resuelve $\\sqrt{144}+3^2$.", "$21$", "$12+9$.", "$\\sqrt{144}=12$ y $3^2=9$, entonces $12+9=21$.")
      ]
    }
  ]
};

let game = loadGame();
let currentClue = null;
let selectedTeamId = game.teams[0]?.id || "";
let socket = null;
let reconnectTimer = null;
let buzzes = [];
let players = [];
let buzzerOpen = false;
let timerId = null;
let timerLeft = TIMER_SECONDS;
let muted = false;

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  bindUi();
  renderAll();
  connectSocket();
  loadInfo();
  applyInitialScreenFromUrl();
  whenMathJaxReady(refreshRenderedMath);
});

window.addEventListener("beforeunload", () => {
  sendWs({ type: "lock-buzzers" });
});

function clue(value, question, answer, hint = "", explanation = "", images = {}) {
  return {
    value,
    question,
    answer,
    hint,
    explanation: explanation || hint,
    questionImage: images.questionImage || "",
    hintImage: images.hintImage || "",
    answerImage: images.answerImage || "",
    explanationImage: images.explanationImage || "",
    answered: false
  };
}

function bindUi() {
  $("#startGameBtn").addEventListener("click", startGame);
  $("#showInstructionsBtn").addEventListener("click", openInstructions);
  $("#startSetupBtn").addEventListener("click", openEditor);
  $("#homeBtn").addEventListener("click", showStart);
  $("#instructionsBtn").addEventListener("click", openInstructions);
  $("#resultsBtn").addEventListener("click", openResults);
  $("#showResultsPanelBtn").addEventListener("click", openResults);
  $("#backToBoardBtn").addEventListener("click", backToBoard);
  $("#resultsHomeBtn").addEventListener("click", showStart);
  $("#editBtn").addEventListener("click", openEditor);
  $("#finalBtn").addEventListener("click", openFinal);
  $("#fullscreenBtn").addEventListener("click", toggleFullscreen);
  $("#muteBtn").addEventListener("click", () => {
    muted = !muted;
    $("#muteBtn").classList.toggle("accent", !muted);
    $("#muteBtn").querySelector("span").textContent = muted ? "Mudo" : "Sonido";
  });
  $("#copyBuzzerLink").addEventListener("click", copyBuzzerLink);
  $("#buzzerQrButton").addEventListener("click", openQrModal);
  $("#copyQrLink").addEventListener("click", copyBuzzerLink);
  $("#clearBuzzers").addEventListener("click", clearBuzzers);
  $("#openBuzzers").addEventListener("click", () => sendWs({ type: "open-buzzers" }));
  $("#lockBuzzers").addEventListener("click", () => sendWs({ type: "lock-buzzers" }));
  $("#addTeamBtn").addEventListener("click", addTeam);
  $("#resetBoardBtn").addEventListener("click", resetBoard);
  $("#resetScoresBtn").addEventListener("click", resetScores);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });

  $("#hintBtn").addEventListener("click", () => {
    const hint = $("#hintText");
    hint.classList.toggle("hidden");
    if (!hint.classList.contains("hidden")) renderMath(hint);
  });
  $("#showAnswerBtn").addEventListener("click", showAnswer);
  $("#correctBtn").addEventListener("click", () => scoreCurrent(true));
  $("#wrongBtn").addEventListener("click", () => scoreCurrent(false));
  $("#markAnsweredBtn").addEventListener("click", () => markCurrentAnswered(true));
  $("#timerBtn").addEventListener("click", toggleTimer);

  $("#editTitle").addEventListener("input", (event) => {
    game.title = event.target.value.trim() || "Jeopardy Matematico";
    saveAndRender();
    sendHostState();
  });
  $("#editLogoImage").addEventListener("input", updateLogoFromEditor);
  bindLogoEditorControls();
  $("#editorFullscreenBtn").addEventListener("click", toggleEditorFullscreen);
  $("#categorySelect").addEventListener("change", renderClueEditor);
  $("#clueSelect").addEventListener("change", renderClueEditor);
  ["editValue", "editQuestion", "editQuestionImage", "editAnswer", "editAnswerImage", "editHint", "editHintImage", "editExplanation", "editExplanationImage"].forEach((id) => {
    $(`#${id}`).addEventListener("input", updateCurrentClueFromEditor);
  });
  bindImageEditorControls("Question");
  bindImageEditorControls("Answer");
  bindImageEditorControls("Hint");
  bindImageEditorControls("Explanation");
  $("#editorAddTeam").addEventListener("click", addTeam);
  $("#addCategoryBtn").addEventListener("click", addCategory);
  $("#exportJsonBtn").addEventListener("click", exportJson);
  $("#importJsonBtn").addEventListener("click", importJson);
  $("#downloadJsonBtn").addEventListener("click", downloadJson);
  $("#resetGameBtn").addEventListener("click", resetTemplate);

  $("#showFinalAnswerBtn").addEventListener("click", () => {
    $("#finalAnswer").classList.remove("hidden");
    renderMath($("#finalAnswer"));
  });
  $("#applyFinalCorrect").addEventListener("click", () => applyFinal(true));
  $("#applyFinalWrong").addEventListener("click", () => applyFinal(false));
}

function loadGame() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return clone(defaultGame);
    return normalizeGame(JSON.parse(stored));
  } catch {
    return clone(defaultGame);
  }
}

function normalizeGame(raw) {
  const safe = { ...clone(defaultGame), ...raw };
  safe.logoImage = normalizeImageSource(raw.logoImage);
  safe.teams = Array.isArray(raw.teams) && raw.teams.length ? raw.teams : clone(defaultGame.teams);
  safe.teams = safe.teams.map((team, index) => ({
    id: team.id || `team-${index + 1}`,
    name: team.name || `Equipo ${index + 1}`,
    score: Number(team.score || 0),
    color: team.color || ["#1f88b5", "#2ea66f", "#ef8a62", "#ffe45b"][index % 4]
  }));
  safe.categories = Array.isArray(raw.categories) && raw.categories.length ? raw.categories : clone(defaultGame.categories);
  safe.categories = safe.categories.map((category, categoryIndex) => ({
    title: category.title || `Categoria ${categoryIndex + 1}`,
    clues: ensureClues(category.clues)
  }));
  safe.final = {
    category: raw.final?.category || defaultGame.final.category,
    question: textOrImageFallback(raw.final?.question, raw.final?.questionImage, defaultGame.final.question),
    answer: textOrImageFallback(raw.final?.answer, raw.final?.answerImage, defaultGame.final.answer),
    explanation: raw.final?.explanation || defaultGame.final.explanation,
    questionImage: normalizeImageSource(raw.final?.questionImage),
    answerImage: normalizeImageSource(raw.final?.answerImage)
  };
  return safe;
}

function ensureClues(clues) {
  const values = [100, 200, 300, 400, 500];
  return values.map((value, index) => {
    const clueData = clues?.[index] || {};
    const questionImage = normalizeImageSource(clueData.questionImage);
    const hintImage = normalizeImageSource(clueData.hintImage);
    const answerImage = normalizeImageSource(clueData.answerImage);
    const explanationImage = normalizeImageSource(clueData.explanationImage);
    const hint = normalizeText(clueData.hint);
    const explanationFallback = hint || "Compara el procedimiento con la respuesta correcta.";

    return {
      value: Number(clueData.value || value),
      question: textOrImageFallback(clueData.question, questionImage, `Pregunta por $${value}`),
      answer: textOrImageFallback(clueData.answer, answerImage, "Respuesta"),
      hint,
      explanation: textOrImageFallback(
        clueData.explanation,
        explanationImage,
        explanationFallback,
        ["Compara el procedimiento con la respuesta correcta."]
      ),
      questionImage,
      hintImage,
      answerImage,
      explanationImage,
      answered: Boolean(clueData.answered)
    };
  });
}

function normalizeImageSource(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeText(value) {
  return typeof value === "string" ? value : "";
}

function textOrImageFallback(value, imageSource, fallback, legacyFillers = []) {
  const text = normalizeText(value);
  const hasImage = Boolean(normalizeImageSource(imageSource));
  if (hasImage && (!text || text === fallback || legacyFillers.includes(text))) return "";
  return text || fallback;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    alert("No se pudo guardar. Es posible que una imagen sea demasiado pesada para el almacenamiento del navegador.");
  }
}

function saveAndRender() {
  saveGame();
  renderGameSurface();
  sendHostState();
}

function startGame() {
  $("#startScreen").classList.add("hidden");
  $("#resultsScreen").classList.add("hidden");
  $("#gameShell").classList.remove("hidden");
  $("#gameShell").classList.add("board-active");
  setTimeout(() => $("#gameShell").classList.remove("board-active"), 360);
  playNotes([[392, 0, 0.09], [523, 0.1, 0.1], [659, 0.22, 0.14]]);
}

function showStart() {
  closeOpenModals();
  $("#gameShell").classList.add("hidden");
  $("#resultsScreen").classList.add("hidden");
  $("#startScreen").classList.remove("hidden");
  sendWs({ type: "lock-buzzers" });
}

function backToBoard() {
  $("#resultsScreen").classList.add("hidden");
  $("#startScreen").classList.add("hidden");
  $("#gameShell").classList.remove("hidden");
}

function openInstructions() {
  $("#instructionsModal").classList.remove("hidden");
}

function closeOpenModals() {
  document.querySelectorAll(".modal").forEach((modal) => modal.classList.add("hidden"));
  stopTimer();
}

function applyInitialScreenFromUrl() {
  const screen = new URLSearchParams(location.search).get("screen");
  if (screen === "game") startGame();
  if (screen === "editor") {
    startGame();
    openEditor();
  }
  if (screen === "results") openResults();
  if (screen === "instructions") openInstructions();
  if (screen === "qr") {
    startGame();
    openQrModal();
  }
  if (screen === "clue" || screen === "feedback") {
    startGame();
    setTimeout(() => {
      const categoryIndex = Number(new URLSearchParams(location.search).get("category") || 0);
      const clueIndex = Number(new URLSearchParams(location.search).get("clue") || 0);
      openClue(categoryIndex, clueIndex);
      if (screen === "feedback") scoreCurrent(true);
    }, 80);
  }
}

function renderAll() {
  renderGameSurface();
  renderEditorShell();
  sendHostState();
}

function renderGameSurface() {
  $("#gameTitle").textContent = game.title;
  $("#startTitle").textContent = game.title;
  $("#startCategoryCount").textContent = `${game.categories.length} categorias`;
  $("#startTeamCount").textContent = `${game.teams.length} equipos`;
  document.title = game.title;
  renderLogo($("#gameLogoMark"), game.logoImage);
  renderLogo($("#startLogoMark"), game.logoImage);
  renderBoard();
  renderTeams();
  renderBuzzes();
}

function renderLogo(container, imageSource) {
  if (!container) return;
  const safeImageSource = normalizeImageSource(imageSource);
  container.textContent = "";
  container.classList.toggle("has-logo-image", Boolean(safeImageSource));

  if (safeImageSource) {
    const image = document.createElement("img");
    image.src = safeImageSource;
    image.alt = `Logo de ${game.title || "Jeopardy"}`;
    image.loading = "lazy";
    image.decoding = "async";
    container.append(image);
    return;
  }

  container.textContent = "JQ";
}

function renderBoard() {
  const columns = Math.max(1, game.categories.length);
  const rows = Math.max(...game.categories.map((category) => category.clues.length));
  $("#categoryRow").style.setProperty("--columns", columns);
  $("#boardGrid").style.setProperty("--columns", columns);
  $("#boardGrid").style.setProperty("--rows", rows);

  $("#categoryRow").innerHTML = "";
  $("#boardGrid").innerHTML = "";

  game.categories.forEach((category) => {
    const header = document.createElement("div");
    header.className = "category-card";
    header.textContent = category.title;
    $("#categoryRow").append(header);
  });

  for (let row = 0; row < rows; row += 1) {
    game.categories.forEach((category, categoryIndex) => {
      const clueData = category.clues[row];
      const button = document.createElement("button");
      button.className = `clue-card${clueData?.answered ? " answered" : ""}`;
      button.type = "button";
      button.textContent = clueData ? `$${clueData.value}` : "";
      button.disabled = !clueData;
      if (clueData) button.addEventListener("click", () => openClue(categoryIndex, row, button));
      $("#boardGrid").append(button);
    });
  }
}

function renderTeams() {
  const teamList = $("#teamList");
  teamList.innerHTML = "";
  const firstBuzz = buzzes[0] || null;
  if (!game.teams.some((team) => team.id === selectedTeamId)) {
    selectedTeamId = game.teams[0]?.id || "";
  }

  game.teams.forEach((team) => {
    const row = document.createElement("article");
    const hasFirstBuzz = firstBuzz?.teamId === team.id;
    row.className = `team-row${team.id === selectedTeamId ? " selected" : ""}${hasFirstBuzz ? " first-buzz" : ""}`;
    row.dataset.teamId = team.id;
    row.style.setProperty("--team-color", team.color);
    row.innerHTML = `
      <div class="team-main">
        <div class="team-name"></div>
        <div class="team-first-buzz" hidden></div>
        <div class="score-tools">
          <button type="button" data-delta="-100">-</button>
          <button type="button" data-delta="100">+</button>
        </div>
      </div>
      <div class="team-score"></div>
    `;
    row.querySelector(".team-name").textContent = team.name;
    row.querySelector(".team-score").textContent = formatScore(team.score);
    if (hasFirstBuzz) {
      const firstBuzzLabel = row.querySelector(".team-first-buzz");
      firstBuzzLabel.hidden = false;
      firstBuzzLabel.textContent = `Primero: ${firstBuzz.name}`;
    }
    row.addEventListener("click", () => {
      selectedTeamId = team.id;
      renderTeams();
      renderTeamChooser();
    });
    row.querySelectorAll("[data-delta]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        adjustScore(team.id, Number(button.dataset.delta));
      });
    });
    teamList.append(row);
  });

  renderTeamChooser();
}

function renderTeamChooser() {
  const chooser = $("#teamChooser");
  if (!chooser) return;
  chooser.innerHTML = "";
  game.teams.forEach((team) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `team-chip${team.id === selectedTeamId ? " selected" : ""}`;
    button.style.setProperty("--team-color", team.color);
    button.textContent = `${team.name} ${formatScore(team.score)}`;
    button.addEventListener("click", () => {
      selectedTeamId = team.id;
      renderTeams();
      renderTeamChooser();
    });
    chooser.append(button);
  });
}

function renderBuzzes() {
  $("#playerCount").textContent = `${players.length} celulares`;
  $("#buzzList").innerHTML = "";
  if (!buzzes.length) {
    const empty = document.createElement("li");
    empty.textContent = buzzerOpen ? "Buzzers abiertos" : "Buzzers cerrados";
    $("#buzzList").append(empty);
    return;
  }

  buzzes.forEach((buzz) => {
    const li = document.createElement("li");
    const team = game.teams.find((item) => item.id === buzz.teamId);
    li.innerHTML = `<span class="buzz-rank">${buzz.rank}</span><strong></strong><span></span>`;
    li.querySelector("strong").textContent = buzz.name;
    li.querySelector("span:last-child").textContent = team ? team.name : "";
    li.addEventListener("click", () => {
      if (buzz.teamId) selectedTeamId = buzz.teamId;
      renderTeams();
      renderTeamChooser();
    });
    $("#buzzList").append(li);
  });
}

function openClue(categoryIndex, clueIndex, sourceButton) {
  const category = game.categories[categoryIndex];
  const clueData = category.clues[clueIndex];
  currentClue = { categoryIndex, clueIndex, category, clue: clueData };
  stopTimer();
  timerLeft = TIMER_SECONDS;
  updateTimer();
  setTimerButtonLabel("Iniciar 30s");
  playNotes([[220, 0, 0.06], [330, 0.07, 0.08], [440, 0.16, 0.1]]);
  if (sourceButton) {
    sourceButton.classList.add("selecting");
    setTimeout(() => sourceButton.classList.remove("selecting"), 400);
  }

  $("#clueMeta").textContent = `${category.title} - $${clueData.value}`;
  $("#clueTitle").textContent = "Pregunta";
  renderRichContent($("#questionText"), clueData.question, clueData.questionImage, "Pregunta sin texto", "Imagen de la pregunta");
  renderRichContent($("#answerText"), clueData.answer, clueData.answerImage, "Respuesta sin texto", "Imagen de la respuesta");
  renderRichContent($("#hintText"), clueData.hint, clueData.hintImage, "Sin pista", "Imagen de la pista");
  $("#answerText").classList.add("hidden");
  $("#hintText").classList.add("hidden");
  $("#feedbackBox").classList.add("hidden");
  $("#feedbackBox").classList.remove("correct", "wrong");
  $("#markAnsweredBtn").querySelector("span").textContent = "Volver al tablero";
  $("#clueModal").classList.remove("hidden");
  renderTeamChooser();
  clearBuzzers();
}

function showAnswer() {
  $("#answerText").classList.remove("hidden");
  renderMath($("#answerText"));
  showFeedback(null);
}

function showFeedback(isCorrect, value = 0, teamName = "") {
  if (!currentClue) return;
  const box = $("#feedbackBox");
  const title = $("#feedbackTitle");
  const feedback = $("#feedbackText");
  const explanation = $("#explanationText");
  box.classList.remove("hidden", "correct", "wrong");

  if (isCorrect === true) {
    box.classList.add("correct");
    title.textContent = "Correcto";
    feedback.textContent = `${teamName} gana ${formatScore(value)}. Excelente respuesta.`;
  } else if (isCorrect === false) {
    box.classList.add("wrong");
    title.textContent = "No es correcto";
    feedback.textContent = `${teamName} pierde ${formatScore(value)}. Revisemos la respuesta correcta.`;
  } else {
    title.textContent = "Retroalimentacion";
    feedback.textContent = currentClue.clue.explanationImage && !currentClue.clue.explanation
      ? ""
      : "Compara la respuesta del equipo con la solucion antes de asignar puntos.";
  }

  const explanationText = currentClue.clue.explanation
    || (!currentClue.clue.explanationImage ? currentClue.clue.hint || "Repasa el procedimiento y contrasta cada paso con la respuesta mostrada." : "");
  renderRichContent(
    explanation,
    explanationText ? `Explicacion: ${explanationText}` : "",
    currentClue.clue.explanationImage,
    "",
    "Imagen de retroalimentacion"
  );
}

function scoreCurrent(isCorrect) {
  if (!currentClue || !selectedTeamId) return;
  const value = Number(currentClue.clue.value || 0);
  const team = game.teams.find((item) => item.id === selectedTeamId);
  adjustScore(selectedTeamId, isCorrect ? value : -value);
  showAnswer();
  showFeedback(isCorrect, value, team?.name || "Equipo");
  markCurrentAnswered(false);
  sendWs({ type: "lock-buzzers" });
  playNotes(isCorrect ? [[523, 0, 0.08], [659, 0.08, 0.1], [784, 0.2, 0.18]] : [[196, 0, 0.16], [130, 0.18, 0.2]]);
}

function markCurrentAnswered(closeAfter) {
  if (!currentClue) return;
  game.categories[currentClue.categoryIndex].clues[currentClue.clueIndex].answered = true;
  saveAndRender();
  if (closeAfter) closeModal("clue");
}

function closeModal(name) {
  $(`#${name}Modal`)?.classList.add("hidden");
  if (name === "clue") {
    stopTimer();
    sendWs({ type: "lock-buzzers" });
  }
}

function adjustScore(teamId, delta) {
  const team = game.teams.find((item) => item.id === teamId);
  if (!team) return;
  team.score = Number(team.score || 0) + delta;
  saveAndRender();
  pulseTeam(teamId);
}

function pulseTeam(teamId) {
  const row = document.querySelector(`[data-team-id="${CSS.escape(teamId)}"]`);
  if (!row) return;
  row.classList.remove("score-pulse");
  void row.offsetWidth;
  row.classList.add("score-pulse");
}

function formatScore(score) {
  return `$${Number(score || 0).toLocaleString("es-CR")}`;
}

function resetBoard() {
  if (!confirm("Reiniciar las casillas usadas?")) return;
  game.categories.forEach((category) => category.clues.forEach((item) => { item.answered = false; }));
  saveAndRender();
}

function resetScores() {
  if (!confirm("Poner todos los puntajes en 0?")) return;
  game.teams.forEach((team) => { team.score = 0; });
  saveAndRender();
}

function addTeam() {
  const index = game.teams.length + 1;
  const colors = ["#1f88b5", "#2ea66f", "#ef8a62", "#ffe45b", "#9a7bd3"];
  game.teams.push({
    id: `team-${Date.now()}`,
    name: `Equipo ${index}`,
    score: 0,
    color: colors[(index - 1) % colors.length]
  });
  selectedTeamId = game.teams.at(-1).id;
  saveAndRender();
  renderEditorShell();
  sendHostState();
}

function addCategory() {
  game.categories.push({
    title: `Categoria ${game.categories.length + 1}`,
    clues: ensureClues([])
  });
  saveAndRender();
  renderEditorShell(game.categories.length - 1, 0);
}

function toggleTimer() {
  if (timerId) {
    stopTimer();
    return;
  }
  setTimerButtonLabel("Pausar");
  timerId = setInterval(() => {
    timerLeft = Math.max(0, timerLeft - 1);
    updateTimer();
    if (timerLeft > 0 && timerLeft <= 5) {
      playTone(260 + timerLeft * 28, 0.04);
    }
    if (timerLeft === 0) {
      stopTimer();
      playNotes([[130, 0, 0.35], [98, 0.18, 0.28]]);
      sendWs({ type: "lock-buzzers" });
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  setTimerButtonLabel(timerLeft === TIMER_SECONDS ? "Iniciar 30s" : "Continuar");
}

function setTimerButtonLabel(label) {
  const span = $("#timerBtn span");
  if (span) span.textContent = label;
}

function updateTimer() {
  const ratio = timerLeft / TIMER_SECONDS;
  $("#timerText").textContent = timerLeft;
  $("#timerBar").style.width = `${ratio * 100}%`;
  $("#timerBar").style.background = ratio < 0.25 ? "var(--red)" : ratio < 0.5 ? "var(--coral)" : "var(--green)";
}

function connectSocket() {
  clearTimeout(reconnectTimer);
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${location.host}/ws`);

  socket.addEventListener("open", () => {
    setStatus("ok", "Conectado");
    sendWs({ type: "register-host" });
    sendHostState();
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "welcome" || message.type === "sync") {
      $("#roomCode").textContent = message.roomCode || "----";
      buzzerOpen = Boolean(message.buzzerOpen);
      buzzes = message.buzzes || [];
      players = message.players || [];
      const firstTeamId = buzzes[0]?.teamId;
      if (firstTeamId && game.teams.some((team) => team.id === firstTeamId)) selectedTeamId = firstTeamId;
      renderBuzzes();
      renderTeams();
    }
    if (message.type === "players") {
      players = message.players || [];
      renderBuzzes();
    }
    if (message.type === "buzz") {
      const teamId = message.buzz?.teamId;
      if (teamId && game.teams.some((team) => team.id === teamId)) selectedTeamId = teamId;
      if (message.buzz && !buzzes.some((buzz) => buzz.playerId === message.buzz.playerId)) buzzes = [message.buzz, ...buzzes];
      playTone(880, 0.12);
      renderTeams();
      renderBuzzes();
    }
    if (message.type === "buzzes") {
      buzzes = message.buzzes || [];
      buzzerOpen = Boolean(message.buzzerOpen);
      const firstTeamId = buzzes[0]?.teamId;
      if (firstTeamId && game.teams.some((team) => team.id === firstTeamId)) selectedTeamId = firstTeamId;
      renderBuzzes();
      renderTeams();
    }
    if (message.type === "buzzer-status") {
      buzzerOpen = Boolean(message.buzzerOpen);
      renderBuzzes();
    }
  });

  socket.addEventListener("close", () => {
    setStatus("off", "Sin conexion");
    reconnectTimer = setTimeout(connectSocket, 1200);
  });

  socket.addEventListener("error", () => {
    setStatus("off", "Sin conexion");
  });
}

function sendWs(payload) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function clearBuzzers() {
  buzzes = [];
  renderBuzzes();
  renderTeams();
  sendWs({ type: "clear-buzzes" });
}

function sendHostState() {
  sendWs({
    type: "host-state",
    title: game.title,
    teams: game.teams.map(({ id, name, color }) => ({ id, name, color }))
  });
}

function setStatus(kind, text) {
  const status = $("#wsStatus");
  status.className = `status-pill status-${kind}`;
  status.textContent = text;
}

async function loadInfo() {
  try {
    const info = await fetch("/api/info").then((res) => res.json());
    $("#roomCode").textContent = info.roomCode || "----";
    setPublicBuzzerUrl();
  } catch {
    setPublicBuzzerUrl();
  }
}

function setPublicBuzzerUrl() {
  const urlBox = $("#buzzerUrl");
  urlBox.dataset.primaryUrl = PUBLIC_BUZZER_URL;
  urlBox.textContent = PUBLIC_BUZZER_URL;
  $("#buzzerLink").href = PUBLIC_BUZZER_URL;
  $("#buzzerLink").textContent = new URL(PUBLIC_BUZZER_URL).host + "/buzzer";
  $("#qrModalLink").href = PUBLIC_BUZZER_URL;
  $("#qrModalLink").textContent = PUBLIC_BUZZER_URL;
}

function openQrModal() {
  $("#qrModal").classList.remove("hidden");
}

async function copyBuzzerLink() {
  const text = $("#buzzerUrl").dataset.primaryUrl || $("#buzzerUrl").textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
    $("#copyBuzzerLink").classList.add("accent");
    setTimeout(() => $("#copyBuzzerLink").classList.remove("accent"), 900);
  } catch {
    prompt("Enlace de buzzer", text);
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  document.documentElement.requestFullscreen?.();
}

function toggleEditorFullscreen() {
  const modal = $("#editorModal");
  modal.classList.toggle("editor-fullscreen");
  updateEditorFullscreenButton();
}

function updateEditorFullscreenButton() {
  const button = $("#editorFullscreenBtn");
  if (!button) return;
  const expanded = $("#editorModal")?.classList.contains("editor-fullscreen");
  button.title = expanded ? "Restaurar configurador" : "Pantalla completa";
  button.setAttribute("aria-label", button.title);
}

function playTone(frequency, seconds) {
  playNotes([[frequency, 0, seconds]]);
}

function playNotes(notes) {
  if (muted) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  let endAt = 0;
  notes.forEach(([frequency, start = 0, duration = 0.12, type = "square"]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + start;
    const stopAt = startAt + duration;
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.07, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt);
    endAt = Math.max(endAt, start + duration);
  });
  setTimeout(() => context.close?.(), Math.ceil((endAt + 0.25) * 1000));
}

function renderRichContent(element, text, imageSource = "", fallbackText = "", imageAlt = "Imagen") {
  if (!element) return;
  const sourceText = String(text || "").trim() || (!imageSource ? fallbackText : "");
  element.textContent = "";
  element.dataset.mathSource = "";

  if (sourceText) {
    const textNode = document.createElement("div");
    textNode.className = "content-text";
    textNode.dataset.mathText = "true";
    textNode.dataset.mathSource = sourceText;
    textNode.textContent = sourceText;
    element.append(textNode);
  }

  const safeImageSource = normalizeImageSource(imageSource);
  if (safeImageSource) {
    const image = document.createElement("img");
    image.className = "content-image";
    image.src = safeImageSource;
    image.alt = imageAlt;
    image.loading = "lazy";
    image.decoding = "async";
    element.append(image);
  }

  if (sourceText) {
    renderMath(element);
  } else {
    markMathDensity(element, "");
  }
}

function renderMath(element) {
  if (!element) return;
  const richTextNodes = [...element.querySelectorAll("[data-math-text]")];
  if (!richTextNodes.length && element.querySelector(".content-image")) {
    markMathDensity(element, "");
    return;
  }
  const sourceText = richTextNodes.length
    ? richTextNodes.map((node) => node.dataset.mathSource || node.textContent.trim()).join("\n").trim()
    : element.dataset.mathSource || element.textContent.trim();
  markMathDensity(element, sourceText);

  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetClear?.([element]);

    if (richTextNodes.length) {
      richTextNodes.forEach((node) => {
        const nodeSource = node.dataset.mathSource || node.textContent.trim();
        node.dataset.mathSource = nodeSource;
        node.textContent = normalizeInlineMath(nodeSource);
      });
    } else {
      element.dataset.mathSource = sourceText;
      element.textContent = normalizeInlineMath(sourceText);
    }

    window.MathJax.typesetPromise([element])
      .then(() => {
        markMathDensity(element, sourceText);
        applyMathSizing(element);
      })
      .catch(() => {
        if (richTextNodes.length) {
          richTextNodes.forEach((node) => {
            node.textContent = node.dataset.mathSource || node.textContent;
          });
        } else {
          element.textContent = sourceText;
        }
        markMathDensity(element, sourceText);
      });
  }
}

function whenMathJaxReady(callback, attempts = 0) {
  if (window.MathJax?.startup?.promise) {
    window.MathJax.startup.promise.then(callback).catch(() => {});
    return;
  }

  if (attempts < 40) {
    setTimeout(() => whenMathJaxReady(callback, attempts + 1), 125);
  }
}

function refreshRenderedMath() {
  document.querySelectorAll(".math-box").forEach((element) => {
    const textNodes = [...element.querySelectorAll("[data-math-text]")];
    const sourceText = textNodes.length
      ? textNodes.map((node) => node.dataset.mathSource || node.textContent.trim()).join("\n").trim()
      : element.dataset.mathSource || element.textContent.trim();
    if (sourceText) renderMath(element);
  });
}

function normalizeInlineMath(sourceText) {
  let output = "";
  let index = 0;

  while (index < sourceText.length) {
    if (sourceText.startsWith("$$", index)) {
      const end = sourceText.indexOf("$$", index + 2);
      if (end === -1) break;
      output += sourceText.slice(index, end + 2);
      index = end + 2;
      continue;
    }

    if (sourceText[index] === "$") {
      const end = findClosingDollar(sourceText, index + 1);
      if (end !== -1) {
        output += `$${withDisplayStyle(sourceText.slice(index + 1, end))}$`;
        index = end + 1;
        continue;
      }
    }

    if (sourceText.startsWith("\\(", index)) {
      const end = sourceText.indexOf("\\)", index + 2);
      if (end !== -1) {
        output += `\\(${withDisplayStyle(sourceText.slice(index + 2, end))}\\)`;
        index = end + 2;
        continue;
      }
    }

    output += sourceText[index];
    index += 1;
  }

  return output + sourceText.slice(index);
}

function findClosingDollar(sourceText, startIndex) {
  for (let index = startIndex; index < sourceText.length; index += 1) {
    if (sourceText[index] === "$" && sourceText[index - 1] !== "\\") return index;
  }
  return -1;
}

function withDisplayStyle(tex) {
  const leading = tex.match(/^\s*/)?.[0] || "";
  const trailing = tex.match(/\s*$/)?.[0] || "";
  const body = tex.trim().replace(/\\t?frac\b/g, "\\dfrac");
  if (!body) return tex;
  if (/^\\displaystyle\b/.test(body)) return `${leading}${body}${trailing}`;
  return `${leading}\\displaystyle ${body}${trailing}`;
}

function applyMathSizing(element) {
  const styles = getComputedStyle(element);
  const inlineSize = styles.getPropertyValue("--math-inline-size").trim() || "1.15em";
  const displaySize = styles.getPropertyValue("--math-display-size").trim() || inlineSize;
  const onlySize = styles.getPropertyValue("--math-only-size").trim() || displaySize;

  element.querySelectorAll("mjx-container").forEach((mathNode) => {
    const isDisplay = mathNode.getAttribute("display") === "true";
    const size = element.classList.contains("math-only")
      ? onlySize
      : isDisplay
        ? displaySize
        : inlineSize;

    mathNode.style.setProperty("font-size", size, "important");
    mathNode.style.setProperty("line-height", "1.25", "important");
    mathNode.style.setProperty("vertical-align", isDisplay ? "0" : "middle", "important");

    mathNode.querySelectorAll("mjx-mfrac").forEach((fraction) => {
      fraction.style.setProperty("font-size", "1em", "important");
    });
  });
}

function markMathDensity(element, sourceText) {
  const text = (sourceText || element.dataset.mathSource || element.textContent).trim();
  const mathOnly = /^(\${1,2}[\s\S]+\${1,2}|\\\[[\s\S]+\\\]|\\\([\s\S]+\\\))\.?$/.test(text);
  element.classList.toggle("math-only", mathOnly && !element.querySelector(".content-image"));
}

function openEditor() {
  renderEditorShell();
  exportJson();
  updateEditorFullscreenButton();
  $("#editorModal").classList.remove("hidden");
}

function renderEditorShell(categoryIndex = Number($("#categorySelect")?.value || 0), clueIndex = Number($("#clueSelect")?.value || 0)) {
  const titleInput = $("#editTitle");
  if (!titleInput) return;
  titleInput.value = game.title;
  $("#editLogoImage").value = game.logoImage || "";
  $("#editLogoImageFile").value = "";
  renderLogoPreview();
  renderTeamEditor();
  renderCategoryEditor();
  renderEditorSelects(categoryIndex, clueIndex);
  renderClueEditor();
}

function renderTeamEditor() {
  const box = $("#teamEditor");
  box.innerHTML = "";
  game.teams.forEach((team, index) => {
    const row = document.createElement("div");
    row.className = "stack-row team-stack-row";
    row.innerHTML = `
      <input type="color" value="${team.color}" aria-label="Color">
      <input type="text" value="" maxlength="40" aria-label="Nombre del equipo">
      <button class="mini-button" type="button" title="Eliminar"><svg><use href="#i-trash"></use></svg></button>
    `;
    const color = row.querySelector("input[type='color']");
    const name = row.querySelector("input[type='text']");
    name.value = team.name;
    color.addEventListener("input", () => {
      team.color = color.value;
      saveAndRender();
      sendHostState();
    });
    name.addEventListener("input", () => {
      team.name = name.value || `Equipo ${index + 1}`;
      saveAndRender();
      sendHostState();
    });
    row.querySelector("button").addEventListener("click", () => {
      if (game.teams.length <= 1) return;
      game.teams.splice(index, 1);
      saveAndRender();
      renderEditorShell();
    });
    box.append(row);
  });
}

function renderCategoryEditor() {
  const box = $("#categoryEditor");
  box.innerHTML = "";
  game.categories.forEach((category, index) => {
    const row = document.createElement("div");
    row.className = "stack-row category-stack-row";
    row.innerHTML = `
      <input type="text" value="" maxlength="40" aria-label="Categoria">
      <button class="mini-button" type="button" title="Eliminar"><svg><use href="#i-trash"></use></svg></button>
    `;
    const input = row.querySelector("input");
    input.value = category.title;
    input.addEventListener("input", () => {
      category.title = input.value || `Categoria ${index + 1}`;
      saveAndRender();
      renderEditorSelects(index, Number($("#clueSelect").value || 0));
    });
    row.querySelector("button").addEventListener("click", () => {
      if (game.categories.length <= 1) return;
      game.categories.splice(index, 1);
      saveAndRender();
      renderEditorShell(Math.max(0, index - 1), 0);
    });
    box.append(row);
  });
}

function renderEditorSelects(categoryIndex = 0, clueIndex = 0) {
  const categorySelect = $("#categorySelect");
  const clueSelect = $("#clueSelect");
  categorySelect.innerHTML = "";
  game.categories.forEach((category, index) => {
    categorySelect.add(new Option(category.title, String(index)));
  });
  categorySelect.value = String(Math.min(categoryIndex, game.categories.length - 1));
  clueSelect.innerHTML = "";
  game.categories[Number(categorySelect.value)].clues.forEach((item, index) => {
    clueSelect.add(new Option(`$${item.value}`, String(index)));
  });
  clueSelect.value = String(Math.min(clueIndex, clueSelect.options.length - 1));
}

function bindImageEditorControls(kind) {
  const urlInput = $(`#edit${kind}Image`);
  const fileInput = $(`#edit${kind}ImageFile`);
  const clearButton = $(`#clear${kind}Image`);
  if (!urlInput || !fileInput || !clearButton) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("El archivo seleccionado no es una imagen.");
      fileInput.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("La imagen es muy grande. Usa una imagen menor a 1.2 MB o pega una URL.");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      urlInput.value = reader.result;
      updateCurrentClueFromEditor();
    });
    reader.readAsDataURL(file);
  });

  clearButton.addEventListener("click", () => {
    urlInput.value = "";
    fileInput.value = "";
    updateCurrentClueFromEditor();
  });
}

function bindLogoEditorControls() {
  const urlInput = $("#editLogoImage");
  const fileInput = $("#editLogoImageFile");
  const clearButton = $("#clearLogoImage");
  if (!urlInput || !fileInput || !clearButton) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("El archivo seleccionado no es una imagen.");
      fileInput.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("La imagen es muy grande. Usa una imagen menor a 1.2 MB o pega una URL.");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      urlInput.value = reader.result;
      updateLogoFromEditor();
    });
    reader.readAsDataURL(file);
  });

  clearButton.addEventListener("click", () => {
    urlInput.value = "";
    fileInput.value = "";
    updateLogoFromEditor();
  });
}

function updateLogoFromEditor() {
  game.logoImage = normalizeImageSource($("#editLogoImage").value);
  saveAndRender();
  renderLogoPreview();
}

function renderLogoPreview() {
  renderLogo($("#logoPreview"), game.logoImage);
}

function renderClueEditor() {
  const category = game.categories[Number($("#categorySelect").value || 0)];
  const clueData = category.clues[Number($("#clueSelect").value || 0)];
  $("#editValue").value = clueData.value;
  $("#editQuestion").value = clueData.question;
  $("#editQuestionImage").value = clueData.questionImage || "";
  $("#editQuestionImageFile").value = "";
  $("#editAnswer").value = clueData.answer;
  $("#editAnswerImage").value = clueData.answerImage || "";
  $("#editAnswerImageFile").value = "";
  $("#editHint").value = clueData.hint || "";
  $("#editHintImage").value = clueData.hintImage || "";
  $("#editHintImageFile").value = "";
  $("#editExplanation").value = clueData.explanation || "";
  $("#editExplanationImage").value = clueData.explanationImage || "";
  $("#editExplanationImageFile").value = "";
  renderPreview();
}

function updateCurrentClueFromEditor() {
  const categoryIndex = Number($("#categorySelect").value || 0);
  const clueIndex = Number($("#clueSelect").value || 0);
  const clueData = game.categories[categoryIndex].clues[clueIndex];
  clueData.value = Number($("#editValue").value || 0);
  clueData.question = $("#editQuestion").value;
  clueData.questionImage = normalizeImageSource($("#editQuestionImage").value);
  clueData.answer = $("#editAnswer").value;
  clueData.answerImage = normalizeImageSource($("#editAnswerImage").value);
  clueData.hint = $("#editHint").value;
  clueData.hintImage = normalizeImageSource($("#editHintImage").value);
  clueData.explanation = $("#editExplanation").value;
  clueData.explanationImage = normalizeImageSource($("#editExplanationImage").value);
  saveAndRender();
  renderEditorSelects(categoryIndex, clueIndex);
  $("#categorySelect").value = String(categoryIndex);
  $("#clueSelect").value = String(clueIndex);
  renderPreview();
}

function renderPreview() {
  const preview = $("#texPreview");
  preview.textContent = "";
  [
    ["Pregunta", $("#editQuestion").value, $("#editQuestionImage").value],
    ["Pista", $("#editHint").value, $("#editHintImage").value],
    ["Respuesta", $("#editAnswer").value, $("#editAnswerImage").value],
    ["Retroalimentacion", $("#editExplanation").value, $("#editExplanationImage").value]
  ].forEach(([label, text, imageSource]) => {
    const section = document.createElement("section");
    section.className = "preview-section";
    const heading = document.createElement("strong");
    heading.className = "preview-label";
    heading.textContent = label;
    section.append(heading);

    if (text.trim()) {
      const textNode = document.createElement("div");
      textNode.className = "content-text";
      textNode.dataset.mathText = "true";
      textNode.dataset.mathSource = text.trim();
      textNode.textContent = text.trim();
      section.append(textNode);
    }

    const safeImageSource = normalizeImageSource(imageSource);
    if (safeImageSource) {
      const image = document.createElement("img");
      image.className = "content-image";
      image.src = safeImageSource;
      image.alt = `Imagen de ${label.toLowerCase()}`;
      image.loading = "lazy";
      section.append(image);
    }

    preview.append(section);
  });
  renderMath(preview);
}

function exportJson() {
  $("#jsonBox").value = JSON.stringify(game, null, 2);
}

function importJson() {
  try {
    game = normalizeGame(JSON.parse($("#jsonBox").value));
    saveAndRender();
    renderEditorShell();
  } catch (error) {
    alert(`JSON invalido: ${error.message}`);
  }
}

function downloadJson() {
  exportJson();
  const blob = new Blob([$("#jsonBox").value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "jeopardy-matematico.json";
  link.click();
  URL.revokeObjectURL(url);
}

function resetTemplate() {
  if (!confirm("Restaurar la plantilla inicial?")) return;
  game = clone(defaultGame);
  saveAndRender();
  renderEditorShell();
}

function openResults() {
  closeOpenModals();
  sendWs({ type: "lock-buzzers" });
  const sortedTeams = [...game.teams].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const topScore = Number(sortedTeams[0]?.score || 0);
  const winners = sortedTeams.filter((team) => Number(team.score || 0) === topScore);

  $("#winnerTitle").textContent = winners.length > 1
    ? "Empate en la cima"
    : `${winners[0]?.name || "Sin equipos"} gana`;
  $("#winnerSubtitle").textContent = winners.length > 1
    ? `${winners.map((team) => team.name).join(" y ")} terminan con ${formatScore(topScore)}`
    : `Reconocimiento academico con ${formatScore(topScore)}`;

  const podium = $("#podium");
  podium.innerHTML = "";
  sortedTeams.slice(0, 3).forEach((team, index) => {
    const card = document.createElement("article");
    card.className = "podium-card";
    card.style.setProperty("--team-color", team.color);
    card.innerHTML = `
      <div class="place">${index + 1}</div>
      <strong></strong>
      <span></span>
    `;
    card.querySelector("strong").textContent = team.name;
    card.querySelector("span").textContent = formatScore(team.score);
    podium.append(card);
  });

  renderConfetti();
  $("#startScreen").classList.add("hidden");
  $("#gameShell").classList.add("hidden");
  $("#resultsScreen").classList.remove("hidden");
  playNotes([[392, 0, 0.1], [494, 0.1, 0.1], [587, 0.2, 0.12], [784, 0.34, 0.28]]);
}

function renderConfetti() {
  const layer = $("#confettiLayer");
  layer.innerHTML = "";
  const colors = ["#ffe45b", "#2ea66f", "#ef8a62", "#33a5bd", "#ffffff"];
  for (let index = 0; index < 46; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--y", `${Math.random() * 80}%`);
    piece.style.setProperty("--rotation", `${Math.random() * 180}deg`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.animationDelay = `${Math.random() * -2.3}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
    layer.append(piece);
  }
}

function openFinal() {
  $("#finalCategory").textContent = game.final.category;
  renderRichContent($("#finalQuestion"), game.final.question, game.final.questionImage, "Pregunta final sin texto", "Imagen de la pregunta final");
  renderRichContent($("#finalAnswer"), game.final.answer, game.final.answerImage, "Respuesta final sin texto", "Imagen de la respuesta final");
  $("#finalAnswer").classList.add("hidden");
  renderFinalWagers();
  $("#finalModal").classList.remove("hidden");
  playNotes([[262, 0, 0.12], [392, 0.14, 0.12]]);
}

function renderFinalWagers() {
  const box = $("#finalWagers");
  box.innerHTML = "";
  game.teams.forEach((team) => {
    const row = document.createElement("div");
    row.className = "wager-row";
    row.style.setProperty("--team-color", team.color);
    row.innerHTML = `
      <strong></strong>
      <input type="number" min="0" step="50" value="0" data-team="${team.id}">
      <span></span>
    `;
    row.querySelector("strong").textContent = team.name;
    row.querySelector("span").textContent = formatScore(team.score);
    box.append(row);
  });
}

function applyFinal(isCorrect) {
  $("#finalWagers").querySelectorAll("input").forEach((input) => {
    const amount = Number(input.value || 0);
    adjustScore(input.dataset.team, isCorrect ? amount : -amount);
  });
  playNotes(isCorrect ? [[523, 0, 0.1], [659, 0.1, 0.1], [880, 0.22, 0.2]] : [[174, 0, 0.18], [130, 0.18, 0.2]]);
  closeModal("final");
}
