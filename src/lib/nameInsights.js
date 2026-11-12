// A localized display layer: translations never overwrite source meaning text.
// Creative copy uses the source builder's reusable poetic fragments.
export const foldMeaning=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function localizedMeaning(item,locale,bundle){
 const original=item?.meaning||'';
 if(locale==='es'||!bundle||bundle.lang!==locale)return original;
 if(item.meaningType==='creative'&&bundle.phrases){
  // The generator always writes "Evoca [first] y [second]." using 32 phrases.
  const body=original.startsWith('Evoca ')?original.slice(6).replace(/\.$/,''):null;
  if(body){
   const candidates=Object.keys(bundle.phrases).sort((a,b)=>b.length-a.length);
   const first=candidates.find(fragment=>body.startsWith(fragment+' y '));
   if(first){
    const second=body.slice(first.length+3);
    if(bundle.phrases[second]&&bundle.template){
     return bundle.template.replace('{a}',bundle.phrases[first]).replace('{b}',bundle.phrases[second]);
    }
   }
  }
 }
 return bundle.meanings?.[original]||original;
}
export function hasLocalizedMeaning(item,locale,bundle){
 return locale==='es'||(item?.meaningType==='published'&&item?.meaningLanguage===locale)||localizedMeaning(item,locale,bundle)!==(item?.meaning||'');
}
export function getPopularity(item,dataset,preferredCountry='all'){
 const key=foldMeaning(item?.name);
 const originalKey=String(item?.name||'').normalize('NFD').toLowerCase().trim();
 const values=dataset?.names?.[originalKey]||dataset?.names?.[key];
 if(!values)return null;
 if(preferredCountry!=='all'){
  const pair=values[preferredCountry];
  return pair?{index:pair[0],share:pair[1],country:preferredCountry}:null;
 }
 const [country,pair]=Object.entries(values).sort((a,b)=>b[1][1]-a[1][1])[0]||[];
 return pair?{index:pair[0],share:pair[1],country}:null;
}
