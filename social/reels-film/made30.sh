#!/bin/bash
# "How a VALDA window is made in 30 seconds": vertical cut of the factory film + synth bed + end card.
set -e
F=../../public/media/valda-film.mp4; O=made30; FONT=../fonts/InterTight-600.ttf; T=$O/tmp; mkdir -p $T
seg(){ # n start dur x label
  local vf="crop=608:1080:$4:0,scale=1080:1920,fps=30,setsar=1"
  if [ "$5" = HOOK ]; then
    vf="$vf,drawbox=y=0:w=iw:h=760:color=black@0.35:t=fill,drawtext=fontfile=$FONT:text='How a VALDA window':fontsize=86:fontcolor=white:x=(w-tw)/2:y=330,drawtext=fontfile=$FONT:text='is made in 30 seconds':fontsize=86:fontcolor=white:x=(w-tw)/2:y=440"
  else
    local num=${5%% *} txt=${5#* }
    vf="$vf,drawbox=x=60:y=250:w=iw-120:h=190:color=black@0.45:t=fill,drawtext=fontfile=$FONT:text='$num':fontsize=44:fontcolor=0xA6C4EA:x=100:y=280,drawtext=fontfile=$FONT:text='$txt':fontsize=66:fontcolor=white:x=100:y=345"
  fi
  ffmpeg -v error -y -ss $2 -t $3 -i $F -i $O/fade.png -an -filter_complex "[0:v]$vf[v];[v][1:v]overlay=0:0" -c:v libx264 -crf 18 -pix_fmt yuv420p $T/s$1.mp4
}
seg 0 22.0 3.0 656 HOOK
seg 1 31.0 2.5 656 "01 Profiles cut to size"
seg 2 49.0 2.5 656 "01 Profiles cut to size"
seg 3 43.0 2.5 656 "02 Frames assembled"
seg 4 55.5 2.5 656 "03 Precision machining"
seg 5 63.0 2.5 656 "04 Glass built in-house"
seg 6 79.0 2.5 656 "04 Glass built in-house"
seg 7 115.0 2.5 656 "05 Ready to open"
seg 8 136.0 2.5 656 "06 Packed for the road"
seg 9 155.0 2.5 656 "07 Shipped to your site"
ffmpeg -v error -y -loop 1 -t 2.5 -i $O/endcard.png -vf "fps=30,format=yuv420p,fade=in:st=0:d=0.3" -c:v libx264 -crf 18 $T/s10.mp4
for i in $(seq 0 10); do echo "file 's$i.mp4'"; done > $T/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $T/list.txt -c copy $T/video.mp4
ffmpeg -v error -y -i $T/video.mp4 -i $O/audio/music.wav -filter_complex "[1:a]atrim=0:28,afade=t=out:st=26.5:d=1.5,loudnorm=I=-14:TP=-1[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "../../social-media/Extras/Reel - How a window is made in 30 seconds.mp4"
echo done
