// Fechas astronómicas aproximadas de paso solar, basadas en OpenStax Astronomy 2.1.
// Los límites exactos varían con el año y la hora de nacimiento.
// Estas figuras son diagramas artísticos, NO coordenadas estelares medidas.
const range=[
 [121,'Capricornio','Capricornus'],[216,'Acuario','Aquarius'],[312,'Piscis','Pisces'],
 [419,'Aries','Aries'],[514,'Tauro','Taurus'],[622,'Géminis','Gemini'],
 [721,'Cáncer','Cancer'],[811,'Leo','Leo'],[917,'Virgo','Virgo'],
 [1031,'Libra','Libra'],[1124,'Escorpio','Scorpius'],[1130,'Ofiuco','Ophiuchus'],
 [1218,'Sagitario','Sagittarius'],[1232,'Capricornio','Capricornus']
];
const signs=[[120,'Capricornio','♑'],[219,'Acuario','♒'],[321,'Piscis','♓'],[420,'Aries','♈'],[521,'Tauro','♉'],[621,'Géminis','♊'],[723,'Cáncer','♋'],[823,'Leo','♌'],[923,'Virgo','♍'],[1023,'Libra','♎'],[1122,'Escorpio','♏'],[1222,'Sagitario','♐'],[1232,'Capricornio','♑']];
export function celestialForDate(date){
 if(!date)return null;
 const m=Number(date.slice(5,7)),d=Number(date.slice(8,10));
 const n=m*100+d;
 const sign=signs.find(s=>n<s[0])||signs.at(-1);
 const constellation=range.find(s=>n<s[0])||range.at(-1);
 return {sign:sign[1],symbol:sign[2],constellation:constellation[1],latin:constellation[2],approx:true};
}
// Diferentes figuras consteladas decorativas para que cada constelación sea distinta.
const shapes=[
 [[13,45],[26,31],[44,44],[62,25],[80,39],[91,57]],[[9,50],[28,23],[41,40],[58,21],[78,40],[88,71]],[[17,15],[30,32],[48,29],[64,45],[80,56],[57,78],[31,68]],
 [[20,58],[39,33],[55,40],[76,21]],[[19,17],[35,42],[51,31],[67,52],[86,22],[73,77]],
 [[14,35],[32,20],[47,50],[63,20],[81,37],[65,75],[46,57],[31,83]],
 [[12,36],[34,52],[52,33],[75,62]],[[12,62],[28,25],[55,36],[75,21],[90,48],[67,79]],
 [[15,31],[36,15],[48,47],[65,66],[84,39],[71,89]],[[19,24],[28,65],[60,75],[82,27]],
 [[12,18],[29,45],[46,39],[59,56],[77,69],[88,85]],[[18,24],[35,12],[56,37],[78,22],[62,63],[45,85]],
 [[14,50],[33,21],[49,48],[67,17],[82,45],[68,79]]
];
export function pointsForConstellation(latin){
 const i=Math.max(0,['Capricornus','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpius','Ophiuchus','Sagittarius'].indexOf(latin));
 return shapes[i];
}
