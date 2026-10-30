export const gradeDetails={
 'carbon-alloy-steel':{
 rows:[
 ['C45 / C45E','Medium-carbon steel; order the actual EN grade and delivery condition.','Machined shoulders, stops and general mechanical parts where specified heat treatment is appropriate.','Compare normalized, annealed and quenched-and-tempered conditions. Similar designation lists do not authorize a substitution.'],
 ['42CrMo4','Chromium-molybdenum steel used for quenching and tempering.','Loaded threaded components where strength, toughness and section size justify alloy steel.','Hardenability and section size matter. Do not infer a finished 10.9 or 12.9 class from the grade alone.'],
 ['SAE 4140','Specify the SAE grade and governing stock specification explicitly.','A drawing-defined alternative to evaluate when the original drawing uses SAE material designations.','Related to the chromium-molybdenum family, but not automatically interchangeable with every 42CrMo4 variant.']
 ],
 decision:'For a machined locating part, start with the required wear surface and final condition. For a loaded fastening part, start with the finished mechanical requirements and applicable fastener standard; then review grade, section size, route and coating together.',
 sources:[['Ovako: C45 grade and variants','https://steelnavigator.ovako.com/steel-grades/c45/'],['Ovako: 42CrMo4 grade, section effects and variants','https://steelnavigator.ovako.com/steel-grades/42crmo4/']]
 },
 '10b21-boron-steel':{
 rows:[
 ['10B21 — forming stock','State the wire specification and forming condition.','Cold-heading route review for repeat quantities.','Wire condition is not the final screw condition; request material identification and agreed forming quality.'],
 ['10B21 — final heat-treated part','State final core properties and the required verification.','Parts where the approved route includes heat treatment.','Do not assume a strength class or prescribe carburizing from the grade name.'],
 ['10B21 — case requirements, if specified','State surface/core requirements separately.','Only where the drawing calls for an appropriate hardened surface.','Agree hardness, case requirements and inspection method; this is not a separate material grade.']
 ],
 decision:'These rows describe different order conditions of one grade, not three interchangeable grades. Choose 10B21 only after the supplier reviews the geometry, required final properties and complete treatment route.',sources:[]
 },
 'stainless-steel-304-316':{
 rows:[
 ['304 / SUS304','General-purpose austenitic stainless; specify the governing standard.','General equipment and enclosure fasteners in suitable environments.','Not corrosion-proof; review exposure, galling and final fastener class.'],
 ['304L / SUS304L','Lower-carbon variant of the 304 family.','Consider when welding or fabrication-related corrosion requirements call for it.','The L suffix does not mean a higher strength class.'],
 ['316 / SUS316','Molybdenum-bearing austenitic stainless.','Consider when the exposure assessment calls for improved resistance over 304.','Chloride concentration, temperature and crevices still require review.'],
 ['316L / SUS316L','Lower-carbon variant of the 316 family.','Consider where fabrication or welding requirements justify the lower-carbon grade.','Specify grade and final condition rather than assuming every 316 part is 316L.'],
 ['303','Free-machining austenitic grade.','Turned parts where machining productivity is important and corrosion requirements permit it.','Do not substitute for 304 or 316 without assessing corrosion and fabrication requirements.']
 ],
 decision:'Start with the exposure and fabrication requirements, then assess manufacturing and assembly. A2/A4 fastener groups are not universal synonyms for a specific JIS or ASTM grade. Order the exact grade plus the applicable finished fastener class; passivation does not upgrade 304 into 316.',
 sources:[['Outokumpu: austenitic stainless grade families','https://www.outokumpu.com/en/products/stainless-steel-types/austenitic-stainless-steel'],['thyssenkrupp: stainless machining and fabrication comparison','https://www.thyssenkrupp-materials-na.com/materials/stainless-steel/stainless-steel-machining-data.html']]
 },
 'aluminum-alloys':{
 rows:[
 ['6061-T6 / T6511','Alloy plus temper and product form must be stated.','Lightweight machined adjustment or enclosure components.','T6511 is a stock temper designation, not a general finished-screw strength guarantee.'],
 ['6082-T6 / T6511','A different alloy with its own product-size property tables.','Machined components where its specified stock properties suit the design.','Do not substitute using one headline strength number; check section, condition and dimensional stability.'],
 ['6061 or 6082 in another temper','The alloy number stays the same while condition changes.','Forming or fabrication routes that require a different supplied condition.','Properties quoted for T6 stock cannot be assigned to unspecified or annealed stock.']
 ],
 decision:'Specify alloy, temper and bar or extrusion specification before comparing strength. Review thread engagement, bearing surfaces, anodizing allowance and mating-metal corrosion as separate joint-design questions.',
 sources:[['Hydro: alloy data sheets and temper-specific references','https://www.hydro.com/us/us/aluminum/products/extruded-profiles/north-america-resources/north-america-alloy-data-sheets/']]
 },
 'copper':{
 rows:[
 ['C11000 — ETP copper','Electrolytic tough-pitch copper.','Conductive components where the specified electrical and mechanical requirements suit this grade.','Order temper and electrical acceptance separately; do not infer joint contact resistance from bulk conductivity.'],
 ['C10100 — oxygen-free electronic copper','A distinct oxygen-free copper designation.','Consider when the application explicitly requires its material specification.','Not simply a premium substitute for every copper screw; verify need, stock form and traceability.'],
 ['C12200 — phosphorus-deoxidized copper','A distinct deoxidized copper grade.','Consider for the fabrication conditions identified by the designer.','Do not assume the same conductivity as C11000; verify grade-specific electrical requirements.']
 ],
 decision:'If the component carries current, define the electrical role, contact faces, plating, mating metal and final verification as well as the copper grade. Temper affects mechanical behavior; a copper-family label does not identify a usable strength value.',
 sources:[['Copper Development Association: copper grades and properties','https://www.copper.org/publications/pub_list/pdf/a1360.pdf'],['Copper Development Association: alloy data references','https://datasheets.copper.org/']]
 },
 'brass':{
 rows:[
 ['C36000 — free-cutting brass','Leaded free-machining brass.','Turned threaded parts when the specification permits this composition.','Check lead restrictions for the actual market and end use; do not claim universal compliance.'],
 ['C26000 — cartridge brass','A different copper-zinc composition and forming behavior.','Consider where the required fabrication route favors this grade.','Not a drop-in replacement for free-cutting brass; review machinability and temper.'],
 ['Specified low-lead or lead-free brass','Require the exact alloy and governing composition limits.','Applications with explicitly defined substance or end-use requirements.','Lead-free is not a complete grade designation. Verify machining, properties and required documents.']
 ],
 decision:'Choose brass by exact composition, temper and processing requirements. If lead content matters, put the applicable limit and evidence in the RFQ instead of requesting only environmentally friendly brass.',
 sources:[['Copper Development Association: brass rod and lead-free selection','https://copper.org/publications/pub_list/pdf/a7052_brass_rod_solutions_for_lead-free_compliance.pdf'],['Copper Development Association: copper alloy guide','https://www.copper.org/publications/pub_list/pdf/a1360.pdf']]
 },
 'titanium-alloys':{
 rows:[
 ['Grade 2 — commercially pure titanium','Specify product form and supplied condition.','Corrosion-driven components where its mechanical properties meet the design.','Not mechanically interchangeable with Ti-6Al-4V.'],
 ['Grade 5 — Ti-6Al-4V','An alloy grade with a different strength and processing basis.','Weight-sensitive loaded components where the complete specification justifies it.','State condition and acceptance; titanium does not imply aerospace qualification.'],
 ['Grade 23 — Ti-6Al-4V ELI','Extra-low-interstitial variant with a distinct specification.','Consider only when the drawing or application requires this variant.','Not automatic medical approval; traceability and application qualification are separate requirements.']
 ],
 decision:'First decide whether commercially pure titanium or an alloy is needed. Then specify the exact grade, product standard, condition, surface requirements and verification. Review thread galling and mating surfaces during assembly planning.',
 sources:[['Carpenter: Ti-6Al-4V alloy data','https://www.carpentertechnology.com/alloy-finder/Ti-6Al-4V'],['Carpenter: Ti-6Al-4V ELI data sheet','https://www.carpentertechnology.com/hubfs/Data%20Sheets/20210902--CT_Ti64ELI_Medical_Datasheet_F.pdf']]
 }
};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function gradeSection(slug){const d=gradeDetails[slug];if(!d)return '';return '<section class="section compact material-grade-selection"><h2>Compare grades and delivery conditions</h2><p>A material family is a starting point, not a complete specification. The following options are selection references; supply and suitability require drawing review.</p><div class="table-scroll material-table"><table><thead><tr><th>Grade or specified condition</th><th>What distinguishes it</th><th>When to consider it</th><th>What to confirm before ordering</th></tr></thead><tbody>'+d.rows.map(row=>'<tr>'+row.map((v,i)=>'<'+(i?'td':'th scope="row"')+'>'+esc(v)+'</'+(i?'td':'th')+'>').join('')+'</tr>').join('')+'</tbody></table></div><h3>How to narrow the choice</h3><p>'+esc(d.decision)+'</p><h3>Write an unambiguous material requirement</h3><p>Include the designation standard, exact grade, product form, delivery condition, final mechanical requirements, surface treatment and acceptance evidence. Similar names across EN, ASTM, SAE, JIS or GB systems are comparison leads, not permission to substitute.</p><p>If the grade is not yet decided, send the load or locating function, environment, mating materials, quantity and drawing. Ask for a proposed grade and route with stated assumptions before approving the material.</p></section>';}
