// utils/qiCalculator.js

let collectiveQI = 100;

/**
 * Reinicia o QI coletivo
 */
export function resetQI() {
  collectiveQI = 100;
}

/**
 * Atualiza o QI coletivo com base no resultado da pergunta
 * @param {boolean} correct - se a pergunta foi acertada
 * @param {number} questionNumber - número da pergunta atual (1-based)
 * @param {number} totalQuestions - total de perguntas do quiz
 */
export function updateQI(correct, questionNumber, totalQuestions) {
  const isFinalStage = questionNumber > totalQuestions - 10;

  if (correct) {
    collectiveQI += isFinalStage ? 3 : 2;
  } else {
    collectiveQI -= isFinalStage ? 2 : 3;
  }

  // Evita valores absurdos
  if (collectiveQI < 60) collectiveQI = 60;
  if (collectiveQI > 160) collectiveQI = 160;
}

/**
 * Retorna o QI atual
 */
export function getQI() {
  return collectiveQI;
}

/**
 * Classificação humorística final
 */
export function getQIClassification() {
  if (collectiveQI >= 130) {
    return "Canal iluminado 🧠✨";
  }
  if (collectiveQI >= 110) {
    return "Funcional e perigoso";
  }
  if (collectiveQI >= 90) {
    return "Sobrevive, mas com supervisão";
  }
  return "Melhor não pilotar avião ✈️";
}
