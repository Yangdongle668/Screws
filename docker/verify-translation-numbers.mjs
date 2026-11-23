import assert from 'node:assert/strict';
import {assertArticleTranslation,numberMismatch} from '../lib/translation-contract.mjs';
const base={slug:'s',product:'hollow-screws',cover:'hollow-screws',processes:[],bodyFormat:'markdown',title:'Hollow bolts',description:'Guide.',category:'Design',intro:'The five categories below cover M8 parts.',example:'A 3 mm cable through an M8 bore; 0.12–0.28 mm clearance.',sections:[['Forms','Two forms combine.'],['Wall','Check 1.25d engagement.']],checklist:['State the bore.'],keywords:['hollow bolt'],relatedLinks:[],sources:[]};
const zh={...base,title:'空心螺栓',description:'指南。',category:'设计',intro:'下面 5 类涵盖 M8 零件。',example:'3 mm 线缆穿过 M8 孔；间隙 0.12–0.28 mm。',sections:[['型式','两种型式可组合。'],['壁厚','检查 1.25d 旋合。']],checklist:['写明孔。'],keywords:['空心螺栓']};
assert.equal(assertArticleTranslation(base,zh),zh,'"five" written as "5" is accepted');
const de={...zh,intro:'Die fünf Kategorien gelten für M8-Teile.',example:'Ein 3-mm-Kabel durch eine M8-Bohrung; 0,12–0,28 mm Spiel.',sections:[['Formen','Zwei Formen kombinieren.'],['Wand','1,25d Einschraubtiefe prüfen.']]};
assert.equal(assertArticleTranslation(base,de),de,'German decimal commas and hyphenated units are accepted');
assert.throws(()=>assertArticleTranslation(base,{...de,example:'Ein 4-mm-Kabel durch eine M8-Bohrung; 0,12–0,28 mm Spiel.'}),/缺少数字 3.*多出数字 4/,'a changed value is rejected and named');
assert.throws(()=>assertArticleTranslation(base,{...de,intro:'Die fünf Kategorien gelten für M10-Teile.'}),/缺少牌号 M8/,'a changed identifier is rejected and named');
assert.deepEqual(numberMismatch(['Use 3 mm cable'],['使用三毫米线缆']).missing,['3'],'numbers with units must stay digits');
// Thousands and decimal conventions differ by language; values must still match.
for(const [en,tr] of [['Up to 20,000 and 5,000 parts.','Jusqu\u2019à 20 000 et 5 000 pièces.'],['20,000 parts','20\u202f000 pièces'],['20,000 parts and 1.25d','20.000 Teile und 1,25d'],['20,000 parts','20\'000 Teile'],['0.12–0.28 mm','0,12–0,28 mm']])assert.deepEqual(numberMismatch([en],[tr]),{missing:[],extra:[]},tr);
assert.deepEqual(numberMismatch(['20,000 parts'],['2 000 pièces']),{missing:['20,000'],extra:['2 000']},'a different value is still rejected');
assert.deepEqual(numberMismatch(['1.25d'],['12,5d']),{missing:['1.25'],extra:['12,5']},'a moved decimal point is still rejected');
console.log(JSON.stringify({countWordsTolerated:true,valuesStrict:true,identifiersStrict:true,errorNamesValues:true,localNumberFormats:true}));
