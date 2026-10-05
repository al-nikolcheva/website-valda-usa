window.REEL={series:'How it works /01',title:'How a PVC window profile is made.',sub:'Five steps from powder to a welded frame.',subTop:860,gy:120,
end:'Warm, quiet, built to last.',endSub:'Insulating PVC outside, structural steel inside, fused corners. Ask us about our PVC range.',
steps:[
 {t:'The compound',b:'PVC powder, blended with stabilisers, impact modifiers and UV protectors.',d:(p,lt)=>{
   let s=`<path d="M440,700 h200 l-40,180 h-120 z" fill="${C.light}" stroke="${C.ink}" stroke-width="4"/>`;
   for(let i=0;i<60;i++){const ph=((lt*0.9)+i/60)%1, x=520+((i*37)%60)-30;
     s+=`<circle cx="${x+Math.sin(i)*8}" cy="${880+ph*360}" r="7" fill="${[C.g2,C.blue,C.warm][i%3]}" opacity="${ph<0.9?1:0}"/>`;}
   s+=`<path d="M${540-300*p},1300 Q540,${1300-200*p} ${540+300*p},1300 z" fill="${C.g1}"/>`;return s;}},
 {t:'Twin-screw extrusion',b:'Heated, mixed and pushed through a die shaped like the profile, then cooled to size.',d:(p,lt)=>{
   let s=rect(90,900,360,220,C.light,C.ink,4,14)+`<g transform="translate(0,${Math.sin(lt*20)*2})">${[0,1,2,3,4].map(i=>`<path d="M${130+i*60},930 l30,160" stroke="${C.g2}" stroke-width="10"/>`).join('')}</g>`;
   s+=rect(450,950,40,120,C.ink,null,0,4)+rect(490,985,500*p,50,'#fff',C.ink,4,4);
   s+=txt(270,1170,'Extruder',28,C.mute)+txt(470,1170,'Die',28,C.mute);
   for(let i=0;i<6;i++){const x=560+i*80; if(x<490+500*p) s+=`<path d="M${x},950 q10,-30 0,-60" fill="none" stroke="${C.blue}" stroke-width="4" opacity="0.5"/>`}
   return s;}},
 {t:'The multi-chamber profile',b:'Hollow chambers trap air, and trapped air slows the heat.',d:(p)=>{
   let s=rect(290,820,500,480,'#fff',C.ink,6,10);
   const ch=[[310,840,140,200],[470,840,140,200],[630,840,140,200],[310,1060,220,220],[550,1060,220,220]];
   ch.forEach((c,i)=>{const o=Math.max(0,Math.min(1,p*6-i)); s+=rect(c[0],c[1],c[2],c[3],'#eaf1fb',C.ink,3,6,o)+txt(c[0]+c[2]/2,c[1]+c[3]/2+10,'air',26,C.blue,'middle',500).replace('<text','<text opacity="'+o+'"');});
   return s;}},
 {t:'Steel reinforcement',b:'Galvanised steel goes into the main chamber. The steel carries the load.',d:(p)=>{
   let s=rect(290,820,500,480,'#fff',C.ink,6,10)+rect(310,840,460,200,'#eaf1fb',C.ink,3,6)+rect(310,1060,460,220,'#eaf1fb',C.ink,3,6);
   const x=330+(1-p)*-700;
   s+=`<path d="M${x},1080 h420 v180 h-420 z M${x+20},1100 h380 v140 h-380 z" fill="${C.g2}" fill-rule="evenodd"/>`+txt(540,1350,'Galvanised steel',28,C.mute);
   return s;}},
 {t:'Fusion-welded corners',b:'The ends are heated until molten and pressed together into one frame.',d:(p)=>{
   const gap=Math.max(0,1-p*1.6)*160, glow=Math.max(0,Math.min(1,(p-0.35)*3))*(1-Math.max(0,(p-0.8)*5));
   let s=`<path d="M${200-gap},1000 h${300} l60,60 v0 h-360 z" fill="#fff" stroke="${C.ink}" stroke-width="5" transform="translate(${-gap},0)"/>`;
   s=`<g transform="translate(${-gap},0)"><path d="M200,940 h360 l-80,80 h-280 z" fill="#fff" stroke="${C.ink}" stroke-width="5"/></g>`;
   s+=`<g transform="translate(${gap},${gap})"><path d="M560,940 v400 h-80 v-320 z" fill="#fff" stroke="${C.ink}" stroke-width="5"/></g>`;
   s+=`<circle cx="520" cy="980" r="70" fill="${C.warm}" opacity="${glow*0.6}"/>`;
   if(p>0.85) s+=check(800,1200,Math.min(1,(p-0.85)*7));
   return s;}},
]};
