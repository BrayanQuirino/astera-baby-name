export const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
// Cultural origin differs from countries where a name has been recorded.
// A given name can be used in Japan without being Japanese by origin.
// Intentionally exclude unknown origins rather than assigning a false culture.
const CULTURE_TERMS={
 JP:['japanese','japones','japon','nihongo','日本'],
 KR:['korean','coreano','coreana','한국'],
 CN:['chinese','chino','china','mandarin','中国'],
 TW:['chinese','chino','china','taiwan','台湾'],
 ES:['spanish','espanol','espana','castilian','castellano'],
 MX:['mexican','mexico','nahuatl','maya','mayan','zapotec','mixtec','otomi','purepecha','huichol'],
 FR:['french','frances','francia','breton'],
 DE:['german','aleman','alemania','germanic','germanico'],
 IT:['italian','italiano','italia'],
 GB:['english','british','welsh','scottish','anglo','ingles'],
 US:['american','estadounidense','native american'],
 GR:['greek','griego','grecia'],
 SE:['swedish','sueco','suecia','nordic','scandinavian'],
 IN:['indian','india','hindi','sanskrit','tamil','bengali','marathi','punjabi','telugu','malayalam'],
 EG:['egyptian','egipcio','coptic'],
 BR:['brazilian','brasileno','brasil','tupi','guarani','portuguese'],
 NG:['nigerian','nigeria','yoruba','igbo','hausa'],
 IE:['irish','irlandes','gaelic'],
 KE:['kenyan','kenia','swahili','suajili'],
 PT:['portuguese','portugues','portugal'],
 RU:['russian','ruso','rusia'],
 TR:['turkish','turco','turquia'],
 IL:['hebrew','hebreo','israeli'],
 SA:['arabic','arabe','saudi'],
 IR:['persian','persa','iranian','farsi'],
 PK:['urdu','pakistani','punjabi'],
 VN:['vietnamese','vietnamita'],
 TH:['thai','tailandes'],
 NL:['dutch','neerlandes','holandes'],
 PL:['polish','polaco'],
 NO:['norwegian','noruego','norse'],
 DK:['danish','danes'],
 FI:['finnish','finlandes'],
 IS:['icelandic','islandes'],
 UA:['ukrainian','ucraniano'],
 CZ:['czech','checo'],
 HU:['hungarian','hungaro'],
 RO:['romanian','rumano'],
 AR:['argentinian','argentino','quechua','mapuche'],
 CL:['chilean','chileno','mapuche'],
 PE:['peruvian','peruano','quechua','aymara'],
 CO:['colombian','colombiano'],
 VE:['venezuelan','venezolano'],
 PH:['filipino','tagalog','filipina'],
 ID:['indonesian','bahasa indonesia','javanese'],
 MY:['malay','malaysian'],
 ZA:['south african','zulu','xhosa','afrikaans']
};
const CULTURE_ALIASES={
 JP:['japones','japanese','japon'],KR:['coreano','korean'],CN:['chino','chinese'],TW:['chino','chinese'],ES:['espanol','spanish'],
 MX:['mexico','mexican'],FR:['frances','french'],DE:['aleman','german'],IT:['italiano','italian'],
 GB:['ingles','english'],GR:['griego','greek'],PT:['portugues','portuguese']
};
export function matchesCulture(name,country='all'){
 if(!country||country==='all')return true;
 // The published catalog explicitly records linguistic/cultural origin
 // independently of countries where the name was counted in a census.
 // An empty array means unverified: do not silently use birth geography.
 if(Array.isArray(name.originCountryCodes)){
  return name.originCountryCodes.includes(country);
 }
 const origin=normalize(name.origin||'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const terms=CULTURE_TERMS[country]||[];
 const aliases=CULTURE_ALIASES[country]||[];
 const originWords=' '+origin+' ';
 if([...terms,...aliases].some(term=>originWords.includes(' '+normalize(term)+' ')))return true;
 // Country provenance is frequency data, not an assertion of cultural origin.
 // For nonmapped cultures keep exact origin-country wording only, not country usage.
 return false;
}
export function searchNames(names,term,gender,country){
 const q=normalize(term).trim();
 return names.filter(n=>(gender==='all'||n.gender===gender||n.gender==='unisex')&&matchesCulture(n,country)&&(!q||normalize([n.name,n.native||'',n.reading||'',n.meaning,n.origin,...(n.variants||[])].join(' ')).includes(q)));
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
 let points=54;
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
// One canonical filtering engine for both browsing and personalized discovery.
// Every option is a hard filter; only surname harmony affects result order.
export const LETTER_RANGES=[['A','E'],['F','K'],['L','P'],['Q','U'],['V','Z']];
export const initialWithinRange=(name,range)=>{
 if(!range)return true;
 const first=normalize(name).trim()[0]||'';
 const item=LETTER_RANGES.find(([a,b])=>a+'-'+b===range);
 return !item||first>=item[0].toLowerCase()&&first<=item[1].toLowerCase();
};
export function recommendNames(names,preferences={}){
 return filterNames(names,'',preferences);
}
export function filterNames(names,query,preferences={},alreadySorted=false){
 const {gender='all',country='all',style='any',initial='',initialRange='',surname1='',surname2=''}=preferences;
 const q=normalize(query).trim(),letter=normalize(initial).trim().slice(0,1);
 const surnames=[surname1,surname2].map(v=>String(v||'').trim()).filter(Boolean);
 const filtered=names.filter(n=>{
  if(gender!=='all'&&n.gender!==gender&&n.gender!=='unisex')return false;
  if(!matchesCulture(n,country))return false;
  if(letter&&!normalize(n.name).startsWith(letter))return false;
  if(!initialWithinRange(n.name,initialRange))return false;
  const name=normalize(n.name);
  if(style==='short'&&name.length>5)return false;
  if(style==='nature'&&!/luna|sora|sakura|citlali|aurora|ravi|hana|leo|rosa|flora|iris|sol|rio|kai|mar|river|jade|oliver|olive|dahlia/i.test(name))return false;
  if(style==='traditional'&&!/hugo|lucia|mateo|sofia|ines|nicolas|elena|ana|maria|jose|juan|carlos|isabel|antonio|miguel|pedro|francisco|carmen/i.test(name))return false;
  if(style==='modern'&&!/kai|ren|mia|yuna|zuri|noah|liam|emma|olivia|luca|leo|enzo|theo|aria|nova|ezra/i.test(name))return false;
  if(q&&!normalize([n.name,n.native||'',n.reading||'',n.meaning||'',n.origin||'',...(n.variants||[])].join(' ')).includes(q))return false;
  return true;
 });
 if(!surnames.length)return alreadySorted?filtered:filtered.sort((a,b)=>a.name.localeCompare(b.name,'es'));
 return filtered.map(n=>({...n,harmony:surnameHarmony(n.name,surnames)}))
  .sort((a,b)=>b.harmony-a.harmony||a.name.localeCompare(b.name,'es'));
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
