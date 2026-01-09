// utils/quizEngine.js

let questions = [];
let currentIndex = 0;
let totalQuestions = 0;

/**
 * Carrega o JSON de perguntas
 */
export async function loadQuestions() {
  const response = await fetch("./data/questions.json");
  if (!response.ok) {
    throw new Error("Erro ao carregar questions.json");
  }

  const data = await response.json();
  questions = shuffleArray(data);
  totalQuestions = questions.length;
  currentIndex = 0;
}

/**
 * Retorna a pergunta atual
 */
export function getCurrentQuestion() {
  if (currentIndex >= totalQuestions) return null;
  return questions[currentIndex];
}

/**
 * Avança para a próxima pergunta
 */
export function nextQuestion() {
  currentIndex++;
  if (currentIndex >= totalQuestions) {
    return null;
  }
  return getCurrentQuestion();
}

/**
 * Verifica se a resposta está correta
 */
export function checkAnswer(selectedOption) {
  const question = getCurrentQuestion();
  if (!question) return false;

  const selectedText = question.options[selectedOption];
  return selectedText === question.answer;
}

/**
 * Retorna progresso (ex: 5 / 50)
 */
export function getProgress() {
  return {
    current: currentIndex + 1,
    total: totalQuestions,
  };
}

/**
 * Embaralha array (Fisher-Yates)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
