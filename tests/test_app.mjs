import fs from 'fs';

function testApp() {
  console.log('--- Testing Web App Assets ---');
  const html = fs.readFileSync('index.html', 'utf-8');
  const css = fs.readFileSync('style.css', 'utf-8');
  const js = fs.readFileSync('app.js', 'utf-8');

  const requiredIds = [
    'screen-welcome', 'screen-quiz', 'screen-results',
    'btn-mode-all', 'btn-mode-random-20', 'btn-mode-random-30',
    'quiz-options-container', 'quiz-waiting-banner', 'quiz-feedback-banner',
    'btn-next-question', 'wrong-questions-section', 'btn-retry-wrong'
  ];

  for (const id of requiredIds) {
    if (!html.includes(`id="${id}"`)) {
      throw new Error(`Missing ID in index.html: ${id}`);
    }
  }

  // Check script tags in HTML
  if (!html.includes('src="data/questions.js"')) {
    throw new Error('index.html missing script data/questions.js');
  }
  if (!html.includes('src="app.js"')) {
    throw new Error('index.html missing script app.js');
  }

  // Check app.js key handlers
  if (!js.includes('setTimeout') || !js.includes('2000')) {
    throw new Error('app.js missing 2000ms delay logic');
  }
  if (!js.includes('shuffleArray')) {
    throw new Error('app.js missing shuffle logic for random mode');
  }
  if (!js.includes('wrongQuestions')) {
    throw new Error('app.js missing review wrong questions logic');
  }

  // Check CSS media queries
  if (!css.includes('@media (max-width: 640px)')) {
    throw new Error('style.css missing responsive mobile media query');
  }

  console.log('✅ Web App verification passed successfully!');
}

testApp();
