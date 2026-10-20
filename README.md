# Docker Sandboxes (sbx) slides

A 25-slide talk on running AI coding agents in Docker Sandboxes: why isolation matters, how the security layers work, workspace modes, and a quick start with the [keystone-bedrock-kit](https://github.com/fandango/keystone-bedrock-kit).

Plain HTML, CSS, and JS. No build step, no dependencies.

## Run it

Open `index.html` in a browser.

## Keys

| Key | Action |
|---|---|
| `→` `Space` `Enter` / `←` | Next / previous slide (or click the right / left side) |
| `Home` / `End` | First / last slide |
| `N` | Toggle speaker notes under the slide |
| `P` | Open the presenter window (notes, next slide, timer) |
| `F` | Fullscreen |
| `T` | Cycle theme: system, light, dark |
| `?` | Help |

Add `#7` to the URL to jump to slide 7.

## Presenting while screen sharing

The `N` notes panel is part of the slide window, so viewers see it. To keep notes private:

1. Press `P` to open the presenter window and move it off the shared screen.
2. Share only the slide window, not your whole screen.
3. Drive the slides from either window; they stay in sync.

## Files

- `index.html`: slides and speaker notes (each slide's notes are in its `<aside class="notes">`)
- `style.css`: theme tokens (light and dark), layout, diagram styles
- `deck.js`: navigation, notes panel, presenter window
