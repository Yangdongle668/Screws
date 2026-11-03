import fs from 'node:fs';

// English is the authoring source. Numbers below are illustrative inputs, never
// production capabilities, quotations, measured results or released designs.
export const buyerCopy = {
  sample: 'Worked example — illustrative inputs, not a released design or measured result.',
  shoulderTitle: 'Calculate the shoulder clearance from both tolerance limits',
  shoulderIntro: 'For a moving plate, shoulder length must be compared with the complete stack between the seating faces. Include the washer, bushing and plate in that stack; overall screw length does not determine movement clearance.',
  shoulderAssumptions: 'Assume a shoulder length L of 8.20 ± 0.03 mm and a complete moving stack S of 8.00 ± 0.05 mm. The illustrative required axial clearance is 0.10–0.30 mm. Both dimensions refer to the final supplied condition.',
  shoulderMinimum: 'Minimum clearance: shortest shoulder minus thickest stack',
  shoulderMaximum: 'Maximum clearance: longest shoulder minus thinnest stack',
  shoulderResult: 'The calculated 0.12–0.28 mm interval lies inside the illustrative requirement. That answers this axial-clearance question only: separately check shoulder-to-bore fit, transition clearance, thread engagement and the effect of the actual assembly and service conditions.',
  shoulderDrawing: 'Shoulder length and moving-stack clearance schematic',
  shoulderLabel: 'Shoulder L',
  stackLabel: 'Moving stack S',
  clearanceLabel: 'Clearance L − S',
  shoulderNext: 'Use the drawing checklist to record both interfaces',
  hollowTitle: 'Specify the passage, not just the outside screw',
  hollowIntro: 'A cable feed-through, an air passage and a pressure-retaining connection need different acceptance checks even when the outside screw looks identical. State what passes through the bore and which surfaces perform the sealing or locating function.',
  hollowCable: 'Cable or tube feed-through',
  hollowCableSpec: 'Minimum clear bore, entry/exit edge condition and the route through the installed part.',
  hollowCableCheck: 'Check passage with a suitable gauge or representative item; inspect both edges and intersections for damaging burrs.',
  hollowFlow: 'Flow passage',
  hollowFlowSpec: 'Bore size and length, intersecting holes, cleanliness and any specified flow requirement.',
  hollowFlowCheck: 'Check the accessible bore geometry; use a separate agreed cleanliness or flow test when required.',
  hollowSeal: 'Sealed connection',
  hollowSealSpec: 'Medium, pressure/temperature conditions, sealing interface and approved test criteria.',
  hollowSealCheck: 'Verify sealing geometry and the specified test separately; a through-hole or camera image does not establish pressure suitability.',
  hollowSequence: 'Review the smallest remaining wall at the thread root and at intersecting holes. Plan how drilling burrs can be removed and checked before a later operation hides them. For internal surfaces, agree a suitable access or inspection method instead of treating external CCD screening as complete bore inspection.',
  hollowNext: 'Connect bore finishing, cleaning and inspection',
  materialTitle: 'Turn the material shortlist into an order requirement',
  materialIntro: 'Choose the grade for the environment, then specify the finished-part requirement. A free-machining knob, a general enclosure screw and a chloride-exposed connection do not justify the same material substitution.',
  material303: 'Machined adjustment knob',
  material303Spec: 'Review 303 where machining productivity matters and the exposure permits it.',
  material303Check: 'Approve corrosion and fabrication suitability before substituting it for 304.',
  material304: 'General equipment cover',
  material304Spec: 'Review 304 with the actual cleaning medium, mating metal and assembly conditions.',
  material304Check: 'Specify final strength where applicable and consider thread galling during assembly.',
  material316: 'Chloride-exposed installation',
  material316Spec: 'Review 316 against concentration, temperature and crevice conditions.',
  material316Check: 'Do not infer corrosion-free service, or select 316L solely because it sounds stronger.',
  materialOrder: 'In the RFQ, enter the designation standard and grade, final condition or fastener class where applicable, finish, mating material and required documents as separate fields. A stock certificate identifies the supplied material; it does not by itself verify every final-part property or the assembled connection.',
  materialNext: 'Download the material specification worksheet (English)',
  routeTitle: 'Compare setup cost and recurring cost separately',
  routeIntro: 'Compare complete routes to the same finished drawing, including secondary machining, treatment, inspection and scrap assumptions. The following currency-unit example demonstrates the calculation; these are invented teaching inputs, not ZUFEK prices.',
  routeHeading: 'Route',
  setupHeading: 'One-time setup F',
  unitHeading: 'Recurring cost v per part',
  routeFormed: 'Formed blank plus secondary machining',
  routeTurned: 'Turned route',
  routeFormula: 'For a single batch q: total cost = F + v × q. With the illustrative inputs, the equal-cost quantity is (2000 − 100) ÷ (0.25 − 0.08), approximately 11177 parts when rounded up. This is not a universal cold-heading threshold.',
  routeSmall: 'At 1000 parts: formed route 2080 units; turned route 350 units.',
  routeLarge: 'At 20000 parts: formed route 3600 units; turned route 5100 units.',
  routeRelease: 'For repeat orders, spread reusable tooling over the agreed production horizon and identify maintenance or replacement costs separately. A route change still needs sample validation: a turned prototype does not automatically approve the material condition, geometry and surface produced by a later forming route.',
  routeNext: 'Download the route-cost comparison worksheet (English)',
  automotiveTitle: 'Start the automotive RFQ with the actual joint',
  automotiveIntro: 'An enclosure cover, a painted bracket and a locating interface impose different requirements. Use the rows below to prepare a component-level discussion; they are design-review examples, not evidence of a delivered or OEM-approved project.',
  automotiveCover: 'Serviceable module cover',
  automotiveCoverSpec: 'Opening sequence, tool access, usable engagement and any captive-retention requirement.',
  automotiveCoverCheck: 'Check removal and reassembly with the representative cover, not only the tightened screw.',
  automotiveBracket: 'Painted bracket',
  automotiveBracketSpec: 'Bearing-face envelope, coating contact, permissible marking and specified tightening conditions.',
  automotiveBracketCheck: 'Evaluate seating and coating damage; use the agreed assembly method for any functional trial.',
  automotiveLocate: 'Locating shoulder',
  automotiveLocateSpec: 'Mating bore, datum relationship, axial stack and final coated dimensions.',
  automotiveLocateCheck: 'Record dimensional acceptance separately from clamp or motion validation.',
  automotiveRelease: 'Before sample release, agree the drawing revision, required submission documents, lot identification and change-approval responsibilities. If the programme requires PPAP, material records or special testing, identify the exact deliverables during quotation rather than assuming that an automotive label includes them.',
  automotiveNext: 'Review the illustrative module enclosure study',
  qualityTitle: 'What an inspection record should let you verify',
  qualityIntro: 'Build a traceable chain from each drawing requirement to the method, result and disposition. The downloadable forms below are planning templates; they contain no claimed production measurements.',
  qualityDimension: 'Dimensional record',
  qualityDimensionSpec: 'Part and drawing revision, lot, characteristic, limits, method/instrument identity, coverage and actual result.',
  qualityDimensionCheck: 'Distinguish recorded measurements from an agreed pass/fail screening result.',
  qualityMaterial: 'Material or treatment record',
  qualityMaterialSpec: 'Material or treatment specification, lot reference and the documents or tests agreed for that requirement.',
  qualityMaterialCheck: 'Keep material identity, final hardness/strength and coating evidence distinguishable.',
  qualityFunction: 'Assembly trial',
  qualityFunctionSpec: 'Mating-part revision, installation method, functional criterion, outcome and approver.',
  qualityFunctionCheck: 'Record deviations and disposition; a dimensional pass does not establish assembly performance.',
  qualitySample: 'For example, CCD screening can evaluate a visible shoulder profile, a thread gauge addresses its specified thread requirement, and a material record addresses a different question again. Agree the relevant methods and any external test arrangements for the order; the template does not assert that every test is performed in-house.',
  qualityBlank: 'Download the blank inspection worksheet (English)',
  qualityExample: 'Download the worked inspection-plan example (English)',
  applicationHeading: 'Application',
  specifyHeading: 'What to specify',
  verifyHeading: 'What to check',
  calculationHeading: 'Calculation',
  resultHeading: 'Result',
  timing: 'Tooling and sampling typically take approximately 10–15 days after technical review and confirmation. Confirm the starting milestone, sample acceptance and repeat-production schedule in the quotation.',
  serviceType: 'Custom screw manufacturing to drawing'
};
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const p=id=>`<p>${e(buyerCopy[id])}</p>`;
const link=(url,id)=>`<a class="text-link" href="${url}">${e(buyerCopy[id])}</a>`;
const table=(caption,heads,rows)=>`<table><caption>${e(buyerCopy[caption])}</caption><thead><tr>${heads.map(id=>`<th scope="col">${e(buyerCopy[id])}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>`<${i?'td':'th scope="row"'}>${e(buyerCopy[v]??v)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table>`;
const open=id=>`<section class="section compact engineering-depth buyer-decision" id="buyer-decision"><h2>${e(buyerCopy[id])}</h2>`;
const headers=['applicationHeading','specifyHeading','verifyHeading'];
export const buyerPaths=['/products/shoulder-screws/','/products/hollow-screws/','/materials/stainless-steel-304-316/','/capabilities/hybrid-manufacturing/','/industries/automotive-components/','/quality/'];
export function buyerJump(url){
 const index=buyerPaths.indexOf(url);if(index<0)return '';
 const title=['shoulderTitle','hollowTitle','materialTitle','routeTitle','automotiveTitle','qualityTitle'][index];
 return `<div class="buyer-jump"><a class="text-link" href="#buyer-decision"><span>${e(buyerCopy[title])}</span><span aria-hidden="true"> ↓</span></a></div>`;
}
export function buyerContent(url){
 if(url===buyerPaths[0])return open('shoulderTitle')+p('shoulderIntro')+p('shoulderAssumptions')+`<figure class="buyer-diagram quality-diagram"><svg viewBox="0 0 720 240" font-size="28" role="img" aria-label="${e(buyerCopy.shoulderDrawing)}"><path d="M65 55h50v120H65zM115 85h420v60H115zM535 92h110v46H535z" fill="#e6ecee" stroke="#17343e" stroke-width="2"/><path d="M115 65h390v110H115z" fill="#dce7ef" fill-opacity=".7" stroke="#0754a6" stroke-width="2"/><path d="M550 85v60M565 85v60M580 85v60M595 85v60M610 85v60M625 85v60" stroke="#687380"/><path d="M115 195h420m-420-8v16m420-16v16M115 35h390m-390-8v16m390-16v16M505 160v18m30-18v18m-30-9h30" stroke="#17343e" fill="none"/><text x="325" y="224" text-anchor="middle" fill="#17343e">${e(buyerCopy.shoulderLabel)}</text><text x="318" y="30" text-anchor="middle" fill="#17343e">${e(buyerCopy.stackLabel)}</text><text x="520" y="65" text-anchor="middle" fill="#17343e">${e(buyerCopy.clearanceLabel)}</text></svg><figcaption>${e(buyerCopy.sample)}</figcaption></figure>`+table('shoulderTitle',['calculationHeading','resultHeading'],[['shoulderMinimum','8.17−8.05=0.12 mm'],['shoulderMaximum','8.23−7.95=0.28 mm']])+p('shoulderResult')+link('/blog/shoulder-screw-drawing-guide/','shoulderNext')+p('timing')+'</section>';
 if(url===buyerPaths[1])return open('hollowTitle')+p('hollowIntro')+table('hollowTitle',headers,[['hollowCable','hollowCableSpec','hollowCableCheck'],['hollowFlow','hollowFlowSpec','hollowFlowCheck'],['hollowSeal','hollowSealSpec','hollowSealCheck']])+p('hollowSequence')+link('/capabilities/post-processing/','hollowNext')+p('timing')+'</section>';
 if(url===buyerPaths[2])return open('materialTitle')+p('materialIntro')+table('materialTitle',headers,[['material303','material303Spec','material303Check'],['material304','material304Spec','material304Check'],['material316','material316Spec','material316Check']])+p('materialOrder')+link('/downloads/material-specification.csv','materialNext')+'</section>';
 if(url===buyerPaths[3])return open('routeTitle')+p('routeIntro')+table('routeTitle',['routeHeading','setupHeading','unitHeading'],[['routeFormed','2000','0.08'],['routeTurned','100','0.25']])+p('routeFormula')+p('routeSmall')+p('routeLarge')+p('routeRelease')+link('/downloads/manufacturing-route-cost.csv','routeNext')+p('timing')+'</section>';
 if(url===buyerPaths[4])return open('automotiveTitle')+p('automotiveIntro')+table('automotiveTitle',headers,[['automotiveCover','automotiveCoverSpec','automotiveCoverCheck'],['automotiveBracket','automotiveBracketSpec','automotiveBracketCheck'],['automotiveLocate','automotiveLocateSpec','automotiveLocateCheck']])+p('automotiveRelease')+link('/applications/automotive-module-enclosure/','automotiveNext')+p('timing')+'</section>';
 if(url===buyerPaths[5])return open('qualityTitle')+p('qualityIntro')+table('qualityTitle',headers,[['qualityDimension','qualityDimensionSpec','qualityDimensionCheck'],['qualityMaterial','qualityMaterialSpec','qualityMaterialCheck'],['qualityFunction','qualityFunctionSpec','qualityFunctionCheck']])+p('qualitySample')+`<div class="related-links">${link('/downloads/inspection-plan-blank.csv','qualityBlank')}${link('/downloads/inspection-plan-example.csv','qualityExample')}</div>`+'</section>';
 return '';
}

export const buyerMetadata={
 '/':['Custom Screw Manufacturer in Dongguan, China','Drawing-defined metal screws from ZUFEK. Compare structures, materials and manufacturing routes, then send your drawing for a quotation.'],
 '/products/shoulder-screws/':['Custom Shoulder Screws to Drawing','Specify shoulder diameter, length, bore fit and usable thread. Review a clearance calculation, material options and inspection before requesting a quote.'],
 '/products/hollow-screws/':['Custom Hollow & Through-Hole Screws','Define the bore, remaining wall, burr control and passage requirements for custom hollow screws. Send the drawing and application for review.'],
 '/materials/stainless-steel-304-316/':['304 vs 316 Stainless Steel for Custom Screws','Compare 303, 304, 304L, 316 and 316L for custom screws. Separate material grade, finished strength, corrosion exposure and assembly requirements.'],
 '/capabilities/hybrid-manufacturing/':['Cold Heading & Secondary CNC Machining','Compare a formed blank plus machining with a turned route. Review tooling, recurring cost, critical features and sample approval for custom screws.'],
 '/industries/automotive-components/':['Custom Screws for Automotive Components','Review custom screws for module covers, brackets and locating interfaces, with drawing control, sample approval and order-specific documentation.'],
 '/quality/':['Custom Screw Inspection & Quality Records','Connect drawing requirements to dimensional checks, thread gauges, material records and assembly trials. Download inspection-plan templates.'],
 '/about/':['About Us — Custom Fasteners Since 2005','Meet ZUFEK, a custom metal screw manufacturer in Dalang, Dongguan since 2005. Explore the products, sample process and company contact details.']
};
export function writeBuyerAssets(){
 const csv=rows=>'\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
 fs.mkdirSync('public/downloads',{recursive:true});
 fs.writeFileSync('public/downloads/material-specification.csv',csv([['Blank material specification worksheet; not an approved part specification'],['Part / revision','Material standard','Exact grade','Product form / condition','Finished fastener class if applicable','Exposure / temperature','Mating material','Surface treatment','Required evidence','Open item / approver'],Array(10).fill('')]));
 fs.writeFileSync('public/downloads/manufacturing-route-cost.csv',csv([['Illustrative inputs only; currency units, not a ZUFEK quotation'],['Route','Setup F','Recurring cost v','Quantity q','Total F + v*q'],['Formed blank + machining',2000,0.08,1000,2080],['Turned route',100,0.25,1000,350],['Formed blank + machining',2000,0.08,20000,3600],['Turned route',100,0.25,20000,5100],['Equal-cost quantity (rounded up)',11177],['Replace all assumptions; include secondary work, treatment, inspection and expected tooling life.']]));
}
