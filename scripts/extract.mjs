import fs from 'fs';
import path from 'path';

export function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

export function cleanText(html) {
  if (!html) return '';
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  text = decodeHtmlEntities(text);
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

export function normalizeKey(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, '')
    .trim();
}

export function parseMoodleHtml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const questions = [];

  // Split by question containers
  const questionRegex = /<div id="question-([^"]+)" class="que multichoice\s+([^"]+)">([\s\S]*?)(?=(?:<div id="question-|\s*<\/form>|\s*<div class="submitbtns">|$))/g;
  let match;

  while ((match = questionRegex.exec(content)) !== null) {
    const qId = match[1];
    const qClasses = match[2];
    const qBody = match[3];

    // Extract Question Text
    const qtextMatch = qBody.match(/<div class="qtext"[^>]*>([\s\S]*?)<\/div>\s*<fieldset/);
    if (!qtextMatch) continue;
    const rawQText = qtextMatch[1];
    const questionText = cleanText(rawQText);

    // Extract Right Answer from feedback
    let rightAnswerText = '';
    const rightAnswerMatch = qBody.match(/<div class="rightanswer">([\s\S]*?)<\/div>/);
    if (rightAnswerMatch) {
      rightAnswerText = cleanText(rightAnswerMatch[1])
        .replace(/^(The correct answer is:|Câu trả lời đúng là:)\s*/i, '')
        .trim();
    }

    // Extract Options
    const options = [];
    let correctIndex = -1;

    const answerBlockMatch = qBody.match(/<div class="answer">([\s\S]*?)<\/fieldset>/);
    if (answerBlockMatch) {
      const answerHtml = answerBlockMatch[1];
      // Options are divided by <div class="r0 ..."> or <div class="r1 ...">
      const optionItemRegex = /<div class="r[01]([^"]*)">([\s\S]*?)(?=(?:<div class="r[01]|$))/g;
      let optMatch;
      let optIdx = 0;

      while ((optMatch = optionItemRegex.exec(answerHtml)) !== null) {
        const optClasses = optMatch[1];
        const optBody = optMatch[2];

        // Clean option text by removing radio input, answer number span, and fontawesome icons
        const cleanedOptHtml = optBody
          .replace(/<input[^>]*>/gi, '')
          .replace(/<span class="answernumber">[\s\S]*?<\/span>/gi, '')
          .replace(/<i class="[^"]*fa-circle-check[^"]*"><\/i>/gi, '')
          .replace(/<span class="ms-1">[\s\S]*?<\/span>/gi, '');

        const optText = cleanText(cleanedOptHtml);
        options.push(optText);

        // Check if correct
        const isClassCorrect = optClasses.includes('correct');
        const hasCheckIcon = optBody.includes('fa-circle-check');
        const textMatchesRightAnswer = rightAnswerText && (
          normalizeKey(optText) === normalizeKey(rightAnswerText) ||
          optText.toLowerCase().trim() === rightAnswerText.toLowerCase().trim()
        );

        if (textMatchesRightAnswer || (isClassCorrect && hasCheckIcon)) {
          correctIndex = optIdx;
        }

        optIdx++;
      }
    }

    // Fallback if correctIndex wasn't found by classes but rightAnswerText exists
    if (correctIndex === -1 && rightAnswerText && options.length > 0) {
      const normRight = normalizeKey(rightAnswerText);
      const foundIdx = options.findIndex(opt => normalizeKey(opt) === normRight);
      if (foundIdx !== -1) {
        correctIndex = foundIdx;
      }
    }

    // Extract explanation if any (excluding rightanswer)
    let explanation = null;
    const feedbackMatch = qBody.match(/<div class="feedback">([\s\S]*?)<\/div><\/div><\/div>/);
    if (feedbackMatch) {
      const fbRaw = feedbackMatch[1].replace(/<div class="rightanswer">[\s\S]*?<\/div>/gi, '');
      const fbClean = cleanText(fbRaw)
        .replace(/^(The correct answer is:|Câu trả lời đúng là:).*$/gim, '')
        .trim();
      if (fbClean && fbClean.length > 0 && !fbClean.includes('**Câu')) {
        explanation = fbClean;
      }
    }

    if (questionText && options.length >= 2 && correctIndex >= 0) {
      questions.push({
        id: `moodle-${qId}`,
        source: filename,
        question: questionText,
        options,
        correctIndex,
        correctAnswer: options[correctIndex],
        explanation
      });
    }
  }

  return questions;
}

export function parseMarkdownQuestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const questions = [];

  const lines = content.split('\n');
  let currentQuestion = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect question header e.g., **Câu 19 (Trang 1):** or **Câu hỏi 17 (Trang 8):**
    const qHeaderMatch = line.match(/^\*\*Câu(?:\s+hỏi)?\s+(\d+)(?:\s*\([^)]*\))?\:\*\*\s*(.*)$/i);
    if (qHeaderMatch) {
      if (currentQuestion && currentQuestion.options.length >= 2 && currentQuestion.correctIndex !== -1) {
        currentQuestion.correctAnswer = currentQuestion.options[currentQuestion.correctIndex];
        questions.push(currentQuestion);
      }

      const qNum = qHeaderMatch[1];
      const qText = qHeaderMatch[2].trim();

      currentQuestion = {
        id: `md-q${qNum}-${questions.length + 1}`,
        source: filename,
        question: qText,
        options: [],
        correctIndex: -1,
        correctAnswer: '',
        explanation: null
      };
      continue;
    }

    if (currentQuestion) {
      // Check for options: A-Z e.g. A. , B. or bolded **A. ...**
      const boldOptMatch = line.match(/^\*\*([A-Za-z])\.\s*(.*?)\*\*$/);
      const normalOptMatch = line.match(/^([A-Za-z])\.\s*(.*)$/);

      if (boldOptMatch) {
        const optText = boldOptMatch[2].trim();
        const optIdx = currentQuestion.options.length;
        currentQuestion.options.push(optText);
        currentQuestion.correctIndex = optIdx;
      } else if (normalOptMatch) {
        const optText = normalOptMatch[2].trim();
        currentQuestion.options.push(optText);
      } else {
        // If it's a continuation of question text or an explanation
        if (currentQuestion.options.length === 0) {
          currentQuestion.question += ' ' + line;
        } else {
          // Additional notes / explanation (guard against other question headers)
          if (!line.includes('**Câu')) {
            if (!currentQuestion.explanation) {
              currentQuestion.explanation = line;
            } else {
              currentQuestion.explanation += '\n' + line;
            }
          }
        }
      }
    }
  }

  if (currentQuestion && currentQuestion.options.length >= 2 && currentQuestion.correctIndex !== -1) {
    currentQuestion.correctAnswer = currentQuestion.options[currentQuestion.correctIndex];
    questions.push(currentQuestion);
  }

  return questions;
}

export function deduplicateQuestions(questionList) {
  const map = new Map();

  for (const item of questionList) {
    const key = normalizeKey(item.question);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key);
      // Priority: Moodle HTML > markdown
      if (existing.source.endsWith('.md') && !item.source.endsWith('.md')) {
        map.set(key, item);
      } else if (!existing.explanation && item.explanation && !item.explanation.includes('**Câu')) {
        existing.explanation = item.explanation;
      }
    }
  }

  return Array.from(map.values()).map((q, idx) => ({
    ...q,
    id: `q-${idx + 1}`
  }));
}

export function main() {
  const rootDir = process.cwd();
  const htmlDir = path.join(rootDir, 'html');
  const mdFile = path.join(rootDir, 'questions.md');
  const dataDir = path.join(rootDir, 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const allRawQuestions = [];

  // Parse HTML files
  if (fs.existsSync(htmlDir)) {
    const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
    console.log(`Scanning ${htmlFiles.length} HTML files in ${htmlDir}...`);
    for (const hFile of htmlFiles) {
      const fullPath = path.join(htmlDir, hFile);
      const qList = parseMoodleHtml(fullPath);
      console.log(` - Extracted ${qList.length} questions from ${hFile}`);
      allRawQuestions.push(...qList);
    }
  }

  // Parse Markdown questions
  if (fs.existsSync(mdFile)) {
    console.log(`Parsing ${mdFile}...`);
    const mdList = parseMarkdownQuestions(mdFile);
    console.log(` - Extracted ${mdList.length} questions from questions.md`);
    allRawQuestions.push(...mdList);
  }

  console.log(`Total raw questions extracted: ${allRawQuestions.length}`);

  const deduped = deduplicateQuestions(allRawQuestions);
  console.log(`Total unique questions after deduplication: ${deduped.length}`);

  const jsonOut = path.join(dataDir, 'questions.json');
  const jsOut = path.join(dataDir, 'questions.js');

  fs.writeFileSync(jsonOut, JSON.stringify(deduped, null, 2), 'utf-8');
  fs.writeFileSync(jsOut, `window.QUIZ_DATA = ${JSON.stringify(deduped, null, 2)};\n`, 'utf-8');

  console.log(`Wrote dataset to:`);
  console.log(` -> ${jsonOut}`);
  console.log(` -> ${jsOut}`);

  return deduped;
}

if (process.argv[1] && process.argv[1].endsWith('extract.mjs')) {
  main();
}
