import assert from 'node:assert/strict';
import {assertArticleTranslation,alignTranslationLinks} from '../lib/translation-contract.mjs';
const source={slug:'hollow-bolt-naming',product:'hollow-screws',cover:'hollow-screws',processes:['cnc-turning'],bodyFormat:'markdown',title:'What are hollow bolts called?',description:'Naming guide.',category:'Design',intro:'See the [hollow screws](/products/hollow-screws/) page.',example:'Example with M8.',
 sections:[['Bore','Use the [bore guide](/blog/hollow-screw-bore-specification/) and [RFQ checklist](/guides/rfq-checklist/).'],['Wall','Check the wall at the thread root.']],checklist:['State the bore.'],keywords:['hollow bolt'],
 relatedLinks:[{path:'/products/hollow-screws/',label:'Hollow screws'},{path:'/products/cross-drilled-screws/',label:'Cross-drilled screws'}],sources:[['Bolt Science glossary','https://www.boltscience.com/pages/glossary.htm']]};
const german={...source,title:'Wie heißen Hohlschrauben?',description:'Leitfaden.',category:'Konstruktion',intro:'Siehe die Seite [Hohlschrauben](/de/products/hollow-screws/).',example:'Beispiel mit M8.',
 sections:[['Bohrung','Den [Bohrungsleitfaden](/de/blog/hollow-screw-bore-specification/) und die [RFQ-Checkliste](/guides/rfq-checklist/) nutzen.'],['Wand','Wand am Gewindegrund prüfen.']],checklist:['Bohrung angeben.'],keywords:['Hohlschraube'],
 relatedLinks:[{path:'/de/products/cross-drilled-screws/',label:'Querbohrungsschrauben'},{path:'/de/products/hollow-screws/',label:'Hohlschrauben'}],sources:[['Bolt-Science-Glossar','https://www.boltscience.com/pages/glossary.htm/']]};
assert.throws(()=>assertArticleTranslation(source,german),/来源或内链网址/,'the unaligned translation fails as in production');
const {article,repairs}=alignTranslationLinks(source,german);
assert.deepEqual(article.relatedLinks,[{path:'/products/hollow-screws/',label:'Hohlschrauben'},{path:'/products/cross-drilled-screws/',label:'Querbohrungsschrauben'}],'paths restored, translated labels kept by URL');
assert.deepEqual(article.sources,[['Bolt-Science-Glossar','https://www.boltscience.com/pages/glossary.htm']],'source URL restored, label kept by position');
assert(article.intro.includes('](/products/hollow-screws/)')&&article.sections[0][1].includes('](/blog/hollow-screw-bore-specification/)'),'body links returned to approved paths');
assert.deepEqual(repairs.sort(),['restored_body_link_paths','restored_relatedLinks','restored_sources']);
assert.equal(assertArticleTranslation(source,article),article,'aligned translation passes the unchanged contract');
// A real body-link change is still rejected.
const changed=alignTranslationLinks(source,{...german,intro:'Siehe [andere Seite](/products/u-bolts/).'}).article;
assert.throws(()=>assertArticleTranslation(source,changed),/正文中的链接/);
// Numbers are still protected.
assert.throws(()=>assertArticleTranslation(source,{...article,example:'Beispiel mit M10.'}),/数字或标准牌号/);
console.log(JSON.stringify({linkListsRestored:true,translatedLabelsKept:true,bodyLocalePrefixRemoved:true,realChangesStillRejected:true}));
