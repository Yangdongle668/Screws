export const processDecisions={
 'cold-heading':[
 ['Geometry and tooling','Identify head volume, steps, recess, blank and any later machining','What can be formed and which features still need a separate operation?'],
 ['Material and wire condition','Specify grade and requirements for the intended final part','Is the proposed input suitable for the forming and treatment route?'],
 ['Production economics','Separate tooling, samples, recurring quantity and secondary work','Does the complete route make sense at the expected repeat volume?'],
 ['Sample release','Identify production-route samples and critical formed features','What must be reconfirmed if an early prototype was machined?']
 ],
 'cnc-turning':[
 ['Setups and datums','Identify locating faces, axes and relationships between steps','Which features should share a setup to preserve the required relationship?'],
 ['Bores and local features','Show depth, diameter, intersections, flats and tool access','Can the feature be machined and checked with the proposed access?'],
 ['Stock and final condition','Specify grade/condition and later treatment or coating','Which dimensions need allowance or acceptance after later processing?'],
 ['Sample to production','Identify route differences and repeated batch needs','Is the approved prototype representative of the final production route?']
 ],
 'hot-forging':[
 ['Preform and stock','Define grade, major section changes and final shape','What material and forging plan is proposed for the actual geometry?'],
 ['Machining allowance','Identify flash/scale removal and finished datums','Which interfaces are accepted only after subsequent machining?'],
 ['Material condition','Specify heat treatment and mechanical acceptance','What evidence establishes the required finished properties?'],
 ['Load-related application','Supply the approved design and traceable verification scope','If lifting is involved, who approves the design and applicable rating?']
 ],
 'hybrid-manufacturing':[
 ['Formed blank','Define the economical bulk shape and stock for machining','Which dimensions are deliberately left for later finishing?'],
 ['Secondary location','Identify datum transfer and held surfaces','How are shoulder, bore and thread relationships preserved?'],
 ['Complete sequence','Coordinate threads, treatment, finishing and coating','At which stage is each critical final requirement established?'],
 ['Route transfer','Compare sample and repeat-production methods','Which characteristics need a production-route sample check?']
 ],
 'threading':[
 ['Thread definition','Specify profile, diameter, pitch, handedness, class and usable length','Does the callout fully identify the mating interface?'],
 ['Method selection','Review rolling/forming, cutting or tapping for the geometry and material','Which method meets the actual profile and final requirements?'],
 ['Transitions and ends','Show relief, lead-in, blind ends and adjacent shoulders','Can the mating part seat and obtain the required engagement?'],
 ['Final acceptance','Agree gauges, custom-profile methods and coating allowance','Is acceptance defined in the supplied condition rather than only before finishing?']
 ],
 'secondary-machining':[
 ['Feature relationship','Define hole, flat, slot or step from the functional datums','Is position/orientation specified separately from feature size?'],
 ['Access and edges','Show hole exits, intersections and permitted edge breaks','Can an internal burr be reached and checked?'],
 ['Finishing operation','State size, form and surface requirements in the final condition','Is grinding or a specialist operation justified by the requirement?'],
 ['Process location','Identify surfaces used for holding after earlier operations','Can the setup preserve the required geometry without damaging the part?']
 ],
 'heat-treatment':[
 ['Grade and final properties','Name the material and specified condition or finished requirements','Is the treatment selected for this alloy rather than a generic steel note?'],
 ['Dimensional sequence','Identify functional surfaces and later finishing allowance','Which features may need rechecking or finishing after treatment?'],
 ['Evidence','Specify hardness, other mechanical checks and requested records','What method, sampling and acceptance criterion apply to each requirement?'],
 ['Surface compatibility','Coordinate later cleaning, coating and risk controls','Does the full proposed route protect the ordered final condition?']
 ],
 'surface-treatment':[
 ['System definition','State substrate, pretreatment, coating, thickness and coverage','Is the complete system specified rather than only a finish color?'],
 ['Fit and assembly','Identify thread, shoulder, bearing surface and friction needs','Which dimensions and assembly settings depend on the final surface?'],
 ['Hydrogen review','Assess susceptible material condition and the entire process','What applicable process controls, relief and evidence are required?'],
 ['Acceptance','Define thickness, appearance and any corrosion/friction tests','Are test conditions and criteria explicit rather than inferred from a trade name?']
 ],
 'post-processing':[
 ['Burr and residue','Identify internal/external edges, passages and contamination concerns','What edge condition and cleaning acceptance does the application need?'],
 ['Locking feature','Specify patch/adhesive type, coverage and assembled requirements','What installation, reuse or torque behavior is to be verified?'],
 ['Pre-assembly','Show washers, seals or springs and their retention','What sequence avoids exposing components to incompatible later processing?'],
 ['Packaging','Agree lot separation, protection and labeling','How will the approved parts reach assembly in the required condition?']
 ],
 'inspection':[
 ['Optical coverage','List visible external characteristics and part presentation','Is the camera program validated for these features and this surface?'],
 ['Complementary checks','Separate internal geometry, thread, texture and material properties','Which methods provide evidence that a silhouette cannot?'],
 ['Coverage and records','State first-article, sampled or 100% screened characteristics','What sampling, limits, traceability and report are agreed?'],
 ['Revision and rejection','Identify drawing/program revision and reject disposition','How are changed requirements and rejected pieces controlled?']
 ]
};
export function processDecisionHtml(url){
 if(!url.startsWith('/capabilities/'))return '';
 const rows=processDecisions[url.split('/')[2]];if(!rows)return '';
 return '<section class="section"><h2>Process decision and release matrix</h2><p>Resolve these items during technical review. Each row identifies a decision or evidence requirement; it does not imply a universal process limit or an in-house equipment claim.</p><div class="table-scroll"><table><thead><tr><th>Decision</th><th>Required input</th><th>Release question</th></tr></thead><tbody>'+rows.map(([a,b,c])=>'<tr><th scope="row">'+a+'</th><td>'+b+'</td><td>'+c+'</td></tr>').join('')+'</tbody></table></div><div class="related-links"><a href="/capabilities/process-routes/">Compare complete manufacturing routes ↗</a><a href="/guides/material-strength-selection/">Select material and final strength ↗</a><a href="/quality/">Agree acceptance and records ↗</a></div></section>';
}
