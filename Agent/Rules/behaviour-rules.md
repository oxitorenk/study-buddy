# Progressive Web App Behavior Rules

These rules are mandatory for all applications in this workspace. They ensure consistency, performance, and a native-like experience.

## 1. PWA Essentials
Every app must be a Progressive Web App (PWA) by default.

### Mandatory Files
-   **`manifest.json`**: Must be present and valid.
    -   `display`: "standalone"
    -   `background_color`: Matches the dark mode background.
    -   `theme_color`: Matches the dark mode background.
    -   `orientation`: "portrait" (unless landscape is critical).
-   **`sw.js` (Service Worker)**: Must implementing a **Cache-First** strategy for all assets (HTML, CSS, JS, Images). offline support is non-negotiable.
    -   Cache versioning (e.g., `v1`) to handle updates.

### iOS Meta Tags
Include these specific meta tags in `<head>` for proper iOS PWA behavior:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default"> <!-- or black-translucent -->
```

## 2. Architecture & Code Structure
Use Vanilla JavaScript. No frameworks (React, Vue, etc.) unless the complexity absolutely demands it (rare for these apps).

### Centralized State Management
-   **Single Source of Truth**: Maintain a global `_state` object.
-   **No Hidden State**: Do not store state in the DOM. The DOM should only reflect `_state`.
-   **Persistence**: Automatically save `_state` to `localStorage` on change. Load on startup.

### Separation of Concerns
Follow this pattern in `app.js`:
1.  **State Definition**: `let _state = { ... };`
2.  **UI References**: `const ui = { ... };` (Cache all DOM elements here).
3.  **Core Logic**: Functions that modify `_state` (e.g., `updateCount()`, `toggleTheme()`).
4.  **Persistence**: `loadState()`, `saveState()`.
5.  **Rendering**: `updateUI()` function that reads `_state` and updates the DOM.
6.  **Initialization**: `init()` function to bind events and start the loop.

## 3. Performance & UX

### Interaction Feedback
-   **Haptic Feedback**: Use `navigator.vibrate(50)` (or similar short patterns) for significant actions (button taps, completions).
-   **Active States**: CSS `:active` states are required for all interactive elements to provide visual feedback.

### Animation performance
-   **60FPS Target**: Use CSS `transform` and `opacity` for animations. Avoid animating `top`, `left`, `width`, `height`.
-   **Hardware Acceleration**: Use `will-change` sparingly on complex moving elements.

### Touch Optimization
-   **No Zoom**: `user-scalable=no` in viewport meta tag.
-   **Fast Tap**: `touch-action: manipulation` on buttons if needed (though viewport settings usually handle this).
-   **Select**: `-webkit-user-select: none; user-select: none;` on non-text elements to prevent accidental selection during app usage.

## 4. versioning
-   Include a `version` field in your `_state` to allow for future migrations if the data structure changes.
