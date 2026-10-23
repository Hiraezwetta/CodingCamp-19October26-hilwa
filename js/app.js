/* ============================================================
   Focus Board — Productivity Dashboard
   Single vanilla-JS file. No frameworks. Data in LocalStorage.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Storage keys ---------- */
  const STORAGE = {
    todos: "focusboard.todos",
    links: "focusboard.links",
    theme: "focusboard.theme",
  };

  /* ---------- DOM helpers ---------- */
  const $ = (id) => document.getElementById(id);

  /* ---------- Greeting & clock ---------- */
  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    $("clockText").textContent = `${String(h).padStart(2, "0")}:${m}:${s}`;

    const dateOpts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    $("dateText").textContent = now.toLocaleDateString(undefined, dateOpts);

    let greeting = "Good night";
    if (h >= 5 && h < 12) greeting = "Good morning";
    else if (h >= 12 && h < 17) greeting = "Good afternoon";
    else if (h >= 17 && h < 21) greeting = "Good evening";
    $("greetingText").textContent = greeting;
  }

  /* ---------- Theme (light / dark) ---------- */
  function getStoredTheme() {
    return localStorage.getItem(STORAGE.theme);
  }

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function initTheme() {
    // 1) Use saved preference if any, else follow the OS setting.
    const stored = getStoredTheme();
    if (stored) {
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE.theme, next);
  }

  /* ---------- Popup warning (duplicate tasks) ---------- */
  let popupTimer = null;
  function showPopup(message) {
    $("popupMessage").textContent = message;
    $("popup").hidden = false;
    // Auto-close after 4s as a safety net (in addition to the OK button).
    clearTimeout(popupTimer);
    popupTimer = setTimeout(closePopup, 4000);
  }

  function closePopup() {
    $("popup").hidden = true;
    clearTimeout(popupTimer);
  }

  /* ============================================================
     TO-DO LIST
     ============================================================ */
  let todos = [];
  let currentSort = "newest";

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE.todos);
      todos = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Could not parse saved todos:", e);
      todos = [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE.todos, JSON.stringify(todos));
  }

  // Case-insensitive duplicate check (ignores done/undone state).
  function isDuplicate(text) {
    const normalized = text.trim().toLowerCase();
    return todos.some((t) => t.text.trim().toLowerCase() === normalized);
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isDuplicate(trimmed)) {
      showPopup("That task already exists! Please enter a different one.");
      return;
    }

    todos.push({
      id: Date.now() + Math.random().toString(16).slice(2),
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    });
    saveTodos();
    renderTodos();
  }

  function editTodo(id, newText) {
    const trimmed = newText.trim();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (!trimmed) {
      // Empty edit => delete the task.
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      renderTodos();
      return;
    }

    // Duplicate check that ignores the task being edited itself.
    const normalized = trimmed.toLowerCase();
    const clash = todos.some(
      (t) => t.id !== id && t.text.trim().toLowerCase() === normalized
    );
    if (clash) {
      showPopup("Another task already has that name!");
      renderTodos(); // restore original text
      return;
    }

    todo.text = trimmed;
    saveTodos();
    renderTodos();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.done = !todo.done;
    saveTodos();
    renderTodos();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    renderTodos();
  }

  function getSortedTodos() {
    const copy = [...todos];
    switch (currentSort) {
      case "oldest":
        return copy.sort((a, b) => a.createdAt - b.createdAt);
      case "az":
        return copy.sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: "base" }));
      case "za":
        return copy.sort((a, b) => b.text.localeCompare(a.text, undefined, { sensitivity: "base" }));
      case "status":
        // Uncompleted first, then completed; within each group keep newest first.
        return copy.sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return b.createdAt - a.createdAt;
        });
      case "newest":
      default:
        return copy.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  function renderTodos() {
    const list = $("todoList");
    list.innerHTML = "";

    const sorted = getSortedTodos();
    sorted.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.done ? " done" : "");
      li.dataset.id = todo.id;

      // Checkbox (mark done)
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.checked = todo.done;
      checkbox.setAttribute("aria-label", "Mark task done");
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      // Task text (double-click or Edit button to edit)
      const span = document.createElement("span");
      span.className = "todo-text";
      span.textContent = todo.text;
      span.title = "Double-click to edit";
      span.tabIndex = 0;
      span.addEventListener("dblclick", () => startEdit(li, todo));
      span.addEventListener("keydown", (e) => {
        if (e.key === "Enter") startEdit(li, todo);
      });

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "todo-action edit";
      editBtn.type = "button";
      editBtn.textContent = "✏️";
      editBtn.title = "Edit task";
      editBtn.setAttribute("aria-label", "Edit task");
      editBtn.addEventListener("click", () => startEdit(li, todo));

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.className = "todo-action delete";
      delBtn.type = "button";
      delBtn.textContent = "🗑️";
      delBtn.title = "Delete task";
      delBtn.setAttribute("aria-label", "Delete task");
      delBtn.addEventListener("click", () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(delBtn);
      list.appendChild(li);
    });

    $("todoEmpty").style.display = todos.length ? "none" : "block";
  }

  // Inline editing: replace the text span with an input.
  function startEdit(li, todo) {
    const span = li.querySelector(".todo-text");
    if (!span) return;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "todo-edit-input";
    input.value = todo.text;
    input.maxLength = 120;

    li.replaceChild(input, span);
    input.focus();
    input.select();

    const commit = () => editTodo(todo.id, input.value);
    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") {
        input.removeEventListener("blur", commit);
        renderTodos(); // discard edits
      }
    });
  }

  /* ============================================================
     QUICK LINKS
     ============================================================ */
  let links = [];

  function loadLinks() {
    try {
      const raw = localStorage.getItem(STORAGE.links);
      links = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Could not parse saved links:", e);
      links = [];
    }
  }

  function saveLinks() {
    localStorage.setItem(STORAGE.links, JSON.stringify(links));
  }

  function normalizeUrl(url) {
    let u = url.trim();
    if (!u) return "";
    // Add https:// if no protocol is present.
    if (!/^https?:\/\//i.test(u)) {
      u = "https://" + u;
    }
    return u;
  }

  function addLink(name, url) {
    const cleanName = name.trim();
    const cleanUrl = normalizeUrl(url);
    if (!cleanName || !cleanUrl) return;

    links.push({ id: Date.now() + Math.random().toString(16).slice(2), name: cleanName, url: cleanUrl });
    saveLinks();
    renderLinks();
  }

  function removeLink(id) {
    links = links.filter((l) => l.id !== id);
    saveLinks();
    renderLinks();
  }

  function renderLinks() {
    const list = $("linksList");
    list.innerHTML = "";

    links.forEach((link) => {
      const chip = document.createElement("a");
      chip.className = "link-chip";
      chip.href = link.url;
      chip.target = "_blank";
      chip.rel = "noopener noreferrer";
      chip.textContent = link.name;
      chip.title = link.url;

      const remove = document.createElement("button");
      remove.className = "link-remove";
      remove.type = "button";
      remove.textContent = "✕";
      remove.title = "Remove link";
      remove.setAttribute("aria-label", `Remove ${link.name}`);
      remove.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeLink(link.id);
      });

      chip.appendChild(remove);
      list.appendChild(chip);
    });

    $("linksEmpty").style.display = links.length ? "none" : "block";
  }

  /* ============================================================
     FOCUS TIMER
     ============================================================ */
  const FOCUS_SECONDS = 25 * 60;
  let timerSeconds = FOCUS_SECONDS;
  let timerInterval = null;
  let timerRunning = false;

  function formatTime(totalSeconds) {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function renderTimer() {
    $("timerDisplay").textContent = formatTime(timerSeconds);
    $("timerDisplay").classList.toggle("running", timerRunning);
  }

  function timerTick() {
    if (timerSeconds > 0) {
      timerSeconds -= 1;
      renderTimer();
    }
    if (timerSeconds === 0) {
      stopTimer();
      $("timerDisplay").classList.add("done");
      $("timerHint").textContent = "Focus session complete! Great work. 🎉";
      // Gentle notification if the browser supports it.
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Focus session complete!", { body: "Great work. Take a short break." });
      }
    }
  }

  function startTimer() {
    if (timerRunning) return;
    if (timerSeconds === 0) timerSeconds = FOCUS_SECONDS;
    $("timerDisplay").classList.remove("done");
    timerRunning = true;
    renderTimer();
    $("timerHint").textContent = "Stay focused — you've got this!";
    timerInterval = setInterval(timerTick, 1000);
    // Ask for notification permission so the end-of-session alert works.
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function stopTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    renderTimer();
    if (timerSeconds > 0 && timerSeconds !== FOCUS_SECONDS) {
      $("timerHint").textContent = "Paused. Press Start to continue.";
    }
  }

  function resetTimer() {
    stopTimer();
    timerSeconds = FOCUS_SECONDS;
    $("timerDisplay").classList.remove("done", "running");
    renderTimer();
    $("timerHint").textContent = "Press Start to begin a 25-minute focus session.";
  }

  /* ============================================================
     EVENT WIRING & INIT
     ============================================================ */
  function initEvents() {
    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Theme
    $("themeToggle").addEventListener("click", toggleTheme);

    // Popup close
    $("popupClose").addEventListener("click", closePopup);
    $("popup").addEventListener("click", (e) => {
      if (e.target === $("popup")) closePopup();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("popup").hidden) closePopup();
    });

    // To-Do: add
    $("todoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("todoInput");
      addTodo(input.value);
      input.value = "";
      input.focus();
    });

    // To-Do: sort
    $("todoSort").addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderTodos();
    });

    // Quick links: add
    $("linkForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = $("linkName");
      const urlInput = $("linkUrl");
      if (!nameInput.value.trim() || !urlInput.value.trim()) return;
      addLink(nameInput.value, urlInput.value);
      nameInput.value = "";
      urlInput.value = "";
      nameInput.focus();
    });

    // Timer controls
    $("timerStart").addEventListener("click", startTimer);
    $("timerStop").addEventListener("click", stopTimer);
    $("timerReset").addEventListener("click", resetTimer);
  }

  function init() {
    initTheme();
    loadTodos();
    loadLinks();
    renderTodos();
    renderLinks();
    renderTimer();
    initEvents();
  }

  // Run after the DOM is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
