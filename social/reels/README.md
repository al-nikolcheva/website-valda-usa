# VALDA Reels

Motion-graphic Reels drawn in code, rendered frame by frame to 1080 x 1920 MP4.

- `render.mjs <page.html> <out.mp4>` renders any page that defines `window.render(t)` and `window.DURATION`.
- One-off Reels: `thermal-break.html`, `myth-shutters.html`, `u-factor.html`.
- "How it works" series: `how-*.html` are built from `shell.html.tpl` + `howto.js` (engine) + `draw.js` (shapes) + one config each (`pvc.js`, `ship.js`, `us.js`). To make a new episode, copy a config, change the title, steps and drawings, then `sed "s/__CFG__/name/" shell.html.tpl > how-name.html` and render.

Output goes to `social-media/Extras/`. No audio: add a track in Instagram or LinkedIn when posting.
