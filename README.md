# Focus Board — Productivity Dashboard

A clean, minimal productivity dashboard built with **vanilla HTML, CSS, and JavaScript**. No frameworks, no backend — all data is stored in your browser using the Local Storage API.

## ✨ Features

### Required MVP
- **Greeting** — live clock and date, with a greeting that changes by time of day (morning / afternoon / evening / night).
- **Focus Timer** — a 25-minute Pomodoro-style timer with Start, Stop, and Reset buttons. A notification fires when the session completes.
- **To-Do List** — add, edit (double-click or ✏️), mark as done, and delete tasks. Tasks are saved in Local Storage and survive page reloads.
- **Quick Links** — save favorite websites as buttons that open in a new tab. Links are stored in Local Storage.

### Bonus features
- **Sort tasks** — sort by newest, oldest, alphabetical (A–Z / Z–A), or uncompleted-first.
- **Duplicate prevention** — adding a task that already exists (case-insensitive) shows a popup warning.
- **Light / Dark mode** — a theme toggle that remembers your choice and respects your OS preference on first visit.

## 📁 Project structure

```
.
├── index.html        # App structure
├── css/
│   └── style.css     # Single stylesheet (theming via CSS variables)
└── js/
    └── script.js     # Single script (all app logic)
```

Per the project rules there is exactly **one** CSS file in `css/` and **one** JavaScript file in `js/`.

## 🚀 Run locally

Just open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari). No build step or server required.

## 🔧 Tech stack

- HTML for structure
- CSS for styling (CSS custom properties for light/dark theming)
- Vanilla JavaScript (no React/Vue/etc.)
- Browser Local Storage API for persistence

## 📦 Deploy with GitHub Pages

1. Use **GitHub Desktop** to commit and push this repository to GitHub.
2. On GitHub, open the repo → **Settings** → **Pages**.
3. Under **Source**, choose the `main` branch and `/ (root)` folder, then **Save**.
4. Wait a moment for the build — your site will be live at
   `https://<your-username>.github.io/<your-repo-name>/`.
