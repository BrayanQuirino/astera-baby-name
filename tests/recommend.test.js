import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendNames,filterNames,matchesCulture,hasHarmonyPreferences,surnameHarmony,searchNames} from '../src/lib/recommend.js';
const names=[
 {id:1,name:'Zuri',gender:'girl',country:'MX',countries:['MX'],origin:'México',native:'',meaning:'Luz',variants:[]},
 {id:2,name:'Ana',gender:'girl',country:'ES',countries:['ES'],origin:'España',native:'',meaning:'Gracia',variants:[]},
 {id:3,name:'Leo',gender:'boy',country:'JP',countries:['JP'],origin:'Japón',native:'',meaning:'León',variants:[]},
 {id:4,name:'Akira',gender:'unisex',country:'JP',countries:['JP'],origin:'Japón',native:'',meaning:'Brillante',variants:[]}
];
test('gender-only selection is alphabetical and does not display harmony',()=>{
 const girls=recommendNames(names,{gender:'girl'});
 assert.deepEqual(girls.map(n=>n.name),['Akira','Ana','Zuri']);
 assert.ok(girls.every(n=>n.harmony===null));
 assert.equal(hasHarmonyPreferences({gender:'boy',date:'2026-11-11'}),false);
});
test('optional preferences activate a 0-100 harmony percentage',()=>{
 const ranked=recommendNames(names,{gender:'all',surname1:'García',surname2:'Tanaka',country:'JP'});
 assert.equal(ranked.length,2);
 assert.ok(ranked.every(n=>Number.isInteger(n.harmony)&&n.harmony>=0&&n.harmony<=100));
 assert.ok(ranked.every((n,i)=>i===0||ranked[i-1].harmony>=n.harmony));
 assert.equal(hasHarmonyPreferences({surname1:'García'}),true);
 assert.equal(hasHarmonyPreferences({country:'JP',style:'modern',mother:'Suzu'}),false);
 assert.notEqual(surnameHarmony('Ana',['García','Tanaka']),surnameHarmony('Hikaru',['García','Tanaka']));
});
test('surname scoring supports one or two surnames and ignores blanks',()=>{
 assert.equal(surnameHarmony('Hikaru',[]),null);
 assert.ok(Number.isFinite(surnameHarmony('Hikaru',['García','Tanaka'])));
 assert.ok(Number.isFinite(surnameHarmony('Ana',['García'])));
});
test('search filter keeps matches usable for pagination',()=>{
 assert.deepEqual(searchNames(names,'', 'boy','all').map(n=>n.name),['Leo','Akira']);
 assert.deepEqual(searchNames(names,'akira','all','all').map(n=>n.name),['Akira']);
});

test('initial search matches first letter and normalizes accents',()=>{
 assert.deepEqual(filterNames(names,'',{initial:'a'}).map(n=>n.name),['Akira','Ana']);
 assert.deepEqual(recommendNames(names,{initial:'a',gender:'girl'}).map(n=>n.name),['Akira','Ana']);
 assert.deepEqual(filterNames(names,'',{initial:'z',gender:'boy'}).map(n=>n.name),[]);
});
test('search filters combine gender, culture, style and surname harmony',()=>{
 assert.deepEqual(filterNames(names,'',{gender:'girl',country:'ES',initial:'A'}).map(n=>n.name),['Ana']);
 assert.deepEqual(filterNames(names,'',{gender:'all',style:'short'}).map(n=>n.name),['Akira','Ana','Leo','Zuri']);
 const ranked=filterNames(names,'',{surname1:'García',surname2:'Tanaka'});
 assert.ok(ranked.every(n=>Number.isInteger(n.harmony)));
 assert.ok(ranked.every((n,i)=>i===0||ranked[i-1].harmony>=n.harmony));
 assert.equal(hasHarmonyPreferences({initial:'A',style:'modern',country:'JP'}),false);
});

test('cultural origin never equals mere recorded frequency in Japan',()=>{
 const samples=[
  {name:'Hikaru',gender:'unisex',origin:'Japonés',country:'MX',countries:['JP','MX'],variants:[]},
  {name:'Haruki',gender:'boy',origin:'Japanese',country:'JP',countries:['JP','US'],variants:[]},
  {name:'Michael',gender:'boy',origin:'English / Hebrew',country:'JP',countries:['JP'],variants:[]},
  {name:'Uncertain',gender:'boy',origin:'Origen por verificar',country:'JP',countries:['JP'],variants:[]},
  {name:'Minjun',gender:'boy',origin:'Coreano',country:'JP',countries:['JP','KR'],variants:[]},
  {name:'Aiko',gender:'girl',origin:'Japanese',country:'US',countries:['US'],variants:[]}
 ];
 assert.deepEqual(filterNames(samples,'',{country:'JP'}).map(n=>n.name),['Aiko','Haruki','Hikaru']);
 assert.deepEqual(recommendNames(samples,{country:'JP'}).map(n=>n.name),['Aiko','Haruki','Hikaru']);
 assert.equal(matchesCulture(samples[2],'JP'),false);
 assert.equal(matchesCulture(samples[4],'KR'),true);
});
test('country filters respect attested origin even when recorded elsewhere',()=>{
 const samples=[
  {name:'Mina',gender:'girl',origin:'Japanese / Arabic',country:'US',countries:['JP','US'],variants:[]},
  {name:'Mia',gender:'girl',origin:'Latin',country:'JP',countries:['JP'],variants:[]},
  {name:'Unspecified',gender:'girl',origin:'Origen por verificar',country:'JP',countries:['JP'],variants:[]}
 ];
 assert.deepEqual(searchNames(samples,'','all','JP').map(n=>n.name),['Mina']);
 assert.deepEqual(filterNames(samples,'',{country:'JP'}).map(n=>n.name),['Mina']);
});
