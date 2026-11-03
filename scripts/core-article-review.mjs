// Targeted editorial increments. Numbers are teaching inputs, not production limits.
export const articleReviewCopy={
 note:'Worked review only. Inputs and acceptance criteria belong to the actual drawing; no customer test result or universal performance rating is claimed.',
 shoulderIntro:'A shoulder screw drawing needs separate bore-fit, axial-stack, thread and final-surface requirements. Check both tolerance limits before sample approval.',
 shoulderHeading:'Worked review: calculate diametral clearance separately',
 shoulderBody:'Assume a finished shoulder diameter of 8.000 ± 0.005 mm and a mating bore of 8.020 ± 0.010 mm. Compare the smallest bore with the largest shoulder, then the largest bore with the smallest shoulder. The resulting 0.005–0.035 mm range is diametral clearance, not radial clearance or an axial gap. These illustrative inputs do not define a standard fit or an approved operating range. The designer still specifies the functional range, temperature basis, datum relationships and final surface condition.',
 shoulderAid:'Turn the diameter limits into a review record',
 shoulderLabelOne:'Minimum diametral clearance',
 shoulderValueOne:'8.010 − 8.005 = 0.005 mm, using the smallest bore and largest shoulder.',
 shoulderLabelTwo:'Maximum diametral clearance',
 shoulderValueTwo:'8.030 − 7.995 = 0.035 mm, using the largest bore and smallest shoulder.',
 shoulderLink:'Shoulder interfaces and the separate axial-clearance example',
 captiveIntro:'Specify a captive screw with its panel, retainer and mating thread. Review installation, released travel and tightened engagement as separate conditions.',
 captiveHeading:'Worked review: release a service panel without losing the screw',
 captiveBody:'For a service-panel design exercise, begin with the intended installation sequence. Show how the screw and retaining part are assembled, which feature prevents escape after release, and where the screw sits once tightened. Check that the available released travel clears the mating thread and permits the panel to open. Then check that the retained hardware does not obstruct seating or reduce the required engagement. Record retention and opening/reassembly as separate checks against the identified panel and retainer revisions.',
 captiveAid:'Keep the two service positions in the approval record',
 captiveLabelOne:'Assembly sketch to supply',
 captiveValueOne:'Panel thickness and hole, retaining part, open and tightened positions, thread engagement and nearby obstructions.',
 captiveLabelTwo:'Sample review to agree',
 captiveValueTwo:'Identify the panel, retainer and screw revisions; record retention, release clearance and reassembly against their separate criteria.',
 captiveLink:'Open and tightened captive-screw interface sketch',
 securityIntro:'Specify the drive profile, matching tool, finish and installed access together. A bit that fits a loose screw may still fail to engage inside the housing.',
 securityHeading:'Worked review: distinguish a tool-fit issue from an access issue',
 securityBody:'Consider a pin-in screw in a recessed cover. First compare the finished recess with the identified service bit outside the housing. Next review the same bit in the installed position, including its holder and approach space. If engagement is satisfactory outside but restricted inside, review the access envelope before changing the drive profile. If the bit cannot seat in either position, review the recess, pin, bit and final finish together. Record which interface changed and repeat the affected check with the same controlled tool reference.',
 securityAid:'Identify the interface that needs correction',
 securityLabelOne:'Tool and loose-part record',
 securityValueOne:'Drive reference, bit identity, pin clearance and usable engagement on the finished sample.',
 securityLabelTwo:'Installed-access record',
 securityValueTwo:'Housing revision, tool holder and approach envelope, access restriction and the proposed drawing change.',
 securityLink:'Security-drive and installed-tool access sketch',
 hollowIntro:'Specify the complete bore, minimum remaining wall, internal edges and acceptance method. Use thread-root geometry and bore offset in the section review.',
 hollowHeading:'Worked review: include bore offset in the wall calculation',
 hollowBody:'For an illustrative circular section, take a lower-limit thread-root envelope diameter of 6.00 mm, an upper-limit bore diameter of 3.00 mm and a maximum radial bore-centre offset of 0.20 mm. The minimum remaining wall in that section is (6.00 − 3.00) ÷ 2 − 0.20 = 1.30 mm. The offset is a radial distance here, not a diametral position-tolerance callout. This calculation does not cover cross-hole intersections, other local sections or load capacity. Derive the actual inputs from the controlled geometry and its tolerance limits.',
 hollowAid:'Record the limiting section and the inspection access',
 hollowLabelOne:'Section result',
 hollowValueOne:'1.30 mm is the calculated remaining wall for the stated teaching inputs, not a safe-wall recommendation or pressure rating.',
 hollowLabelTwo:'Separate internal-edge decision',
 hollowValueTwo:'Identify the intersecting hole and burr requirement, the deburring stage and a suitable check before later assembly limits access.',
 hollowLink:'Hollow-screw section and passage review',
 flangeIntro:'Match the flange bearing face to the actual supporting surface. Compare the contact footprint, finish and grip length before replacing a separate washer.',
 flangeHeading:'Worked review: compare an integral flange with a washer assembly',
 flangeBody:'For a coated slotted bracket, compare the existing head-and-washer arrangement with the proposed integral flange on the same bracket drawing. Identify the supporting surface left around the slot and the areas that must remain clear. Review flange or washer overhang, the under-head transition and permissible coating marks. Account for the washer thickness when comparing grip length and usable engagement. Keep the assembly method and acceptance criteria explicit; fewer loose components do not establish equivalent bearing behavior or retained clamp load.',
 flangeAid:'Separate unchanged inputs from the proposed change',
 flangeLabelOne:'Keep the comparison basis',
 flangeValueOne:'Bracket and slot revision, mating material, coating, assembly method and agreed acceptance criteria.',
 flangeLabelTwo:'Compare the two arrangements',
 flangeValueTwo:'Supported footprint, transition clearance, washer contribution to grip length, engagement and marking after the agreed service sequence.',
 flangeLink:'Smooth flange, serrated flange and separate-washer sketch',
 setIntro:'Choose a set-screw point by its contact with the mating part. Define allowable marking, adjustment and retention, then verify the complete joint.',
 setHeading:'Write a repeat-adjustment acceptance record',
 setBody:'For the fixture-stop exercise, define the starting setting, allowed contact mark and adjustment/service sequence before the trial. Check contact at both ends of travel and after returning to the starting setting. Record whether each result is a visual assessment, a dimensional reading or a functional observation. If the pad or point geometry changes, compare against the same criteria rather than reusing the old result. This creates an acceptance record; it does not establish a universal tightening torque or holding force.',
 setAid:'Make the adjustment trial repeatable',
 setLabelOne:'Before the trial',
 setValueOne:'Point and pad drawings, permitted marking, adjustment travel and the agreed retained-setting criterion.',
 setLabelTwo:'After the service sequence',
 setValueTwo:'Starting and returned positions, contact condition and outcome against each criterion; identify the point, pad and drawing revisions.',
 setLink:'Set-screw contact forms in the mating assembly',
 shoulderKeyOne:'shoulder screw drawing',shoulderKeyTwo:'diametral clearance',shoulderKeyThree:'shoulder-to-bore fit',
 captiveKeyOne:'captive screw design',captiveKeyTwo:'panel retention',captiveKeyThree:'captive screw travel',
 securityKeyOne:'security screw drive specification',securityKeyTwo:'pin-in tool engagement',securityKeyThree:'installed tool access',
 hollowKeyOne:'hollow screw bore specification',hollowKeyTwo:'remaining wall thickness',hollowKeyThree:'internal burr inspection',
 flangeKeyOne:'flange screw bearing face',flangeKeyTwo:'flange versus washer',flangeKeyThree:'supported bearing footprint',
 setKeyOne:'set screw point selection',setKeyTwo:'contact marking',setKeyThree:'repeat adjustment acceptance'
};
export const articleReviews={
 'shoulder-screw-drawing-guide':{key:'shoulder',expectedFingerprint:'10ed397d83ed116c0371cf33cdee7fbf52b5c0fd9fb3fba2e61a52aee3ecf03b',product:'shoulder-screws'},
 'captive-screw-design-questions':{key:'captive',expectedFingerprint:'0e476078fc52c0169d4234ffa87f421eedff97689e36e0464e688eefb27ce971',product:'captive-screws'},
 'specifying-security-screw-drive':{key:'security',expectedFingerprint:'ea3de5810d450f4384cb90910dc8e852089a3983cfd4f9507b6c626420ea65e7',product:'security-screws'},
 'hollow-screw-bore-specification':{key:'hollow',expectedFingerprint:'61c7af53cf409b7672e48fd6011fc77b0ce3e44b401e9b6a7658c2bff1768a20',product:'hollow-screws'},
 'custom-flange-bearing-face':{key:'flange',expectedFingerprint:'6bcf9d3cb3bd7fb841d2dc2f0164c84c68ea86b912589caddf4c0a2699577ceb',product:'flange-screws'},
 'set-screw-tip-selection':{key:'set',expectedFingerprint:'421f0437ebf39f27ad92e4b9c3b3e9a84e3657bb4bd962f5ce9275861d70c8f1',product:'set-screws'}
};
export function applyCoreArticleReviews(articles){
 for(const a of articles){const r=articleReviews[a.slug];if(!r)continue;const k=r.key;
  a.intro=articleReviewCopy[k+'Intro'];a.description=a.intro;a.reviewedAt='2026-11-03';
  a.sections=[...a.sections,[articleReviewCopy[k+'Heading'],articleReviewCopy[k+'Body']]];
  a.keywords=['One','Two','Three'].map(n=>articleReviewCopy[k+'Key'+n]);
  a.relatedLinks=[{path:'/products/'+r.product+'/',label:articleReviewCopy[k+'Link']}];
 }
}
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function coreArticleAids(){return Object.fromEntries(Object.entries(articleReviews).map(([slug,r])=>{const k=r.key;return [slug,`<section class="quality-aid article-review-aid" id="review-record"><h2>${e(articleReviewCopy[k+'Aid'])}</h2><p class="fine">${e(articleReviewCopy.note)}</p><dl class="material-brief">${['One','Two'].map(n=>`<div><dt><strong>${e(articleReviewCopy[k+'Label'+n])}</strong></dt><dd>${e(articleReviewCopy[k+'Value'+n])}</dd></div>`).join('')}</dl><a class="text-link" href="/products/${r.product}/#practical-interface">${e(articleReviewCopy[k+'Link'])}<span aria-hidden="true"> ↗</span></a></section>`];}));}
export function coreCorrectionPacks(articles){return Object.entries(articleReviews).map(([slug,r])=>{
 const a=articles.find(a=>a.slug===slug);if(!a)throw Error('Missing reviewed article '+slug);
 return {id:'2026-11-core-review-'+r.key+'-v1',slug,expectedFingerprint:r.expectedFingerprint,article:{slug,path:'/blog/'+slug+'/',title:a.title,metaTitle:a.title,description:a.description,category:a.category,intro:a.intro,sections:a.sections,product:a.product,cover:a.processes?.[0]||a.product,checklist:a.checklist||[],example:a.example||'',processes:a.processes||[],sources:a.sources||[],keywords:a.keywords,relatedLinks:a.relatedLinks}};
 });}
