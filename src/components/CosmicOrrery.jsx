import React,{useEffect,useRef} from 'react';

// A lightweight CSS 3D orrery: real pointer parallax, layered planetary orbits
// and connected stellar patterns. No WebGL dependency or emoji artwork.
const stars=Array.from({length:76},(_,i)=>({
 x:(i*67+13)%100,y:(i*43+i*i*7+19)%100,size:i%9===0?2.8:i%3===0?1.8:1,
 delay:(i%14)*-.31
}));
const paths=[
 [[12,29],[26,19],[35,32],[49,20],[62,35],[81,20]],
 [[14,74],[27,61],[41,66],[54,48],[70,54],[85,39]],
 [[19,13],[29,39],[40,49],[52,71],[70,78]]
];
const orbits=[
 {name:'Mercury',className:'mercury',radius:'31%'},
 {name:'Venus',className:'venus',radius:'44%'},
 {name:'Earth',className:'earth',radius:'57%'},
 {name:'Mars',className:'mars',radius:'70%'},
 {name:'Jupiter',className:'jupiter',radius:'84%'},
 {name:'Saturn',className:'saturn',radius:'98%'}
];
export default function CosmicOrrery(){
 const root=useRef(null),frame=useRef(0),target=useRef({x:0,y:0});
 useEffect(()=>{
  const node=root.current;
  if(!node)return;
  const interactionArea=node.closest('.hero')||node;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const move=event=>{
   if(reduce)return;
   const box=interactionArea.getBoundingClientRect();
   const x=(event.clientX-box.left)/box.width-.5;
   const y=(event.clientY-box.top)/box.height-.5;
   target.current={x:Math.max(-1,Math.min(1,x*2)),y:Math.max(-1,Math.min(1,y*2))};
   if(frame.current)cancelAnimationFrame(frame.current);
   frame.current=requestAnimationFrame(()=>{
    node.style.setProperty('--parallax-x',String(target.current.x));
    node.style.setProperty('--parallax-y',String(target.current.y));
   });
  };
  const reset=()=>{
   if(frame.current)cancelAnimationFrame(frame.current);
   node.style.setProperty('--parallax-x','0');
   node.style.setProperty('--parallax-y','0');
  };
  interactionArea.addEventListener('pointermove',move,{passive:true});
  interactionArea.addEventListener('pointerleave',reset);
  return()=>{interactionArea.removeEventListener('pointermove',move);interactionArea.removeEventListener('pointerleave',reset);if(frame.current)cancelAnimationFrame(frame.current)};
 },[]);
 return <div className="orrery-container" ref={root} aria-label="Interactive 3D-style solar system with connected stars">
   <div className="orrery-depth" aria-hidden="true">
    <div className="orrery-starfield">{stars.map((p,i)=><i key={i} style={{left:p.x+'%',top:p.y+'%',width:p.size,height:p.size,animationDelay:p.delay+'s'}}/>)}</div>
    <svg className="orrery-star-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
     <defs><linearGradient id="astera-constellation-stroke"><stop stopColor="#e4cfac" stopOpacity=".08"/><stop offset=".5" stopColor="#f5d5a1" stopOpacity=".66"/><stop offset="1" stopColor="#bcdaff" stopOpacity=".1"/></linearGradient></defs>
     {paths.map((p,i)=><g key={i}><polyline className="orrery-sky-path" points={p.map(v=>v.join(',')).join(' ')}/>{p.map(([x,y],j)=><circle key={j} cx={x} cy={y} r=".52" fill="#fff1cc"/>)}</g>)}
    </svg>
    <div className="orrery-disc">
     {orbits.map((orbit,i)=><div key={orbit.name} className={'orrery-ring orbit-depth-'+i} style={{'--orbit-size':orbit.radius}}>
       <div className={'orrery-revolve revolve-'+i}>
        <div className={'orrery-planet '+orbit.className}>{orbit.className==='saturn'&&<span className="planet-saturn-ring"/>}</div>
       </div>
     </div>)}
     <div className="orrery-sun"><div className="sun-core"/><div className="sun-flare"/></div>
    </div>
    <div className="orrery-depth-particles">✧ <span>✦</span><i>✧</i></div>
   </div>
   <div className="orrery-caption">✦ &nbsp; CELESTIAL ATLAS &nbsp; / &nbsp; ASTERA</div>
 </div>;
}
