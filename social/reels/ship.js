window.REEL={series:'How it works /02',title:'How your windows get from Bulgaria to your site.',sub:'Factory direct. One point of contact.',subTop:880,gy:120,
end:'Factory to final window.',endSub:'No distributor in between. Delivery to your nearest US port or all the way to site.',
steps:[
 {t:'Made in our own factories',b:'Two family-owned factories in Bulgaria, making windows since 1998.',d:(p)=>{
   let s=`<path d="M200,1300 v-260 l120,-80 v80 l120,-80 v80 l120,-80 v80 l120,-80 v80 l80,0 v260 z" fill="#fff" stroke="${C.ink}" stroke-width="5"/>`;
   for(let i=0;i<4;i++){const o=Math.max(0,Math.min(1,p*5-i)); s+=rect(820,1260-i*80,140,70,'#eaf1fb',C.ink,4,4,o);}
   s+=txt(890,1350,'Windows out',26,C.mute);return s;}},
 {t:'Packed for the crossing',b:'Every order is protected for sea and road, then trucked to the port.',d:(p)=>{
   const x=-400+p*700;
   let s=`<g transform="translate(${x},0)">`+rect(300,980,420,240,C.blue,null,0,8)+txt(510,1115,'VALDA',44,'#fff','middle',600)+rect(720,1060,140,160,'#fff',C.ink,4,8)+`<circle cx="380" cy="1240" r="34" fill="${C.ink}"/><circle cx="620" cy="1240" r="34" fill="${C.ink}"/><circle cx="800" cy="1240" r="34" fill="${C.ink}"/></g>`;
   s+=`<line x1="0" y1="1278" x2="1080" y2="1278" stroke="${C.g1}" stroke-width="4"/>`;return s;}},
 {t:'Across the Atlantic',b:'Shipped with full export documentation.',d:(p,lt)=>{
   const x=-300+p*700; let s='';
   for(let i=0;i<8;i++){const wx=(i*160-lt*80)%1280-100; s+=`<path d="M${wx},1290 q40,-24 80,0 t80,0" fill="none" stroke="${C.blue}" stroke-width="5" opacity="0.4"/>`;}
   s+=`<g transform="translate(${x},${Math.sin(lt*3)*6})"><path d="M200,1180 h560 l-70,90 h-430 z" fill="${C.ink}"/>`+rect(260,1080,140,100,C.blue,null,0,4)+rect(410,1080,140,100,C.g1,null,0,4)+rect(560,1080,140,100,C.g2,null,0,4)+rect(330,980,140,100,C.g1,null,0,4)+rect(480,980,140,100,C.blue,null,0,4)+`</g>`;
   s+=txt(140,940,'BG',34,C.mute)+txt(940,940,'USA',34,C.mute);return s;}},
 {t:'US customs, handled',b:'We clear US customs for you, so nothing waits at the port.',d:(p)=>{
   let s=doc(240,860,p,6);
   const st=Math.max(0,Math.min(1,(p-0.5)*3));
   s+=`<g transform="translate(700,1060) rotate(-12) scale(${1+(1-st)*0.6})" opacity="${st}">`+`<rect x="-150" y="-60" width="300" height="120" rx="12" fill="none" stroke="${C.blue}" stroke-width="8"/>`+txt(0,16,'CLEARED',48,C.blue,'middle',600)+`</g>`;
   return s;}},
 {t:'Delivered to your site',b:'From the port to your site, East Coast to West Coast, ready to install.',d:(p)=>{
   let s=rect(340,880,400,420,'#fff',C.ink,5,6);
   for(let r=0;r<4;r++)for(let c=0;c<3;c++){const k=r*3+c,o=Math.max(0,Math.min(1,p*13-k)); s+=rect(370+c*125,910+(3-r)*95,95,70,'#eaf1fb',C.ink,3,3,o);}
   if(p>0.9) s+=check(830,960,Math.min(1,(p-0.9)*10));
   s+=`<line x1="120" y1="1300" x2="960" y2="1300" stroke="${C.g1}" stroke-width="4"/>`;return s;}},
]};
