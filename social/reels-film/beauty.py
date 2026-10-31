# "the beauty of windows": slow push-in slideshow of real VALDA projects with spaced titles.
# python3 beauty.py  (run from social/reels-film)
import subprocess, os
IMG = '../../public/images'; O = 'beauty'; T = f'{O}/tmp'; os.makedirs(T, exist_ok=True)
R = '../fonts/InterTight-400.ttf'; M = '../fonts/InterTight-500.ttf'
DUR, XF, FPS = 3.4, 0.7, 30
SHOTS = [  # image, title, credit, focus (0..1 horizontal crop centre)
  ('hero-gora.jpg', None, None, .35),
  ('proj-belle.jpg', 'BELLE EPOQUE', 'aluminum windows and doors · Sofia', .5),
  ('project-mona-1.jpg', 'MONA RESIDENCE', 'aluminum tilt and turn · Sofia', .4),
  ('proj-austin.jpg', 'AUSTIN RESIDENCE', 'lift and slide · fixed glazing · Texas', .45),
  ('proj-gora.jpg', 'GORA', 'aluminum tilt and turn · Sofia', .55),
  ('proj-amaya.jpg', 'AMAYA RESIDENCE', 'aluminum windows · sliding · Sofia', .62),
]
sp = lambda s: '   '.join(' '.join(w) for w in s.split(' '))
esc = lambda s: s.replace(':', r'\:').replace("'", '’')
GRADE = 'eq=saturation=0.72:contrast=0.95:gamma=1.03,colorbalance=rs=0.05:gs=0.015:bs=-0.05:rm=0.03:bm=-0.03,vignette=PI/4.5'
def run(a): subprocess.run(a, check=True)
for i, (img, title, credit, fx) in enumerate(SHOTS):
    n = int(DUR * FPS)
    # cover-crop to 9:16 around fx, upscale for smooth zoom, slow push-in
    pre = (f"scale=-2:3840,crop='min(iw,2160)':3840:'max(0,min(iw-2160,iw*{fx}-1080))':0,"
           f"zoompan=z='1+0.07*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1080x1920:fps={FPS},{GRADE},"
           f"null")
    if title is None:
        txt = (f",drawtext=fontfile={R}:text='the beauty of':fontsize=58:fontcolor=white:x=(w-tw)/2:y=860:alpha='min(1,max(0,(t-0.3)/0.8))'"
               f",drawtext=fontfile={M}:text='{sp('WINDOWS')}':fontsize=64:fontcolor=white:x=(w-tw)/2:y=960:alpha='min(1,max(0,(t-0.9)/0.8))'")
    else:
        size = 50 if len(title) < 20 else 38
        txt = (f",drawtext=fontfile={M}:text='{esc(sp(title))}':fontsize={size}:fontcolor=white:x=(w-tw)/2:y=1180:alpha='min(1,max(0,(t-0.4)/0.7))'"
               f",drawtext=fontfile={R}:text='{esc(credit)}':fontsize=32:fontcolor=white@0.85:x=(w-tw)/2:y=1258:alpha='min(1,max(0,(t-0.7)/0.7))'")
    run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', str(DUR), '-i', f'{IMG}/{img}', '-i', f'{O}/grad.png', '-filter_complex', f'[0:v]{pre}[b];[b][1:v]overlay=0:0' + txt + ',format=yuv420p',
         '-frames:v', str(n), '-c:v', 'libx264', '-crf', '18', f'{T}/s{i}.mp4'])
# end card
run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=0x1f1c19:s=1080x1920:d={DUR}:r={FPS}', '-vf',
     f"drawtext=fontfile={M}:text='{sp('VALDA')}':fontsize=70:fontcolor=white:x=(w-tw)/2:y=860,"
     f"drawtext=fontfile={R}:text='European windows, made for your site':fontsize=36:fontcolor=white@0.8:x=(w-tw)/2:y=970,"
     f"drawtext=fontfile={R}:text='valdagroup.com':fontsize=30:fontcolor=white@0.6:x=(w-tw)/2:y=1040,format=yuv420p",
     '-c:v', 'libx264', '-crf', '18', f'{T}/s{len(SHOTS)}.mp4'])
k = len(SHOTS) + 1
ins = sum([['-i', f'{T}/s{i}.mp4'] for i in range(k)], [])
fc, last, off = '', '[0:v]', 0.0
for i in range(1, k):
    off += DUR - XF
    fc += f"{last}[{i}:v]xfade=transition=fade:duration={XF}:offset={off:.2f}[v{i}];"; last = f'[v{i}]'
total = DUR * k - XF * (k - 1)
run(['ffmpeg', '-v', 'error', '-y', *ins, '-i', f'{O}/audio/music.wav', '-filter_complex',
     fc + f"[{k}:a]atrim=0:{total:.2f},afade=t=in:d=1,afade=t=out:st={total-2:.2f}:d=2,loudnorm=I=-14:TP=-1[a]",
     '-map', last, '-map', '[a]', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
     '-movflags', '+faststart', '../../social-media/Extras/Reel - The beauty of windows.mp4'])
print('done', round(total, 1), 's')
