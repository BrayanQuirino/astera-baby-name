import test from 'node:test';
import assert from 'node:assert/strict';
import {getPopularity,localizedMeaning,hasLocalizedMeaning} from '../src/lib/nameInsights.js';
test('popularity reflects country-specific source data, not a global percent',()=>{
 const name={name:'Ana'};
 const dataset={names:{ana:{MX:[53,.001],JP:[28,.0001]}}};
 assert.deepEqual(getPopularity(name,dataset,'MX'),{index:53,share:.001,country:'MX'});
 assert.equal(getPopularity(name,dataset,'US'),null);
 assert.deepEqual(getPopularity(name,dataset,'all'),{index:53,share:.001,country:'MX'});
 assert.equal(getPopularity(name,null),null);
});
test('creative poetic associations are composed in active language',()=>{
 const name={meaningType:'creative',meaning:'Evoca la luz y el amor.'};
 const english={lang:'en',template:'Evokes {a} and {b}.',phrases:{'la luz':'light','el amor':'love'},meanings:{}};
 assert.equal(localizedMeaning(name,'en',english),'Evokes light and love.');
 assert.equal(hasLocalizedMeaning(name,'en',english),true);
 assert.equal(localizedMeaning(name,'ja',english),'Evoca la luz y el amor.');
});
test('published source meanings are never replaced with unrelated translations',()=>{
 const name={meaningType:'published',meaning:'Gift of God'};
 const english={lang:'en',phrases:{},meanings:{'Gift of God':'A gift from God'}};
 assert.equal(localizedMeaning(name,'en',english),'A gift from God');
 assert.equal(localizedMeaning(name,'fr',english),'Gift of God');
 assert.equal(hasLocalizedMeaning(name,'fr',english),false);
});
