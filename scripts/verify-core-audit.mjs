import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {isCorePath,describeHtml} from './collect-core-audit.mjs';
import {noteFor} from './core-audit-notes.mjs';

const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const report=await read('docs/reports/core-page-audit.json');
const index=await read('docs/content-operations/evidence-index.json');
const inventory=await read('docs/content-operations/inventory.json');
const live=await read('docs/reports/core-live-observations.json');
const paths=inventory.pages.filter(p=>isCorePath(p.path)).map(p=>p.path);
assert.deepEqual(report.records.map(r=>r.path),paths,'Missing or extra core URL');
assert.equal(new Set(paths).size,paths.length);
assert.equal(report.totals.coreEnglish,paths.length);
assert.equal(index.claims.length,22);
assert.equal(new Set(index.claims.map(c=>c.id)).size,22);
const claimMap=new Map(index.claims.map(c=>[c.id,c]));
for(const [p,expected] of Object.entries(report.sourceHashes))assert.equal(hash((await fs.readFile(p,'utf8')).replaceAll('\r\n','\n')),expected,'Stale audit source: '+p);
for(const r of report.records){
 assert(noteFor(r.path),'No route-specific editorial note');
 assert(!r.path.startsWith('/request-a-quote/'),'RFQ excluded');
 const observation=live.observations.find(o=>o.path===r.path);
 assert(observation,'No captured public observation');
 assert.equal(r.observation.status,observation.status);
 assert.equal(r.observation.bodyHash,observation.bodyHash);
 assert(observation.bodyText.includes(r.content.supportingExcerpt),'Excerpt not present in captured body');
 assert(r.content.nextAction.length>20);
 assert.equal(r.translationRepositoryChecks.length,5);
 for(const id of r.evidenceIds){assert(claimMap.has(id),'Unresolved evidence ID');assert(claimMap.get(id).relatedPaths.includes(r.path));}
}
for(const claim of index.claims){
 for(const file of claim.basis)await fs.access(file);
 for(const asset of claim.assets)assert.equal(hash(await fs.readFile(asset.path)),asset.sha256,'Asset provenance hash differs');
 for(const p of claim.relatedPaths)assert(report.records.find(r=>r.path===p)?.evidenceIds.includes(claim.id));
}
assert.equal(live.observations.length,paths.length+10);
assert.equal(new Set(live.observations.map(r=>r.path)).size,live.observations.length);
assert.equal(report.totals.publicGET200,report.records.filter(r=>r.observation.status===200).length);
// Fixtures catch parser regressions without contacting production or submitting forms.
const fixture=describeHtml('<title>A &amp; B</title><meta name="description" content="Use a drawing"><link rel="canonical" href="https://example.invalid/"><main><h1>One</h1><h2>Two</h2><a href="/materials/?x=1&amp;y=2">Compare</a><table></table></main><script type="application/ld+json">{"@type":"WebPage"}</script>');
assert.equal(fixture.title,'A & B');assert.equal(fixture.tables,1);assert.equal(fixture.headings.length,2);assert.deepEqual(fixture.schemaTypes,['WebPage']);assert.equal(fixture.links[0],'/materials/?x=1&y=2');
const html=await fs.readFile('docs/reports/core-page-audit.html','utf8');
assert.equal((html.match(/<tr data-priority=/g)||[]).length,paths.length);
for(const c of index.claims)assert(html.includes('id="'+c.id+'"'));
for(const m of html.matchAll(/href="#(C\d+)"/g))assert(claimMap.has(m[1]),'Broken in-report evidence anchor');
// Exercise the report filter and evidence expansion, including its no-results state.
const rows=[{dataset:{priority:'P1',kind:'product'},textContent:'shoulder screw',hidden:false},{dataset:{priority:'P2',kind:'material'},textContent:'stainless steel',hidden:false}];
const elements=Object.fromEntries(['search','priority','kind','count'].map(id=>[id,{value:'',textContent:'',addEventListener(){}}]));
elements.C14={tagName:'DETAILS',open:false};
const context=vm.createContext({document:{querySelectorAll:()=>rows,getElementById:id=>elements[id]},window:{addEventListener(){}},location:{hash:'#C14'}});
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
assert.equal(elements.count.textContent,'显示 2 / 2 个页面');assert(elements.C14.open);
elements.priority.value='P1';vm.runInContext('filter()',context);assert(!rows[0].hidden&&rows[1].hidden);
elements.search.value='no match';vm.runInContext('filter()',context);assert(rows.every(r=>r.hidden));
console.log(`Audit verified: ${paths.length} unique English URLs, ${paths.length*5} repository translations, 10 live translation samples, ${index.claims.length} evidence records; hashes, excerpts, anchors and filter verified. No RFQ or deployment test executed.`);
