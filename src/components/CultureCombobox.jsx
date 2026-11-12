import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Check,ChevronDown,Globe2,Search,X} from 'lucide-react';
import {translate} from '../lib/i18n.js';

// Accent-insensitive search works equally for México, Mexico, Japanese, etc.
const fold=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();

/** Searchable, keyboard-accessible country selector; no third-party widget dependency. */
export default function CultureCombobox({options,value,onChange,label='Cultura',className='',lang='es'}) {
 const [open,setOpen]=useState(false);
 const [term,setTerm]=useState('');
 const [active,setActive]=useState(0);
 const ref=useRef(null);
 const input=useRef(null);
 const list=useMemo(()=>{
   const needle=fold(term);
   return needle?options.filter(([code,name])=>fold(name).includes(needle)||fold(code).includes(needle)):options;
 },[options,term]);
 const selected=options.find(([code])=>code===value)?.[1]??translate(lang,'all');
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
    <input ref={input} value={open?term:selected} onFocus={()=>{setOpen(true);setTerm('')}} onChange={e=>{setTerm(e.target.value);setOpen(true)}} onKeyDown={keyboard} role="combobox" aria-label={label} aria-expanded={open} aria-autocomplete="list" aria-controls="culture-options" aria-activedescendant={open&&list[active]?'culture-option-'+list[active][0]:undefined} placeholder="Busca un país o cultura..." autoComplete="off"/>
    {value!=='all'&&!open?<button type="button" onClick={()=>choose('all')} aria-label="Quitar filtro"><X size={14}/></button>:<button type="button" aria-label={open?'Cerrar lista':'Abrir lista'} onClick={()=>{setOpen(v=>!v);if(!open){setTerm('');input.current?.focus()}}}><ChevronDown size={17}/></button>}
   </div>
  </label>
  {open&&<div className="culture-options" id="culture-options" role="listbox" aria-label={label}>
    {list.length?list.slice(0,110).map(([code,name],i)=><button id={'culture-option-'+code} type="button" role="option" aria-selected={value===code} key={code} className={(active===i?'active ':'')+(value===code?'selected':'')} onMouseEnter={()=>setActive(i)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(code)}><span>{name}</span>{value===code&&<Check size={15}/>}</button>):<p className="culture-empty">No encontramos coincidencias. Prueba otra búsqueda.</p>}
  </div>}
 </div>;
}
