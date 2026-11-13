import React,{useMemo,useState,useEffect} from 'react';
import {Heart,Search,ArrowRight,Sparkles,Globe2,X,CalendarDays,Menu,Copy,Check,SlidersHorizontal,ChevronDown} from 'lucide-react';
import {names as curatedNames,countries as curatedCountries} from './lib/names.js';
import StarDatePicker from './components/StarDatePicker.jsx';
import AlphabetPicker from './components/AlphabetPicker.jsx';
import NameSkyExperience from './components/NameSkyExperience.jsx';
import CultureCombobox from './components/CultureCombobox.jsx';
import {filterNames,zodiac,hasHarmonyPreferences,LETTER_RANGES} from './lib/recommend.js';
import {LANGUAGES,localeFor,translate} from './lib/i18n.js';
import {localizedMeaning,hasLocalizedMeaning,getPopularity} from './lib/nameInsights.js';

const genders=[['all','surprise'],['girl','girl'],['boy','boy']];
const todayLocal=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const empty={date:todayLocal(),initial:'',initialRange:'',surname1:'',surname2:'',country:'all',gender:'all',style:'any'};
const styles=[['any','any'],['short','short'],['traditional','traditional'],['modern','modern'],['nature','nature']];
function readFavorites(){try{return JSON.parse(localStorage.getItem('astera.favorites')||'[]')}catch{return []}}
function NameCard({item,liked,toggle,open,surnames='',harmony=null,popularity=null,t,meaning,translated=true}){
 return <article className="name-card"><div className="name-card-top"><span className="name-category">{item.origin}</span><button className={'heart '+(liked?'liked':'')} onClick={()=>toggle(item.id)} aria-label={liked?t('remove'):t('save')}><Heart size={19} fill={liked?'currentColor':'none'}/></button></div><button className="name-open" onClick={()=>open(item)}><h3>{item.name}</h3>{surnames&&<span className="full-name-preview">{item.name} {surnames}</span>}{item.native&&<span className="native-name">{item.native}</span>}{item.components?.length>1&&<span className="compound-components" aria-label={t('components')}><small>{t('components')}</small><span>{item.components.join(' · ')}</span></span>}<p>{meaning||t('nameStory')}</p>{!translated&&<small className="meaning-source-caption">{t('meaningOriginal')}</small>}{item.meaningType==='creative'&&<small className="poetic-label">✧ {t('poetic')}</small>}{popularity&&<div className="harmony-meter popularity-meter" aria-label={`${t('popularity')}: ${popularity.index}/100`} title={t('popularityNote')}><div className="harmony-meter-heading"><span>✦ {t('popularity')} <small>({popularity.country})</small></span><strong>{popularity.index}/100</strong></div><div className="harmony-track"><div style={{width:`${popularity.index}%`}}/></div></div>}{!popularity&&<div className="harmony-meter popularity-meter" title={t('popularityNote')}><div className="harmony-meter-heading"><span>✦ {t('popularity')}</span><strong>{t('noPopularity')}</strong></div><div className="harmony-track missing"><div/></div></div>}{harmony!==null&&<div className="harmony-meter" aria-label={`${t('harmony')}: ${harmony}%`}><div className="harmony-meter-heading"><span>✧ {t('harmony')}</span><strong>{harmony}%</strong></div><div className="harmony-track"><div style={{width:`${harmony}%`}}/></div></div>}<span>{t('nameStory')} <ArrowRight size={15}/></span></button></article>
}
function Sky({date,setDate,t,lang}){
 const sign=zodiac(date);
 return <section id="cielo" className="sky-section"><div className="sky-copy"><div className="eyebrow">{t('skyEyebrow')}</div><h2>{t('skyTitle')} <em>{t('skyEm')}</em></h2><p>{t('skyDescription')}</p><div className="date-input"><StarDatePicker value={date} onChange={setDate} lang={lang} dark/></div><small>{t('skyNote')}</small></div><div className="sky-graphic"><div className="orbital outer"></div><div className="orbital inner"></div><div className="sky-symbol">{sign.symbol}</div><div className="sky-stars">{sign.dots.map(([x,y],i)=><span key={i} style={{left:x+'%',top:y+'%'}}>✦</span>)}</div><strong>{sign.name}</strong><span className="sky-label">{date?t('skySign'):t('chooseDate')}</span></div></section>
}
export default function App(){
 const [query,setQuery]=useState('');
 const [advancedOpen,setAdvancedOpen]=useState(false);
 const [expandedLetterRange,setExpandedLetterRange]=useState('');
 const [searchFocused,setSearchFocused]=useState(false);
 const [showFloatingLoad,setShowFloatingLoad]=useState(false);
 // One source of truth across the explorer and Discover Name dialog.
 const [prefs,setPrefs]=useState(empty);
 const [discoveryMode,setDiscoveryMode]=useState(false);
 const updateFilter=(key,value)=>{setPrefs(p=>({...p,[key]:value}));setShowFav(false);setPage(1)};
 const updateInitial=value=>{setPrefs(p=>({...p,initial:value.slice(0,1),initialRange:''}));setShowFav(false)};
 const updateRange=value=>{setExpandedLetterRange(p=>p===value?'':value);setPrefs(p=>({...p,initialRange:value,initial:''}));setShowFav(false)};
 const openWizard=()=>setWizard(true);
 const [lang,setLang]=useState(()=>{try{return localeFor(localStorage.getItem('astera.language'))||'es'}catch{return 'es'}});
 const [languageOffer,setLanguageOffer]=useState(null);
 const [page,setPage]=useState(1);
 const t=key=>translate(lang,key);
 const languageChange=next=>{setLang(next);setLanguageOffer(null);try{localStorage.setItem('astera.language',next)}catch{}};
 useEffect(()=>{document.documentElement.lang=lang;document.title='Astera · '+t('findName')},[lang]);
 useEffect(()=>{const browser=(navigator.languages||[navigator.language]).map(localeFor).find(Boolean);let stored=false;try{stored=Boolean(localStorage.getItem('astera.language')||sessionStorage.getItem('astera.languageOfferDismissed'))}catch{}if(browser&&browser!=='es'&&!stored)setLanguageOffer(browser)},[]);
 const [names,setNames]=useState(()=>[...curatedNames].sort((a,b)=>a.name.localeCompare(b.name,'es')).map((n,id)=>({...n,id})));
 const [countries,setCountries]=useState(curatedCountries);
 const [popularityData,setPopularityData]=useState(null);
 const [meaningBundle,setMeaningBundle]=useState(null);
 useEffect(()=>{let alive=true;fetch(import.meta.env.BASE_URL+'names/popularity.json').then(r=>r.ok?r.json():null).then(data=>{if(alive)setPopularityData(data)}).catch(()=>{});return()=>{alive=false}},[]);
 useEffect(()=>{let alive=true;setMeaningBundle(null);if(lang==='es')return()=>{alive=false};fetch(import.meta.env.BASE_URL+'names/locales/'+lang+'.json').then(r=>r.ok?r.json():null).then(data=>{if(alive)setMeaningBundle(data)}).catch(()=>{});return()=>{alive=false}},[lang]);
 useEffect(()=>{
  let active=true;
  Promise.all([fetch(import.meta.env.BASE_URL+'names/search-index.json').then(r=>r.ok?r:fetch(import.meta.env.BASE_URL+'names/extended.json')),fetch(import.meta.env.BASE_URL+'names/countries.json')])
   .then(async ([nameResponse,countryResponse])=>{
    if(!nameResponse.ok||!countryResponse.ok)throw Error('El catálogo ampliado no está disponible');
    const [catalogPayload,locations]=await Promise.all([nameResponse.json(),countryResponse.json()]);
    const extended=Array.isArray(catalogPayload)?catalogPayload:catalogPayload.rows.map(row=>Object.fromEntries(catalogPayload.fields.map((field,i)=>[field,row[i]])));
    if(!active)return;
    // Catalog entries are authoritative and already deduplicated. Preserve curated
    // entries only when absent from the expanded catalog; reconcile diacritics.
    const aliasKey=value=>String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().trim();
    const known=new Set(extended.map(n=>aliasKey(n.name)));
    const additions=curatedNames.filter(n=>!known.has(aliasKey(n.name)));
    setNames([...extended,...additions].sort((a,b)=>a.name.localeCompare(b.name,'es')).map((n,id)=>({...n,id})));
    const codes=new Set(curatedCountries.map(([code])=>code));
    setCountries([...curatedCountries,...locations.filter(c=>!codes.has(c.code)).map(c=>[c.code,c.name])].sort((a,b)=>a[0]==='all'?-1:b[0]==='all'?1:a[1].localeCompare(b[1],'es')));
   }).catch(error=>console.info('Astera conserva el catálogo local:',error.message));
  return()=>{active=false};
 },[]);
 const [favorites,setFavorites]=useState(readFavorites),[showFav,setShowFav]=useState(false),[wizard,setWizard]=useState(false);
 const [detail,setDetail]=useState(null),[copied,setCopied]=useState(false),[menu,setMenu]=useState(false);
 useEffect(()=>{localStorage.setItem('astera.favorites',JSON.stringify(favorites))},[favorites]);
 useEffect(()=>{document.body.style.overflow=wizard||detail?'hidden':'';return()=>{document.body.style.overflow=''}},[wizard,detail]);
 const cultureCounts=useMemo(()=>{const counts={};for(const n of names){for(const code of n.originCountryCodes||[]){counts[code]=(counts[code]||0)+1;}}return counts},[names]);
 const unknownOrigins=useMemo(()=>names.reduce((sum,n)=>sum+(!Array.isArray(n.originCountryCodes)||n.originCountryCodes.length===0?1:0),0),[names]);
 const result=useMemo(()=>filterNames(names,query,prefs,true),[names,query,prefs]);
 const display=useMemo(()=>showFav?names.filter(n=>favorites.includes(n.id)).sort((a,b)=>a.name.localeCompare(b.name,lang)):result,[showFav,names,favorites,result,lang]);
 const pageSize=24;
 const [visibleCount,setVisibleCount]=useState(pageSize);
 const visible=useMemo(()=>display.slice(0,visibleCount),[display,visibleCount]);
 const canLoadMore=visibleCount<display.length;
 const loadMore=()=>setVisibleCount(n=>Math.min(n+pageSize,display.length));
 useEffect(()=>setVisibleCount(pageSize),[query,prefs,showFav,discoveryMode]);
 useEffect(()=>{
  const check=()=>{
   const explore=document.getElementById('explorar');
   if(!explore)return;
   const rect=explore.getBoundingClientRect();
   setShowFloatingLoad(rect.top<window.innerHeight*.35&&rect.bottom>window.innerHeight*.25);
  };
  check();
  window.addEventListener('scroll',check,{passive:true});
  window.addEventListener('resize',check);
  return()=>{window.removeEventListener('scroll',check);window.removeEventListener('resize',check)};
 },[]);
 const smartSuggestions=useMemo(()=>{
  const term=query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(term.length<2||showFav)return [];
  const exact=[],starts=[],related=[];
  for(const n of result){
   const name=n.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   if(name===term)exact.push(n);
   else if(name.startsWith(term)&&starts.length<7)starts.push(n);
   else if(related.length<5)related.push(n);
   if(exact.length+starts.length>=7)break;
  }
  return [...exact,...starts,...related].slice(0,7);
 },[result,query,showFav]);
 const chooseSuggestion=name=>{setQuery(name);setSearchFocused(false);setShowFav(false);setDiscoveryMode(false)};
 const harmonyEnabled=!showFav&&hasHarmonyPreferences(prefs);
 const popularityCountry=prefs.country;
 const babySurnames=[prefs.surname1,prefs.surname2].map(v=>v.trim()).filter(Boolean).join(' ');
 const activeFilters=Number(prefs.style!=='any')+Number(Boolean(prefs.initial.trim()))+Number(Boolean(prefs.surname1.trim()))+Number(Boolean(prefs.surname2.trim()));
 const toggle=id=>setFavorites(v=>v.includes(id)?v.filter(n=>n!==id):[...v,id]);
 const set=(key,value)=>updateFilter(key,value);
 const reset=()=>{setDiscoveryMode(false);setShowFav(false);setQuery('');setPrefs(empty);setPage(1)};
 const generate=()=>{setDiscoveryMode(true);setShowFav(false);setPage(1);setWizard(false);setTimeout(()=>document.getElementById('explorar')?.scrollIntoView({behavior:'smooth'}),80)};
 const share=async()=>{try{await navigator.clipboard.writeText(names.filter(n=>favorites.includes(n.id)).map(n=>n.name+' — '+n.meaning).join('\n'));setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{}};
 return <div className="site">
 <header className="header"><a className="brand" href="#inicio"><span>✳</span> astera<span className="dot">.</span></a><nav className={menu?'open':''}><a onClick={()=>setMenu(false)} href="#explorar">{t('navExplore')}</a><a onClick={()=>setMenu(false)} href="#cielo">{t('navSky')}</a><button onClick={()=>{setShowFav(true);setDiscoveryMode(false);setMenu(false);document.getElementById('explorar')?.scrollIntoView({behavior:'smooth'})}}>{t('favorites')} <b>{favorites.length}</b></button></nav><button className="nav-cta" onClick={openWizard}>{t('findName')} <ArrowRight size={17}/></button><div className="language-menu"><Globe2 size={16}/><select value={lang} aria-label={t('language')} onChange={e=>languageChange(e.target.value)}>{Object.entries(LANGUAGES).map(([code,label])=><option value={code} key={code}>{label}</option>)}</select></div><button className="menu-button" aria-label="Abrir navegación" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
 <main>
 <section id="inicio" className="hero"><div className="hero-copy"><div className="eyebrow">{t('heroEyebrow')}</div><h1>{t('heroTitle')}<br/><em>{t('heroEm')}</em></h1><p>{t('heroDescription')}</p><div className="hero-actions"><button className="primary" onClick={()=>setWizard(true)}>{t('discover')} <Sparkles size={18}/></button><a className="plain-link" href="#explorar">{t('explore')} <ArrowRight size={17}/></a></div><div className="hero-caption"><span className="hero-count"><strong>{names.length.toLocaleString('es-MX')}</strong> {t('heroCount')}</span><span className="hero-count-note">{t('heroNote')}</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-a"></div><div className="orbit orbit-b"></div><div className="orbit orbit-c"></div><div className="moon"><i></i><i></i></div><span className="spark s1">✧</span><span className="spark s2">✦</span><span className="spark s3">✧</span><span className="orbit-text o1">amor</span><span className="orbit-text o2">vida</span><span className="orbit-text o3">luz</span></div></section>
 <div className="ticker"><span>✧ &nbsp; {t('ticker1')}</span><span>✧ &nbsp; {t('ticker2')}</span><span>✧ &nbsp; {t('ticker3')}</span><span>✧ &nbsp; {t('ticker4')}</span></div>
 <section id="explorar" className="explore"><div className="section-heading"><div><div className="eyebrow dark">{t('exploreEyebrow')}</div><h2>{t('exploreTitle')} <em>{t('exploreEm')}</em></h2><p>{t('exploreDescription')}</p></div><button className="outlined" onClick={()=>setWizard(true)}><Sparkles size={17}/> {t('recommend')}</button></div>
 <div className="filters"><div className="search-box"><Search size={21}/><input placeholder={t('searchPlaceholder')} aria-label={t('searchPlaceholder')} value={query} onChange={e=>{setQuery(e.target.value);setShowFav(false)}}/>{query&&<button aria-label="Borrar búsqueda" onClick={()=>setQuery('')}><X size={16}/></button>}</div><div className="filter-bottom"><div className="segmented">{[['all',t('all')],['girl',t('girl')],['boy',t('boy')]].map(([v,label])=><button key={v} className={prefs.gender===v?'active':''} onClick={()=>updateFilter('gender',v)}>{label}</button>)}</div><CultureCombobox options={countries} counts={cultureCounts} value={prefs.country} lang={lang} label={t('cultureQuestion')} onChange={next=>updateFilter('country',next)}/></div><AlphabetPicker label={t('initialRanges')} initial={prefs.initial} initialRange={prefs.initialRange} expandedRange={expandedLetterRange} onRange={updateRange} onInitial={updateInitial}/><div className="advanced-toggle-row"><button type="button" className={'advanced-toggle '+(advancedOpen||activeFilters?'active':'')} aria-expanded={advancedOpen} aria-controls="advanced-name-filters" onClick={()=>setAdvancedOpen(v=>!v)}><SlidersHorizontal size={17}/>{advancedOpen?t('collapseFilters'):t('expandFilters')} {activeFilters>0&&<span className="filter-count">{activeFilters}</span>}<ChevronDown className={advancedOpen?'rotated':''} size={16}/></button>{activeFilters>0&&<button className="clear-advanced" type="button" onClick={()=>setPrefs(p=>({...p,style:'any',initial:'',surname1:'',surname2:''}))}>{t('clearFilters')}</button>}</div>{advancedOpen&&<div className="advanced-panel" id="advanced-name-filters"><div className="advanced-grid"><div className="advanced-field"><strong>{t('styleQuestion')}</strong><div className="choices">{styles.map(([v,k])=><button type="button" key={v} className={prefs.style===v?'active':''} onClick={()=>updateFilter('style',v)}>{t(k)}</button>)}</div></div><label className="advanced-field"><strong>{t('initialQuestion')}</strong><input value={prefs.initial} onChange={e=>updateInitial(e.target.value)} maxLength={1} placeholder={t('initialPlaceholder')} autoComplete="off" /></label><div className="advanced-field"><strong>{t('surnames')}</strong><div className="two-fields"><input aria-label={t('surname1')} value={prefs.surname1} onChange={e=>updateFilter('surname1',e.target.value)} placeholder={t('surname1')} maxLength={70}/><input aria-label={t('surname2')} value={prefs.surname2} onChange={e=>updateFilter('surname2',e.target.value)} placeholder={t('surname2')} maxLength={70}/></div><small className="surname-hint">{t('surnameHint')}</small></div></div></div>}</div>{prefs.country!=='all'&&<p className="origin-filter-note">{t('originFilterNote')} · {t('unknownOrigins')}: {unknownOrigins.toLocaleString(lang)}. {t('originFilterSource')}</p>}
 <div className="listing-head"><h3>✦ {showFav?t('listingFavorites'):discoveryMode?t('listingRecommended'):t('listingDefault')} <span>{display.length}</span></h3>{(showFav||discoveryMode)&&<button onClick={reset}>{t('backExplore')} ↗</button>}{showFav&&favorites.length>0&&<button onClick={share}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?t('copied'):t('copy')}</button>}</div>
 <div className="name-grid">{visible.map(n=><NameCard key={n.id} item={n} liked={favorites.includes(n.id)} toggle={toggle} open={setDetail} surnames={harmonyEnabled?babySurnames:''} harmony={harmonyEnabled?n.harmony:null} popularity={getPopularity(n,popularityData,popularityCountry)} meaning={localizedMeaning(n,lang,meaningBundle)} translated={hasLocalizedMeaning(n,lang,meaningBundle)} t={t}/>)}</div>{canLoadMore&&<div className="load-more-panel"><span>{t('showing')} {visible.length.toLocaleString(lang)} {t('of')} {display.length.toLocaleString(lang)}</span><button className="load-more-button" type="button" onClick={loadMore}><Sparkles size={16}/>{t('loadMore')} <span>+{Math.min(pageSize,display.length-visibleCount)}</span></button></div>}
 {canLoadMore&&showFloatingLoad&&<button type="button" className="floating-load-more" onClick={loadMore} aria-label={t('loadMore')}><ArrowRight size={17}/>{t('loadMore')} <span>+{Math.min(pageSize,display.length-visibleCount)}</span></button>}
 {!display.length&&<div className="no-results"><h3>{t('noResults')}</h3><p>{t('tryFilters')}</p><button className="outlined" onClick={reset}>{t('seeAll')}</button></div>}<p className="catalog-note">{t('popularityNote')} · {t('catalogNote')} {names.length.toLocaleString(lang)} · Onomaverse · SSA · ONS/NRS/NISRA · IBGE / Gabriel Lobo · INE · Wikidata · <a href="https://github.com/BrayanQuirino/astera-baby-name/blob/main/DATA_SOURCES.md" target="_blank" rel="noreferrer">{t('source')}</a>.</p></section>
 <Sky date={prefs.date} setDate={value=>set('date',value)} t={t} lang={lang}/>
 <section className="closing"><div>✳</div><h2>{t('closingTitle')}<br/><em>{t('closingEm')}</em></h2><p>{t('closingDescription')}</p><button className="primary" onClick={()=>setWizard(true)}>{t('begin')} <ArrowRight size={18}/></button></section></main>
 <footer><a className="brand" href="#inicio"><span>✳</span> astera<span className="dot">.</span></a><span>Hecho con cariño para nuevos comienzos · 2026</span><span>Versión preliminar 0.1</span></footer>
 {wizard&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setWizard(false)}}><section role="dialog" aria-modal="true" aria-label="Calculadora de nombres" className="modal"><button className="close" onClick={()=>setWizard(false)} aria-label="Cerrar"><X/></button><div className="eyebrow dark">{t('wizardEyebrow')}</div><h2>{t('wizardTitle')}<br/><em>{t('wizardEm')}</em></h2><p>{t('wizardDescription')}</p><label className="field"><strong>{t('genderQuestion')}</strong><div className="choices">{genders.map(([v,l])=><button className={prefs.gender===v?'active':''} key={v} onClick={()=>set('gender',v)}>{t(l)}</button>)}</div></label><label className="field"><strong>{t('styleQuestion')}</strong><div className="choices">{styles.map(([v,l])=><button className={prefs.style===v?'active':''} key={v} onClick={()=>set('style',v)}>{t(l)}</button>)}</div></label><div className="field"><strong>{t('cultureQuestion')}</strong><CultureCombobox options={countries} value={prefs.country} lang={lang} label={t('cultureQuestion')} onChange={next=>set('country',next)}/></div><label className="field"><strong>{t('initialQuestion')}</strong><input value={prefs.initial} onChange={e=>updateInitial(e.target.value)} maxLength={1} placeholder={t('initialPlaceholder')} autoComplete="off"/></label><div className="wizard-alphabet"><AlphabetPicker label={t('initialRanges')} initial={prefs.initial} initialRange={prefs.initialRange} expandedRange={expandedLetterRange} onRange={updateRange} onInitial={updateInitial}/></div><div className="field"><strong>{t('surnames')}</strong><div className="two-fields"><input aria-label={t('surname1')} autoComplete="off" placeholder={t('surname1')} maxLength={70} value={prefs.surname1} onChange={e=>set('surname1',e.target.value)}/><input aria-label={t('surname2')} autoComplete="off" placeholder={t('surname2')} maxLength={70} value={prefs.surname2} onChange={e=>set('surname2',e.target.value)}/></div><small className="surname-hint">{t('surnameHint')}</small></div><label className="field"><strong>{t('birthDate')}</strong><StarDatePicker value={prefs.date} onChange={v=>set('date',v)} lang={lang}/></label><button className="primary submit" onClick={generate}>{t('submit')} <Sparkles size={18}/></button><small className="privacy">{t('privacy')}</small></section></div>}
 {languageOffer&&<aside className="locale-offer" role="status"><Globe2 size={19}/><div><strong>{t('language')}: {LANGUAGES[languageOffer]}</strong><p>{t('suggestLanguage')}</p></div><button type="button" onClick={()=>languageChange(languageOffer)}>{t('switchLanguage')}</button><button type="button" className="locale-dismiss" onClick={()=>{setLanguageOffer(null);try{sessionStorage.setItem('astera.languageOfferDismissed','1')}catch{}}} aria-label={t('dismiss')}><X size={17}/></button></aside>}
 {detail&&<NameSkyExperience lang={lang} meaning={localizedMeaning(detail,lang,meaningBundle)} translated={hasLocalizedMeaning(detail,lang,meaningBundle)} item={detail} date={prefs.date} onDateChange={v=>set('date',v)} onClose={()=>setDetail(null)} onFavorite={()=>toggle(detail.id)} isFavorite={favorites.includes(detail.id)}/>}
 </div>
}