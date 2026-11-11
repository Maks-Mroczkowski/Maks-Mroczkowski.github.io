# Maks Mroczkowski: personal site

Live at https://maks-mroczkowski.github.io/

Two static pages of HTML, CSS and one small script. Vite builds them and copies them to `dist/` unchanged. There's no framework at runtime and no client-side bundle.

## Run it

```
npm install
npm run dev       # http://localhost:5173/
npm run build     # writes dist/
npm run preview   # serves dist/
```

## Deploy

Every push to `main` goes live automatically. `.github/workflows/deploy.yml` builds the site and publishes `dist/` to GitHub Pages, usually within a minute or two. Progress shows on the repo's Actions tab, and "Run workflow" there redeploys without a new commit.

```
git add -A
git commit -m "Describe the change"
git push
```

Before pushing a visual change, check it against "Done when" below.

## What's where

| Path | What it is |
| --- | --- |
| `index.html` | Home: Maks's story, told along an orange line in the left margin |
| `projects.html` | Projects: "Things I've built" |
| `public/css/home.css`, `public/css/projects.css` | All styling, one file per page so each page stands alone |
| `public/js/home.js` | The margin line, its dots, the year labels and the opening animation on Home |
| `public/assets/paper-figure-1a.webp` | Figure 1a from the npj Digital Surgery paper (CC BY 4.0, credited on the page) |
| `public/assets/paper-first-page.webp` | The paper's first page, shown on Projects |

Anything in `public/` is served at the site root, so `public/assets/x` is linked from the pages as `assets/x`.

## Still to add

Placeholders show as grey highlights (`<mark class="todo">`) or grey boxes.

1. **CV.** Add the PDF at `public/assets/Maks-Mroczkowski-CV.pdf`. The nav's "CV" link and "Download CV (PDF)" on both pages already point there.
2. **#EatABRHack video** (Home, "The other side of the table"). Add `public/assets/eatabrhack.mp4`; the play button swaps in a real player. Replace the grey still with a poster frame.
3. **Three #EatABRHack photos** with their captions, in the same chapter.
4. **One line on what Maks looked for as a judge**, in the same chapter.
5. **Portrait** (black and white, 4:5) in "Where I am now".
6. **The rest of the "Where I am now" sentence.**

Nice to have: a favicon and a social preview image (`og:image`).

## Design rules

- **Colours.** Paper `#F2F2F0` (background), Ink `#000` (text), Graphite `#666662` (secondary text), Signal `#E84600` (the line and dots), Track `#D6D6D2` (hairlines, placeholders and the undrawn line), Edge `#B5B5B0` (card borders, 1.5px). No other colours.
- **Type.** Libre Franklin from Google Fonts, weights 400 to 900. Sizes are fluid, set with `clamp()`.
- **Layout.** Everything is sized from the page width using a CSS container query on `.site`. Below 1024px wide, the phone layout takes over. The layout variables sit at the top of each CSS file (`--text-x`, `--line-x`, `--story-shift`, `--pn-x` and so on).
- **Cards.** Chapters on Home and projects on Projects sit in rounded panels with a 1.5px Edge outline. The line, dots and years stay in the margin and never connect to the panels.
- **Never add** shadows, gradients, all-caps labels, emoji or big headline numbers. Bold marks a few key phrases only.
- **Copy** is in British English and final, apart from the marked placeholders.

## How the margin line works (Home)

- The HTML is served in its finished state: the whole line drawn, every dot filled and every year shown. That is what visitors see without JavaScript, with reduced motion, or in a window too tall to scroll.
- With JavaScript, the line draws as you scroll. Its tip sits around the middle of the screen, catches up quickly near the top, and speeds up over the last screen so the line is complete when you reach the bottom.
- Each dot fills, and its year label darkens from Track to Graphite, as the line reaches it.
- Once per browser session, the small year next to the headline spins from 2023 to 2026 while the line draws down to the first dot.
- On Projects the line is simply drawn in full, with no script.

## Done when

- Both pages look and behave the same as before the change at 1440px and 390px wide, top to bottom.
- Home works without JavaScript and shows the finished line.
- The skip link, visible focus styles and every link work from the keyboard.
- Lighthouse on mobile scores at least 95 for accessibility and 90 for performance.
- Every link works, including Home's link to `projects.html#client-app-alpha`.
- Figure 1a keeps its credit line: Zhang et al., npj Digital Surgery (2026), CC BY 4.0, cropped.

## Notes

- Container queries need Chrome or Edge 105+, Safari 16+ or Firefox 110+.
- The two stylesheets repeat some base rules on purpose. Merging them is fine as long as nothing changes visually.
