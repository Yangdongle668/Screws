import fs from 'node:fs';
// At-a-glance comparison tables for decision articles. General engineering facts only; no plant capability claims.
export const comparisonNote='General comparison. The route and requirements for a specific part are confirmed against its drawing.';
export const comparisonTables={
 '/blog/cold-heading-vs-cnc-custom-screws/':{
  heading:'At a glance: cold heading vs CNC turning',
  columns:['Factor','Cold heading','CNC / Swiss-type turning'],
  rows:[
   ['Typical quantity','Repeat volumes that justify tooling','Prototypes, small batches and changing designs'],
   ['Tooling','Dies and punches are made before production','Mainly programs and standard cutting tools'],
   ['Material use','Little material loss; grain flow follows the formed shape','Material is removed as chips; grain flow is cut'],
   ['Suited geometry','Heads, flanges and steps that can be formed in stages','Deep bores, cross holes, eccentric and tight local features'],
   ['Design changes','Die changes take longer and cost more','Program changes are quick']
  ]},
 '/blog/rolled-vs-cut-thread-rfq/':{
  heading:'At a glance: rolled vs cut threads',
  columns:['Factor','Rolled thread','Cut thread'],
  rows:[
   ['How it is made','Material is displaced between dies','Material is removed by turning, die cutting or milling'],
   ['Blank','A reduced blank near the pitch diameter','Stock at the full major diameter'],
   ['Surface and fatigue','Cold-worked, smooth flanks; generally better fatigue resistance','Grain flow is cut; finish depends on tool and setup'],
   ['Suited to','Volume production and many special profiles','Large pitches, small batches and threads close to a shoulder'],
   ['State in the RFQ','Thread designation, class, gauging and whether rolling is required','Thread designation, class, gauging and whether cutting is acceptable']
  ]},
 '/blog/nickel-plating-vs-stainless-passivation/':{
  heading:'At a glance: nickel plating vs stainless passivation',
  columns:['Factor','Nickel plating','Stainless passivation'],
  rows:[
   ['Applies to','Steel, brass and other substrates','Stainless steel only'],
   ['What it does','Adds a metallic nickel layer','Removes free iron and supports the passive film; adds no layer'],
   ['Dimensional effect','Adds thickness; threads and fits need an allowance','Negligible dimensional change'],
   ['Common reference','ISO 4042 for electroplated fasteners','ASTM A967 or ASTM A380'],
   ['Hydrogen risk','High-strength steel needs a hydrogen-embrittlement review','Not an electroplating process']
  ]},
 '/blog/sampling-vs-full-fastener-inspection/':{
  heading:'At a glance: sampling vs 100% inspection',
  columns:['Factor','Sampling inspection','100% inspection'],
  rows:[
   ['Coverage','A defined sample from each lot','Every part, for the named characteristics'],
   ['Suited to','Stable processes and lower-risk characteristics','Functional or safety-relevant characteristics and unstable processes'],
   ['Typical methods','Gauges and instruments under a plan such as ISO 2859-1','Optical (CCD) sorting, go/no-go gauging or functional checks'],
   ['Evidence','Sample records and lot acceptance','Sorting records, reject counts and system verification'],
   ['State in the RFQ','Characteristics, sampling plan and acceptance numbers','Characteristics, method and how the system is verified']
  ]}
};
export function comparisonSection(url){const t=comparisonTables[url];if(!t)return '';return `<section class="section compact comparison-table"><h2>${t.heading}</h2><table><thead><tr>${t.columns.map(c=>`<th scope="col">${c}</th>`).join('')}</tr></thead><tbody>${t.rows.map(([a,b,c])=>`<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table><p class="fine">${comparisonNote}</p></section>`;}
export const comparisonStrings=()=>[comparisonNote,...Object.values(comparisonTables).flatMap(t=>[t.heading,...t.columns,...t.rows.flat()])];
