import React,{useState} from 'react';
import {ArrowLeft,Heart,ExternalLink,Compass} from 'lucide-react';
import StarDatePicker from './StarDatePicker.jsx';
import FullSkyMap,{SkyLocationControl} from './FullSkyMap.jsx';
import {celestialForDate} from '../lib/celestial.js';
import {translate} from '../lib/i18n.js';
const sources={
 Hikaru:'https://www.behindthename.com/name/hikaru',
 Haruka:'https://www.behindthename.com/name/haruka',
 Gael:'https://www.behindthename.com/name/gael',
 Itzel:'https://www.behindthename.com/name/itzel',
 Akira:'https://www.behindthename.com/name/akira'
};
export default function NameSkyExperience({item,date,onDateChange,onClose,onFavorite,isFavorite,lang='es',meaning,translated=true}){
 const t=key=>translate(lang,key);
 const [location,setLocation]=useState({preset:0,lat:19.4326,lon:-99.1332});
 const sky=celestialForDate(date);
 return <div className="cosmic-overlay cosmic-fullsky" role="dialog" aria-modal="true" aria-label={t('aboveSky')+' '+item.name}>
  <FullSkyMap date={date} location={location}/>
  <div className="cosmic-top"><button onClick={onClose}><ArrowLeft size={18}/> {t('backNames')}</button><span>✳ astera.</span></div>
  <div className="cosmic-grid immersive-layout">
   <div className="cosmic-name"><div className="eyebrow">{t('detailEyebrow')}</div><span className="cosmic-overline">{t('detailTitle')}</span><h2>{item.name}</h2>{item.native&&<p className="cosmic-native" lang="und">{item.native} {item.reading&&<span>· {item.reading}</span>}</p>}<p className="cosmic-meaning">{meaning??item.meaning??""}</p>{!translated&&<small className="meaning-source-note">{t("meaningOriginal")}</small>}
{item.meaningType==="creative"&&<span className="meaning-source-note">✧ {t('poetic')} · {t('nonTraditional')}</span>}{item.meaningLanguage==="en"&&<span className="meaning-source-note">{t('meaningInEnglish')} · {item.meaningSource?.startsWith("wiktionary")?"Wiktionary (CC BY-SA 4.0)":"Nurturepedia (MIT)"}</span>}
    <div className="cosmic-facts"><div><small>{t('origin')}</small><strong>{item.origin}</strong></div><div><small>{t('variants')}</small><strong>{item.variants.length?item.variants.join(' · '):t('original')}</strong></div></div>
    {(item.meaningSource||sources[item.name])&&<a className="cosmic-source" href={item.meaningSourceUrl||sources[item.name]||'https://en.wiktionary.org/wiki/'+encodeURIComponent(item.name)} target="_blank" rel="noopener noreferrer">{t('source')} <ExternalLink size={14}/></a>}
    <button className="cosmic-like" onClick={onFavorite}><Heart size={18} fill={isFavorite?'currentColor':'none'}/>{isFavorite?t('saved'):t('saveToFavorites')}</button>
   </div>
   <div className="sky-corner-legend"><span><Compass size={15}/> {t('aboveSky')}</span><strong>{t('storyStars')}</strong><small>{t('skyAt')}</small></div>
  </div>
  <div className="cosmic-bottom sky-full-controls"><div className="cosmic-date"><span>{t('birthDate')}</span><StarDatePicker value={date} onChange={onDateChange} lang={lang} dark/></div><SkyLocationControl location={location} onChange={setLocation} lang={lang}/><div className="cosmic-sign"><span>{t('zodiac')}</span><strong>{sky?sky.symbol+' '+sky.sign:t('discoverLater')+' ✧'}</strong>{sky&&<small>Sol en {sky.constellation} (aprox.)</small>}</div></div>
  <p className="sky-disclaimer">{t('skyDisclaimer')} Datos: d3-celestial (BSD-3-Clause).</p>
 </div>;
}
