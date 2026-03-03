'use strict';

(function () {
  const STORAGE_KEY = 'todo_tasks_v1';
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
  function generateId() {
    return (
      't_' +
      Math.random().toString(36).slice(2, 8) +
      Date.now().toString(36).slice(-4)
    );
  }

  const form = document.getElementById('task-form');
  const formTitle = document.getElementById('form-title');
  const inputId = document.getElementById('task-id');
  const inputTopic = document.getElementById('topic');
  const inputPriority = document.getElementById('priority');
  const inputStatus = document.getElementById('status');
  const inputDescription = document.getElementById('description');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const list = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');

  // 🔽 Prioriteettisuodatusnapit
  const filterContainer = document.createElement('div');
  filterContainer.id = 'filter-container';
  ['all', 'high', 'medium', 'low'].forEach((prio) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.filter = prio;
    btn.textContent =
      prio === 'all'
        ? 'Show All'
        : prio.charAt(0).toUpperCase() + prio.slice(1);
    filterContainer.appendChild(btn);
  });
  list.parentNode.insertBefore(filterContainer, list);

  let tasks = loadTasks();
  let currentFilter = 'all'; // 🔹 aktiivinen suodatin

  function render() {
    list.innerHTML = '';
    const visibleTasks =
      currentFilter === 'all'
        ? tasks
        : tasks.filter((t) => t.priority === currentFilter);

    if (!visibleTasks.length) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    visibleTasks
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const prioRank = { high: 0, medium: 1, low: 2 };
        if (prioRank[a.priority] !== prioRank[b.priority]) {
          return prioRank[a.priority] - prioRank[b.priority];
        }
        return b.createdAt - a.createdAt;
      })
      .forEach((t) => {
        const li = document.createElement('li');
        li.className = 'task' + (t.completed ? ' done' : '');
        li.dataset.id = t.id;
        li.innerHTML = `
          <div>
            <div class="title">${escapeHtml(t.topic)}</div>
            <div class="desc">${escapeHtml(t.description || '')}</div>
          </div>
          <div class="meta">
            <span class="badge prio-${t.priority}">
              <span class="dot"></span>
              ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
            </span>
          </div>
          <div class="meta">
            ${badgeForStatus(t.status)}
          </div>
          <div class="controls">
            <button data-action="edit" class="secondary">Edit</button>
            <button data-action="complete" class="${t.completed ? 'secondary' : ''}">
              ${t.completed ? 'Undo' : 'Complete'}
            </button>
            <button data-action="delete" class="danger">Delete</button>
          </div>
        `;
        list.appendChild(li);
      });
  }

  function badgeForStatus(status) {
    const label =
      {
        todo: 'To do',
        'in-progress': 'In progress',
        blocked: 'Blocked',
        done: 'Done',
      }[status] || status;
    return `<span class="badge">${label}</span>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const now = Date.now();
    const payload = {
      topic: inputTopic.value.trim(),
      priority: inputPriority.value,
      status: inputStatus.value,
      description: inputDescription.value.trim(),
    };
    if (!payload.topic) {
      inputTopic.focus();
      return;
    }

    if (inputId.value) {
      const idx = tasks.findIndex((t) => t.id === inputId.value);
      if (idx !== -1) {
        tasks[idx] = {
          ...tasks[idx],
          ...payload,
          completed: payload.status === 'done' ? true : tasks[idx].completed,
          updatedAt: now,
        };
      }
    } else {
      const newTask = {
        id: generateId(),
        ...payload,
        completed: payload.status === 'done',
        createdAt: now,
        updatedAt: now,
      };
      tasks.push(newTask);
    }
    saveTasks(tasks);
    resetForm();
    render();
  });

  resetBtn.addEventListener('click', resetForm);

  function resetForm() {
    formTitle.textContent = 'Create Task';
    inputId.value = '';
    form.reset();
    inputPriority.value = 'medium';
    inputStatus.value = 'todo';
    saveBtn.textContent = 'Save Task';
  }

  list.addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName !== 'BUTTON') return;
    const action = target.dataset.action;
    const li = target.closest('.task');
    if (!li) return;
    const id = li.dataset.id;
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return;

    if (action === 'edit') {
      const t = tasks[idx];
      formTitle.textContent = 'Edit Task';
      inputId.value = t.id;
      inputTopic.value = t.topic;
      inputPriority.value = t.priority;
      inputStatus.value = t.status;
      inputDescription.value = t.description || '';
      saveBtn.textContent = 'Update Task';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (action === 'complete') {
      const t = tasks[idx];
      const nextCompleted = !t.completed;
      tasks[idx] = {
        ...t,
        completed: nextCompleted,
        status: nextCompleted
          ? 'done'
          : t.status === 'done'
            ? 'todo'
            : t.status,
        updatedAt: Date.now(),
      };
      saveTasks(tasks);
      render();
    }
    if (action === 'delete') {
      const confirmDelete = window.confirm('Delete this task?');
      if (!confirmDelete) return;
      tasks.splice(idx, 1);
      saveTasks(tasks);
      render();
    }
  });

  // 🔹 Prioriteettisuodatuksen logiikka
  filterContainer.addEventListener('click', (e) => {
    const btn = e.target;
    if (!btn.dataset.filter) return;
    currentFilter = btn.dataset.filter;
    render();
  });

  render();
})();
