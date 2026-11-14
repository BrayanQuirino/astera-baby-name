import React from 'react';

// Approved Astera artwork, isolated as transparent artwork from the approved 12-sign illustration.
// One lightweight image sprite avoids 12 network requests and preserves
// the hand-rendered gold figures exactly as the user approved them.
// Each equally-sized transparent image tile is selected with CSS background position.
const SIGNS=[
 'Aries','Tauro','Géminis','Cáncer',
 'Leo','Virgo','Libra','Escorpio',
 'Sagitario','Capricornio','Acuario','Piscis'
];
const X=['0%','33.333333%','66.666667%','100%'];
const Y=['0%','50%','100%'];
const POSITIONS=Object.fromEntries(
 SIGNS.map((sign,index)=>[sign,X[index%4]+' '+Y[Math.floor(index/4)]])
);
export const ZODIAC_ART_SIGNS=Object.freeze(SIGNS);

export default function ZodiacEmblem({sign='Aries',className=''}) {
 const selected=POSITIONS[sign]?sign:'Aries';
 const sprite=import.meta.env.BASE_URL+'zodiac/approved-zodiac-transparent.webp';
 return <div
  className={'illustrated-zodiac illustrated-zodiac-approved '+className}
  role="img"
  aria-label={selected}
  style={{
   backgroundImage:'url("'+sprite+'")',
   backgroundPosition:POSITIONS[selected]
  }}
 />;
}
