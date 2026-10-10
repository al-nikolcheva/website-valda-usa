# Narrate an episode: one clip per scene, then timings.json and narration.wav.
# Usage: python voice.py ep01.json <model.onnx> <voices.npz>
import sys, json, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
cfg_path, model, voices = sys.argv[1:4]
cfg = json.load(open(cfg_path)); k = Kokoro(model, voices)
LEAD, GAP, TAIL = 0.5, 0.7, 1.2   # seconds of silence before, between scenes, after
sr, parts, t, timings = 24000, [], LEAD, []
parts.append(np.zeros(int(LEAD * sr), np.float32))
for s in cfg['scenes']:
    v = cfg['voice']
    a, sr = k.create(s['say'], voice=v, speed=cfg.get('speed', 1.0), lang='en-us' if v[0] == 'a' else 'en-gb')
    d = len(a) / sr
    timings.append({'start': round(t, 3), 'speech': round(d, 3)})
    parts += [a.astype(np.float32), np.zeros(int(GAP * sr), np.float32)]
    t += d + GAP
parts.append(np.zeros(int((TAIL - GAP) * sr), np.float32))
out = os.path.join(os.path.dirname(cfg_path), 'audio')
os.makedirs(out, exist_ok=True)
sf.write(f"{out}/{cfg['slug']}.wav", np.concatenate(parts), sr)
json.dump({'duration': round(t + TAIL - GAP, 3), 'scenes': timings}, open(f"{out}/{cfg['slug']}.timings.json", 'w'), indent=1)
print(cfg['slug'], round(t + TAIL - GAP, 2), 's')
