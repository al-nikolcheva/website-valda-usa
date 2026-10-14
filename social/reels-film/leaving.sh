#!/bin/bash
# "POV: your windows leaving the factory": vertical cut of the factory film + synth bed + end card.
set -e
F=../../public/media/valda-film.mp4; O=leaving; FONT=../fonts/InterTight-600.ttf; T=$O/tmp; mkdir -p $T
seg(){ # n start dur line1 line2
  local vf="crop=608:1080:656:0,scale=1080:1920,fps=30,setsar=1"
  local a="${4//:/\\:}" b="${5//:/\\:}"
  if [ -n "$4" ]; then vf="$vf,drawbox=y=0:w=iw:h=700:color=black@0.35:t=fill,drawtext=fontfile=$FONT:text='$a':fontsize=86:fontcolor=white:x=(w-tw)/2:y=330,drawtext=fontfile=$FONT:text='$b':fontsize=86:fontcolor=white:x=(w-tw)/2:y=440"; fi
  ffmpeg -v error -y -ss $2 -t $3 -i $F -i $O/fade.png -an -filter_complex "[0:v]$vf[v];[v][1:v]overlay=0:0" -c:v libx264 -crf 18 -pix_fmt yuv420p $T/s$1.mp4
}
seg 0 141.0 2.5 "POV: your windows" "leaving the factory"
seg 1 134.0 2.0
seg 2 137.0 2.0
seg 3 143.0 2.0
seg 4 148.6 1.5
seg 5 155.0 2.5 "Next stop:" "your jobsite"
seg 6 160.0 2.5 "Next stop:" "your jobsite"
ffmpeg -v error -y -loop 1 -t 2.5 -i made30/endcard.png -vf "fps=30,format=yuv420p,fade=in:st=0:d=0.3" -c:v libx264 -crf 18 $T/s7.mp4
for i in $(seq 0 7); do echo "file 's$i.mp4'"; done > $T/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $T/list.txt -c copy $T/video.mp4
ffmpeg -v error -y -i $T/video.mp4 -i $O/audio/music.wav -filter_complex "[1:a]atrim=0:17.5,afade=t=out:st=16:d=1.5,loudnorm=I=-14:TP=-1[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "../../social-media/Extras/Reel - Leaving the factory.mp4"
rm -rf $T; echo done
