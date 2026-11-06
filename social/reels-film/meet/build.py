# Build "Meet VALDA": one clip per scene timed to the narration, crossfaded, with voice and music.
import json, subprocess, sys
voice = sys.argv[1] if len(sys.argv) > 1 else 'voice.wav'
out = sys.argv[2] if len(sys.argv) > 2 else 'meet-valda.mp4'
c = json.load(open('script.json')); tm = json.load(open(sys.argv[3] if len(sys.argv) > 3 else 'timings.json'))
D = tm['duration']; n = len(c['scenes'])
b = [0.0] + [s['start'] - 0.35 for s in tm['scenes'][1:]] + [D]
X = 0.4; FPS = 30; grade = "eq=saturation=0.9:contrast=1.02,colorbalance=rs=0.03:bs=-0.03"
segs = []
for i, s in enumerate(c['scenes']):
    d = b[i+1] - b[i] + (X if i < n-1 else X/2) + (0 if i == 0 else 0)
    f = f'seg{i}.mp4'; N = int(d * FPS) + 1; m = s['media']
    if m == 'end':
        cmd = ['ffmpeg','-v','error','-y','-f','lavfi','-i',f'color=c=0x0c0c0d:s=1080x1920:r={FPS}:d={d}','-loop','1','-i',f'ov/{i}.png',
               '-filter_complex',f"[1]format=rgba,fade=in:st=0.2:d=0.6:alpha=1[o];[0][o]overlay=0:0,format=yuv420p",'-t',str(d),f]
    elif m.endswith('.mp4'):
        cmd = ['ffmpeg','-v','error','-y','-stream_loop','-1','-i',m,'-loop','1','-i',f'ov/{i}.png',
               '-filter_complex',f"[0]scale=-2:1920:flags=lanczos,crop=1080:1920,{grade},fps={FPS}[v];[1]format=rgba,fade=in:st=0.5:d=0.6:alpha=1[o];[v][o]overlay=0:0,format=yuv420p",'-t',str(d),'-an',f]
    else:
        z = "1.0+0.06*on/%d" % N
        cmd = ['ffmpeg','-v','error','-y','-i',m,'-loop','1','-i',f'ov/{i}.png',
               '-filter_complex',f"[0]scale=2160:3840:force_original_aspect_ratio=increase:flags=lanczos,crop=2160:3840,zoompan=z='{z}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={N}:s=1080x1920:fps={FPS},{grade}[v];[1]format=rgba,fade=in:st=0.4:d=0.6:alpha=1[o];[v][o]overlay=0:0:shortest=1,format=yuv420p",'-t',str(d),f]
    subprocess.run(cmd, check=True); segs.append((f, d))
# crossfade chain
inputs = sum([['-i', f] for f, _ in segs], []); fc = ''; prev = '[0:v]'; 
for i in range(1, n):
    o = b[i] - X/2; lab = f'[x{i}]'
    fc += f"{prev}[{i}:v]xfade=transition=fade:duration={X}:offset={o:.3f}{lab};"; prev = lab
fc += f"{prev}fade=in:st=0:d=0.5,format=yuv420p[v];"
fc += f"[{n}:a]aresample=48000,volume=1.0[vo];[{n+1}:a]aresample=48000,volume=0.16,afade=out:st={D-2.2:.2f}:d=2[mu];[vo][mu]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]"
subprocess.run(['ffmpeg','-v','error','-y',*inputs,'-i',voice,'-i','film/audio/music.wav','-filter_complex',fc,'-map','[v]','-map','[a]',
                '-c:v','libx264','-crf','19','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',f'{D:.3f}','-movflags','+faststart',out], check=True)
print(out, D)
