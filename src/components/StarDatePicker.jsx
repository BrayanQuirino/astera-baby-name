import React,{useEffect,useRef,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight,X,ChevronDown} from 'lucide-react';
import {translate} from '../lib/i18n.js';

const fmt=(y,m,d)=>[y,String(m+1).padStart(2,'0'),String(d).padStart(2,'0')].join('-');
const parseDate=value=>{
 const match=/^(\d{4})-(\d\d)-(\d\d)$/.exec(value||'');
 return match?{year:Number(match[1]),month:Number(match[2])-1,day:Number(match[3])}:null;
};
const YEARS=Array.from({length:221},(_,i)=>1900+i);

export default function StarDatePicker({value,onChange,dark=false,lang='es'}){
 const parsed=parseDate(value);
 const months=Array.from({length:12},(_,i)=>new Intl.DateTimeFormat(lang,{month:'long'}).format(new Date(2026,i,1)));
 const weekdays=Array.from({length:7},(_,i)=>new Intl.DateTimeFormat(lang,{weekday:'short'}).format(new Date(2026,10,9+i)).slice(0,2));
 const [open,setOpen]=useState(false);
 const [month,setMonth]=useState(parsed?.month??new Date().getMonth());
 const [year,setYear]=useState(parsed?.year??new Date().getFullYear());
 const ref=useRef(null);
 useEffect(()=>{if(parsed){setMonth(parsed.month);setYear(parsed.year)}},[value]);
 useEffect(()=>{
  if(!open)return;
  const outside=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};
  const escape=e=>{if(e.key==='Escape')setOpen(false)};
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)};
 },[open]);
 const shift=amount=>{const next=new Date(year,month+amount,1);if(next.getFullYear()>=1900&&next.getFullYear()<=2120){setMonth(next.getMonth());setYear(next.getFullYear())}};
 const leading=(new Date(year,month,1).getDay()+6)%7;
 const count=new Date(year,month+1,0).getDate();
 const days=Array.from({length:Math.ceil((leading+count)/7)*7},(_,i)=>i-leading+1);
 const selected=parsed?new Date(parsed.year,parsed.month,parsed.day,12):null;
 const choose=day=>{onChange(fmt(year,month,day));setOpen(false)};
 return <div className={'star-date '+(dark?'dark-date':'')} ref={ref}>
  <button type="button" aria-expanded={open} aria-haspopup="dialog" className="date-trigger" onClick={()=>setOpen(v=>!v)}>
   <CalendarDays size={19} className="date-icon"/><span className="date-trigger-label">{selected?new Intl.DateTimeFormat(lang,{day:'numeric',month:'long',year:'numeric'}).format(selected):translate(lang,'chooseDate')}</span><ChevronDown size={16} className="date-chevron"/>
  </button>
  {open&&<div className="calendar-popup" role="dialog" aria-label={translate(lang,'birthDate')}>
   <div className="calendar-head">
    <button type="button" aria-label="Mes anterior" onClick={()=>shift(-1)} disabled={year===1900&&month===0}><ChevronLeft size={18}/></button>
    <div className="calendar-selectors">
     <label className="calendar-select-wrap"><span className="sr-only">Mes</span><select aria-label="Mes" value={month} onChange={e=>setMonth(Number(e.target.value))}>{months.map((label,i)=><option value={i} key={label}>{label}</option>)}</select><ChevronDown size={13}/></label>
     <label className="calendar-select-wrap year-wrap"><span className="sr-only">Año</span><select aria-label="Año" value={year} onChange={e=>setYear(Number(e.target.value))}>{YEARS.map(y=><option value={y} key={y}>{y}</option>)}</select><ChevronDown size={13}/></label>
    </div>
    <button type="button" aria-label="Mes siguiente" onClick={()=>shift(1)} disabled={year===2120&&month===11}><ChevronRight size={18}/></button>
   </div>
   <div className="calendar-grid">{weekdays.map((d,i)=><span className="weekday" key={i}>{d}</span>)}{days.map((d,i)=><button type="button" key={i} disabled={d<1||d>count} aria-label={d>=1&&d<=count?d+' de '+months[month]+' de '+year:undefined} aria-pressed={value===fmt(year,month,d)} className={value===fmt(year,month,d)?'selected-day':''} onClick={()=>choose(d)}>{d>=1&&d<=count?d:''}</button>)}</div>
   <div className="calendar-footer"><span>✦ {translate(lang,'chooseDate')}</span>{value&&<button type="button" onClick={()=>{onChange('');setOpen(false)}}><X size={13}/> {({es:"Limpiar",en:"Clear",fr:"Effacer",pt:"Limpar",de:"Löschen",it:"Cancella",ja:"クリア",ko:"지우기",zh:"清除"})[lang]}</button>}</div>
  </div>}
 </div>;
}
