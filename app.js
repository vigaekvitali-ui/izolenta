// Инициализация Gun.js (используем публичные пиры для GitHub Pages)
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const userState = { role: 'guest', name: 'Механик #' + Math.floor(Math.random()*1000) };

// Контент страниц
const pages = {
    home: `
        <h2>📋 КОНСТИТУЦИЯ АРТЕЛИ</h2>
        <div class="rules-grid">
            <p>1. ТБ — не догма, а рекомендация.</p>
            <p>2. Закон лишней детали: остались болты — ты гений оптимизации.</p>
            <p>3. Синяя изолента лечит всё.</p>
        </div>
        <h3>Табель о рангах</h3>
        <ul>
            <li>Личинка инженера</li>
            <li>Гранд-мастер Синей Катушки</li>
        </ul>
    `,
    chat: `
        <div id="chat-window" style="height:300px; overflow-y:auto; border:1px solid var(--blue-tape)"></div>
        <input id="chat-input" type="text" placeholder="Матерись по ГОСТу...">
        <button class="btn-launch" onclick="sendMessage()">ПУСК</button>
    `,
    stash: `
        <h2>💰 ЗАНАЧКА</h2>
        <div class="tabs">
            <button>Биржа Дефицита</button>
            <button>Вредные советы</button>
        </div>
    `,
    tech: `
        <h2>🔧 СПРАВОЧНИК</h2>
        <input type="text" placeholder="Поиск резьбы или кода...">
        <div id="tech-results">Метрическая резьба М12: шаг 1.75...</div>
    `
};

function showPage(pageId) {
    const container = document.getElementById('app-content');
    container.innerHTML = pages[pageId] || "<h2>404: Система дала течь. Мотай изоленту.</h2>";
    
    if(pageId === 'chat') initChat();
}

// Работа с чатом через Gun.js
function initChat() {
    gun.get('artel-chat').map().once((data) => {
        if(data && data.msg) {
            const div = document.createElement('div');
            div.innerText = `${data.user}: ${data.msg}`;
            document.getElementById('chat-window').appendChild(div);
        }
    });
}

function sendMessage() {
    const msg = document.getElementById('chat-input').value;
    gun.get('artel-chat').set({ user: userState.name, msg: msg });
    document.getElementById('chat-input').value = '';
}

// Бесконечный календарь
function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    const quotes = [
        "Если что-то может пойти не так, оно пойдет не так (Мерфи)",
        "Не умножай сущности без необходимости (Оккам)"
    ];
    document.getElementById('daily-quote').innerText = quotes[Math.floor(Math.random()*quotes.length)];
    
    // Упрощенная генерация дней
    for(let i=1; i<=28; i++) {
        const day = document.createElement('span');
        day.innerText = i;
        grid.appendChild(day);
    }
}

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

window.onload = () => {
    showPage('home');
    initCalendar();
};
