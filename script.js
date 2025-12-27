document.addEventListener('DOMContentLoaded', () => {
  const questionHolder = document.getElementById('question_holder');
  const answerPad = document.getElementById('answer_to_questions');
  const optionsPad = document.getElementById('answers_options');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const levelSelect = document.getElementById('levelSelect');
  const languageSelect = document.getElementById('languageSelect');
  const scoreEl = document.getElementById('score');

  let questionsData = {};
  let availableQuestions = [];
  let quiz = [];
  let currentIndex = 0;
  let score = 0;

  let selectedLanguage = 'python';
  let selectedLevel = 'beginner';

  const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'];

  /*
  // ---------- UTILS ----------
  function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[i], a[j]];
    }
    return a;
  }
  */
  function shuffle(array) {
  let a = [...array];
  if (a.length <= 1) return a;  // Can't shuffle

  // Standard Fisher-Yates
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  // If accidentally same as original (common for length 2-3), reshuffle once
  if (a.length <= 4 && a.every((val, idx) => val === array[idx])) {
    return shuffle(array);  // Recurse once for a different order
  }

  return a;
}

  function saveProgress() {
    localStorage.setItem(
      'quiz-progress',
      JSON.stringify({
        currentIndex,
        score,
        quiz,
        selectedLanguage,
        selectedLevel
      })
    );
  }

  function loadProgress() {
    const saved = localStorage.getItem('quiz-progress');
    if (!saved) return false;

    const data = JSON.parse(saved);
    currentIndex = data.currentIndex || 0;
    score = data.score || 0;
    quiz = data.quiz || [];
    selectedLanguage = data.selectedLanguage || 'python';
    selectedLevel = data.selectedLevel || 'beginner';

    levelSelect.value = selectedLevel;
    languageSelect.value = selectedLanguage;

    return true;
  }

  function startNewQuiz() {
    availableQuestions = questionsData[selectedLevel]?.[selectedLanguage] || [];
    if (availableQuestions.length === 0) {
      alert("No questions available for this level/language!");
      return;
    }

    quiz = shuffle(availableQuestions).slice(0, Math.min(20, availableQuestions.length));
    currentIndex = 0;
    score = 0;
    localStorage.removeItem('quiz-progress');
    renderQuestion();
    updateScoreDisplay();
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  // ---------- LOAD QUESTIONS ----------
  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questionsData = data;

      if (loadProgress() && quiz.length > 0) {
        renderQuestion();
        updateScoreDisplay();
      } else {
        // Default view before starting
        questionHolder.textContent = "Select level/language and click 'Start Quiz' to begin!";
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      questionHolder.textContent = "Error loading questions.";
    });

  // ---------- BUTTONS ----------
  startBtn.addEventListener('click', () => {
    selectedLevel = levelSelect.value;
    selectedLanguage = languageSelect.value;
    startNewQuiz();
  });

  restartBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to restart the quiz? Progress will be lost.")) {
      selectedLevel = levelSelect.value;
      selectedLanguage = languageSelect.value;
      startNewQuiz();
    }
  });

  // ---------- RENDER ----------
  function renderQuestion() {
    if (currentIndex >= quiz.length) {
      endQuiz();
      return;
    }

    const q = quiz[currentIndex];
    questionHolder.textContent = `${currentIndex + 1}/${quiz.length}. ${q.question}`;

    answerPad.innerHTML = '';
    optionsPad.innerHTML = '';

    const shuffledLines = shuffle([...q.code]);
    shuffledLines.forEach(line => {
      optionsPad.appendChild(createCodeLineDiv(line));
    });

    updateScoreDisplay();
  }

  function createCodeLineDiv(text) {
    const div = document.createElement('div');
    div.className = 'answer';
    div.textContent = text;
    div.draggable = true;

    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', text);
      div.classList.add('dragging');
    });

    div.addEventListener('dragend', () => {
      div.classList.remove('dragging');
    });

    return div;
  }

  // ---------- DRAG AND DROP ----------
  [answerPad, optionsPad].forEach(pad => {
    pad.addEventListener('dragover', (e) => e.preventDefault());
    pad.addEventListener('drop', (e) => {
      e.preventDefault();
      const text = e.dataTransfer.getData('text/plain');
      const dragging = document.querySelector('.dragging');
      if (dragging && dragging.textContent === text) {
        pad.appendChild(dragging);
        checkAnswerCompletion();
      }
    });
  });

  // Touch/click fallback
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('answer')) {
      const div = e.target;
      if (div.parentElement === optionsPad) {
        answerPad.appendChild(div);
      } else {
        optionsPad.appendChild(div);
      }
      checkAnswerCompletion();
    }
  });

  function checkAnswerCompletion() {
    const q = quiz[currentIndex];
    const answeredLines = [...answerPad.children].map(div => div.textContent.trim());

    answerPad.classList.remove('correct', 'incorrect');

    if (answeredLines.length !== q.code.length) return;

    const isCorrect = answeredLines.every((line, i) => line === q.code[i].trim());

    answerPad.classList.toggle('correct', isCorrect);
    answerPad.classList.toggle('incorrect', !isCorrect);

    if (isCorrect) {
      score++;
      updateScoreDisplay();
      setTimeout(nextQuestion, 800);
    }
  }

  function updateScoreDisplay() {
    scoreEl.textContent = `Score: ${score}/${quiz.length}`;
  }

  // ---------- NAVIGATION ----------
  function nextQuestion() {
    currentIndex++;
    renderQuestion();
    saveProgress();
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  }

  prevBtn.onclick = prevQuestion;
  nextBtn.onclick = nextQuestion;

  // ---------- END QUIZ ----------
  function endQuiz() {
    const percent = Math.round((score / quiz.length) * 100);
    const passed = score >= 16; // 80% of 20

    let message = `
      <h2>Quiz Complete!</h2>
      <p>You scored <strong>${score}/${quiz.length}</strong> (${percent}%)</p>
      <p>${percent >= 80 ? 'Great job! 🎉' : 'Keep practicing! 💪'}</p>
    `;

    if (passed) {
      const currentIdx = LEVEL_ORDER.indexOf(selectedLevel);
      if (currentIdx < LEVEL_ORDER.length - 1) {
        const nextLevel = LEVEL_ORDER[currentIdx + 1];
        message += `
          <p><strong>Congratulations!</strong> You've unlocked the <em>${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}</em> level!</p>
          <button id="nextLevelBtn">Go to ${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)} Level</button>
        `;
      } else {
        message += `
          <p><strong>Master!</strong> You've completed all levels!</p>
          <button id="playOnBtn">Play On (More ${selectedLevel} questions)</button>
        `;
      }
    }

    message += `<button id="newQuizBtn">Start New Quiz (Same Settings)</button>`;

    questionHolder.innerHTML = message;
    answerPad.innerHTML = '';
    optionsPad.innerHTML = '';
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    // Attach buttons
    if (passed) {
      const currentIdx = LEVEL_ORDER.indexOf(selectedLevel);
      if (currentIdx < LEVEL_ORDER.length - 1) {
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
          selectedLevel = LEVEL_ORDER[currentIdx + 1];
          levelSelect.value = selectedLevel;
          startNewQuiz();
        });
      } else {
        document.getElementById('playOnBtn')?.addEventListener('click', () => {
          startNewQuiz();
        });
      }
    }

    document.getElementById('newQuizBtn').addEventListener('click', () => {
      startNewQuiz();
    });
  }
});
