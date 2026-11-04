// Application examples for drawing review; no plant limits or measured results.
export const processReviewLabels={jump:'Drawing review example',scope:'Illustrative drawing review. Confirm the route, dimensions and acceptance for your part.',fit:'What drives the route',quote:'What changes the quotation',release:'How to release the sample'};
export const processReviews={
 'cold-heading':{
  title:'Cold heading a flanged screw with a deep drive',
  fit:'Review the head and recess together in section. Enlarging the flange changes the metal volume to be moved, while a deeper drive leaves less material below the recess. Identify the under-head transition and usable bearing face before splitting the blank into forming stages.',
  quote:'Separate the cost of heading tools from recurring pieces and any later recess, shoulder or hole machining. Ask which revision changes would require a tool change and whether the proposed wire condition and batch size support the formed route.',
  release:'Use samples from the intended forming route. Confirm the recess fit, flange seating and under-head geometry on the finished part, and agree what forming defects are unacceptable and how they will be checked. A turned mock-up can prove assembly access without proving formed-head quality.',
  products:['flange-screws','security-screws'],processes:['hybrid-manufacturing'],materials:['10b21-boron-steel']
 },
 'cnc-turning':{
  title:'Check the remaining wall before quoting a hollow screw',
  fit:'Illustrative section only: an outside diameter of at least 7.96 mm and a bore of at most 4.04 mm leave 1.96 mm radial wall if concentric. With up to 0.15 mm centre offset at that section, the minimum wall is (7.96 − 4.04) ÷ 2 − 0.15 = 1.81 mm. This simple circular check excludes threads, cross-holes and local transitions.',
  quote:'Identify the minimum wall and bore axis where they matter, rather than only giving nominal diameters. A long bore, interrupted cut, tighter position requirement or second workholding setup can change cycle time, tool access and the inspection method.',
  release:'Check bore and outer geometry in the agreed datums and after release from the fixture. Separately verify hole intersections and burrs where a cable or fluid passes. The section calculation is a geometry check, not a pressure or load rating.',
  products:['hollow-screws'],processes:['secondary-machining','inspection']
 },
 'hot-forging':{
  title:'Separate the forged eye blank from the finished load path',
  fit:'For a large eye component, draw the eye, pin or hook contact, shank transition and final seating face. Review the proposed parting line, trimming and machining stock so the finished bearing surfaces are not confused with the as-forged outline.',
  quote:'Quote the heated blank, tooling, trimming or scale removal and later machining as a complete route. Define any treatment, mechanical verification and document scope at quotation; a large eye shape does not by itself establish suitability for lifting.',
  release:'Confirm finished bore and seat geometry, material and treatment traceability and the agreed mechanical verification. If the part is intended for lifting, the applicable design, load direction, marking and qualification must be approved for that use before release.',
  products:['eye-bolts','lifting-eye-bolts'],processes:['heat-treatment']
 },
 'hybrid-manufacturing':{
  title:'Transfer a turned shoulder prototype to a formed blank',
  fit:'Freeze the shoulder-to-bore fit and axial locating face before moving to the hybrid route. Define which surfaces are formed, which locate the second operation and where enough stock must remain for finishing after any treatment or distortion.',
  quote:'Compare the complete route, including tooling, handling between operations, rejected blanks and final fitting work. If the shoulder and thread are established in different setups, include the work needed to control their relationship rather than pricing only two diameters.',
  release:'Use production-route samples to recheck shoulder size and form, axial length, thread acceptance and seating in the mating assembly after finishing. Preserve the turned prototype as a geometry reference; record which characteristics require fresh approval after the route change.',
  products:['shoulder-screws'],processes:['cold-heading','secondary-machining','inspection']
 },
 'threading':{
  title:'A gauge pass does not establish usable engagement',
  fit:'For a short fine-pitch thread next to a locating shoulder, distinguish the usable full-form length from the lead-in and incomplete runout. Show the mating hole depth and entry chamfer so the shoulder can seat before the screw bottoms or encounters incomplete threads.',
  quote:'Supply the complete profile, pitch, class, direction and final condition. For rolling, review blank size, ductility and die runout; for cutting, review tool clearance and cycle time. Include the required coating allowance and any special gauge before comparing prices.',
  release:'Apply the agreed thread gauge in the final condition, then check usable length and runout separately. Trial the approved mating assembly where seating matters. A ring-gauge result alone cannot prove the available engagement or that the joint seats.',
  products:['fine-thread-screws','double-ended-studs'],processes:['surface-treatment','inspection']
 },
 'secondary-machining':{
  title:'Control the hidden edge of an intersecting hole',
  fit:'A radial pin or feed hole can break into an axial bore. Dimension its position from the functional face or axis, and identify the inner intersection as a separate edge from the visible outer entrance. Specify allowed edge break and passage clearance together.',
  quote:'Show whether a deburring tool can reach the inner edge without enlarging the passage or scratching a sealing face. Workholding, access, a specialist deburring operation and a separate inspection setup can cost more than drilling the hole itself.',
  release:'Agree a method that actually sees or evaluates the hidden intersection, such as an accessible optical check or a sectioned first sample where appropriate. Define the production check separately. A clean outer entry and passing hole diameter do not establish internal burr acceptance.',
  products:['cross-drilled-screws','hollow-screws'],processes:['post-processing','inspection']
 },
 'heat-treatment':{
  title:'Specify a wear surface and a tough core separately',
  fit:'For a steel stop or tapping feature, identify the working surface and the core requirement. If the design needs a hardened case, define the depth criterion, test method and location. Do not substitute surface hardness for core properties or use a steel treatment note on a stainless or titanium grade.',
  quote:'Decide which dimensions are established before and after treatment. A precision shoulder may need finishing stock and a different inspection sequence; special case requirements or destructive checks can affect treatment lot size and turnaround.',
  release:'Tie the agreed hardness or case evidence to the treatment lot. Check the final geometry after finishing and confirm that any stock removal is consistent with the required surface condition. If a finished property class is ordered, verify it by its applicable acceptance basis.',
  products:['set-screws','shoulder-screws'],processes:['surface-treatment','inspection'],materials:['carbon-alloy-steel','10b21-boron-steel']
 },
 'surface-treatment':{
  title:'Budget coating thickness at a smooth locating shoulder',
  fit:'Illustrative geometry: a smooth 8.000 mm outside diameter with a uniform 0.005 mm deposit on each side becomes 8.010 mm. Use the actual thickness range and distribution to assess fit. This two-sided diameter estimate does not apply directly to thread pitch diameter.',
  quote:'Identify the coating system, substrate condition, covered or masked surfaces, thickness locations and any friction or corrosion requirement. Include pretreatment and relevant hydrogen-risk controls in the route; a finish name or colour does not define this scope.',
  release:'Agree how thickness and coverage are checked, then verify final shoulder fit and thread acceptance separately. Where the assembly relies on controlled friction, require the appropriate evidence for the specified mating and tightening conditions, not only an appearance or salt-spray result.',
  products:['shoulder-screws','flange-screws'],processes:['threading','inspection'],materials:['carbon-alloy-steel']
 },
 'post-processing':{
  title:'Decide when to clean, apply locking patches and assemble seals',
  fit:'For a captive screw with a seal or pre-applied patch, map every later cleaning, coating or heating step against compatibility. Identify the sealing face, required retention and patch position. Keep the passage and the useful thread clear of unintended residue.',
  quote:'Price the sequence as delivered: cleaning and drying, patch application or washer/seal assembly, sorting and packaging. Define cleanliness and any torque or reuse requirement by method and conditions rather than ordering a generic clean or locked part.',
  release:'Verify final condition after all operations and protective packing. Check retention, seal orientation and patch coverage separately from the agreed functional trial. Record the lot and distinguish technical-cleanliness results from any inspection of visible debris.',
  products:['captive-screws','hollow-screws'],processes:['surface-treatment','inspection']
 },
 'inspection':{
  title:'Use CCD for visible dimensions, then cover the blind spots',
  fit:'For a shoulder screw, identify the length and visible diameter or step that a stable, calibrated silhouette can evaluate. Present representative good, borderline and rejected samples at the expected orientations to verify the program. A view of the outline does not reveal the internal bore or material condition.',
  quote:'Separate the agreed optical screening characteristics from sampled thread, bore, hardness or coating checks. Agree the feature limits, reference method, sampling and records. A request for 100% screening needs a list of covered characteristics rather than a promise to measure everything.',
  release:'Compare results near the limits against the agreed reference, verify rejection handling, and record the drawing and program revision. Retain separate results for thread gauges, internal features and any material testing so a single pass flag is not mistaken for complete acceptance.',
  products:['shoulder-screws','hollow-screws'],processes:['threading']
 },
 'process-routes':{
  title:'Approve the route at the handoffs, not only at the end',
  fit:'For a shoulder screw with a precision fit, identify the blank reference, which operation establishes the bearing shoulder, and which later treatment can move or build up that surface. Carry the same drawing revision and final-condition requirement across each handoff.',
  quote:'Compare each route to the same delivery scope: sample quantity, tooling, later operations, verification and records. Record which operations must be repeated or reapproved if the grade, finish, blank supplier or production method changes.',
  release:'Record the feature, operation that establishes it, verification stage and acceptance method. Link the approved sample and lot records to the route. For a change from turned samples to formed production, review each affected characteristic before approving repeat orders.',
  products:['shoulder-screws'],processes:['hybrid-manufacturing','cnc-turning','inspection']
 }
};
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function processReviewHtml(slug,{productLinks,processLinks,materialLinks}){
 const review=processReviews[slug];if(!review)return '';
 return '<section class="section compact process-review" id="process-review"><small>'+e(processReviewLabels.jump)+'</small><h2>'+e(review.title)+'</h2><p class="fine">'+e(processReviewLabels.scope)+'</p><dl class="material-brief">'+['fit','quote','release'].map(k=>'<div><dt><strong>'+e(processReviewLabels[k])+'</strong></dt><dd>'+e(review[k])+'</dd></div>').join('')+'</dl>'+productLinks(review.products)+processLinks(review.processes)+(review.materials?materialLinks(review.materials):'')+'</section>';
}
