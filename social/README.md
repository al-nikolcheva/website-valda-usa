# VALDA social posts

Every post uses `site.css`, which mirrors the website design system in `src/app/globals.css`: white pages, #222224 charcoal, soft greys, Inter Tight medium headings with tight tracking, plain muted labels, /NN markers, rounded photos and grey cards, chips like the project pages, and VALDA blue as a small accent only.

Each post folder has `carousel.html` (one `<section class="slide">` per frame), `render.mjs` (run `node render.mjs` in the folder to export 1080 x 1080 PNGs and a PDF) and `caption.md`. Shared images live in `assets/`, fonts in `fonts/`.
