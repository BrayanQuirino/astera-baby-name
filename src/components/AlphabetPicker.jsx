import React from 'react';
import {LETTER_RANGES} from '../lib/recommend.js';

// Exactly the same controls are used in exploration and personalized discovery.
export default function AlphabetPicker({initial='',initialRange='',expandedRange='',onRange,onInitial,label='Iniciales'}){
 const rangeFor=letter=>LETTER_RANGES.find(([a,b])=>letter.toUpperCase()>=a&&letter.toUpperCase()<=b)?.join('-')||'';
 return <div className="alphabet-filter">
  <span className="alphabet-heading">{label}</span>
  <div className="alphabet-buttons" role="group" aria-label={label}>
   {LETTER_RANGES.map(([from,to])=>{
    const range=from+'-'+to;
    return <button key={range} type="button" aria-expanded={expandedRange===range}
      aria-pressed={initialRange===range||rangeFor(initial)===range}
      className={(initialRange===range||rangeFor(initial)===range?'active ':'')+(expandedRange===range?'expanded':'')}
      onClick={()=>onRange(range)}>{from}–{to}<span className="alphabet-chevron" aria-hidden="true">⌄</span></button>
   })}
  </div>
  {expandedRange&&<div className="alphabet-letters" role="group" aria-label={label+' '+expandedRange}>
   {Array.from({length:expandedRange.charCodeAt(2)-expandedRange.charCodeAt(0)+1},(_,i)=>String.fromCharCode(expandedRange.charCodeAt(0)+i)).map(letter=>
     <button key={letter} type="button" aria-pressed={initial.toUpperCase()===letter}
       className={initial.toUpperCase()===letter?'active':''}
       onClick={()=>onInitial(letter)}>{letter}</button>)}
   <button className="alphabet-all" type="button" onClick={()=>onInitial('')}>✕</button>
  </div>}
 </div>
}
