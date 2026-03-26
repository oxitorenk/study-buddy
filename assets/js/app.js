let _state = {
    version: "1.0.0",
    theme: 'dark',
    database: null,
    currentSelection: {
        department: null,
        course: null,
        examType: null
    },
    quiz: {
        active: false,
        questions: [],
        currentIndex: 0,
        score: 0,
        userAnswers: []
    }
};

const ui = {
    container: document.getElementById('screen-container')
};

function saveState() {
    localStorage.setItem('study_buddy_state', JSON.stringify(_state));
}

function loadState() {
    const saved = localStorage.getItem('study_buddy_state');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === _state.version) {
            _state = { ..._state, ...parsed };
        }
    }
}

async function loadDatabase() {
    try {
        const response = await fetch('data/database.json');
        _state.database = await response.json();
    } catch (error) {
        console.error("Failed to load database:", error);
    }
}

function tap() {
    if (navigator.vibrate) navigator.vibrate(10);
}

function feedback(success) {
    if (navigator.vibrate) {
        if (success) navigator.vibrate(50);
        else navigator.vibrate([50, 50, 50]);
    }
}

function renderDepartmentSelection() {
    const department = _state.database.department;
    ui.container.innerHTML = `
        <div class="fade-in">
            <div class="ios-list-group" style="margin-top: 40px;">
                <div class="ios-list-header">Bölüm Seçiniz</div>
                <div class="ios-list">
                    <div class="ios-cell" id="select-dept">
                        <div class="ios-cell-inner">
                            <span class="body-text">${department}</span>
                            <svg class="chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('select-dept').onclick = () => {
        tap();
        _state.currentSelection.department = department;
        saveState();
        renderCourseSelection();
    };
}

function renderCourseSelection() {
    const courses = _state.database.courses;
    ui.container.innerHTML = `
        <div class="slide-in-right">
            <div class="ios-navbar">
                <button class="nav-btn" id="back-to-dept">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Bölüm
                </button>
                <span class="nav-title">Ders Seç</span>
            </div>
            <div class="ios-list-group">
                <div class="ios-list">
                    ${courses.map((course, idx) => `
                        <div class="ios-cell course-item" data-idx="${idx}">
                            <div class="ios-cell-inner">
                                <span class="body-text">${course.courseName}</span>
                                <svg class="chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-to-dept').onclick = () => {
        tap();
        renderDepartmentSelection();
    };

    document.querySelectorAll('.course-item').forEach(el => {
        el.onclick = () => {
            tap();
            const idx = el.getAttribute('data-idx');
            _state.currentSelection.course = courses[idx];
            saveState();
            renderExamTypeSelection();
        };
    });
}

function renderExamTypeSelection() {
    const types = [
        { id: 'semiExam', label: 'Ara Sınav' },
        { id: 'finalExam', label: 'Dönem Sonu Sınavı' },
        { id: 'summerExam', label: 'Yaz Okulu Sınavı' }
    ];

    ui.container.innerHTML = `
        <div class="slide-in-right">
            <div class="ios-navbar">
                <button class="nav-btn" id="back-to-courses">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Dersler
                </button>
                <span class="nav-title">Sınav Türü</span>
            </div>
            <div class="ios-list-group">
                <div class="ios-list">
                    ${types.map(type => `
                        <div class="ios-cell type-item" data-id="${type.id}">
                            <div class="ios-cell-inner">
                                <span class="body-text">${type.label}</span>
                                <svg class="chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-to-courses').onclick = () => {
        tap();
        renderCourseSelection();
    };

    document.querySelectorAll('.type-item').forEach(el => {
        el.onclick = () => {
            tap();
            const id = el.getAttribute('data-id');
            _state.currentSelection.examType = id;
            startQuiz();
        };
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz() {
    const course = _state.currentSelection.course;
    const type = _state.currentSelection.examType;
    let pool = course[type] || [];

    if (pool.length === 0) {
        alert("Bu kategori için soru bulunamadı!");
        return;
    }

    // Limit to 10 questions and shuffle
    let shuffled = shuffleArray([...pool]);
    _state.quiz.questions = shuffled.slice(0, 10);
    _state.quiz.currentIndex = 0;
    _state.quiz.score = 0;
    _state.quiz.userAnswers = [];
    _state.quiz.active = true;

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const question = _state.quiz.questions[_state.quiz.currentIndex];
    const total = _state.quiz.questions.length;

    ui.container.innerHTML = `
        <div class="quiz-container fade-in">
            <div class="quiz-header">
                <button class="exit-btn" id="exit-quiz">×</button>
                <span class="secondary-text" style="text-align: center;">Soru ${_state.quiz.currentIndex + 1} / ${total}</span>
                <div></div>
            </div>
            <div class="question-area">
                <p class="question-text">${question.questionText}</p>
            </div>
            <div class="options-list">
                ${shuffleArray(Object.entries(question.options)).map((entry, idx) => `
                    <div class="option-card" data-key="${entry[0]}">
                        <strong>${String.fromCharCode(65 + idx)}:</strong> ${entry[1]}
                    </div>
                `).join('')}
            </div>
            <div class="quiz-footer">
                <button class="ios-btn-primary" id="next-question" style="display: none;">Sonraki Soru</button>
            </div>
        </div>
    `;

    document.getElementById('exit-quiz').onclick = () => {
        if (confirm("Sınavdan çıkmak istediğinize emin misiniz?")) {
            _state.quiz.active = false;
            renderDepartmentSelection();
        }
    };

    const options = document.querySelectorAll('.option-card');
    options.forEach(opt => {
        opt.onclick = () => {
            if (document.querySelector('.option-card.correct')) return; // Already answered

            const key = opt.getAttribute('data-key');
            const correct = question.correctAnswer;
            
            _state.quiz.userAnswers[_state.quiz.currentIndex] = key;

            if (key === correct) {
                opt.classList.add('correct');
                _state.quiz.score++;
                feedback(true);
            } else {
                opt.classList.add('wrong');
                document.querySelector(`.option-card[data-key="${correct}"]`).classList.add('correct');
                feedback(false);
            }

            const nextBtn = document.getElementById('next-question');
            nextBtn.style.display = 'block';
            nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
    });

    document.getElementById('next-question').onclick = () => {
        tap();
        _state.quiz.currentIndex++;
        if (_state.quiz.currentIndex < total) {
            renderQuizQuestion();
        } else {
            showResults();
        }
    };
}

function showResults() {
    const total = _state.quiz.questions.length;
    const score = _state.quiz.score;
    const percent = Math.round((score / total) * 100);

    ui.container.innerHTML = `
        <div class="quiz-container fade-in" style="justify-content: center; text-align: center;">
            <h1 class="large-title">Bitti!</h1>
            <p class="body-text" style="margin-bottom: 20px;">Sınavı tamamladınız.</p>
            <div style="font-size: 48px; font-weight: 800; color: var(--ios-blue); margin-bottom: 10px;">
                ${percent}%
            </div>
            <p class="secondary-text" style="margin-bottom: 40px;">${total} soruda ${score} doğru cevap.</p>
            
            <button class="ios-btn-secondary" id="view-wrong" style="${score === total ? 'display:none' : ''}">Yanlışlarımı Gör</button>
            <button class="ios-btn-primary" id="finish-quiz">Ana Menüye Dön</button>
        </div>
    `;

    document.getElementById('finish-quiz').onclick = () => {
        tap();
        _state.quiz.active = false;
        renderDepartmentSelection();
    };

    const viewWrongBtn = document.getElementById('view-wrong');
    if (viewWrongBtn) {
        viewWrongBtn.onclick = () => {
            tap();
            renderWrongAnswers();
        };
    }
}

function renderWrongAnswers() {
    const questions = _state.quiz.questions;
    const userAnswers = _state.quiz.userAnswers;
    
    const wrongOnes = questions.filter((q, idx) => userAnswers[idx] !== q.correctAnswer);

    ui.container.innerHTML = `
        <div class="slide-in-right">
            <div class="ios-navbar">
                <button class="nav-btn" id="back-to-results">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Sonuçlar
                </button>
                <span class="nav-title">Yanlışlarım</span>
            </div>
            <div style="padding: 16px; padding-bottom: 80px; overflow-y: auto; height: calc(100vh - 100px);">
                ${wrongOnes.map(q => `
                    <div class="wrong-answer-card">
                        <span class="q-text">${q.questionText}</span>
                        <div class="ans-row">
                            <span class="ans-label">Sizin Cevabınız:</span>
                            <span class="your-ans">${userAnswers[questions.indexOf(q)] || 'Boş'} - ${q.options[userAnswers[questions.indexOf(q)]] || ''}</span>
                        </div>
                        <div class="ans-row">
                            <span class="ans-label">Doğru Cevap:</span>
                            <span class="correct-ans">${q.correctAnswer} - ${q.options[q.correctAnswer]}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('back-to-results').onclick = () => {
        tap();
        showResults();
    };
}

async function init() {
    loadState();
    await loadDatabase();

    // Apply theme
    document.documentElement.setAttribute('data-theme', _state.theme);

    if (_state.database) {
        renderDepartmentSelection();
    } else {
        ui.container.innerHTML = '<p class="body-text" style="padding: 20px;">Veritabanı yüklenemedi.</p>';
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('SW reg fail:', err));
        });
    }
}

init();
