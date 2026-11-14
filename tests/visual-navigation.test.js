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
 assert.doesNotMatch(detail,/setTimeout|setInterval|symbolTimer|clearTimeout/);
 assert.doesNotMatch(detail,/setSymbolOpen\(true\)/);
 assert.match(detail,/useState\(true\)/);
 assert.match(detail,/setSymbolOpen\(open=>!open\)/);
 assert.match(detail,/if\(!symbolOpen\)setRevealVersion/);
 assert.match(detail,/aria-expanded={symbolOpen}/);
 assert.match(detail,/zodiac-stage-toggle/);
 assert.doesNotMatch(detail,/zodiac-detail-toggle/);
 assert.doesNotMatch(detail,/matchMedia/);
 assert.doesNotMatch(detail,/sky-corner-legend/);
 assert.doesNotMatch(detail,/sky\.symbol/);
 assert.match(symbol,/approved-zodiac-transparent\.webp/);
 assert.match(symbol,/backgroundPosition:POSITIONS\[selected\]/);
 assert.match(symbol,/role="img"/);
 const approvedSprite=readFileSync(new URL('../public/zodiac/approved-zodiac-isolated-v2.webp',import.meta.url));
 assert.ok(approvedSprite.length>50000,'Approved zodiac sprite should be present and contain artwork');
 assert.equal(approvedSprite.subarray(0,4).toString(),'RIFF','Expected a WebP image');
 assert.equal(approvedSprite.subarray(12,16).toString(),'VP8X','Expected extended WebP with transparency');
 assert.ok(approvedSprite[20]&0x10,'Zodiac illustrations must include real alpha transparency');
 const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
 assert.match(css,/background-color:transparent;background-repeat:no-repeat/);
 assert.match(css,/box-shadow:none/);
 for(const sign of ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis']){
  assert.ok(symbol.includes(sign),sign+' must map to a distinct isolated artwork tile');
 }
});

test('standalone sky story is gone; animated zodiac stage remains first in mobile name detail',()=>{
 assert.doesNotMatch(app,/<Sky\\s+date=/);
 assert.doesNotMatch(app,/href="#cielo"/);
 assert.match(detail,/zodiac-reveal-stage/);
 assert.match(detail,/zodiac-stage-toggle/);
 assert.ok(detail.indexOf('zodiac-reveal-stage') < detail.indexOf('cosmic-name'), 'zodiac must precede name details');
});

test('phone-sized CSS places zodiac ahead of long name content',()=>{
 const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
 assert.match(css,/\.cosmic-fullsky \.zodiac-reveal-stage\{position:relative/);
 assert.match(css,/order:-1/);
 assert.match(css,/\.cosmic-fullsky \.zodiac-reveal-stage \.zodiac-vision/);
 assert.match(css,/\.cosmic-fullsky \.cosmic-name\{width:100%/);
 assert.match(css,/\.zodiac-stage-toggle/);
});
