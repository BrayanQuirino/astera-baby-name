import React,{useEffect,useRef,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight,X} from 'lucide-react';
const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const weekdays=['L','M','M','J','V','S','D'];
const fmt=(y,m,d)=>[y,String(m+1).padStart(2,'0'),String(d).padStart(2,'0')].join('-');
export default function StarDatePicker({value,onChange,dark=false}){
 const initial=value?new Date(value+'T12:00:00'):new Date();
 const [open,setOpen]=useState(false),[month,setMonth]=useState(initial.getMonth()),[year,setYear]=useState(initial.getFullYear());
 const ref=useRef(null);
 useEffect(()=>{if(!open)return;const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};const key=e=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('pointerdown',fn);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',fn);document.removeEventListener('keydown',key)}},[open]);
 const selected=value?new Date(value+'T12:00:00'):null;
 const shift=x=>{const date=new Date(year,month+x,1);setMonth(date.getMonth());setYear(date.getFullYear())};
 const leading=(new Date(year,month,1).getDay()+6)%7;
 const count=new Date(year,month+1,0).getDate();
 const days=Array.from({length:Math.ceil((leading+count)/7)*7},(_,i)=>i-leading+1);
 const choose=d=>{onChange(fmt(year,month,d));setOpen(false)};
 return <div className={'star-date '+(dark?'dark-date':'')} ref={ref}><button type="button" aria-expanded={open} className="date-trigger" onClick={()=>setOpen(v=>!v)}><CalendarDays size={19}/><span>{selected?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long',year:'numeric'}).format(selected):'Elegir fecha probable'}</span><span className="date-chevron">⌄</span></button>{open&&<div className="calendar-popup" role="dialog" aria-label="Elegir fecha probable de nacimiento"><div className="calendar-head"><button type="button" aria-label="Mes anterior" onClick={()=>shift(-1)}><ChevronLeft size={19}/></button><span>{months[month]} <select aria-label="Año" value={year} onChange={e=>setYear(Number(e.target.value))}>{Array.from({length:14},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}</select></span><button type="button" aria-label="Mes siguiente" onClick={()=>shift(1)}><ChevronRight size={19}/></button></div><div className="calendar-grid">{weekdays.map((x,i)=><span key={i} className="weekday">{x}</span>)}{days.map((d,i)=><button type="button" key={i} disabled={d<1||d>count} className={value===fmt(year,month,d)?'selected-day':''} onClick={()=>choose(d)}>{d>=1&&d<=count?d:''}</button>)}</div><div className="calendar-footer"><span>✦ Elige el día de su llegada</span>{value&&<button type="button" onClick={()=>{onChange('');setOpen(false)}}><X size={13}/> Limpiar</button>}</div></div>}</div>;
}