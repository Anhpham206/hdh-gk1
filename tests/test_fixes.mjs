import fs from 'fs';
import { parseMarkdownQuestions, decodeHtmlEntities } from '../scripts/extract.mjs';

function runFixTests() {
  console.log('--- Testing Code Review Findings ---');

  // Test 1: Hex Entity Decoding
  const entityTest = decodeHtmlEntities('Hello&#x2014;World&#x27;s');
  if (entityTest !== "Hello—World's") {
    throw new Error(`Hex decoding failed: expected "Hello—World's", got "${entityTest}"`);
  }
  console.log('Test 1 Passed: Hex entity decoding');

  // Test 2: Parse Markdown with "**Câu hỏi <N>**" and options beyond D (E, F)
  const mdQuestions = parseMarkdownQuestions('questions.md');
  console.log(`Markdown parsed questions count: ${mdQuestions.length}`);
  if (mdQuestions.length < 80) {
    throw new Error(`Expected at least 80 questions from questions.md, got ${mdQuestions.length}`);
  }

  // Verify "Câu hỏi 17" exists
  const q17 = mdQuestions.find(q => q.question.includes('Câu hỏi 17') || q.id.includes('q17'));
  if (!q17) {
    throw new Error('Did not find Câu hỏi 17 in parsed markdown questions');
  }

  // Test 3: Explanation check on dataset (no question has corrupted multiquestion explanation)
  const jsonQuestions = JSON.parse(fs.readFileSync('data/questions.json', 'utf-8'));
  for (const q of jsonQuestions) {
    if (q.explanation && (q.explanation.length > 300 || q.explanation.includes('**Câu'))) {
      throw new Error(`Question ${q.id} has corrupted explanation: ${q.explanation.slice(0, 80)}...`);
    }
  }

  console.log('✅ All Fix Verification Tests Passed!');
}

runFixTests();

