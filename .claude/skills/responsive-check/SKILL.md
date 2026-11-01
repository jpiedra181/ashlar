---
name: responsive-check
description: >
  Detects responsive design problems on any web page by rendering it at common
  breakpoints with Playwright and reporting concrete, measurable failures
  (horizontal overflow, undersized tap targets, page overflow). Use this skill
  whenever the user wants to check, test, audit, or debug how a site behaves on
  different screen sizes or devices, mentions "responsive", "mobile view",
  "breakpoints", "se rompe en móvil", "overflow", or asks to verify a layout
  across viewports — even if they don't say "responsive" explicitly. This skill
  ONLY detects and reports; applying CSS fixes is a separate step the user drives
  afterwards.
---

# Responsive Check

Renders a URL at common breakpoints and reports measurable responsive failures as
structured JSON plus one full-page screenshot per breakpoint.

This skill is detection-only by design. It produces a report; it does not edit any
code. Fixing is a deliberate, separate step (see "After detection" below).

## Requirements (one-time, per machine)

The script uses the Playwright **npm library** (separate from the Playwright MCP
server). Install it once and download the browser:

```bash
npm install -D playwright
npx playwright install chromium
```

If `playwright` is already a project dependency, skip the install.

## How to run

The URL is always provided by the user at run time. From the skill directory:

```bash
node scripts/check.mjs <url> [outDir]
```

- `<url>` — full URL, including `http://` or `https://` (localhost is fine).
- `[outDir]` — optional output folder. Defaults to `.claude/reports/responsive/`
  (ignored by Git, next to the other audit reports). Each run overwrites the
  previous report.

Example (from the theme root):

```bash
node .claude/skills/responsive-check/scripts/check.mjs http://ashlar.local/projects/
```

## Breakpoints checked

320, 375, 768, 1024, 1280, 1440, 1920 (px wide × 900 tall). 320 doubles as the
WCAG 1.4.10 reflow width, so the report is also a partial reflow check. 1920
verifies the desktop layout and that the content's `max-width` + centering behave
on wide screens.

## What it detects

- **horizontal_overflow** — element extends past the viewport horizontally (the
  classic cause of mobile horizontal scroll). Only the outermost offender in each
  chain is reported, since that's the one worth fixing. Content that overflows
  inside an ancestor that clips or scrolls it (carousel track, swipeable chip
  row, `.visually-hidden`) is skipped: it doesn't widen the page. `html` and
  `body` don't count as such ancestors, so content cut off by a global
  `overflow-x` is still reported.
- **small_tap_target** — interactive element whose smaller side is under 24px
  (WCAG 2.5.8 AA minimum).
- A per-breakpoint `pageOverflow` flag and `scrollWidth` for quick triage.

It does NOT make subjective calls ("looks cramped", "ugly on mobile"). For those,
open the screenshots referenced in the report.

## Output format

`<outDir>/report.json`:

```json
{
  "url": "http://ashlar.local/projects/",
  "generatedAt": "2026-...",
  "breakpoints": [
    {
      "width": 375,
      "viewport": { "width": 375, "height": 900 },
      "screenshot": "375.png",
      "pageOverflow": true,
      "scrollWidth": 412,
      "issueCount": 1,
      "issues": [
        {
          "type": "horizontal_overflow",
          "selector": "section.hero > h1.hero__title:nth-of-type(1)",
          "domPath": "html > body > section#hero > h1",
          "classes": "hero__title text-4xl px-8",
          "text": "Bienvenido a...",
          "measured": { "elementWidth": 410, "elementRight": 412, "viewportWidth": 375, "overflowPx": 37 },
          "screenshot": "375.png"
        }
      ]
    }
  ]
}
```

Plus one screenshot per breakpoint (`320.png`, `375.png`, …) in the same folder.

## After detection (fixing — separate step)

When the user asks to fix the findings:

1. Read `<outDir>/report.json`.
2. Locate each offending element in the **source code** using the issue's
   `classes`, `text`, and `domPath`. Note that the report describes the
   **rendered DOM**; the fix happens in source (Tailwind classes, CSS modules,
   components), so this mapping requires care.
3. Before editing, read the project's style configuration (e.g.
   `tailwind.config.*`, global CSS, design tokens / CSS variables) and prefer the
   project's existing conventions for any change.
4. Never fix one breakpoint in a way that breaks another. After applying fixes,
   re-run this skill on the same URL to confirm the issues are gone and no new
   ones appeared.
