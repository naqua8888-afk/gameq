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
        ? (state.currentTurn === 'boys' ? 'Хлопці' : 'Дівчата')
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


/*  clock */
const hours = document.querySelector('.hours');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

/*  play button */
const play = document.querySelector('.play');
const pause = document.querySelector('.pause');
const playBtn = document.querySelector('.circle__btn');
const wave1 = document.querySelector('.circle__back-1');
const wave2 = document.querySelector('.circle__back-2');

/*  rate slider */
const container = document.querySelector('.slider__box');
const btn = document.querySelector('.slider__btn');
const color = document.querySelector('.slider__color');
const tooltip = document.querySelector('.slider__tooltip');

clock = () => {
    let today = new Date();
    let h = (today.getHours() % 12) + today.getMinutes() / 59; // 22 % 12 = 10pm
    let m = today.getMinutes(); // 0 - 59
    let s = today.getSeconds(); // 0 - 59

    h *= 30; // 12 * 30 = 360deg
    m *= 6;
    s *= 6; // 60 * 6 = 360deg

    rotation(hours, h);
    rotation(minutes, m);
    rotation(seconds, s);

    // call every second
    setTimeout(clock, 500);
}

rotation = (target, val) => {
    target.style.transform =  `rotate(${val}deg)`;
}

window.onload = clock();

dragElement = (target, btn) => {
    target.addEventListener('mousedown', (e) => {
        onMouseMove(e);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    onMouseMove = (e) => {
        e.preventDefault();
        let targetRect = target.getBoundingClientRect();
        let x = e.pageX - targetRect.left + 10;
        if (x > targetRect.width) { x = targetRect.width};
        if (x < 0){ x = 0};
        btn.x = x - 10;
        btn.style.left = btn.x + 'px';

        // get the position of the button inside the container (%)
        let percentPosition = (btn.x + 10) / targetRect.width * 100;

        // color width = position of button (%)
        color.style.width = percentPosition + "%";

        // move the tooltip when button moves, and show the tooltip
        tooltip.style.left = btn.x - 5 + 'px';
        tooltip.style.opacity = 1;

        // show the percentage in the tooltip
        tooltip.textContent = Math.round(percentPosition) + '%';
    };

    onMouseUp  = (e) => {
        window.removeEventListener('mousemove', onMouseMove);
        tooltip.style.opacity = 0;

        btn.addEventListener('mouseover', function() {
            tooltip.style.opacity = 1;
        });

        btn.addEventListener('mouseout', function() {
            tooltip.style.opacity = 0;
        });
    };
};

dragElement(container, btn);

/*  play button  */
playBtn.addEventListener('click', function(e) {
    e.preventDefault();
    pause.classList.toggle('visibility');
    play.classList.toggle('visibility');
    playBtn.classList.toggle('shadow');
    wave1.classList.toggle('paused');
    wave2.classList.toggle('paused');
});