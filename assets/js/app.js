let _state = {
    version: "1.0.0",
    theme: 'dark',
    database: null,
    currentCourseData: null,
    currentSelection: {
        department: null,
        course: null,
        examType: null,
        questionCount: 10
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
    const departments = _state.database.departments;
    ui.container.innerHTML = `
        <div class="fade-in">
            <div class="ios-list-group" style="margin-top: 40px;">
                <div class="ios-list-header">Bölüm Seçiniz</div>
                <div class="ios-list">
                    ${departments.map((dept, idx) => `
                        <div class="ios-cell dept-item" data-idx="${idx}">
                            <div class="ios-cell-inner">
                                <span class="body-text">${dept.name}</span>
                                <svg class="chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.dept-item').forEach(el => {
        el.onclick = () => {
            tap();
            const idx = el.getAttribute('data-idx');
            _state.currentSelection.department = departments[idx];
            saveState();
            renderCourseSelection();
        };
    });
}

function renderCourseSelection() {
    const courses = _state.currentSelection.department.courses;
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
            renderQuestionCountSelection();
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

function renderQuestionCountSelection() {
    ui.container.innerHTML = `
        <div class="slide-in-right">
            <div class="ios-navbar">
                <button class="nav-btn" id="back-to-types">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Sınav Türü
                </button>
                <span class="nav-title">Soru Sayısı</span>
            </div>
            
            <div class="ios-list-group" style="margin-top: 20px;">
                <div class="ios-list-header">Soru Sayısı Ayarla</div>
                <div class="ios-list">
                    <div class="ios-cell no-chevron" id="question-count-row">
                        <div class="ios-cell-inner" style="border-bottom: none;">
                            <span class="body-text">Soru Sayısı</span>
                            <input type="number" id="question-count-input" class="ios-input" 
                                inputmode="numeric" pattern="[0-9]*"
                                value="${_state.currentSelection.questionCount === 'all' ? 10 : _state.currentSelection.questionCount}" 
                                min="1" max="100" style="text-align: right; width: 60px; background: none; border: none; color: var(--ios-blue); font-size: 17px; font-weight: 600;">
                        </div>
                    </div>
                </div>
                <div class="secondary-text" style="margin: 10px 16px;">Kaç soru çözmek istediğinizi girin veya tüm soruları seçin.</div>
            </div>

            <div style="padding: 0 16px; display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
                <button class="ios-btn-secondary" id="all-questions-btn" style="margin-bottom: 0;">Tüm Sorular</button>
                <button class="ios-btn-primary" id="start-exam-btn">Sınavı Başlat</button>
            </div>
        </div>
    `;

    const input = document.getElementById('question-count-input');
    
    document.getElementById('back-to-types').onclick = () => {
        tap();
        renderExamTypeSelection();
    };

    document.getElementById('all-questions-btn').onclick = () => {
        tap();
        _state.currentSelection.questionCount = "all";
        startQuiz();
    };

    document.getElementById('start-exam-btn').onclick = () => {
        tap();
        const val = parseInt(input.value);
        if (isNaN(val) || val < 1) {
            alert("Lütfen geçerli bir sayı giriniz.");
            return;
        }
        _state.currentSelection.questionCount = val;
        startQuiz();
    };

    // Ensure clicking the row focuses the input
    document.getElementById('question-count-row').onclick = (e) => {
        if (e.target !== input) {
            input.focus();
        }
        tap();
    };

    // Robust focus management
    input.onfocus = () => {
        setTimeout(() => {
            input.select();
        }, 100);
    };

    // Immediate sanitization
    input.oninput = () => {
        if (input.value > 100) input.value = 100;
        if (input.value.length > 3) input.value = input.value.slice(0, 3);
    };
}

async function startQuiz() {
    const course = _state.currentSelection.course;
    const type = _state.currentSelection.examType;

    // Show loading state if needed
    ui.container.innerHTML = '<div class="fade-in" style="padding: 20px; text-align: center;"><p class="body-text">Sorular yükleniyor...</p></div>';

    try {
        const response = await fetch(`data/courses/${course.id}.json`);
        _state.currentCourseData = await response.json();
    } catch (error) {
        console.error("Failed to load course questions:", error);
        alert("Sorular yüklenirken hata oluştu!");
        renderExamTypeSelection();
        return;
    }

    let pool = _state.currentCourseData[type] || [];

    if (pool.length === 0) {
        alert("Bu kategori için soru bulunamadı!");
        renderExamTypeSelection();
        return;
    }

    // Limit to selected question count or pool size
    let shuffled = shuffleArray([...pool]);
    let count = _state.currentSelection.questionCount;
    if (count === "all" || count > shuffled.length) {
        count = shuffled.length;
    }
    _state.quiz.questions = shuffled.slice(0, count);
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
        showActionSheet({
            title: "Sınavdan çıkmak istediğinize emin misiniz?",
            buttons: [
                { 
                    text: 'Sınavı Bitir', 
                    style: 'destructive', 
                    onClick: () => {
                        _state.quiz.active = false;
                        renderDepartmentSelection();
                    } 
                }
            ]
        });
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
            <button class="ios-btn-secondary" id="back-to-courses-btn" style="margin-bottom: 12px;">Derslere Dön</button>
            <button class="ios-btn-primary" id="finish-quiz">Ana Menüye Dön</button>
        </div>
    `;

    document.getElementById('finish-quiz').onclick = () => {
        tap();
        _state.quiz.active = false;
        renderDepartmentSelection();
    };

    document.getElementById('back-to-courses-btn').onclick = () => {
        tap();
        _state.quiz.active = false;
        renderCourseSelection();
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

function showActionSheet(options) {
    const overlay = document.createElement('div');
    overlay.className = 'action-sheet-overlay';
    
    // Create the structure
    overlay.innerHTML = `
        <div class="action-sheet">
            <div class="action-sheet-group">
                <div class="action-sheet-title">${options.title}</div>
                ${options.buttons.map((btn, idx) => `
                    <button class="action-sheet-btn ${btn.style || ''}" data-idx="${idx}">${btn.text}</button>
                `).join('')}
            </div>
            <div class="action-sheet-group">
                <button class="action-sheet-btn cancel">Vazgeç</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Force reflow and activate
    requestAnimationFrame(() => overlay.classList.add('active'));

    const closeHandler = (callback) => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (callback) callback();
        }, 300);
    };

    overlay.querySelectorAll('.action-sheet-btn').forEach(btn => {
        btn.onclick = () => {
            tap();
            const idx = btn.getAttribute('data-idx');
            if (idx !== null) {
                const buttonDef = options.buttons[idx];
                closeHandler(buttonDef.onClick);
            } else {
                // Cancel button
                closeHandler();
            }
        };
    });

    overlay.onclick = (e) => {
        if (e.target === overlay) closeHandler();
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

document.addEventListener('keydown', (e) => {
    if (!_state.quiz.active) return;
    
    const key = e.key.toLowerCase();
    
    if (key === 'enter') {
        const nextBtn = document.getElementById('next-question');
        if (nextBtn && nextBtn.style.display !== 'none') {
            nextBtn.click();
        }
    } else {
        const optionKeys = ['a', 'b', 'c', 'd', 'e'];
        const index = optionKeys.indexOf(key);
        if (index !== -1) {
            const options = document.querySelectorAll('.option-card');
            if (options && options.length > index) {
                options[index].click();
            }
        }
    }
});

init();
