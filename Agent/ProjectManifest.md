# Project Manifest - Study Buddy

## 1. Project Identity
**Name**: Study Buddy
**Description**: A Progressive Web App (PWA) designed to provide a fast, offline-capable quiz experience for university students, categorizing questions by department, course, and exam type.
**Platform**: Progressive Web App (Mobile-first, iOS-style UI)

## 2. Technology Stack & Architecture
- **Core**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (Variables, Flexbox/Grid)
- **App Type**: PWA (Progressive Web App)
- **Data Storage**: Local JSON files (modularized per-course in `data/courses/`).
- **Offline Support**: Service Worker (`sw.js`) with Cache API for static assets and dynamic dynamic JSON caching.
- **State Management**: LocalStorage for persisting user selections and theming (`study_buddy_state`).

## 3. Directory Structure
```
/
├── index.html          # Main application entry point
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── data/               # Data files
│   ├── database.json   # Course Manifest
│   └── courses/        # Individual course questions
├── assets/             # Static assets
│   ├── css/style.css   # Main stylesheet (iOS-style)
│   ├── js/app.js       # Main application logic
│   └── img/            # Icons and graphics
├── Agent/              # AI Agent context and rules
│   └── Personality/    # Persona definitions
└── ProjectManifest.md  # Ground Truth (This file)
```

## 4. Fundamental Rules & "Never" List
- **Never** use complex front-end frameworks (React, Vue, Alpine) unless explicitly authorized. Keep it Vanilla HTML/JS.
- **Never** load the entire dataset at once. Use the defined lazy-loading architecture with `fetch`.
- **Never** use arbitrary CSS utility classes (like Tailwind) unless migrating the entire `style.css` systematically. Stick to the custom `ios-` prefixed classes.
- **Always** ensure haptic feedback is triggered on interactive elements (using `navigator.vibrate` wrapper).
- **Always** maintain the `safe-area` classes to support modern mobile notches.
- **Always** ensure new features consider offline capabilities via the Service Worker.

## 5. Coding Standards
- **JavaScript**: Use modern ES6+ (let/const, async/await, arrow functions, destructuring).
- **CSS**: heavily utilize custom properties (`--ios-blue`, `--bg-primary`) to support automatic light/dark mode switching based on system preferences or app state.

## 6. Deployment / Server
- Currently designed to be served from any static file server without backend logic requirements.
