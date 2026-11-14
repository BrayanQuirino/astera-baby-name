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
test('zodiac artwork is permanently visible beside observation sign info',()=>{
 assert.match(detail,/<div className="cosmic-sign zodiac-sign-summary">/);
 assert.match(detail,/<div className="zodiac-sign-graphic"><ZodiacEmblem sign={sky.sign}\/><\/div>/);
 assert.match(detail,/<div className="zodiac-sign-copy">/);
 assert.match(detail,/Sol en {sky.constellation} \(aprox\.\)/);
 assert.doesNotMatch(detail,/zodiac-reveal-stage|zodiac-stage-toggle|zodiac-vision|setSymbolOpen|symbolOpen|toggleSymbol|setTimeout|setInterval|symbolTimer/);
 assert.doesNotMatch(detail,/Sparkles|aria-expanded/);
 assert.doesNotMatch(detail,/matchMedia|sky-corner-legend|sky\.symbol/);
 assert.equal((detail.match(/<ZodiacEmblem/g)||[]).length,1,'Exactly one illustration should render');
 assert.ok(detail.indexOf('cosmic-name')<detail.indexOf('zodiac-sign-summary'),'The large illustration must no longer occupy the sky area');
 assert.match(symbol,/approved-zodiac-isolated-v2\.webp/);
 assert.match(symbol,/backgroundPosition:POSITIONS\[selected\]/);
 assert.match(symbol,/role="img"/);
 const approvedSprite=readFileSync(new URL('../public/zodiac/approved-zodiac-isolated-v2.webp',import.meta.url));
 assert.ok(approvedSprite.length>50000,'Approved zodiac sprite should be present and contain artwork');
 assert.equal(approvedSprite.subarray(0,4).toString(),'RIFF','Expected a WebP image');
 assert.equal(approvedSprite.subarray(12,16).toString(),'VP8X','Expected extended WebP with transparency');
 assert.ok(approvedSprite[20]&0x10,'Zodiac illustrations must include real alpha transparency');
 const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
 assert.match(css,/\.zodiac-sign-graphic \.illustrated-zodiac-approved/);
 assert.match(css,/background-color:transparent/);
 assert.match(css,/background-size:400% 300%/);
 for(const sign of ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis']){
  assert.ok(symbol.includes(sign),sign+' must map to a distinct isolated artwork tile');
 }
});
test('the sky story stays removed and the constellation area is clear',()=>{
 assert.doesNotMatch(app,/<Sky\\s+date=/);
 assert.doesNotMatch(app,/href="#cielo"/);
 assert.match(detail,/FullSkyMap date={date} location={location}/);
 assert.doesNotMatch(detail,/zodiac-reveal-stage|zodiac-stage-toggle/);
});

test('mobile zodiac summary always keeps the illustration left of text',()=>{
 const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
 assert.match(css,/\.cosmic-fullsky \.sky-full-controls \.zodiac-sign-summary/);
 assert.match(css,/flex-direction:row/);
 assert.match(css,/\.zodiac-sign-graphic/);
 assert.match(css,/\.zodiac-sign-copy/);
 assert.match(css,/@media \(max-width:760px\)/);
 assert.match(css,/\.cosmic-fullsky \.sky-full-controls \.zodiac-sign-copy/);
});
