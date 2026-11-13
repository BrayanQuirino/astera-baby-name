import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const detail=readFileSync(new URL('../src/components/NameSkyExperience.jsx',import.meta.url),'utf8');
const orrery=readFileSync(new URL('../src/components/CosmicOrrery.jsx',import.meta.url),'utf8');
const symbol=readFileSync(new URL('../src/components/ZodiacEmblem.jsx',import.meta.url),'utf8');

test('landing hero is mouse-responsive constellation orrery',()=>{
 assert.match(app,/<CosmicOrrery\s*\/>/);
 assert.match(orrery,/pointermove/);
 assert.match(orrery,/interactionArea/);
 assert.match(orrery,/orrery-ring/);
 assert.match(orrery,/orrery-sky-path/);
});
test('letter range controls and main page zodiac emoji reveal are absent',()=>{
 assert.doesNotMatch(app,/<AlphabetPicker/);
 assert.doesNotMatch(app,/zodiac-symbol-reveal/);
 assert.doesNotMatch(app,/zodiac-reopen/);
 assert.match(app,/initialQuestion/);
});
test('zodiac illustration belongs to name-detail celestial experience, not landing page',()=>{
 assert.match(detail,/<ZodiacEmblem/);
 assert.match(detail,/setTimeout\(\(\)=>setSymbolOpen\(false\),5200\)/);
 assert.match(detail,/zodiac-detail-toggle/);
 assert.doesNotMatch(detail,/sky\.symbol/);
 for(const sign of ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis']){
  assert.ok(symbol.includes(sign),sign+' must have a custom illustrated vector');
 }
});
