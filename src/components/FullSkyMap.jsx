import React,{useEffect,useRef,useState} from 'react';
import {MapPin,CalendarDays} from 'lucide-react';
import {translate} from '../lib/i18n.js';

// Public J2000 equatorial star/constellation catalog, BSD-3-Clause, d3-celestial.
// Catalog coordinates are astronomical rather than decorative.
const DATA_ROOT='https://cdn.jsdelivr.net/gh/ofrohn/d3-celestial@master/data/';
const CITY_OPTIONS=[
 {label:'Ciudad de México, México',lat:19.4326,lon:-99.1332},
 {label:'Tokio, Japón',lat:35.6762,lon:139.6503},
 {label:'Osaka, Japón',lat:34.6937,lon:135.5023},
 {label:'Toronto, Canadá',lat:43.6532,lon:-79.3832},
 {label:'Madrid, España',lat:40.4168,lon:-3.7038},
 {label:'Nueva York, EE. UU.',lat:40.7128,lon:-74.006},
 {label:'Ubicación personalizada',lat:null,lon:null}
];
const radians=v=>v*Math.PI/180;
const wrap=v=>(v%360+360)%360;
let catalogPromise;
function loadCatalog(){
 if(!catalogPromise)catalogPromise=Promise.all(['stars.6.json','constellations.lines.json'].map(async file=>{
  const response=await fetch(DATA_ROOT+file);
  if(!response.ok)throw Error('No se pudo cargar '+file);
  return response.json();
 })).catch(err=>{catalogPromise=null;throw err});
 return catalogPromise;
}
function siderealDegrees(utc,longitude){
 const jd=utc.getTime()/86400000+2440587.5;
 const t=(jd-2451545)/36525;
 return wrap(280.46061837+360.98564736629*(jd-2451545)+.000387933*t*t-t*t*t/38710000+longitude);
}
// Local 21:00 mean solar time (no timezone or DST lookup required).
function eveningUTC(date,longitude){
 const [year,month,day]=date.split('-').map(Number);
 return new Date(Date.UTC(year,month-1,day,21,0,0)-longitude/15*3600000);
}
function project(coord,lst,latitude,width,height){
 const ra=wrap(-coord[0]); // d3-celestial GeoJSON longitude = -right ascension
 const dec=radians(coord[1]),lat=radians(latitude),ha=radians(wrap(lst-ra)>180?wrap(lst-ra)-360:wrap(lst-ra));
 const sinAlt=Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos(ha);
 const alt=Math.asin(Math.max(-1,Math.min(1,sinAlt)));
 if(alt<=0)return null;
 const az=Math.atan2(-Math.sin(ha),Math.tan(dec)*Math.cos(lat)-Math.sin(lat)*Math.cos(ha));
 const radius=(Math.PI/2-alt)/(Math.PI/2)*Math.max(width,height)*.77;
 return [width/2+radius*Math.sin(az),height/2-radius*Math.cos(az)];
}
function deterministicStars(ctx,w,h){
 // Decorative placeholder is explicitly identified as preview until the real catalog loads.
 for(let i=0;i<165;i++){
  const x=((i*331.779)%997)/997*w,y=((i*173.117)%997)/997*h;
  ctx.beginPath();ctx.arc(x,y,i%11===0?1.4:.55,0,2*Math.PI);
  ctx.fillStyle=i%9===0?'#e2c28f':'#cddcf2';ctx.globalAlpha=.18+(i%7)*.075;ctx.fill();
 }
 ctx.globalAlpha=1;
}
export default function FullSkyMap({date,location,onLocationChange}){
 const canvas=useRef(null),motion=useRef(null),[catalog,setCatalog]=useState(null),[error,setError]=useState(false);
 const preset=CITY_OPTIONS[location?.preset??0]||CITY_OPTIONS[0];
 const lat=location?.lat??preset.lat??19.4326,lon=location?.lon??preset.lon??-99.1332;
 useEffect(()=>{let alive=true;loadCatalog().then(data=>{if(alive)setCatalog(data)}).catch(()=>{if(alive)setError(true)});return()=>{alive=false}},[]);
 // Interpolate latitude and sidereal orientation instead of instantly replacing the sky.
 // A wrapped shortest-arc movement keeps changes of city/date feeling like one continuous camera move.
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const ctx=el.getContext('2d');
  const selectedDate=/^\d{4}-\d\d-\d\d$/.test(date)?date:new Date().toISOString().slice(0,10);
  const target={latitude:lat,lst:siderealDegrees(eveningUTC(selectedDate,lon),lon)};
  const prefersReduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const previous=motion.current?.position;
  const from=previous?{...previous}:{...target};
  const delta=((target.lst-from.lst+540)%360)-180;
  let frame=0,begin=null,cancelled=false;
  const draw=position=>{
   const w=el.clientWidth,h=el.clientHeight;
   if(!w||!h)return;
   const ratio=Math.min(window.devicePixelRatio||1,2);
   const pixelWidth=Math.round(w*ratio),pixelHeight=Math.round(h*ratio);
   if(el.width!==pixelWidth||el.height!==pixelHeight){el.width=pixelWidth;el.height=pixelHeight;}
   ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
   if(!catalog){deterministicStars(ctx,w,h);return;}
   const [stars,lines]=catalog;
   ctx.lineWidth=.8;ctx.strokeStyle='rgba(217,183,130,.32)';
   for(const feature of (lines.features||[])){
    const geometry=feature.geometry;if(!geometry)continue;
    const paths=geometry.type==='MultiLineString'?geometry.coordinates:geometry.type==='LineString'?[geometry.coordinates]:[];
    for(const path of paths){
     let started=false;ctx.beginPath();
     for(const point of path){
      const p=project(point,position.lst,position.latitude,w,h);
      if(!p){started=false;continue;}
      if(!started){ctx.moveTo(...p);started=true;}else ctx.lineTo(...p);
     }ctx.stroke();
    }
   }
   for(const feature of (stars.features||[])){
    const coords=feature.geometry?.coordinates;if(!coords)continue;
    const p=project(coords,position.lst,position.latitude,w,h);if(!p)continue;
    const magnitude=Number(feature.properties?.mag??feature.properties?.magnitude??feature.properties?.v??5.5);
    if(!Number.isFinite(magnitude)||magnitude>6.2)continue;
    const size=Math.max(.38,2.7-magnitude*.36);
    ctx.beginPath();ctx.arc(p[0],p[1],size,0,Math.PI*2);
    ctx.fillStyle=magnitude<2?'#f6deb1':'#e9effe';
    ctx.globalAlpha=Math.max(.32,1-magnitude*.095);ctx.fill();
    if(magnitude<1.2){ctx.beginPath();ctx.arc(p[0],p[1],size*2.8,0,Math.PI*2);ctx.fillStyle='#e9c994';ctx.globalAlpha=.09;ctx.fill();}
   }
   ctx.globalAlpha=1;
  };
  const animate=timestamp=>{
   if(cancelled)return;
   if(begin===null)begin=timestamp;
   const duration=prefersReduced?0:1250;
   const raw=duration===0?1:Math.min(1,(timestamp-begin)/duration);
   const eased=raw<.5?4*raw*raw*raw:1-Math.pow(-2*raw+2,3)/2;
   const position={latitude:from.latitude+(target.latitude-from.latitude)*eased,lst:wrap(from.lst+delta*eased)};
   motion.current={position};draw(position);
   if(raw<1)frame=requestAnimationFrame(animate);
  };
  const observer=new ResizeObserver(()=>draw(motion.current?.position??from));
  observer.observe(el);
  if(!catalog||!previous||prefersReduced){motion.current={position:target};draw(target);}
  else frame=requestAnimationFrame(animate);
  return()=>{cancelled=true;cancelAnimationFrame(frame);observer.disconnect();};
 },[catalog,date,lat,lon]);
 return <div className="full-sky-layer" aria-hidden="true"><canvas ref={canvas} className="full-sky-canvas"/><div className="full-sky-shade"/><div className="full-sky-glow"/>{!catalog&&<span className="sky-data-status">{error?'Vista decorativa: no se pudo cargar el catálogo astronómico':'Cargando estrellas reales…'}</span>}</div>;
}
export function SkyLocationControl({location,onChange,lang='es'}){
 const preset=location?.preset??0,custom=preset===CITY_OPTIONS.length-1;
 const chosen=CITY_OPTIONS[preset]||CITY_OPTIONS[0];
 return <div className="sky-location-control"><label><MapPin size={15}/> {translate(lang,'observing')}</label><select aria-label={translate(lang,'observing')} value={preset} onChange={e=>{const p=Number(e.target.value),c=CITY_OPTIONS[p];onChange({preset:p,lat:c.lat,lon:c.lon})}}>{CITY_OPTIONS.map((city,i)=><option key={city.label} value={i}>{city.label}</option>)}</select>{custom&&<div className="sky-coordinates"><label>{translate(lang,'latitude')} <input type="number" min="-90" max="90" step=".0001" value={location?.lat??''} placeholder="19.4326" onChange={e=>onChange({...location,lat:e.target.value===''?null:Math.max(-90,Math.min(90,Number(e.target.value)))})}/></label><label>{translate(lang,'longitude')} <input type="number" min="-180" max="180" step=".0001" value={location?.lon??''} placeholder="-99.1332" onChange={e=>onChange({...location,lon:e.target.value===''?null:Math.max(-180,Math.min(180,Number(e.target.value)))})}/></label></div>}</div>;
}
