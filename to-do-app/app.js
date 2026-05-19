// app.js — TaskFlow | Gerenciador de Tarefas
// Vanilla JS + localStorage | Sem dependências externas

(function () {
  'use strict';

  // ─── DB ──────────────────────────────────────────────────────
  const DB_KEY = 'db';
  const SESSION_KEY = 'currentUser';

  function getDb() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return { users: [], todos: [] };
    return JSON.parse(raw);
  }

  function saveDb(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(user) {
    const { password, ...safe } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // ─── UI HELPERS ───────────────────────────────────────────────
  const screens = {
    login: document.getElementById('screen-login'),
    register: document.getElementById('screen-register'),
    app: document.getElementById('screen-app'),
  };

  function switchScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    clearAllErrors();
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function clearAllErrors() {
    document.querySelectorAll('[id$="-error"]').forEach(el => {
      el.textContent = '';
      el.classList.add('hidden');
    });
  }

  // ─── AUTH ─────────────────────────────────────────────────────
  function login(email, password) {
    clearAllErrors();
    let valid = true;

    if (!email.trim()) { showError('login-email-error', 'Informe seu e-mail.'); valid = false; }
    if (!password) { showError('login-password-error', 'Informe sua senha.'); valid = false; }
    if (!valid) return;

    const db = getDb();
    const user = db.users.find(u => u.email === email.trim().toLowerCase());

    if (!user) { showError('login-general-error', 'E-mail não cadastrado.'); return; }
    if (user.password !== password) { showError('login-general-error', 'Senha incorreta. Tente novamente.'); return; }

    setSession(user);
    openApp();
  }

  function register(name, email, password) {
    clearAllErrors();
    let valid = true;

    if (!name.trim()) { showError('register-name-error', 'Informe seu nome.'); valid = false; }
    if (!email.trim()) { showError('register-email-error', 'Informe seu e-mail.'); valid = false; }
    if (!password) { showError('register-password-error', 'Informe uma senha.'); valid = false; }
    else if (password.length < 6) { showError('register-password-error', 'A senha deve ter pelo menos 6 caracteres.'); valid = false; }
    if (!valid) return;

    const db = getDb();
    const normalEmail = email.trim().toLowerCase();

    if (db.users.some(u => u.email === normalEmail)) {
      showError('register-general-error', 'Este e-mail já está em uso.');
      return;
    }

    const newUser = {
      id: String(Date.now()),
      name: name.trim(),
      email: normalEmail,
      password,
    };

    db.users.push(newUser);
    saveDb(db);
    setSession(newUser);
    openApp();
  }

  function logout() {
    clearSession();
    document.getElementById('login-form').reset();
    switchScreen('login');
  }

  // ─── APP / TODOS ──────────────────────────────────────────────
  function openApp() {
    const user = getSession();
    document.getElementById('user-greeting').textContent = user.name;
    renderTodos();
    switchScreen('app');
  }

  function addTodo(title, type, description) {
    clearAllErrors();

    if (!title.trim()) {
      showError('todo-title-error', 'O título é obrigatório.');
      return false;
    }

    const user = getSession();
    const db = getDb();

    const todo = {
      id: String(Date.now()),
      userId: user.email,
      title: title.trim(),
      type,
      description: description.trim(),
      done: false,
      createdAt: Date.now(),
    };

    db.todos.push(todo);
    saveDb(db);
    renderTodos();
    return true;
  }

  function completeTodo(id) {
    const db = getDb();
    const todo = db.todos.find(t => t.id === id);
    if (todo) {
      todo.done = true;
      saveDb(db);
      renderTodos();
    }
  }

  function getUserTodos() {
    const user = getSession();
    const db = getDb();
    const all = db.todos.filter(t => t.userId === user.email);
    const pending = all.filter(t => !t.done).sort((a, b) => b.createdAt - a.createdAt);
    const done = all.filter(t => t.done).sort((a, b) => b.createdAt - a.createdAt);
    return [...pending, ...done];
  }

  const BADGE = {
    'Trabalho': 'badge-work',
    'Pessoal': 'badge-personal',
    'Estudos': 'badge-study',
  };

  function renderTodos() {
    const list = document.getElementById('todo-list');
    const countEl = document.getElementById('todo-count');
    const todos = getUserTodos();

    const pending = todos.filter(t => !t.done).length;
    countEl.textContent = `${pending} pendente${pending !== 1 ? 's' : ''} · ${todos.length} total`;

    if (todos.length === 0) {
      list.innerHTML = `
        <div class="glass-card rounded-2xl p-10 text-center">
          <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <p class="text-slate-400 text-sm">Nenhuma tarefa cadastrada ainda.</p>
          <p class="text-slate-600 text-xs mt-1">Adicione sua primeira tarefa acima.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = todos.map(todo => {
      const badgeClass = BADGE[todo.type] || 'badge-work';
      const doneClass = todo.done ? 'done' : '';
      const btnDisabled = todo.done ? 'disabled opacity-0 pointer-events-none' : '';
      const description = todo.description
        ? `<p class="text-slate-400 text-xs mt-2 leading-relaxed">${escapeHtml(todo.description)}</p>`
        : '';

      return `
        <div class="glass-card todo-card ${doneClass} rounded-xl p-4 fade-in" data-id="${todo.id}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="todo-title font-medium text-sm text-slate-200 truncate">${escapeHtml(todo.title)}</span>
                <span class="${badgeClass} text-xs px-2 py-0.5 rounded-full font-medium shrink-0">${escapeHtml(todo.type)}</span>
                ${todo.done ? '<span class="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full border border-white/5">Concluída</span>' : ''}
              </div>
              ${description}
            </div>
            <button
              class="btn-complete text-slate-400 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${btnDisabled}"
              onclick="App.completeTodo('${todo.id}')"
              ${todo.done ? 'disabled' : ''}
              aria-label="Concluir tarefa: ${escapeHtml(todo.title)}"
            >
              ${todo.done ? '✓' : 'Concluir'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────────
  document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('register-form').reset();
    switchScreen('register');
  });

  document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('login-form').reset();
    switchScreen('login');
  });

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    login(
      document.getElementById('login-email').value,
      document.getElementById('login-password').value
    );
  });

  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    register(
      document.getElementById('register-name').value,
      document.getElementById('register-email').value,
      document.getElementById('register-password').value
    );
  });

  document.getElementById('logout-btn').addEventListener('click', logout);

  document.getElementById('todo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = addTodo(
      document.getElementById('todo-title').value,
      document.getElementById('todo-type').value,
      document.getElementById('todo-description').value
    );
    if (ok) {
      document.getElementById('todo-form').reset();
    }
  });

  // ─── INIT ─────────────────────────────────────────────────────
  if (!localStorage.getItem(DB_KEY)) {
    saveDb({ users: [], todos: [] });
  }

  const session = getSession();
  if (session) {
    openApp();
  } else {
    switchScreen('login');
  }

  // Expose completeTodo globally for inline onclick handlers
  window.App = { completeTodo };

})();
