const C={ink:'#222224',g1:'#c9ccd1',g2:'#8d9198',g3:'#eef0f2',blue:'#1f4e8c',warm:'#d9772b',mute:'#a3a3a5',light:'#f4f4f4'};
const rect=(x,y,w,h,fill,st,sw=3,rx=6,op=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${st?`stroke="${st}" stroke-width="${sw}"`:''} opacity="${op}"/>`;
const txt=(x,y,s,size=28,fill=C.ink,anchor='middle',w=500)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${w}">${s}</text>`;
const check=(x,y,p,col=C.blue)=>`<circle cx="${x}" cy="${y}" r="${44*p}" fill="${col}"/><path d="M${x-20},${y} l14,14 l26,-28" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="${p>0.6?1:0}"/>`;
const doc=(x,y,p,lines=6)=>rect(x,y,300,400,'#fff',C.ink,4,10)+[...Array(lines)].map((_,i)=>rect(x+36,y+60+i*50,(i%3==2?150:228)*Math.max(0,Math.min(1,p*lines-i)),14,C.g1,null,0,7)).join('');
