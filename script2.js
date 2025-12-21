document.addEventListener('DOMContentLoaded', () => {
  const questionHolder = document.getElementById('question_holder');
  const answerPad = document.getElementById('answer_to_questions');
  const optionsPad = document.getElementById('answers_options');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let questionsData = {}; // Raw data from JSON
  let availableQuestions = [];
  let quiz = [];
  let currentIndex = 0;
  let score = 0;

  let selectedLanguage = 'python'; // default
  let selectedLevel = 'beginner';  // default

  // ---------- UTILS ----------
  function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[i], a[j]];
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

    // Update UI selectors if you add real selects later
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
  }

  // ---------- LOAD QUESTIONS ----------
  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questionsData = data;

      if (loadProgress() && quiz.length > 0) {
        renderQuestion();
      } else {
        startNewQuiz();
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      questionHolder.textContent = "Error loading questions.";
    });

  // ---------- RENDER ----------
  function renderQuestion() {
    if (currentIndex >= quiz.length) {
      endQuiz();
      return;
    }

    const q = quiz[currentIndex];
    questionHolder.textContent = `${currentIndex + 1}/${quiz.length}. ${q.question}`;

    // Clear pads
    answerPad.innerHTML = '';
    optionsPad.innerHTML = '';

    // Shuffle code lines and create draggable divs
    const shuffledLines = shuffle([...q.code]);
    shuffledLines.forEach(line => {
      optionsPad.appendChild(createCodeLineDiv(line));
    });

    // Update score display (you can add a score element in HTML)
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
    pad.addEventListener('dragover', (e) => {
      e.preventDefault();
      pad.classList.add('drag-over');
    });

    pad.addEventListener('dragleave', () => {
      pad.classList.remove('drag-over');
    });

    pad.addEventListener('drop', (e) => {
      e.preventDefault();
      pad.classList.remove('drag-over');

      const text = e.dataTransfer.getData('text/plain');
      const dragging = document.querySelector('.dragging');
      if (dragging && dragging.textContent === text) {
        pad.appendChild(dragging);
        checkAnswerCompletion();
      }
    });
  });

  // Fallback: keep click-to-move for touch devices
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

    if (answeredLines.length !== q.code.length) {
      answerPad.classList.remove('correct', 'incorrect');
      return;
    }

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
    // Add a score display in HTML like: <div id="score">Score: 0/20</div>
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
      scoreEl.textContent = `Score: ${score}/${quiz.length}`;
    }
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
    questionHolder.innerHTML = `
      <h2>Quiz Complete!</h2>
      <p>You scored <strong>${score}/${quiz.length}</strong> (${percent}%)</p>
      <p>${percent >= 80 ? 'Great job! 🎉' : 'Keep practicing! 💪'}</p>
    `;
    answerPad.innerHTML = '';
    optionsPad.innerHTML = '';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }

  // ---------- MENU CONTROLS (optional enhancement) ----------
  // Example: add real selectors in HTML and connect them
  // <select id="languageSelect"><option>python</option><option>javascript</option></select>
  // <select id="levelSelect"><option>beginner</option><option>intermediate</option><option>advanced</option></select>

  // Then add:
  /*
  document.getElementById('languageSelect')?.addEventListener('change', (e) => {
    selectedLanguage = e.target.value;
    startNewQuiz();
  });
  document.getElementById('levelSelect')?.addEventListener('change', (e) => {
    selectedLevel = e.target.value;
    startNewQuiz();
  });
  */
});
