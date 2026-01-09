// ===== ELEMENTOS =====
const screens = {
  start: document.getElementById('start-screen'),
  quiz: document.getElementById('quiz-screen'),
  end: document.getElementById('end-screen')
};

// Tela Inicial
const playerInput = document.getElementById('player-name-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const playerList = document.getElementById('player-list');
const noPlayersMsg = document.getElementById('no-players-msg');
const startGameBtn = document.getElementById('start-game-btn');

// Tela Quiz
const questionCounter = document.getElementById('question-counter');
const qiValue = document.getElementById('qi-value');
const flagDisplay = document.getElementById('flag-display');
const questionText = document.getElementById('question-text');
const optionButtons = document.querySelectorAll('.option-btn');
const timerProgress = document.getElementById('timer-progress');
const timerDisplay = document.getElementById('timer');
const playersScoreList = document.getElementById('players-score-list');

// Tela Final
const finalQiValue = document.getElementById('final-qi-value');
const qiClassification = document.getElementById('qi-classification');
const finalRanking = document.getElementById('final-ranking');
const restartBtn = document.getElementById('restart-btn');
const newGameBtn = document.getElementById('new-game-btn');

// ===== ESTADO DO JOGO =====
let players = []; // { id, name, score }
let currentQuestionIndex = 0;
let timer = null;
let timeLeft = 10;
let totalQI = 100;
let questions = [];
let correctAnswers = 0;
let quizData = []; // ← VARIÁVEL PARA ARMAZENAR PERGUNTAS DO JSON

// ===== CARREGAR PERGUNTAS DO JSON =====
async function loadQuizData() {
  try {
    console.log("📂 Tentando carregar questions.json...");
    const response = await fetch('questions.json');
    
    console.log("Status da resposta:", response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Dados recebidos:", data);
    
    quizData = data;
    console.log(`✅ ${quizData.length} perguntas carregadas do JSON`);
    
  } catch (error) {
    console.error('❌ Erro detalhado ao carregar perguntas:', error);
    console.error('Mensagem:', error.message);
    
    // Fallback reduzido para TESTE
    quizData = [
      {
        id: 1,
        countryCode: "br",
        options: ["Argentina", "Brasil", "Uruguai", "Paraguai"],
        answer: "Brasil",
        difficulty: "easy"
      }
    ];
    console.log('⚠️ Usando APENAS 1 pergunta de fallback para teste');
  }
}

// Carregar perguntas quando a página carrega
loadQuizData();

// ===== FUNÇÕES DE TELA =====
function showScreen(screenName) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove('active');
  });
  screens[screenName].classList.add('active');
}

// ===== GERENCIAMENTO DE JOGADORES =====
function addPlayer(name) {
  const player = {
    id: Date.now(),
    name: name.trim(),
    score: 0
  };
  
  players.push(player);
  updatePlayersList();
  playerInput.value = '';
  playerInput.focus();
  
  // Atualizar botão de iniciar
  startGameBtn.disabled = players.length === 0;
}

function removePlayer(id) {
  players = players.filter(player => player.id !== id);
  updatePlayersList();
  startGameBtn.disabled = players.length === 0;
}

function updatePlayersList() {
  playerList.innerHTML = '';
  
  if (players.length === 0) {
    noPlayersMsg.style.display = 'block';
    return;
  }
  
  noPlayersMsg.style.display = 'none';
  
  players.forEach(player => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${player.name}</span>
      <button class="remove-player" onclick="removePlayer(${player.id})">×</button>
    `;
    playerList.appendChild(li);
  });
}

function updateScoreboard() {
  playersScoreList.innerHTML = '';
  
  players.sort((a, b) => b.score - a.score).forEach((player, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${index + 1}. ${player.name}</span>
      <span class="score-badge">${player.score}</span>
    `;
    playersScoreList.appendChild(li);
  });
}

// ===== CONTROLE DO QUIZ =====
function startGame() {
  // Verificar se tem perguntas carregadas
  if (quizData.length === 0) {
    alert('⚠️ As perguntas ainda estão carregando. Tente novamente em alguns segundos.');
    return;
  }
  
  // Verificar se tem jogadores
  if (players.length === 0) {
    alert('⚠️ Adicione pelo menos um jogador!');
    return;
  }
  
  // Resetar estado do jogo
  currentQuestionIndex = 0;
  totalQI = 100;
  correctAnswers = 0;
  players.forEach(player => player.score = 0);
  
  // Embaralhar questões (pega apenas 10 perguntas)
  questions = [...quizData]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10); // Limita a 10 perguntas por jogo
  
  // Pré-carregar bandeiras
  preloadFlags();
  
  // Atualizar UI e mostrar tela do quiz
  updateQI();
  showScreen('quiz');
  loadQuestion();
}

function preloadFlags() {
  questions.forEach(question => {
    const img = new Image();
    // Caminho relativo local
    img.src = `./assets/flags/${question.countryCode}.png`;
  });
  console.log(`🚩 ${questions.length} bandeiras pré-carregadas localmente!`);
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endGame();
    return;
  }
  
  const question = questions[currentQuestionIndex];
  
  // DEBUG: Verificar dados da questão
  console.log('Carregando questão:', {
    index: currentQuestionIndex,
    countryCode: question.countryCode,
    answer: question.answer,
    options: question.options
  });
  
  // Atualizar contador
  questionCounter.textContent = `Pergunta ${currentQuestionIndex + 1}/${questions.length}`;
  
  // Atualizar BANDEIRA
//
// Ajuste o caminho conforme onde seu index.html está em relação à pasta assets
const flagUrl = `./assets/flags/${question.countryCode}.png`;

console.log('Caminho da bandeira:', flagUrl);
  flagDisplay.src = flagUrl;
  flagDisplay.alt = `Bandeira de ${question.answer}`;
  
  // Atualizar pergunta
  questionText.textContent = "Qual é o país desta bandeira?";
  
  // Atualizar opções
  optionButtons.forEach((btn, index) => {
    btn.textContent = question.options[index];
    btn.className = 'option-btn';
    btn.disabled = false;
  });
  
  // Iniciar timer
  startTimer();
  updateScoreboard();
}

function startTimer() {
  timeLeft = 10;
  timerProgress.style.width = '100%';
  timerDisplay.textContent = `⏱️ ${timeLeft}s`;
  
  if (timer) clearInterval(timer);
  
  timer = setInterval(() => {
    timeLeft--;
    timerProgress.style.width = `${(timeLeft / 10) * 100}%`;
    timerDisplay.textContent = `⏱️ ${timeLeft}s`;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      handleTimeOut();
    }
  }, 1000);
}

function handleAnswer(selectedIndex) {
  clearInterval(timer);
  
  const question = questions[currentQuestionIndex];
  const selectedAnswer = question.options[selectedIndex]; // Pega o TEXTO da opção
  const isCorrect = selectedAnswer === question.answer;   // Compara TEXTOS
  
  console.log('Resposta:', {
    selectedIndex,
    selectedAnswer,
    correctAnswer: question.answer,
    isCorrect
  });
  
  // Marcar opções corretas/incorretas
  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    const btnAnswer = question.options[index];
    
    if (btnAnswer === question.answer) {
      // Esta é a resposta correta
      btn.classList.add('correct');
    } else if (index === selectedIndex && !isCorrect) {
      // Esta foi a resposta errada escolhida
      btn.classList.add('wrong');
    }
  });
  
  // Atualizar pontuação e QI
  if (isCorrect) {
    correctAnswers++;
    
    // Dar ponto para todos os jogadores (versão coletiva)
    players.forEach(player => {
      player.score++;
    });
    
    // Aumentar QI
    totalQI += 5;
  } else {
    // Diminuir QI por erro
    totalQI -= 10;
  }
  
  updateQI();
  updateScoreboard();
  
  // Próxima pergunta após delay
  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 2000);
}

function handleTimeOut() {
  const question = questions[currentQuestionIndex];
  
  // Mostrar resposta correta quando o tempo acaba
  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (question.options[index] === question.answer) {
      btn.classList.add('correct');
    }
  });
  
  // Diminuir QI por timeout
  totalQI -= 5;
  updateQI();
  
  // Próxima pergunta após delay
  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 2000);
}

function updateQI() {
  // Garantir que QI não fique negativo
  totalQI = Math.max(0, totalQI);
  
  // Atualizar exibição do QI
  qiValue.textContent = `QI: ${totalQI}`;
  
  // Classificação do QI
  const classifications = [
    { min: 130, text: "Gênio Coletivo! 🧠" },
    { min: 115, text: "Muito Inteligente! 🎓" },
    { min: 100, text: "Inteligência Média 📚" },
    { min: 85, text: "Na média 🤔" },
    { min: 70, text: "Precisa estudar mais 📖" },
    { min: 0, text: "Tem certeza? 🤨" }
  ];
  
  const classification = classifications.find(c => totalQI >= c.min)?.text || "Indefinido";
  qiClassification.textContent = classification;
}

// ===== TELA FINAL =====
function endGame() {
  showScreen('end');
  
  // Exibir QI final
  finalQiValue.textContent = totalQI;
  
  // Classificação final
  const finalClassifications = [
    { min: 120, text: "👑 Gênios Coletivos! Incrível!" },
    { min: 100, text: "🎯 Grupo Inteligente! Parabéns!" },
    { min: 80, text: "👍 Bom trabalho! Podem melhorar." },
    { min: 60, text: "📚 Precisa estudar geografia!" },
    { min: 0, text: "🌍 Tempo de abrir um atlas!" }
  ];
  
  const finalClass = finalClassifications.find(c => totalQI >= c.min)?.text || "Resultado";
  qiClassification.textContent = finalClass;
  
  // Exibir ranking final
  finalRanking.innerHTML = '';
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  sortedPlayers.forEach((player, index) => {
    const li = document.createElement('li');
    li.style.setProperty('--order', index);
    li.innerHTML = `
      <div class="player-info">
        <span class="player-name">${player.name}</span>
        <span class="player-score">${player.score} pontos</span>
      </div>
    `;
    finalRanking.appendChild(li);
  });
}

// ===== EVENT LISTENERS =====
// Adicionar jogador
addPlayerBtn.addEventListener('click', () => {
  const name = playerInput.value.trim();
  if (name) {
    addPlayer(name);
  }
});

playerInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const name = playerInput.value.trim();
    if (name) {
      addPlayer(name);
    }
  }
});

// Iniciar jogo
startGameBtn.addEventListener('click', startGame);

// Opções do quiz
optionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedIndex = parseInt(btn.dataset.option);
    handleAnswer(selectedIndex);
  });
});

// Botões da tela final
restartBtn.addEventListener('click', () => {
  startGame();
});

newGameBtn.addEventListener('click', () => {
  players = [];
  updatePlayersList();
  showScreen('start');
});

// ===== INICIALIZAÇÃO =====
updatePlayersList();

// Teste rápido: abra o console do navegador e digite:
// 1. console.log(quizData) - deve mostrar o array de perguntas
// 2. console.log(players) - deve mostrar array de jogadores