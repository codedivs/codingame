document.addEventListener('DOMContentLoaded', () => {

  const questionHolder = document.getElementById('question_holder');
  const answerPad = document.getElementById('answer_to_questions');
  const optionsPad = document.getElementById('answers_options');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let questions = [];
  let quiz = [];
  let currentIndex = 0;
  let score = 0;

  // ---------- UTILS ----------
  function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function saveProgress() {
    localStorage.setItem(
      'quiz-progress',
      JSON.stringify({ currentIndex, score, quiz })
    );
  }

  function loadProgress() {
    const saved = localStorage.getItem('quiz-progress');
    if (!saved) return false;

    const data = JSON.parse(saved);
    currentIndex = data.currentIndex;
    score = data.score;
    quiz = data.quiz;
    return true;
  }

  // ---------- LOAD QUESTIONS ----------
  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questions = [];

      Object.values(data).forEach(lang => {
        Object.values(lang).forEach(level => {
          questions.push(...level);
        });
      });

      if (!loadProgress()) {
        quiz = shuffle(questions).slice(0, 20);
      }

      renderQuestion();
    })
    .catch(err => console.error('Fetch error:', err));

  // ---------- RENDER ----------
  function renderQuestion() {
    const q = quiz[currentIndex];
    if (!q) return;

    questionHolder.textContent = `${currentIndex + 1}. ${q.question}`;
    answerPad.innerHTML = '';
    optionsPad.innerHTML = '';

    shuffle(q.code).forEach(line => {
      optionsPad.appendChild(createAnswerDiv(line));
    });

    saveProgress();
  }

  function createAnswerDiv(text) {
    const div = document.createElement('div');
    div.className = 'answer';
    div.textContent = text;
    div.onclick = () => moveAnswer(div);
    return div;
  }

  function moveAnswer(div) {
    if (div.parentElement === optionsPad) {
      answerPad.appendChild(div);
    } else {
      optionsPad.appendChild(div);
    }
    checkAnswerCompletion();
  }

  // ---------- CHECK ANSWER ----------
  function checkAnswerCompletion() {
    const q = quiz[currentIndex];
    const selected = [...answerPad.children].map(d => d.textContent);

    if (selected.length !== q.code.length) return;

    const correct = selected.every((line, i) => line === q.code[i]);
    if (correct) score++;

    setTimeout(nextQuestion, 400);
  }

  // ---------- NAVIGATION ----------
  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= quiz.length) {
      endQuiz();
      return;
    }
    renderQuestion();
  }

  function prevQuestion() {
    if (currentIndex === 0) return;
    currentIndex--;
    renderQuestion();
  }

  prevBtn.onclick = prevQuestion;
  nextBtn.onclick = nextQuestion;

  // ---------- END QUIZ ----------
  function endQuiz() {
    const percent = Math.round((score / quiz.length) * 100);
    const retry = confirm(
      `You got ${percent}%.\n\n` +
      (percent >= 80 ? 'Move to next level?' : 'Try again?')
    );

    if (retry) {
      localStorage.removeItem('quiz-progress');
      location.reload();
    }
  }

});

