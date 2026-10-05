window.REEL={series:'How it works /03',step:2.4,title:'How a European window gets approved for the US.',sub:'Six steps between a factory in Europe and a signed-off opening in Florida.',subTop:880,gy:120,
end:'Tested, approved, audited.',endSub:'Every VALDA impact system ships with its Florida Product Approval, NAMI certificate and test reports for permitting.',endTop:640,
steps:[
 {t:'Independent lab',b:'Full-size specimens are tested for impact, cycling, air, water and structural load.',d:(p)=>{
   let s=rect(600,860,260,380,'#eaf1fb',C.ink,8,6);
   const x=160+p*420; s+=rect(x,1030,180,30,C.warm,null,0,4)+rect(120,1000,80,100,C.g1,C.ink,4,6);
   if(p>0.95) s+=`<g stroke="#fff" stroke-width="4"><path d="M730,1045 l-50,-60 M730,1045 l60,-40 M730,1045 l-30,80 M730,1045 l70,40"/></g>`;
   return s;}},
 {t:'Test report',b:'The lab signs a report: sizes, glass, anchors and every result.',d:(p)=>doc(390,860,p,7)},
 {t:'Evaluation',b:'An evaluation entity or Florida-registered engineer checks it against the Florida Building Code.',d:(p)=>{
   let s=doc(390,860,1,7); const a=p*Math.PI*1.2;
   s+=`<g transform="translate(${540+Math.cos(a)*120},${1060+Math.sin(a)*120})"><circle r="90" fill="rgba(255,255,255,.6)" stroke="${C.ink}" stroke-width="10"/><line x1="64" y1="64" x2="130" y2="130" stroke="${C.ink}" stroke-width="18" stroke-linecap="round"/></g>`;
   return s;}},
 {t:'Product approval',b:'A Florida Product Approval or a Miami-Dade NOA fixes the size, pressure and installation.',d:(p)=>{
   const sc=0.6+0.4*Math.min(1,p*2);
   return `<g transform="translate(540,1080) scale(${sc})" opacity="${Math.min(1,p*2)}"><circle r="190" fill="${C.blue}"/><circle r="160" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="6 10"/>`+txt(0,-10,'FL',110,'#fff','middle',600)+txt(0,60,'PRODUCT APPROVAL',24,'#fff','middle',600)+`</g>`;}},
 {t:'Factory audits',b:'A third-party agency audits the factory, so every unit matches the one tested. For VALDA systems: NAMI.',bTop:560,d:(p)=>{
   let s=`<path d="M200,1300 v-260 l120,-80 v80 l120,-80 v80 l120,-80 v80 l120,-80 v80 l80,0 v260 z" fill="#fff" stroke="${C.ink}" stroke-width="5"/>`;
   s+=rect(760,920,200,260,'#fff',C.ink,4,10)+[0,1,2].map(i=>{const o=Math.max(0,Math.min(1,p*4-i));return `<path d="M790,${985+i*60} l14,14 l26,-28" fill="none" stroke="${C.blue}" stroke-width="7" opacity="${o}"/>`+rect(850,980+i*60,80,12,C.g1,null,0,6)}).join('');
   return s;}},
 {t:'On site',b:'Each unit is labelled, installed to the approved drawings and checked by the inspector.',d:(p)=>{
   let s=rect(360,860,300,420,'#eaf1fb',C.ink,8,6)+rect(380,1180,110,60,'#fff',C.ink,3,4)+txt(435,1218,'FL #',22,C.ink);
   if(p>0.5) s+=check(780,980,Math.min(1,(p-0.5)*3));
   return s;}},
]};
