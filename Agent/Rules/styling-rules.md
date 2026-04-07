# Progressive Web App Styling Rules

These rules are strict and must be followed for all current and future projects to maintain a cohesive, native iOS-like aesthetic.

## 1. Core Principles
- **Mobile-First**: Design primarily for mobile touch targets and interactions.
- **iOS Aesthetic**: Mimic native iOS UI patterns (Lists, Navigation Bars, Action Sheets).
- **Dark Mode Default**: All apps must default to dark mode, with a light mode override.
- **No External Frameworks**: Use vanilla CSS with variables. No Bootstrap, Tailwind, etc., unless specified.

## 2. Color System & Variables
Define these variables in `:root` and override them in `[data-theme="light"]`.

### Dark Mode (Default)
```css
:root {
    --ios-bg: #000000;
    --ios-card-bg: #1C1C1E;
    --ios-text: #FFFFFF;
    --ios-text-secondary: #98989D;
    --ios-separator: #38383A;
    --ios-blue: #0A84FF;
    --ios-red: #FF453A;
    --ios-green: #32D74B;
    --ios-sheet-bg: #1C1C1E;
    --ios-sheet-handle: #5B5B5E;
    --safe-area-top: env(safe-area-inset-top, 20px);
    --safe-area-bottom: env(safe-area-inset-bottom, 20px);
}
```

### Light Mode Override
```css
[data-theme="light"] {
    --ios-bg: #F2F2F7;
    --ios-card-bg: #FFFFFF;
    --ios-text: #000000;
    --ios-text-secondary: #8E8E93;
    --ios-separator: #C6C6C8;
    --ios-blue: #007AFF;
    --ios-red: #FF3B30;
    --ios-green: #34C759;
    --ios-sheet-bg: #FFFFFF;
    --ios-sheet-handle: #C5C5C7;
}
```

## 3. Typography
- **Font Stack**: `-apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif`
- **Navigation Title**: 34px, Bold (700), Tracking -0.02em (+ Large Title behavior).
- **Body Text**: 17px.
- **Secondary Text (Captions/Footers)**: 13px, Color `--ios-text-secondary`.
- **Monospace Numbers**: Use `.tabular-nums { font-variant-numeric: tabular-nums; }` for timers/counters.

## 4. Component Patterns

### Navigation Bar (`.ios-navbar`)
- **Position**: Sticky top.
- **Height**: 44px content height + safe area top.
- **Background**: `--ios-bg` (translucent blur optional but plain bg is standard for these apps).
- **Actions**: Icons or text buttons, color `--ios-blue`, 44px tap target.

### List Groups (`.ios-list-group`)
- **Structure**:
  ```html
  <div class="ios-list-group">
      <div class="ios-list-header">OPTIONAL HEADER</div>
      <div class="ios-list">
          <div class="ios-cell">...</div>
          <div class="ios-cell">...</div>
      </div>
      <div class="ios-list-footer">Optional footer text...</div>
  </div>
  ```
- **List Container (`.ios-list`)**:
  - `border-radius: 10px`
  - `background-color: var(--ios-card-bg)`
  - `overflow: hidden`
- **Margins**: `margin-bottom: 2rem`

### Table Cells (`.ios-cell`)
- **Height**: Min-height 44px.
- **Padding**: Left 16px (1rem).
- **Separator**: Bottom border `0.5px solid var(--ios-separator)` on inner content, **except** the last child.
- **Layout**: Flexbox `space-between`, aligning items center.
- **Content**:
  - Left: Label (17px, regular text color).
  - Right: Value (17px, secondary color) or Control (Toggle/Input).
- **Interactions**: Active state background change (`var(--ios-separator)` or dimmer).

### Inputs
- **Style**: No border, transparent background.
- **Alignment**: Right-aligned in cells.
- **Color**: `--ios-blue` for active values.

### Buttons (`.ios-btn-primary`)
- **Style**:
  - Background: `--ios-blue`
  - Color: White
  - Radius: 12px
  - Padding: 14px 20px
  - Font: 17px, Weight 600
  - Width: 100%
- **Interaction**: Scale 0.98 and opacity 0.9 on `:active`.

### Modals / Sheets (`.ios-sheet`)
- **Backdrop**: Fixed, `rgba(0,0,0,0.4)`, fades in.
- **Sheet**:
  - Fixed bottom, `width: 100%`.
  - Top radius: 13px.
  - Background: `--ios-sheet-bg`.
  - Drag Handle: 36px x 5px, rounded, centered top.
  - Animation: Slide up `translateY(0)` from `translateY(100%)`.
  - Easing: `cubic-bezier(0.19, 1, 0.22, 1)` (iOS-like physics).

## 5. Global Layout
- **Body Background**: `--ios-bg`.
- **Safe Areas**: Respect `env(safe-area-inset-*)`.
- **Transitions**: Smooth theme transitions (0.3s ease).

## 6. Iconography
- Use simple SVG icons (Lucide or similar style) compatible with iOS thin stroke aesthetic.
- Stroke width: 2px usually, rounded caps/joins.
