// 🔽 Tämä rivi kertoo Vitestille että käytetään jsdomia
// @vitest-environment jsdom

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('Todo App – Acceptance criteria', () => {
  async function loadApp() {
    await import('../public/app.js');
  }

  beforeEach(async () => {
    // Nollaa moduulicache (IIFE suorittuu uudelleen)
    vi.resetModules();

    // Rakenna testin DOM
    document.body.innerHTML = `
      <form id="task-form">
        <h2 id="form-title"></h2>
        <input id="task-id" />
        <input id="topic" />
        <select id="priority">
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <select id="status">
          <option value="todo">todo</option>
          <option value="in-progress">in-progress</option>
          <option value="blocked">blocked</option>
          <option value="done">done</option>
        </select>
        <textarea id="description"></textarea>
        <button id="save-btn" type="submit">Save</button>
        <button id="reset-btn" type="button">Reset</button>
      </form>

      <ul id="task-list"></ul>
      <div id="empty-state"></div>
    `;

    localStorage.clear();
    vi.restoreAllMocks();

    await loadApp();
  });

  // 1️⃣ Luo tehtävä nimellä
  test('User can create a new task with at least a name', () => {
    document.getElementById('topic').value = 'My task';

    document
      .getElementById('task-form')
      .dispatchEvent(new Event('submit', { bubbles: true }));

    const tasks = document.querySelectorAll('.task');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].textContent).toContain('My task');
  });

  // 2️⃣ Lisää vapaaehtoinen kuvaus
  test('User can add optional description', () => {
    document.getElementById('topic').value = 'Task with description';
    document.getElementById('description').value = 'Optional details';

    document
      .getElementById('task-form')
      .dispatchEvent(new Event('submit', { bubbles: true }));

    const description = document.querySelector('.task .desc');
    expect(description.textContent).toContain('Optional details');
  });

  // 3️⃣ Muokkaa tehtävää
  test('User can edit existing task', () => {
    document.getElementById('topic').value = 'Original';

    document
      .getElementById('task-form')
      .dispatchEvent(new Event('submit', { bubbles: true }));

    document.querySelector('button[data-action="edit"]').click();

    document.getElementById('topic').value = 'Updated';
    document.getElementById('description').value = 'Updated description';

    document
      .getElementById('task-form')
      .dispatchEvent(new Event('submit', { bubbles: true }));

    const task = document.querySelector('.task');
    expect(task.textContent).toContain('Updated');
    expect(task.textContent).toContain('Updated description');
  });

  // 4️⃣ Poista tehtävä
  test('User can delete a task', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    document.getElementById('topic').value = 'Delete me';

    document
      .getElementById('task-form')
      .dispatchEvent(new Event('submit', { bubbles: true }));

    document.querySelector('button[data-action="delete"]').click();

    const tasks = document.querySelectorAll('.task');
    expect(tasks).toHaveLength(0);
  });

  // 5️⃣ Näe lista omista tehtävistä
  test('User can see list of their tasks', () => {
    document.getElementById('topic').value = 'Task 1';
    document
      .getElementById('task-form')
      .dispatchEvent(new Event('submit', { bubbles: true }));

    document.getElementById('topic').value = 'Task 2';
    document
      .getElementById('task-form')
      .dispatchEvent(new Event('submit', { bubbles: true }));

    const tasks = document.querySelectorAll('.task');
    expect(tasks).toHaveLength(2);
  });
});
