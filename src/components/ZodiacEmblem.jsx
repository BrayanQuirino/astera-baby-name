import React from 'react';

// Astera zodiac iconography: traditional silhouettes inspired by the user's
// reference cards. Original, scalable SVG figures, not emoji or line scribbles.
const gold='url(#zodiac-gold)';
const dark='#101f39';

const icons={
 Aries:<g>
  <path d="M83 103 C64 102 44 87 46 68 C47 48 70 45 79 61 C87 76 69 84 64 74" fill="none" stroke={gold} strokeWidth="12" strokeLinecap="round"/>
  <path d="M117 103 C136 102 156 87 154 68 C153 48 130 45 121 61 C113 76 131 84 136 74" fill="none" stroke={gold} strokeWidth="12" strokeLinecap="round"/>
  <path d="M79 91 Q100 75 121 91 L121 117 L100 150 L79 117 Z" fill={gold}/>
  <path d="M83 91 L69 99 L86 116 Z M117 91 L131 99 L114 116 Z" fill={gold}/>
  <path d="M90 105 L96 108 M104 108 L110 105" stroke={dark} strokeWidth="4" strokeLinecap="round"/>
  <path d="M95 133 L100 139 L105 133" fill={dark}/>
 </g>,
 Tauro:<g>
  <path d="M77 85 Q53 81 47 65 L43 42 Q56 59 74 62 L89 78 Z" fill={gold}/>
  <path d="M123 85 Q147 81 153 65 L157 42 Q144 59 126 62 L111 78 Z" fill={gold}/>
  <path d="M74 72 Q100 61 126 72 L136 105 Q129 137 113 149 L87 149 Q71 137 64 105 Z" fill={gold}/>
  <path d="M64 87 Q49 78 46 99 L66 110 M136 87 Q151 78 154 99 L134 110" fill={gold}/>
  <path d="M82 104 L92 106 M108 106 L118 104" stroke={dark} strokeWidth="5" strokeLinecap="round"/>
  <path d="M86 130 Q100 119 114 130 L110 148 L90 148 Z" fill="#c88941" opacity=".85"/>
  <ellipse cx="94" cy="136" rx="3" ry="2.5" fill={dark}/>
  <ellipse cx="106" cy="136" rx="3" ry="2.5" fill={dark}/>
 </g>,
 'Géminis':<g>
  <path d="M93 75 Q84 48 64 51 Q43 54 45 78 L37 87 L46 94 Q47 108 60 112 L61 131 L45 141 L41 155 L98 155 L95 119 L78 113 Q89 100 87 86 Z" fill={gold}/>
  <path d="M107 75 Q116 48 136 51 Q157 54 155 78 L163 87 L154 94 Q153 108 140 112 L139 131 L155 141 L159 155 L102 155 L105 119 L122 113 Q111 100 113 86 Z" fill={gold}/>
  <path d="M47 70 Q55 43 80 52 Q90 56 91 77 Q74 71 66 62 Q58 76 46 79 Z" fill="#edc37e"/>
  <path d="M153 70 Q145 43 120 52 Q110 56 109 77 Q126 71 134 62 Q142 76 154 79 Z" fill="#edc37e"/>
  <path d="M60 88 L68 88 M132 88 L140 88" stroke={dark} strokeWidth="3.8" strokeLinecap="round"/>
  <path d="M100 49 L103 58 L112 61 L103 64 L100 73 L97 64 L88 61 L97 58 Z" fill="#fff3c8"/>
 </g>,
 'Cáncer':<g>
  <ellipse cx="100" cy="117" rx="38" ry="26" fill={gold}/>
  <path d="M72 109 Q59 90 47 93 L40 78 Q27 86 35 103 L46 110 L55 102 L67 119 Z" fill={gold}/>
  <path d="M128 109 Q141 90 153 93 L160 78 Q173 86 165 103 L154 110 L145 102 L133 119 Z" fill={gold}/>
  <path d="M59 122 L43 131 L37 145 M68 137 L58 149 M82 143 L76 157 M141 122 L157 131 L163 145 M132 137 L142 149 M118 143 L124 157" fill="none" stroke={gold} strokeWidth="6.5" strokeLinecap="round"/>
  <path d="M79 103 L76 86 M121 103 L124 86" stroke={gold} strokeWidth="5.5" strokeLinecap="round"/>
  <circle cx="76" cy="83" r="7" fill={gold}/><circle cx="124" cy="83" r="7" fill={gold}/>
  <circle cx="75" cy="83" r="2.8" fill={dark}/><circle cx="125" cy="83" r="2.8" fill={dark}/>
  <path d="M90 132 Q100 140 110 132" fill="none" stroke={dark} strokeWidth="3.5" strokeLinecap="round"/>
 </g>,
 Leo:<g>
  {Array.from({length:12},(_,i)=><ellipse key={i} cx="100" cy="56" rx="16" ry="31" transform={'rotate('+(i*30)+' 100 107)'} fill={i%2? '#e9b763':gold}/>)}
  <path d="M72 94 Q74 75 100 72 Q126 75 128 94 L122 127 Q115 143 100 146 Q85 143 78 127 Z" fill="#f4ce85"/>
  <path d="M78 98 L90 102 M110 102 L122 98" stroke={dark} strokeWidth="4.8" strokeLinecap="round"/>
  <path d="M90 122 Q100 116 110 122 L100 131 Z" fill={dark}/>
  <path d="M100 130 L100 137 M100 137 Q93 143 87 137 M100 137 Q107 143 113 137" stroke={dark} fill="none" strokeWidth="3.2" strokeLinecap="round"/>
  <path d="M100 79 L104 88 L113 91 L104 94 L100 103 L96 94 L87 91 L96 88 Z" fill="#fff4ce" opacity=".86"/>
 </g>,
 Virgo:<g>
  <path d="M117 58 Q141 57 151 78 Q161 102 146 121 Q158 137 150 152 Q127 167 105 155 Q122 131 116 109 Q104 88 108 70 Z" fill={gold}/>
  <path d="M119 58 Q92 40 72 61 Q60 74 66 96 L58 113 L68 119 Q70 142 89 139 L92 153 L65 162 L56 169 L146 169 Q134 151 116 147 L116 118 Q129 106 128 85 Z" fill={gold}/>
  <path d="M79 80 Q85 67 105 71 Q114 87 108 99 L91 109 Q81 111 74 103 L71 94 Q81 95 79 80 Z" fill="#ffe2a5"/>
  <path d="M83 95 L90 95" stroke={dark} strokeWidth="3" strokeLinecap="round"/>
  <path d="M87 112 Q96 117 105 110" stroke={dark} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
  <path d="M111 115 Q122 129 117 143 M133 86 Q148 107 138 124" stroke={dark} strokeOpacity=".4" strokeWidth="3" fill="none"/>
 </g>,
 Libra:<g>
  <path d="M100 44 L100 158" stroke={gold} strokeWidth="8" strokeLinecap="round"/>
  <path d="M53 76 L147 76" stroke={gold} strokeWidth="7" strokeLinecap="round"/>
  <path d="M84 159 L116 159 M68 169 L132 169" stroke={gold} strokeWidth="8" strokeLinecap="round"/>
  <path d="M65 80 L48 127 L82 127 Z M135 80 L118 127 L152 127 Z" fill="none" stroke={gold} strokeWidth="4.5" strokeLinejoin="round"/>
  <path d="M42 128 Q64 151 88 128 Z M112 128 Q136 151 158 128 Z" fill={gold}/>
  <path d="M100 39 L104 47 L112 50 L104 53 L100 61 L96 53 L88 50 L96 47 Z" fill="#fff0c5"/>
 </g>,
 Escorpio:<g>
  <path d="M75 93 Q96 72 117 92 L126 115 Q121 138 99 144 Q77 138 72 115 Z" fill={gold}/>
  <path d="M74 100 L60 83 L43 94 L52 109 L65 104 M126 100 L140 83 L157 94 L148 109 L135 104" fill={gold}/>
  <path d="M57 83 L44 69 L34 75 M143 83 L156 69 L166 75" fill="none" stroke={gold} strokeWidth="7" strokeLinecap="round"/>
  <path d="M78 131 L65 145 L59 157 M91 140 L84 159 M108 140 L115 159 M121 131 L134 145 L140 157" fill="none" stroke={gold} strokeWidth="7" strokeLinecap="round"/>
  <path d="M124 115 Q154 113 158 133 Q160 154 144 161 Q131 167 136 175" fill="none" stroke={gold} strokeWidth="11" strokeLinecap="round"/>
  <path d="M135 173 L127 160 L146 166 L135 183 Z" fill="#ffdf9e"/>
  <path d="M85 108 L92 110 M108 110 L115 108" stroke={dark} strokeWidth="4.5" strokeLinecap="round"/>
  <path d="M82 121 Q99 128 116 121" stroke={dark} strokeWidth="3" fill="none"/>
 </g>,
 Sagitario:<g>
  <path d="M74 53 Q39 97 77 151" fill="none" stroke={gold} strokeWidth="10" strokeLinecap="round"/>
  <path d="M74 53 L78 151" stroke="#f8d99c" strokeWidth="3.5" fill="none"/>
  <path d="M59 139 L145 57" stroke={gold} strokeWidth="8" strokeLinecap="round"/>
  <path d="M145 57 L134 58 L149 42 L158 76 L147 66 Z" fill={gold}/>
  <path d="M61 137 L54 155 L71 149 M75 119 L96 145" fill="none" stroke={gold} strokeWidth="6.5" strokeLinecap="round"/>
  <path d="M66 101 Q76 90 84 83" fill="none" stroke="#f7dfad" strokeWidth="3" strokeLinecap="round"/>
 </g>,
 Capricornio:<g>
  <path d="M67 87 Q84 67 106 87 L116 111 Q113 130 99 144 Q82 134 76 116 Z" fill={gold}/>
  <path d="M73 96 Q44 86 50 58 Q58 37 78 50 Q61 56 66 73 Q70 83 82 77" fill="none" stroke={gold} strokeWidth="10" strokeLinecap="round"/>
  <path d="M110 93 Q137 86 137 60 Q136 46 122 45 Q143 34 155 56 Q168 83 122 109" fill="none" stroke={gold} strokeWidth="10" strokeLinecap="round"/>
  <path d="M85 137 L98 169 L108 134" fill={gold}/>
  <path d="M88 106 L94 108 M105 108 L112 106" stroke={dark} strokeWidth="4.3" strokeLinecap="round"/>
  <path d="M95 121 L100 127 L105 121" fill={dark}/>
 </g>,
 Acuario:<g>
  <path d="M40 91 C53 73 65 109 78 91 S102 73 115 91 S139 109 152 91 S164 73 170 80" fill="none" stroke={gold} strokeWidth="12" strokeLinecap="round"/>
  <path d="M40 128 C53 110 65 146 78 128 S102 110 115 128 S139 146 152 128 S164 110 170 117" fill="none" stroke={gold} strokeWidth="12" strokeLinecap="round"/>
  <path d="M100 54 L104 63 L113 67 L104 71 L100 80 L96 71 L87 67 L96 63 Z" fill="#fff0c4"/>
 </g>,
 Piscis:<g>
  <path d="M90 85 Q69 43 38 65 Q62 77 38 92 Q69 109 90 85 Z" fill={gold}/>
  <path d="M110 121 Q131 163 162 141 Q138 129 162 114 Q131 97 110 121 Z" fill={gold}/>
  <path d="M45 75 Q31 66 25 54 L25 105 Q36 95 45 86 Z M155 131 Q168 122 175 111 L175 162 Q164 152 155 143 Z" fill="#f6d18b"/>
  <path d="M91 84 Q108 94 109 109 Q110 116 110 121" fill="none" stroke={gold} strokeWidth="7" strokeLinecap="round"/>
  <circle cx="76" cy="83" r="3" fill={dark}/><circle cx="124" cy="123" r="3" fill={dark}/>
  <path d="M55 76 Q63 69 70 77 M130 132 Q138 139 145 131" fill="none" stroke={dark} strokeOpacity=".6" strokeWidth="2.5"/>
 </g>
};
export const ZODIAC_ART_SIGNS=Object.freeze(Object.keys(icons));
export default function ZodiacEmblem({sign='Aries',className=''}) {
 return <svg className={'illustrated-zodiac '+className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={sign}>
  <defs>
   <radialGradient id="zodiac-art-back"><stop stopColor="#f7da99" stopOpacity=".23"/><stop offset="1" stopColor="#f7da99" stopOpacity="0"/></radialGradient>
   <linearGradient id="zodiac-gold" x1="0" y1="0" x2="1" y2="1">
    <stop stopColor="#fff0bd"/><stop offset=".35" stopColor="#f5ca7c"/><stop offset=".75" stopColor="#dca45d"/><stop offset="1" stopColor="#ffe0a1"/>
   </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="97" fill="url(#zodiac-art-back)"/>
  <circle cx="100" cy="100" r="85" className="illustrated-zodiac-ring"/>
  <circle cx="100" cy="100" r="73" className="illustrated-zodiac-inner"/>
  <g className="illustrated-zodiac-figure">{icons[sign]||icons.Aries}</g>
  {Array.from({length:12},(_,i)=>{
   const angle=i*Math.PI/6,x=100+88*Math.cos(angle),y=100+88*Math.sin(angle);
   return <circle key={i} cx={x} cy={y} r={i%3===0?2.1:1.1} fill="#f7d69c" className="illustrated-zodiac-star"/>;
  })}
 </svg>;
}
