const params = new URLSearchParams(window.location.search);
const number = params.get('id');
const storageKey = `gameState_${number}`;

// === Генерація списку раундів ===
function renderRoundsNav(totalRounds) {
    const nav = document.getElementById('rounds-nav');
    nav.innerHTML = '';

    for (let i = 1; i <= totalRounds; i++) {
        const link = document.createElement('a');
        link.href = `index.html?id=${i}`;
        link.classList.add('icon__icon')
        link.textContent = i;
        link.style.marginRight = '8px';

        // Підсвічування поточного раунду
        if (String(i) === number) {
            link.classList.add('current-round');
        }

        // Читаємо стан з localStorage
        const saved = JSON.parse(localStorage.getItem(`gameState_${i}`));
        if (saved && saved.currentTurn) {
            if (saved.currentTurn === 'boys') {
                link.classList.add('boys-started');
            } else if (saved.currentTurn === 'girls') {
                link.classList.add('girls-started');
            }
        }

        nav.appendChild(link);
    }
}

let state = {
    boysScore: 0,
    girlsScore: 0,
    boysErrors: 0,
    girlsErrors: 0,
    openedAnswers: [],
    currentTurn: null, // 'boys' або 'girls'
    roundOver: false
};

// Завантажуємо стан
const savedState = JSON.parse(localStorage.getItem(storageKey));
if (savedState) {
    state = savedState;
}

function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
}

function renderScores() {
    document.getElementById('score-boys').textContent = state.boysScore;
    document.getElementById('score-girls').textContent = state.girlsScore;
    document.getElementById('errors-boys').textContent = state.boysErrors;
    document.getElementById('errors-girls').textContent = state.girlsErrors;
    document.getElementById('turn').textContent = state.currentTurn
        ? (state.currentTurn === 'boys' ? 'З досвідом' : 'З перспективою')
        : '—';

    // Прибираємо старі класи
    document.body.classList.remove('boys-turn', 'girls-turn', 'round-over');

    if (state.roundOver) {
        document.body.classList.add('round-over');
    } else if (state.currentTurn === 'boys') {
        document.body.classList.add('boys-turn');
    } else if (state.currentTurn === 'girls') {
        document.body.classList.add('girls-turn');
    }
}

if (!number) {
    document.getElementById('question').textContent = 'Номер питання не вказано';
} else {
    fetch('js/data.json')
        .then(response => response.json())
        .then(data => {
            renderRoundsNav(Object.keys(data).length);
            const item = data[number];
            if (item && item.question) {
                document.getElementById('question').textContent = item.question;

                const answersList = document.getElementById('answers');

                // Якщо хід ще не визначено, показуємо кнопки вибору
                if (!state.currentTurn) {
                    document.getElementById('start-choice').style.display = 'flex';
                } else {
                    document.getElementById('start-choice').style.display = 'none';
                }

                document.getElementById('start-boys').addEventListener('click', () => {
                    state.currentTurn = 'boys';
                    saveState();
                    renderScores();
                    document.getElementById('start-choice').style.display = 'none';
                });

                document.getElementById('start-girls').addEventListener('click', () => {
                    state.currentTurn = 'girls';
                    saveState();
                    renderScores();
                    document.getElementById('start-choice').style.display = 'none';
                });

                // Рендер відповідей
                Object.entries(item.answers).forEach(([key, answer], index) => {
                    const li = document.createElement('li');
                    li.dataset.name = answer.name;
                    li.dataset.points = answer.points;
                    li.dataset.id = key;
                    li.classList.add('btn__secondary', 'btn');

                    if (state.openedAnswers.includes(key)) {
                        li.textContent = `${answer.name} — ${answer.points} балів`;
                        li.classList.add('disabled');
                    } else {
                        li.textContent = `${index + 1}. Натисни, щоб показати`;
                    }

                    li.addEventListener('click', () => {
                        if (state.openedAnswers.includes(key)) return;

                        li.textContent = `${answer.name} — ${answer.points} балів`;
                        li.classList.add('disabled');
                        state.openedAnswers.push(key);

                        if (!state.roundOver) {
                            if (state.currentTurn === 'boys') {
                                state.boysScore += answer.points;
                            } else {
                                state.girlsScore += answer.points;
                            }
                            // Після правильної відповіді — інший хід
                            state.currentTurn = state.currentTurn === 'boys' ? 'girls' : 'boys';
                        }

                        saveState();
                        renderScores();
                    });

                    answersList.appendChild(li);
                });

                // Обробка помилок
                document.getElementById('mistake-btn').addEventListener('click', () => {
                    if (state.roundOver) return;

                    if (state.currentTurn === 'boys') {
                        state.boysErrors++;
                        if (state.boysErrors >= 3) {
                            state.girlsScore += state.boysScore;
                            state.boysScore = 0;
                            state.roundOver = true;
                        } else {
                            state.currentTurn = 'girls';
                        }
                    } else {
                        state.girlsErrors++;
                        if (state.girlsErrors >= 3) {
                            state.boysScore += state.girlsScore;
                            state.girlsScore = 0;
                            state.roundOver = true;
                        } else {
                            state.currentTurn = 'boys';
                        }
                    }

                    saveState();
                    renderScores();
                });

                renderScores();
            } else {
                document.getElementById('question').textContent = 'Дані не знайдено';
            }
        })
        .catch(error => console.error('Помилка завантаження JSON:', error));
}

// Завершити раунд
document.getElementById('end-round-btn').addEventListener('click', () => {
    state.roundOver = true;
    saveState();
    renderScores();
});


document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".pass-form");
    const container = document.querySelector(".container");
    const input = document.getElementById("pass");
    const button = document.getElementById("ok");

    // Перевірка при завантаженні сторінки
    const savedPass = localStorage.getItem("pass");
    if (savedPass === "gameq19") {
      form.style.display = "none";
      container.style.display = "flex";
    }

    // Обробка натискання кнопки
    button.addEventListener("click", () => {
      const enteredPass = input.value.trim();
      localStorage.setItem("pass", enteredPass);

      if (enteredPass === "gameq19") {
        form.style.display = "none";
        container.style.display = "flex";
      } else {
        alert("Невірний пароль ❌");
      }
    });
  });