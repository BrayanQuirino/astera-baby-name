export const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function searchNames(names,term,gender,country){
 const q=normalize(term).trim();
 return names.filter(n=>(gender==='all'||n.gender===gender||n.gender==='unisex')&&(country==='all'||n.country===country||n.countries?.includes(country))&&(!q||normalize([n.name,n.native||'',n.reading||'',n.meaning,n.origin,...n.variants].join(' ')).includes(q)));
}
// A lightweight, deterministic sound-flow heuristic, not a linguistic guarantee.
// Evaluate each surname separately and the full spoken name together.
// No surname data is stored or transmitted.
const vowels=/[aeiou]/;
const syllableCount=word=>(normalize(word).match(/[aeiou]+/g)||[]).length;
const soundTokens=text=>normalize(text).replace(/[^a-z\s]/g,' ').trim().split(/\s+/).filter(Boolean);
const consonant=c=>Boolean(c)&&!vowels.test(c);
export function surnameHarmony(givenName,surnames=[]){
 const given=soundTokens(givenName).join('');
 const family=surnames.flatMap(soundTokens);
 if(!given||!family.length)return 0;
 let score=0;
 const all=[given,...family];
 const counts=all.map(syllableCount);
 const total=counts.reduce((a,b)=>a+b,0);
 // Favor a readable cadence (without unfairly rejecting longer family names).
 if(total>=4&&total<=9)score+=2;
 if(counts.length>=2&&Math.abs(counts[0]-counts[1])<=2)score+=1;
 for(let i=0;i<all.length-1;i++){
  const left=all[i],right=all[i+1],a=left.at(-1),b=right[0];
  if(a===b)score-=3; // e.g. Ana Navarro or Luca Aguilar.
  else if(consonant(a)&&consonant(b))score-=1; // crowded consonant boundary.
  else score+=2; // natural consonant-vowel / vowel-consonant transition.
  if(left.slice(-2)===right.slice(0,2))score-=2;
 }
 // Avoid conspicuous repeated neighboring syllables.
 for(let i=0;i<all.length-1;i++)
  if(all[i].slice(-3)===all[i+1].slice(0,3))score-=2;
 return Math.max(-8,Math.min(8,score));
}
export function recommendNames(names,preferences){
 const {gender='all',country='all',style='any',parent1='',parent2='',mother='',father='',surname1='',surname2=''}=preferences;
 const initials=[parent1||mother,parent2||father].filter(Boolean).map(p=>normalize(p[0]));
 const surnames=[surname1,surname2].map(s=>s.trim()).filter(Boolean);
 return names.filter(n=>gender==='all'||n.gender===gender||n.gender==='unisex').map(n=>{
 let score=0;const name=normalize(n.name);
 if(country!=='all'&&(n.country===country||n.countries?.includes(country)))score+=5;
 if(style==='short'&&name.length<=5)score+=4;
 if(style==='nature'&&/luna|sora|sakura|citlali|aurora|ravi|hana|leo/i.test(n.name))score+=4;
 if(style==='traditional'&&/hugo|lucia|mateo|sofia|ines|nicolas|elena/i.test(name))score+=4;
 if(style==='modern'&&/kai|ren|mia|yuna|zuri|noah|liam/i.test(name))score+=4;
 if(initials.some(a=>name.startsWith(a)))score+=1;
 if(surnames.length)score+=surnameHarmony(n.name,surnames)*2;
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
