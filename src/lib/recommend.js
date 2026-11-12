export const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function searchNames(names,term,gender,country){
 const q=normalize(term).trim();
 return names.filter(n=>(gender==='all'||n.gender===gender||n.gender==='unisex')&&(country==='all'||n.country===country||n.countries?.includes(country))&&(!q||normalize([n.name,n.native||'',n.reading||'',n.meaning,n.origin,...n.variants].join(' ')).includes(q)));
}
// Pronunciation-aware *heuristic* (not a linguistic pronunciation dictionary).
// Normalize spelling, count vowel nuclei, examine every word boundary and
// differentiate rhythmic patterns, repeated endings, hiatus and consonant clusters.
// We do not infer someone's language or ethnicity from their surname.
const letters=value=>normalize(value).replace(/[^a-zñü'\s-]/g,' ').replace(/[-']/g,' ').trim();
const words=value=>letters(value).split(/\s+/).filter(Boolean);
const vowels=/[aeiouü]/;
const nucleus=word=>word.match(/[aeiouü]+/g)||[];
const syllables=word=>Math.max(1,nucleus(word).length);
const isVowel=char=>vowels.test(char||'');
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
// A small pronunciation sketch makes orthographic e.g. "qu", "ll", "ch" more natural.
const sound=word=>word.replace(/qu(?=[ei])/g,'k').replace(/gue(?=[^a-z]|$)/g,'ge').replace(/ch/g,'č').replace(/ll/g,'y').replace(/rr/g,'ř').replace(/ph/g,'f').replace(/h/g,'').replace(/c(?=[ei])/g,'s').replace(/c/g,'k').replace(/v/g,'b').replace(/z/g,'s');
const ending=word=>{const m=sound(word).match(/[aeiouü][^aeiouü]*$/);return m?.[0]||sound(word).slice(-2)};
export const hasHarmonyPreferences=preferences=>Boolean([preferences.surname1,preferences.surname2].some(v=>String(v||'').trim()));
export function surnameHarmony(givenName,surnames=[]){
 const givenWords=words(givenName),familyWords=surnames.flatMap(words);
 if(!givenWords.length||!familyWords.length)return null;
 const all=[...givenWords,...familyWords].map(sound);
 const sounds=all.map(syllables);
 let points=70;
 // Rhythm: distinguish 1–2–3, 2–3–2 and dense equal-length patterns.
 const total=sounds.reduce((sum,n)=>sum+n,0);
 points+=total>=4&&total<=10?5:total>13?-9:-2;
 for(let i=0;i<sounds.length-1;i++){
  const difference=Math.abs(sounds[i]-sounds[i+1]);
  points+=difference===1?7:difference===2?4:difference===0?-4:difference>=4?-5:1;
 }
 for(let i=0;i<all.length-1;i++){
  const left=all[i],right=all[i+1];
  const tail=left.at(-1),head=right[0];
  const lv=isVowel(tail),rv=isVowel(head);
  if(tail===head)points-=9;
  else if(lv!==rv)points+=6;
  else if(lv&&rv)points-=4;
  else points-=6;
  if(left.slice(-2)===right.slice(0,2))points-=7;
  // More than two consecutive consonants across a word boundary is hard to say.
  const cluster=(left.match(/[^aeiouü]+$/)?.[0]?.length||0)+(right.match(/^[^aeiouü]+/)?.[0]?.length||0);
  if(cluster>=3)points-=Math.min(12,(cluster-2)*4);
  // Adjacent words should not rhyme or echo each other's entire final nucleus.
  if(ending(left)===ending(right))points-=7;
 }
 // Repeated sounds between the given name and the surnames affect flow.
 const name=all[0];
 for(const surname of all.slice(givenWords.length)){
  if(name.slice(-3)===surname.slice(-3))points-=7;
  if(name.slice(0,2)===surname.slice(0,2))points+=2;
  if(name===surname)points-=18;
 }
 // Distinctness: written pronunciation features also separate close candidates.
 const vowelShape=nucleus(name).map(part=>part[0]).join('');
 const alternations=[...vowelShape].filter((char,i)=>i&&char!==vowelShape[i-1]).length;
 points+=Math.min(8,alternations*2);
 if(name.length<=2||name.length>=13)points-=5;
 return Math.round(clamp(points,8,98));
}
export function recommendNames(names,preferences){
 const {gender='all',country='all',style='any',parent1='',parent2='',mother='',father='',surname1='',surname2=''}=preferences;
 const initials=[parent1||mother,parent2||father].filter(Boolean).map(p=>normalize(p[0]));
 const surnames=[surname1,surname2].map(v=>String(v||'').trim()).filter(Boolean);
 const personalized=Boolean(surnames.length||initials.length||country!=='all'||style!=='any');
 return names.filter(n=>gender==='all'||n.gender===gender||n.gender==='unisex').map(n=>{
  const name=normalize(n.name);
  let preferenceScore=0;
  if(country!=='all'&&(n.country===country||n.countries?.includes(country)))preferenceScore+=12;
  if(style==='short'&&name.length<=5)preferenceScore+=8;
  if(style==='nature'&&/luna|sora|sakura|citlali|aurora|ravi|hana|leo/i.test(n.name))preferenceScore+=8;
  if(style==='traditional'&&/hugo|lucia|mateo|sofia|ines|nicolas|elena/i.test(name))preferenceScore+=8;
  if(style==='modern'&&/kai|ren|mia|yuna|zuri|noah|liam/i.test(name))preferenceScore+=8;
  if(initials.some(a=>name.startsWith(a)))preferenceScore+=2;
  const harmony=surnames.length?surnameHarmony(n.name,surnames):null;
  return {...n,harmony,score:preferenceScore+(harmony??0)};
 }).sort((a,b)=>personalized?(b.score-a.score||a.name.localeCompare(b.name,'es')):a.name.localeCompare(b.name,'es'));
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
