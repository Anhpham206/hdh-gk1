import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('--- Running Extractor Tests ---');

  const jsonPath = path.resolve('data/questions.json');
  const jsPath = path.resolve('data/questions.js');

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File missing: ${jsonPath}`);
  }
  if (!fs.existsSync(jsPath)) {
    throw new Error(`File missing: ${jsPath}`);
  }

  const rawJson = fs.readFileSync(jsonPath, 'utf-8');
  const questions = JSON.parse(rawJson);

  if (!Array.isArray(questions)) {
    throw new Error('questions.json is not an array');
  }

  console.log(`Found ${questions.length} total deduplicated questions.`);

  if (questions.length < 50) {
    throw new Error(`Expected at least 50 questions, found only ${questions.length}`);
  }

  const seenQuestions = new Set();
  const normalize = (q) => q.toLowerCase().replace(/[\s\p{P}]/gu, '');

  questions.forEach((q, idx) => {
    if (!q.id) throw new Error(`Question at index ${idx} missing id`);
    if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
      throw new Error(`Question at index ${idx} has invalid question text`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(`Question [${q.id}] has invalid options: ${JSON.stringify(q.options)}`);
    }
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      throw new Error(`Question [${q.id}] has invalid correctIndex: ${q.correctIndex} (options length: ${q.options.length})`);
    }
    if (!q.correctAnswer) {
      throw new Error(`Question [${q.id}] missing correctAnswer`);
    }

    const norm = normalize(q.question);
    if (seenQuestions.has(norm)) {
      throw new Error(`Duplicate question found in dataset: "${q.question}"`);
    }
    seenQuestions.add(norm);
  });

  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  if (!jsContent.includes('window.QUIZ_DATA =')) {
    throw new Error('questions.js does not assign window.QUIZ_DATA');
  }

  console.log('✅ All Extractor Tests Passed!');
}

runTests();

