# How It's Made: VALDA Reels series

Animated "book page" episodes with a narrator, in a flat editorial style. Everything is drawn in code, so there is no Higgsfield and no paid tools.

Each episode is one config file (`ep01.json`). Every scene in it has:
- `art`: which illustration from `ep.html` to use.
- `kicker`: the small italic line above the headline.
- `head`: the headline.
- `say`: the narration text.

## Make an episode

1. **Write the script.** Copy `ep01.json` and change the scenes. To add a new illustration, add a function to the `ART` object in `ep.html`.
2. **Narrate it** with Kokoro (an open-source TTS model that runs locally). Install it once in a venv:

   ```
   npm i kokoro-js@1.2.1 kokoro-q8-shards@1.0.0
   cat node_modules/kokoro-q8-shards/*.bin > model_quantized.onnx
   python -m venv venv && venv/bin/pip install kokoro-onnx soundfile
   ```

   Then pack the voices into one file with numpy, as in `mkvoices.py` from the session.
   This step writes `audio/<slug>.wav` and `audio/<slug>.timings.json`:

   ```
   venv/bin/python voice.py ep01.json model_quantized.onnx voices.npz
   ```
3. **Preview** one still per scene, then **render** the full video:

   ```
   node render.mjs ep01 /tmp/prev --preview
   node render.mjs ep01 "../../social-media/Extras/How It's Made 01 - The VALDA window.mp4"
   ```

**Timing:** scene timing follows the narration automatically, and caption words light up as they are spoken.

**Fact check:** the facts in Episode 01 come from the VALDA factory film (`public/media/valda-film.mp4`). Keep every claim checkable.
