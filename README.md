# Maks Mroczkowski: personal site

Live at https://maks-mroczkowski.github.io/

Two static pages of HTML, CSS and two small scripts. Vite builds them and copies them to `dist/` unchanged. There's no framework at runtime and no client-side bundle.

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
| `public/js/home.js` | The margin line, its dots, the year labels and the opening animation on Home, plus the inline video player |
| `public/js/motion.js` | The panel outlines that draw themselves in, on both pages (see "Motion" below) |
| `public/assets/paper-figure-1a.webp` | Figure 1a from the npj Digital Surgery paper (CC BY 4.0, credited on the page) |
| `public/assets/paper-first-page.webp` | The paper's first page, shown on Projects |

Anything in `public/` is served at the site root, so `public/assets/x` is linked from the pages as `assets/x`.

## Still to add

Placeholders show as grey highlights (`<mark class="todo">`) or grey boxes.

1. **One line on what Maks looked for as a judge** (Home, "The other side of the table").
2. **The rest of the "Where I am now" sentence.**

Nice to have: a favicon and a social preview image (`og:image`).

The CV is at `public/assets/Maks-Mroczkowski-CV.pdf`. To update it, replace that file and keep the name, since the nav's "CV" link and "Download CV (PDF)" on both pages point there.

The #EatABRHack video is Gianni Austin's LinkedIn post. The still (`eatabrhack-still.webp`, the video's cover frame) shows the design's play button, which opens the post on LinkedIn. To play a video inline instead, do what "Starting from zero" does: point the play link's `href` and `data-video-src` at an mp4 in `assets/` and give it a `data-video-label`. `js/home.js` then swaps in a real player when it's clicked, and without JavaScript the link just opens the file. The chapter's photo row holds two photos, so it uses two columns on desktop. The portrait (`portrait.webp`) is black and white at 4:5, as the design specifies.

The graduation photo (`graduation.webp`, in "Graduation, and a return offer") is cropped to 3:2 from the original, with its location data removed.

"Starting from zero" has the video of Maks's first project with code (`first-project.mp4`, 33 seconds). It was converted from the iPhone's HDR original to standard H.264 at 720×1280 (about 5 MB), with its location data removed. It sits behind a still (`first-project-still.webp`) with the design's play button, so the file only downloads when someone presses play. Portrait videos use `.tall`, which makes the frame as wide as one photo in a two-photo row. "Testing frontier AI models, and a publication" has the photo of Maks presenting at Purdue's undergraduate research symposium (`purdue-symposium.webp`, 3:2), under Figure 1a.

"Shipping while studying" embeds Maks's LinkedIn post about joining Really Good Culture, as LinkedIn's own iframe (`.post` in `home.css`). LinkedIn's post can't tell the page its height, so the frame is set to the card's height: 608px, or 652px when the column is under 350px wide and 690px under 250px. If the post is edited or LinkedIn changes its card, re-measure those. Visitors who haven't answered LinkedIn's cookie prompt see it at the top of the post until they choose. The post loads LinkedIn's scripts and cookies, which costs a few Lighthouse points (performance about 95, best practices 75), still within "Done when".

Photos on Home (the two video stills, the Purdue photo, the #EatABRHack photos, the graduation photo and the portrait) sit in `.box` frames with Figure 1a's 12px rounding, and CSS shows them in black and white (`filter` on `.box>img` in `home.css`) so they match the portrait and leave Signal as the page's only colour. On a desktop, hovering a photo brings back its colour. The image files themselves are untouched, so deleting that `filter` restores colour everywhere. The LinkedIn post gets the same black and white, with colour on hover (its own `filter` on `.post iframe`).

## Design rules

- **Colours.** Paper `#F2F2F0` (background), Ink `#000` (text), Graphite `#666662` (secondary text), Signal `#E84600` (the line and dots), Track `#D6D6D2` (hairlines, placeholders and the undrawn line), Edge `#B5B5B0` (card borders, 1.5px). No other colours.
- **Type.** Libre Franklin from Google Fonts, weights 400 to 900. Sizes are fluid, set with `clamp()`.
- **Layout.** Everything is sized from the page width using a CSS container query on `.site`. Below 1024px wide, the phone layout takes over. The layout variables sit at the top of each CSS file (`--text-x`, `--line-x`, `--story-shift`, `--pn-x` and so on).
- **Cards.** Chapters on Home and projects on Projects sit in rounded panels with a 1.5px Edge outline. The line, dots and years stay in the margin and never connect to the panels.
- **Never add** shadows, gradients, all-caps labels, emoji or big headline numbers. Bold marks a few key phrases only.
- **Copy** is in British English and final, apart from the marked placeholders.
- **Motion** is quiet and points at what matters. Text never animates: it is always there and always still. Nothing shifts the layout. Everything below is switched off with reduced motion, and without JavaScript the page is complete with every outline drawn.
  - *Between pages:* moving between Home and Projects fades the page through while the nav pill stays put (a cross-document view transition, in Chrome, Edge and Safari 18.2+; other browsers just load the page).
  - *Outlines* (`motion.js`): each outlined panel that starts below the fold draws its outline as it comes up the screen. The stroke starts on the panel's left edge, level with its dot (or heading), and wraps round the text both ways to meet on the far side, over about 1.8 seconds. Panels on screen at load are left alone. On Projects each dot pulses once as its outline starts.
  - *The line:* on Home, a dot pops once, with a single ring, when the line reaches it as you scroll.
  - *Hovers:* nav underlines fade in and settle into place, link underlines thicken smoothly, and the play button grows slightly.

## How the margin line works (Home)

- The HTML is served in its finished state: the whole line drawn, every dot filled and every year shown. That is what visitors see without JavaScript, with reduced motion, or in a window too tall to scroll.
- With JavaScript, the line draws as you scroll. Its tip sits around the middle of the screen, catches up quickly near the top, and speeds up over the last screen so the line is complete when you reach the bottom.
- Each dot fills, and its year label darkens from Track to Graphite, as the line reaches it.
- Once per browser session, the small year next to the headline spins from 2023 to 2026 while the line draws down to the first dot.
- On Projects the line is simply drawn in full; its only script draws the panel outlines in.

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
