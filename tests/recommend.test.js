import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendNames,hasHarmonyPreferences,surnameHarmony,searchNames} from '../src/lib/recommend.js';
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
 assert.equal(ranked.length,4);
 assert.ok(ranked.every(n=>Number.isInteger(n.harmony)&&n.harmony>=0&&n.harmony<=100));
 assert.ok(ranked.every((n,i)=>i===0||ranked[i-1].harmony>=n.harmony));
 assert.equal(hasHarmonyPreferences({surname1:'García'}),true);
});
test('surname scoring supports one or two surnames and ignores blanks',()=>{
 assert.equal(surnameHarmony('Hikaru',[]),0);
 assert.ok(Number.isFinite(surnameHarmony('Hikaru',['García','Tanaka'])));
 assert.ok(Number.isFinite(surnameHarmony('Ana',['García'])));
});
test('search filter keeps matches usable for pagination',()=>{
 assert.deepEqual(searchNames(names,'', 'boy','all').map(n=>n.name),['Leo','Akira']);
 assert.deepEqual(searchNames(names,'akira','all','all').map(n=>n.name),['Akira']);
});
