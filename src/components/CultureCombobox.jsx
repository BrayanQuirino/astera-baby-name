import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Check,ChevronDown,Globe2,Search,X} from 'lucide-react';
import {translate} from '../lib/i18n.js';

// Accent-insensitive search works equally for México, Mexico, Japanese, etc.
const fold=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();

/** Searchable, keyboard-accessible country selector; no third-party widget dependency. */
export default function CultureCombobox({options,value,onChange,label='Cultura',className='',lang='es',counts=null}) {
 const [open,setOpen]=useState(false);
 const [term,setTerm]=useState('');
 const [active,setActive]=useState(0);
 const ref=useRef(null);
 const input=useRef(null);
 // ISO country names are localized by the browser. Non-country cultural labels are kept verbatim.
 const localized=useMemo(()=>{
   let regions=null;
   try{regions=new Intl.DisplayNames([lang],{type:'region'})}catch{}
   return options.map(([code,name])=>{
    const label=code==='all'?translate(lang,'all'):/^[A-Z]{2}$/.test(code)&&regions?regions.of(code)||name:name;
    return [code,label,name];
   }).sort((a,b)=>a[0]==='all'?-1:b[0]==='all'?1:a[1].localeCompare(b[1],lang));
 },[options,lang]);
 const list=useMemo(()=>{
   const needle=fold(term);
   return needle?localized.filter(([code,name,original])=>fold(name).includes(needle)||fold(original).includes(needle)||fold(code).includes(needle)):localized;
 },[localized,term]);
 const selected=localized.find(([code])=>code===value)?.[1]??translate(lang,'all');
 useEffect(()=>setActive(0),[term]);
 useEffect(()=>{
   if(!open)return;
   const outside=event=>{if(ref.current&&!ref.current.contains(event.target))setOpen(false)};
   document.addEventListener('pointerdown',outside);
   return()=>document.removeEventListener('pointerdown',outside);
 },[open]);
 const choose=code=>{onChange(code);setTerm('');setOpen(false)};
 const keyboard=event=>{
  if(event.key==='Escape'){event.preventDefault();setOpen(false);setTerm('');return}
  if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);setActive(i=>Math.min(i+1,list.length-1))}
  if(event.key==='ArrowUp'){event.preventDefault();setActive(i=>Math.max(0,i-1))}
  if(event.key==='Enter'){event.preventDefault();if(open&&list.length)choose(list[active]?.[0]??list[0][0]);else{setOpen(true);input.current?.focus()}}
 };
 return <div className={'culture-combo '+className} ref={ref}>
  <label className="culture-combo-label"><Globe2 size={17}/><span className="sr-only">{label}</span>
   <div className="culture-input-shell">
    <input ref={input} value={open?term:selected} onFocus={()=>{setOpen(true);setTerm('')}} onChange={e=>{setTerm(e.target.value);setOpen(true)}} onKeyDown={keyboard} role="combobox" aria-label={label} aria-expanded={open} aria-autocomplete="list" aria-controls="culture-options" aria-activedescendant={open&&list[active]?'culture-option-'+list[active][0]:undefined} placeholder={translate(lang,'cultureSearch')} autoComplete="off"/>
    {value!=='all'&&!open?<button type="button" onClick={()=>choose('all')} aria-label={translate(lang,'removeFilter')}><X size={14}/></button>:<button type="button" aria-label={translate(lang,open?'closeList':'openList')} onClick={()=>{setOpen(v=>!v);if(!open){setTerm('');input.current?.focus()}}}><ChevronDown size={17}/></button>}
   </div>
  </label>
  {open&&<div className="culture-options" id="culture-options" role="listbox" aria-label={label}>
    {list.length?list.slice(0,110).map(([code,name],i)=><button id={'culture-option-'+code} type="button" role="option" aria-selected={value===code} key={code} className={(active===i?'active ':'')+(value===code?'selected':'')} onMouseEnter={()=>setActive(i)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(code)}><span>{name}</span>{counts&&code!=='all'&&<small className="culture-option-count" aria-label={String(counts[code]||0)}>{(counts[code]||0).toLocaleString(lang)}</small>}{value===code&&<Check size={15}/>}</button>):<p className="culture-empty">{translate(lang,'noCulture')}</p>}
  </div>}
 </div>;
}
