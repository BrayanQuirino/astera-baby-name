export const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function searchNames(names,term,gender,country){
 const q=normalize(term).trim();
 return names.filter(n=>(gender==='all'||n.gender===gender||n.gender==='unisex')&&(country==='all'||n.country===country||n.countries?.includes(country))&&(!q||normalize([n.name,n.native||'',n.reading||'',n.meaning,n.origin,...n.variants].join(' ')).includes(q)));
}
export function recommendNames(names,preferences){
 const {gender='all',country='all',style='any',parent1='',parent2=''}=preferences;
 const initials=[parent1,parent2].filter(Boolean).map(p=>normalize(p[0]));
 return names.filter(n=>gender==='all'||n.gender===gender||n.gender==='unisex').map(n=>{
 let score=0;const name=normalize(n.name);
 if(country!=='all'&&(n.country===country||n.countries?.includes(country)))score+=5;
 if(style==='short'&&name.length<=5)score+=4;
 if(style==='nature'&&/luna|sora|sakura|citlali|aurora|ravi|hana|leo/i.test(n.name))score+=4;
 if(style==='traditional'&&/hugo|lucia|mateo|sofia|ines|nicolas|elena/i.test(name))score+=4;
 if(style==='modern'&&/kai|ren|mia|yuna|zuri|noah|liam/i.test(name))score+=4;
 if(initials.some(a=>name.startsWith(a)))score+=1;
 return {...n,score};
 }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'es')).slice(0,12);
}
export function zodiac(date){
 if(!date)return {name:'Tu cielo',symbol:'✧',dots:[[14,23],[71,19],[40,48],[81,72],[28,83],[60,91]]};
 const m=Number(date.slice(5,7)),d=Number(date.slice(8,10));
 if(!m||!d)return zodiac('');
 const bounds=[[120,'Capricornio','♑'],[219,'Acuario','♒'],[320,'Piscis','♓'],[420,'Aries','♈'],[521,'Tauro','♉'],[621,'Géminis','♊'],[723,'Cáncer','♋'],[823,'Leo','♌'],[923,'Virgo','♍'],[1023,'Libra','♎'],[1122,'Escorpio','♏'],[1222,'Sagitario','♐']];
 const n=m*100+d;const found=bounds.find(([limit])=>n<limit);
 const [_,name,symbol]=found||[0,'Capricornio','♑'];
 return {name,symbol,dots:[[14,23],[71,19],[40,48],[81,72],[28,83],[60,91]]};
}
