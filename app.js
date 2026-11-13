// ==========================================================================
// Quiz Application State & Logic
// ==========================================================================

(function() {
  'use strict';

  // State
  let allQuestions = [];
  let currentQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let wrongQuestions = [];
  let isAnswering = false;
  let answerTimer = null;

  // DOM Elements
  const screens = {
    welcome: document.getElementById('screen-welcome'),
    quiz: document.getElementById('screen-quiz'),
    results: document.getElementById('screen-results')
  };

  const totalCountEl = document.getElementById('total-questions-count');
  const btnModeAll = document.getElementById('btn-mode-all');
  const btnModeRandom20 = document.getElementById('btn-mode-random-20');
  const btnModeRandom30 = document.getElementById('btn-mode-random-30');
  const btnExitQuiz = document.getElementById('btn-exit-quiz');

  // Quiz DOM
  const quizCurrentQ = document.getElementById('quiz-current-q');
  const quizTotalQ = document.getElementById('quiz-total-q');
  const quizLiveScore = document.getElementById('quiz-live-score');
  const quizProgressFill = document.getElementById('quiz-progress-fill');
  const quizQSource = document.getElementById('quiz-q-source');
  const quizQId = document.getElementById('quiz-q-id');
  const quizQText = document.getElementById('quiz-q-text');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizWaitingBanner = document.getElementById('quiz-waiting-banner');
  const quizFeedbackBanner = document.getElementById('quiz-feedback-banner');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  const btnNextQuestion = document.getElementById('btn-next-question');

  // Results DOM
  const resultEmoji = document.getElementById('result-emoji');
  const resultTitle = document.getElementById('result-title');
  const resultSubtitle = document.getElementById('result-subtitle');
  const resultScoreNumber = document.getElementById('result-score-number');
  const statCorrectCount = document.getElementById('stat-correct-count');
  const statWrongCount = document.getElementById('stat-wrong-count');
  const statAccuracyPct = document.getElementById('stat-accuracy-pct');
  const btnNewQuiz = document.getElementById('btn-new-quiz');
  const btnRetryWrong = document.getElementById('btn-retry-wrong');
  const retryWrongCount = document.getElementById('retry-wrong-count');
  const wrongQuestionsSection = document.getElementById('wrong-questions-section');
  const wrongQuestionsList = document.getElementById('wrong-questions-list');

  // ==========================================================================
  // Initialization & Data Loading
  // ==========================================================================

  async function init() {
    bindEvents();

    if (window.QUIZ_DATA && Array.isArray(window.QUIZ_DATA)) {
      allQuestions = window.QUIZ_DATA;
      onDataLoaded();
    } else {
      try {
        const res = await fetch('data/questions.json');
        if (!res.ok) throw new Error('Cannot fetch questions.json');
        allQuestions = await res.json();
        onDataLoaded();
      } catch (err) {
        console.error('Failed to load questions data:', err);
        totalCountEl.textContent = 'Lỗi tải dữ liệu';
        alert('Không thể tải dữ liệu câu hỏi. Hãy đảm bảo file data/questions.js tồn tại.');
      }
    }
  }

  function onDataLoaded() {
    totalCountEl.textContent = allQuestions.length;
    console.log(`Loaded ${allQuestions.length} questions successfully.`);
  }

  function bindEvents() {
    btnModeAll.addEventListener('click', () => startQuiz('all'));
    btnModeRandom20.addEventListener('click', () => startQuiz('random', 20));
    btnModeRandom30.addEventListener('click', () => startQuiz('random', 30));

    btnExitQuiz.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn dừng bài thi và quay lại trang chủ không?')) {
        showScreen('welcome');
      }
    });

    btnNextQuestion.addEventListener('click', handleNextQuestion);
    btnNewQuiz.addEventListener('click', () => showScreen('welcome'));
    btnRetryWrong.addEventListener('click', startRetryWrong);
  }

  // ==========================================================================
  // Navigation & Screens
  // ==========================================================================

  function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    if (screens[screenName]) {
      screens[screenName].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Fisher-Yates Shuffle
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ==========================================================================
  // Quiz Lifecycle
  // ==========================================================================

  function startQuiz(mode, count = 20) {
    if (!allQuestions || allQuestions.length === 0) {
      alert('Dữ liệu câu hỏi chưa sẵn sàng!');
      return;
    }

    if (mode === 'all') {
      currentQuestions = [...allQuestions];
    } else if (mode === 'random') {
      const shuffled = shuffleArray(allQuestions);
      currentQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    }

    currentIndex = 0;
    score = 0;
    wrongQuestions = [];
    isAnswering = false;

    showScreen('quiz');
    renderCurrentQuestion();
  }

  function startRetryWrong() {
    if (wrongQuestions.length === 0) return;
    currentQuestions = wrongQuestions.map(w => w.originalItem);
    currentIndex = 0;
    score = 0;
    wrongQuestions = [];
    isAnswering = false;

    showScreen('quiz');
    renderCurrentQuestion();
  }

  function renderCurrentQuestion() {
    if (answerTimer) clearTimeout(answerTimer);
    isAnswering = false;

    const q = currentQuestions[currentIndex];
    const total = currentQuestions.length;

    // Update Header
    quizCurrentQ.textContent = currentIndex + 1;
    quizTotalQ.textContent = total;
    quizLiveScore.textContent = score;

    const progressPct = ((currentIndex) / total) * 100;
    quizProgressFill.style.width = `${progressPct}%`;

    // Meta
    let sourceLabel = q.source || 'Đề thi';
    if (sourceLabel.includes('BTLT1')) sourceLabel = 'BTLT 1';
    else if (sourceLabel.includes('BTLT2')) sourceLabel = 'BTLT 2';
    else if (sourceLabel.endsWith('.md')) sourceLabel = 'Đề Thi PDF';
    quizQSource.textContent = sourceLabel;
    quizQId.textContent = `#${q.id}`;

    // Question Text
    quizQText.textContent = q.question;

    // Reset Elements
    quizWaitingBanner.classList.remove('active');
    quizFeedbackBanner.classList.remove('active', 'success', 'danger');
    btnNextQuestion.classList.remove('active');
    btnNextQuestion.innerHTML = (currentIndex === total - 1)
      ? '<span>Xem kết quả</span> ➔'
      : '<span>Câu tiếp theo</span> ➔';

    // Render Options
    quizOptionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    q.options.forEach((optText, idx) => {
      const optItem = document.createElement('div');
      optItem.className = 'option-item';
      optItem.dataset.index = idx;

      optItem.innerHTML = `
        <div class="option-letter">${letters[idx] || (idx + 1)}</div>
        <div class="option-text">${escapeHtml(optText)}</div>
      `;

      optItem.addEventListener('click', () => onOptionSelected(idx, optItem));
      quizOptionsContainer.appendChild(optItem);
    });
  }

  // ==========================================================================
  // User Selection & 2-Second Delay
  // ==========================================================================

  function onOptionSelected(selectedIndex, selectedElement) {
    if (isAnswering) return;
    isAnswering = true;

    const q = currentQuestions[currentIndex];

    // Mark selected styling
    selectedElement.classList.add('selected');

    // Disable all options
    const allOptItems = quizOptionsContainer.querySelectorAll('.option-item');
    allOptItems.forEach(item => item.classList.add('disabled'));

    // Show waiting spinner (2s)
    quizWaitingBanner.classList.add('active');

    // Wait exactly 2000ms
    answerTimer = setTimeout(() => {
      quizWaitingBanner.classList.remove('active');
      evaluateAnswer(selectedIndex, q, allOptItems);
    }, 2000);
  }

  function evaluateAnswer(selectedIndex, q, allOptItems) {
    const isCorrect = (selectedIndex === q.correctIndex);

    // Apply colors to options
    allOptItems.forEach((item, idx) => {
      if (idx === q.correctIndex) {
        item.classList.add('correct');
      } else if (idx === selectedIndex && !isCorrect) {
        item.classList.add('wrong');
      } else {
        item.classList.add('dimmed');
      }
    });

    // Feedback Banner
    quizFeedbackBanner.classList.add('active');

    if (isCorrect) {
      score++;
      quizLiveScore.textContent = score;
      quizFeedbackBanner.classList.add('success');
      feedbackIcon.textContent = '✓';
      feedbackTitle.textContent = '🎉 Chính xác!';
    } else {
      quizFeedbackBanner.classList.add('danger');
      feedbackIcon.textContent = '✕';
      feedbackTitle.textContent = `Chưa đúng! Đáp án chính xác là: ${q.correctAnswer}`;

      // Save for wrong question review
      wrongQuestions.push({
        id: q.id,
        question: q.question,
        source: q.source,
        userAnswer: q.options[selectedIndex] || 'Chưa chọn',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        originalItem: q
      });
    }

    // Explanation if present
    if (q.explanation && q.explanation.trim().length > 0) {
      feedbackExplanation.textContent = `💡 Giải thích: ${q.explanation}`;
      feedbackExplanation.style.display = 'block';
    } else {
      feedbackExplanation.style.display = 'none';
    }

    // Show Next Button
    btnNextQuestion.classList.add('active');
  }

  function handleNextQuestion() {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
      renderCurrentQuestion();
    } else {
      finishQuiz();
    }
  }

  // ==========================================================================
  // Quiz Finish & Results
  // ==========================================================================

  function finishQuiz() {
    const total = currentQuestions.length;
    const score10 = ((score / total) * 10).toFixed(1);
    const accuracy = Math.round((score / total) * 100);

    resultScoreNumber.textContent = score10;
    statCorrectCount.textContent = score;
    statWrongCount.textContent = total - score;
    statAccuracyPct.textContent = `${accuracy}%`;

    // Motivational Emoji and message
    if (accuracy >= 90) {
      resultEmoji.textContent = '🏆';
      resultTitle.textContent = 'Xuất Sắc!';
      resultSubtitle.textContent = 'Bạn đã nắm rất vững kiến thức ôn tập Giữa Kỳ!';
    } else if (accuracy >= 70) {
      resultEmoji.textContent = '🎉';
      resultTitle.textContent = 'Làm Tốt Lắm!';
      resultSubtitle.textContent = 'Chỉ cần xem lại vài câu sai là tự tin đạt điểm cao!';
    } else if (accuracy >= 50) {
      resultEmoji.textContent = '📚';
      resultTitle.textContent = 'Đạt Yêu Cầu';
      resultSubtitle.textContent = 'Hãy luyện tập thêm để củng cố các câu còn phân vân.';
    } else {
      resultEmoji.textContent = '💪';
      resultTitle.textContent = 'Cố Lên Nhé!';
      resultSubtitle.textContent = 'Hãy ôn lại lý thuyết và thử làm lại một lượt nữa.';
    }

    // Wrong Questions Section
    if (wrongQuestions.length > 0) {
      wrongQuestionsSection.style.display = 'block';
      btnRetryWrong.style.display = 'inline-block';
      retryWrongCount.textContent = wrongQuestions.length;

      wrongQuestionsList.innerHTML = '';
      wrongQuestions.forEach((item, i) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'wrong-q-item';
        itemEl.innerHTML = `
          <div class="wrong-q-title">${i + 1}. ${escapeHtml(item.question)}</div>
          <div class="wrong-q-choice-row">
            <span class="badge-wrong-choice">Bạn chọn:</span>
            <span>${escapeHtml(item.userAnswer)}</span>
          </div>
          <div class="wrong-q-choice-row">
            <span class="badge-right-choice">Đáp án đúng:</span>
            <span><strong>${escapeHtml(item.correctAnswer)}</strong></span>
          </div>
          ${item.explanation ? `<div style="margin-top:6px;font-size:12.5px;color:#64748b;">💡 ${escapeHtml(item.explanation)}</div>` : ''}
        `;
        wrongQuestionsList.appendChild(itemEl);
      });
    } else {
      wrongQuestionsSection.style.display = 'none';
      btnRetryWrong.style.display = 'none';
    }

    showScreen('results');
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start application
  document.addEventListener('DOMContentLoaded', init);

})();
