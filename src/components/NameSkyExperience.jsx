import React,{useState} from 'react';
import {ArrowLeft,Heart,ExternalLink,Compass} from 'lucide-react';
import StarDatePicker from './StarDatePicker.jsx';
import FullSkyMap,{SkyLocationControl} from './FullSkyMap.jsx';
import {celestialForDate} from '../lib/celestial.js';
const sources={
 Hikaru:'https://www.behindthename.com/name/hikaru',
 Haruka:'https://www.behindthename.com/name/haruka',
 Gael:'https://www.behindthename.com/name/gael',
 Itzel:'https://www.behindthename.com/name/itzel',
 Akira:'https://www.behindthename.com/name/akira'
};
export default function NameSkyExperience({item,date,onDateChange,onClose,onFavorite,isFavorite}){
 const [location,setLocation]=useState({preset:0,lat:19.4326,lon:-99.1332});
 const sky=celestialForDate(date);
 return <div className="cosmic-overlay cosmic-fullsky" role="dialog" aria-modal="true" aria-label={'El cielo de '+item.name}>
  <FullSkyMap date={date} location={location}/>
  <div className="cosmic-top"><button onClick={onClose}><ArrowLeft size={18}/> Volver a los nombres</button><span>✳ astera.</span></div>
  <div className="cosmic-grid immersive-layout">
   <div className="cosmic-name"><div className="eyebrow">✦ UN NOMBRE, UN UNIVERSO</div><span className="cosmic-overline">La historia de un nombre</span><h2>{item.name}</h2>{item.native&&<p className="cosmic-native" lang="und">{item.native} {item.reading&&<span>· {item.reading}</span>}</p>}<p className="cosmic-meaning">{item.meaning||"Su significado todavía no está documentado en nuestras fuentes."}</p>{item.meaningLanguage==="en"&&<span className="meaning-source-note">Significado documentado en inglés · {item.meaningSource==="wiktionary-en"?"Wiktionary (CC BY-SA 4.0)":"Nurturepedia (MIT)"}</span>}
    <div className="cosmic-facts"><div><small>ORIGEN</small><strong>{item.origin}</strong></div><div><small>VARIANTES</small><strong>{item.variants.length?item.variants.join(' · '):'Forma original'}</strong></div></div>
    {sources[item.name]&&<a className="cosmic-source" href={sources[item.name]} target="_blank" rel="noopener noreferrer">Consultar etimología <ExternalLink size={14}/></a>}
    <button className="cosmic-like" onClick={onFavorite}><Heart size={18} fill={isFavorite?'currentColor':'none'}/>{isFavorite?'Guardado en favoritos':'Guardar entre mis favoritos'}</button>
   </div>
   <div className="sky-corner-legend"><span><Compass size={15}/> EL CIELO SOBRE TI</span><strong>Las estrellas de su historia</strong><small>Mapa del cielo a las 21:00 (hora solar local)</small></div>
  </div>
  <div className="cosmic-bottom sky-full-controls"><div className="cosmic-date"><span>Fecha probable de nacimiento</span><StarDatePicker value={date} onChange={onDateChange} dark/></div><SkyLocationControl location={location} onChange={setLocation}/><div className="cosmic-sign"><span>SIGNO ZODIACAL</span><strong>{sky?sky.symbol+' '+sky.sign:'Por descubrir ✧'}</strong>{sky&&<small>Sol en {sky.constellation} (aprox.)</small>}</div></div>
  <p className="sky-disclaimer">Cielo astronómico proyectado para la ubicación elegida y las 21:00 de la fecha indicada (hora solar local). Las líneas representan las figuras convencionales de las constelaciones. El signo zodiacal tropical es diferente de las constelaciones reales. Datos estelares: d3-celestial, licencia BSD-3-Clause. Se omiten la refracción atmosférica y la precesión para fechas alejadas de J2000.</p>
 </div>;
}
