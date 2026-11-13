import React from 'react';

// Illustrated zodiac figures, all SVG vectors; no Unicode sign or emoji glyphs.
// The art is ornamental, while the separate real sky map remains astronomical.
const designs={
 Aries:['M45 118 C20 94 24 52 48 47 C65 43 76 60 68 78 C64 88 50 83 52 70 C52 59 70 46 100 80','M155 118 C180 94 176 52 152 47 C135 43 124 60 132 78 C136 88 150 83 148 70 C148 59 130 46 100 80','M100 80 C91 107 91 129 100 154 M100 154 L91 166 M100 154 L109 166'],
 Taurus:['M63 82 C41 77 25 62 27 39 C47 44 64 50 77 67','M137 82 C159 77 175 62 173 39 C153 44 136 50 123 67','M68 71 C47 99 56 148 97 157 C139 152 151 107 132 72 C115 58 84 58 68 71 Z','M84 113 Q100 126 116 113 M89 141 Q100 150 111 141'],
 Gemini:['M72 56 C65 44 52 45 46 55 C39 68 51 78 62 77 L66 124 L50 150','M128 56 C135 44 148 45 154 55 C161 68 149 78 138 77 L134 124 L150 150','M70 79 Q100 89 130 79 M65 122 Q100 113 135 122','M77 57 Q86 66 100 57 Q114 66 123 57'],
 Cancer:['M69 101 Q49 71 25 70 L48 96 M131 101 Q151 71 175 70 L152 96','M52 92 C69 70 131 70 148 92 C161 121 136 146 100 145 C64 146 39 121 52 92 Z','M72 104 C64 97 62 88 72 82 M128 104 C136 97 138 88 128 82','M69 121 Q100 140 131 121 M42 118 L20 139 M158 118 L180 139'],
 Leo:['M93 54 C63 38 37 61 43 86 C30 95 31 120 56 131 L49 155 L76 150 L91 132','M91 54 Q111 32 137 56 Q154 81 143 106 L161 143 Q131 139 120 156 L94 142 Q64 143 57 123','M82 81 Q100 95 118 81 M84 111 Q100 123 116 111','M66 73 L51 60 M134 73 L149 60'],
 Virgo:['M74 59 Q88 40 100 59 Q112 40 126 59 Q118 76 116 91 L129 137 L100 154 L71 137 L84 91 Z','M77 80 Q100 96 123 80 M84 102 L67 139 M116 102 L133 139','M66 56 Q58 39 68 31 M134 56 Q142 39 132 31','M90 66 Q100 75 110 66 M85 138 Q100 148 115 138'],
 Libra:['M52 67 L148 67 M100 45 L100 65','M100 47 Q74 34 65 50 M100 47 Q126 34 135 50','M57 70 L35 122 L79 122 Z M143 70 L121 122 L165 122 Z','M100 69 L100 149 M72 149 L128 149 M82 139 L118 139'],
 Scorpio:['M83 69 Q60 51 45 71 Q38 84 54 94 Q68 105 81 90','M81 91 Q93 109 110 96 Q125 83 133 108 Q141 131 126 145','M126 145 Q139 167 156 147 L170 132 L161 149 L172 154','M67 93 L55 114 M81 104 L72 128 M101 107 L100 134','M45 71 L33 54 M45 71 L26 74'],
 Sagittarius:['M40 155 L158 42 M114 42 L158 42 L158 86','M38 154 Q75 156 89 121 M90 121 Q113 115 119 95','M70 120 L103 146 M64 119 L49 145','M90 68 L118 98 M90 68 L93 100','M118 60 L153 45'],
 Capricornio:['M38 105 Q28 68 59 57 Q70 36 91 54 L95 81','M62 57 Q53 41 38 37 Q37 57 53 68','M92 79 Q111 69 136 85 Q157 100 145 120 Q138 135 121 129','M121 129 Q107 155 138 163 Q158 164 166 147 Q173 125 154 124','M71 96 L59 138 M95 97 L90 146'],
 Acuario:['M70 56 Q92 38 119 55 Q131 72 115 86 L86 96','M91 82 L67 137 M113 87 L101 143','M63 143 Q71 133 80 143 T98 143 T116 143 T134 143','M43 162 Q58 152 73 162 T103 162 T133 162 T163 162'],
 Piscis:['M36 105 C50 62 83 68 91 105 C80 141 49 149 36 105 Z','M109 105 C121 68 150 62 164 105 C150 149 120 141 109 105 Z','M90 105 L110 105 M53 105 Q66 91 79 105 Q66 119 53 105','M121 105 Q134 91 147 105 Q134 119 121 105']
};
export default function ZodiacEmblem({sign='Aries',className=''}) {
 const lines=designs[sign]||designs.Aries;
 return <svg className={'illustrated-zodiac '+className} viewBox="0 0 200 200" role="img" aria-label={sign} xmlns="http://www.w3.org/2000/svg">
  <defs>
   <radialGradient id="zodiac-art-back"><stop stopColor="#f7da99" stopOpacity=".28"/><stop offset="1" stopColor="#f7da99" stopOpacity="0"/></radialGradient>
   <linearGradient id="zodiac-art-line" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2c3"/><stop offset=".5" stopColor="#dfac66"/><stop offset="1" stopColor="#fff4d2"/></linearGradient>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#zodiac-art-back)"/>
  <circle cx="100" cy="100" r="84" className="illustrated-zodiac-ring"/>
  <circle cx="100" cy="100" r="70" className="illustrated-zodiac-inner"/>
  <g className="illustrated-zodiac-figure" fill="none" stroke="url(#zodiac-art-line)" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
   {lines.map((d,i)=><path key={i} d={d} style={{animationDelay:(.12*i)+'s'}} pathLength="1"/>)}
  </g>
  {Array.from({length:12},(_,i)=>{
   const theta=i*Math.PI/6;
   const x=100+87*Math.cos(theta),y=100+87*Math.sin(theta);
   return <circle key={i} cx={x} cy={y} r={i%3===0?1.8:1} fill="#f7d69c" className="illustrated-zodiac-star"/>;
  })}
 </svg>;
}
