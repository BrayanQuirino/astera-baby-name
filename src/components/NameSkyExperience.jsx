import React from 'react';
import {ArrowLeft,Heart,CalendarDays,ExternalLink} from 'lucide-react';
import StarDatePicker from './StarDatePicker.jsx';
import {celestialForDate,pointsForConstellation} from '../lib/celestial.js';
const sources={
 Hikaru:'https://www.behindthename.com/name/hikaru',
 Haruka:'https://www.behindthename.com/name/haruka',
 Gael:'https://www.behindthename.com/name/gael',
 Itzel:'https://www.behindthename.com/name/itzel',
 Akira:'https://www.behindthename.com/name/akira',
 Minjun:'https://www.behindthename.com/name/min01jun',
 Kizuna:'https://www.behindthename.com/name/kizuna/submitted'
};
export default function NameSkyExperience({item,date,onDateChange,onClose,onFavorite,isFavorite}){
 const sky=celestialForDate(date);
 const points=sky?pointsForConstellation(sky.latin):[[12,57],[24,31],[42,47],[60,25],[79,44],[86,72]];
 return <div className="cosmic-overlay" role="dialog" aria-modal="true" aria-label={'El universo de '+item.name}>
  <div className="cosmic-nebula"></div><div className="cosmic-stars" aria-hidden="true">{Array.from({length:82},(_,i)=><i key={i} style={{left:((i*37.91)%100)+'%',top:((i*19.37)%100)+'%',animationDelay:(i%19)*.19+'s',opacity:.2+(i%5)*.13}}/>)}</div>
  <div className="cosmic-top"><button onClick={onClose}><ArrowLeft size={18}/> Volver a los nombres</button><span>✳ astera.</span></div>
  <div className="cosmic-grid">
   <div className="cosmic-name"><div className="eyebrow">✦ UN NOMBRE, UN UNIVERSO</div><span className="cosmic-overline">La historia de un nombre</span><h2>{item.name}</h2><p className="cosmic-meaning">{item.meaning}</p><div className="cosmic-facts"><div><small>ORIGEN</small><strong>{item.origin}</strong></div><div><small>VARIANTES</small><strong>{item.variants.length?item.variants.join(' · '):'Forma original'}</strong></div></div>{sources[item.name]&&<a className="cosmic-source" href={sources[item.name]} target="_blank" rel="noopener noreferrer">Consultar etimología <ExternalLink size={14}/></a>}<button className="cosmic-like" onClick={onFavorite}><Heart size={18} fill={isFavorite?'currentColor':'none'}/>{isFavorite?'Guardado en favoritos':'Guardar entre mis favoritos'}</button></div>
   <div className="cosmic-chart"><div className="star-figure"><svg viewBox="0 0 100 100" role="img" aria-label={'Representación artística de '+(sky?.constellation||'las estrellas')}><polyline points={points.map(p=>p.join(',')).join(' ')} fill="none" stroke="#d9bc87" strokeWidth=".22" className="constellation-line"/>{points.map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={i%3===0?'1.15':'.75'} fill="#fff5db" className="constellation-dot"/><circle cx={x} cy={y} r="2.6" fill="#e9c18b" opacity=".08"/></g>)}</svg><span className="chart-halo"></span></div><span className="chart-label">✦ {sky?'CONSTELACIÓN ASOCIADA AL SOL':'UNA HISTORIA POR ESCRIBIR'}</span><h3>{sky?sky.constellation:'Elige una fecha'}</h3><p>{sky?'Ilustración artística · posición solar aproximada':'Descubre qué constelación atravesaría el Sol en su fecha probable de nacimiento.'}</p></div>
  </div>
  <div className="cosmic-bottom"><div className="cosmic-date"><span><CalendarDays size={17}/> Fecha probable de nacimiento</span><StarDatePicker value={date} onChange={onDateChange} dark/></div><div className="cosmic-sign"><span>SIGNO ZODIACAL TRADICIONAL</span><strong>{sky?sky.symbol+' '+sky.sign:'Por descubrir ✧'}</strong></div></div>
  <p className="sky-disclaimer">El signo corresponde al zodiaco tropical; la constelación es una aproximación astronómica según el día. El dibujo es artístico, no una carta estelar a escala. En fechas cercanas a un cambio de constelación, el resultado requiere hora y efemérides precisas.</p>
 </div>;
}
