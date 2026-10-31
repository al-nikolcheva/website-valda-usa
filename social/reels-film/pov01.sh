#!/bin/bash
# POV ep 01 as a Reel: warm-graded vertical cuts of the factory film, light POV typography.
set -e
F=../../public/media/valda-film.mp4; O=pov01; T=$O/tmp; R=../fonts/InterTight-400.ttf; M=../fonts/InterTight-500.ttf; mkdir -p $T
GRADE="eq=saturation=0.70:contrast=0.94:gamma=1.02,colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.04:bm=-0.04:rh=0.02:bh=-0.03,vignette=PI/5"
esc(){ printf '%s' "$1" | sed "s/:/\\\\:/g; s/'/’/g"; }
seg(){ # n start dur x num title line
  local vf="crop=608:1080:$4:0,scale=1080:1920:flags=lanczos,fps=30,setsar=1,$GRADE"
  vf="$vf,drawbox=y=0:w=iw:h=260:color=0x14100c@0.45:t=fill,drawtext=fontfile=$M:text='VALDA':fontsize=30:fontcolor=0xf4efe7:x=72:y=110,drawtext=fontfile=$M:text='EP 01':fontsize=28:fontcolor=0xf4efe7:x=w-tw-72:y=112"
  if [ "$5" = HOOK ]; then
    vf="$vf,drawbox=y=260:w=iw:h=520:color=0x14100c@0.40:t=fill,drawtext=fontfile=$R:text='POV\:':fontsize=300:fontcolor=0xf4efe7:x=58:y=300,drawtext=fontfile=$R:text='your windows are':fontsize=64:fontcolor=0xf4efe7:x=72:y=600,drawtext=fontfile=$R:text='being made in Sofia.':fontsize=64:fontcolor=0xf4efe7:x=72:y=680"
  else
    vf="$vf,drawbox=y=1120:w=iw:h=440:color=0x14100c@0.55:t=fill,drawtext=fontfile=$M:text='$(esc "$5")':fontsize=32:fontcolor=0xf4efe7@0.85:x=72:y=1170,drawtext=fontfile=$R:text='$(esc "$6")':fontsize=76:fontcolor=0xf4efe7:x=72:y=1230,drawtext=fontfile=$R:text='$(esc "$7")':fontsize=40:fontcolor=0xf4efe7@0.9:x=72:y=1340"
  fi
  ffmpeg -v error -y -ss $2 -t $3 -i $F -i made30/fade.png -an -filter_complex "[0:v]$vf[v];[v][1:v]overlay=0:0" -c:v libx264 -crf 18 -pix_fmt yuv420p $T/s$1.mp4
}
seg 0 22.0 3.0 700 HOOK
seg 1 31.0 2.6 700 "01  CUT" "A bare profile." "Cut to your drawing."
seg 2 43.5 2.6 700 "02  ASSEMBLED" "Then a frame." "Corners joined, hardware fitted."
seg 3 79.0 2.6 700 "03  GLAZED" "Glass made here too." "Our own LISEC glass line."
seg 4 136.5 2.6 700 "04  PACKED" "Packed for the Atlantic." "Loaded and documented."
seg 5 155.5 3.0 700 "05  SHIPPED" "Next stop: your site." "Factory direct."
ffmpeg -v error -y -f lavfi -i "color=c=0x1a1816:s=1080x1920:d=2.6:r=30" -vf "drawtext=fontfile=$R:text='ep 02':fontsize=44:fontcolor=0xf4efe7@0.8:x=(w-tw)/2:y=760,drawtext=fontfile=$R:text='the glass line':fontsize=96:fontcolor=0xf4efe7:x=(w-tw)/2:y=830,drawtext=fontfile=$M:text='FOLLOW VALDA FOR THE SERIES':fontsize=30:fontcolor=0xf4efe7@0.7:x=(w-tw)/2:y=1000,format=yuv420p,fade=in:st=0:d=0.3" -c:v libx264 -crf 18 $T/s6.mp4
for i in $(seq 0 6); do echo "file 's$i.mp4'"; done > $T/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $T/list.txt -c copy $T/video.mp4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $T/video.mp4)
ffmpeg -v error -y -i $T/video.mp4 -i made30/audio/music.wav -filter_complex "[1:a]atrim=0:$D,afade=t=out:st=$(echo "$D-1.5"|bc):d=1.5,loudnorm=I=-14:TP=-1[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "../../social-media/Extras/Reel - POV ep01.mp4"
rm -rf $T; echo done $D
