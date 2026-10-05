const $=id=>document.getElementById(id);
const e=x=>x<0?0:x>1?1:1-Math.pow(1-x,3), f=(t,a,b)=>e((t-a)/(b-a)), cl=x=>Math.max(0,Math.min(1,x));
const R=window.REEL, INTRO=2.6, STEP=R.step||2.6, OUT=2.6, N=R.steps.length, D=INTRO+N*STEP+OUT;
$('series').textContent=R.series;
function render(t){
  let h='';
  if(t<INTRO){const o=f(t,0.1,0.8);
    h=`<div class="a big" style="top:${330+(1-o)*30}px;font-size:104px;opacity:${o}">${R.title}</div>
       <div class="a mid" style="top:${R.subTop||820}px;opacity:${f(t,0.6,1.2)}">${R.sub}</div>`;
    $('seg').style.opacity=0;}
  else if(t<INTRO+N*STEP){const k=Math.floor((t-INTRO)/STEP), lt=t-INTRO-k*STEP, s=R.steps[k], o=f(lt,0,0.45), p=cl((lt-0.3)/(STEP-0.9));
    h=`<div class="a" style="top:300px;font-size:30px;color:#a3a3a5;opacity:${o}">Step /0${k+1}</div>
       <div class="a big" style="top:${350+(1-o)*20}px;font-size:76px;opacity:${o}">${s.t}</div>
       <div class="a mid" style="top:${s.bTop||560}px;opacity:${f(lt,0.25,0.7)}">${s.b}</div>
       <svg style="position:absolute;left:0;top:0;opacity:${o}" width="1080" height="1920"><g transform="translate(0,${R.gy||0})">${s.d(p,lt)}</g></svg>`;
    $('seg').style.opacity=1; $('seg').innerHTML=R.steps.map((_,i)=>`<i style="background:${i<=k?'#222224':'#e3e3e3'}"></i>`).join('');}
  else{const lt=t-INTRO-N*STEP,o=f(lt,0,0.5);
    h=`<div class="a big" style="top:420px;font-size:92px;opacity:${o}">${R.end}</div>
       <div class="a mid" style="top:${R.endTop||760}px;opacity:${f(lt,0.4,0.9)}">${R.endSub}</div>
       <div class="a mid" style="top:${(R.endTop||760)+260}px;opacity:${f(lt,0.9,1.4)};color:#1f4e8c;font-weight:600">valdagroup.com</div>`;
    $('seg').style.opacity=0;}
  $('stage').innerHTML=h; $('prog').style.width=(t/D*100)+'%';
}
window.render=render; window.DURATION=D;
