import {productInterfaceHtml} from './product-interface-notes.mjs';
// Buyer-facing engineering examples. They are neither released designs nor factory test records.
export const practicalCopy={
 diagramNote:'Interface sketch — not to scale. Dimensions and acceptance follow the approved assembly drawing.',
 homeLink:'Company background and sample planning',
 companyTitle:'Agree the milestones before tooling starts',
 companyIntro:'Separate the quotation, sample approval and repeat-production decisions. This makes it clear what is being priced, what the sample must demonstrate and what remains to be agreed for the order.',
 companyReviewTitle:'Drawing and quotation',
 companyReview:'Identify the current drawing, mating parts, material, finish and critical features. Record unresolved items and quotation assumptions, including the proposed route and any externally arranged processing or testing.',
 companySampleTitle:'Tooling and samples',
 companySample:'Allow approximately 10–15 days for tooling and sampling, subject to technical review and quotation confirmation. Agree the starting milestone, sample quantity and checks before work begins; sample acceptance is a separate decision.',
 companyRepeatTitle:'Repeat production',
 companyRepeat:'Use the approved sample and drawing revision to agree order quantity, lot identification, required documents and delivery. Monthly capacity is approximately several million parts across the product mix; allocation and timing depend on the actual route and order.',
 companyNext:'Prepare the sample approval requirements',
 companyPhoto:'Company-supplied photograph of threaded components and shoulder forms',
 companyCaption:'Product forms from the company-supplied sample photographs.',
 shoulderTitle:'Check the bore fit separately from the axial clearance',
 shoulderIntro:'The shoulder-to-bore interface guides movement; the distance between the seating faces controls the axial stack. Define both in the finished condition rather than treating a thread fit as the locating fit.',
 shoulderOne:'Shoulder and mating bore: specify the two limits, the reference axis and any functional surface requirement.',
 shoulderTwo:'Seating and transition: show the mating chamfer or counterbore so the incomplete thread or relief does not prevent seating.',
 shoulderThree:'After finishing: identify the surfaces affected by treatment or coating and the stage at which the final fit is checked.',
 shoulderOutcome:'Read the clearance calculation below alongside these interfaces. A satisfactory axial gap does not by itself establish the bore fit or the required geometric relationship.',
 captiveTitle:'Review the captive screw in both service positions',
 captiveIntro:'A captive screw belongs to a panel-and-retainer assembly. Check the released position as carefully as the tightened position; usable thread engagement and retained travel answer different questions.',
 captiveOne:'Released: the screw clears the mating thread while the chosen retaining feature keeps it with the panel.',
 captiveTwo:'Tightened: the head seats as intended, the retainer has room to move and the required thread engagement remains available.',
 captiveThree:'Assembly review: provide panel thickness, retaining-hole details, retainer geometry and the installation sequence.',
 captiveOutcome:'Agree a retention check and a removal/reassembly trial separately from thread gauging. The sketch uses a separate retainer for illustration; the actual retaining arrangement must match the assembly.',
 securityTitle:'Match the drive to the installed tool access',
 securityIntro:'Choose the drive profile together with the service tool and the housing. A matching bit is useful only if it can reach, engage and turn the installed screw.',
 securityOne:'Drive and bit: identify the actual profile, engagement depth and, for a pin-in drive, the pin and matching bit clearance.',
 securityTwo:'Access envelope: show the tool approach, neighboring walls and the space needed to insert and withdraw the tool.',
 securityThree:'Service trial: check installation and authorized removal with the representative housing and matching tool.',
 securityOutcome:'Keep drive acceptance and access acceptance separate. A pin-in profile can restrict casual access, but the profile alone does not establish a security rating.',
 hollowTitle:'Follow the smallest wall and the hidden bore edge',
 hollowIntro:'Use a section view to connect the passage to the outside features. The critical remaining wall may be beside a thread root or an intersecting hole rather than at the largest outside diameter.',
 hollowOne:'Thread root to bore: define the remaining section using the applicable thread geometry and the bore position.',
 hollowTwo:'Hole intersection: identify the internal edge, burr requirement and a workable deburring and inspection route.',
 hollowThree:'Finished passage: agree bore clearance, entry/exit condition and cleaning before assembly makes the internal features inaccessible.',
 hollowOutcome:'External CCD screening can support visible profile checks. Verify inaccessible bore features with a suitable separate method, and use the application matrix below to distinguish cable, flow and sealing requirements.',
 flangeTitle:'Compare the bearing interface before enlarging the flange',
 flangeIntro:'A larger flange changes the contact envelope, but the clamped component still determines whether that contact is useful. Compare the face, coating and available seating area together.',
 flangeOne:'Smooth integral flange: define the usable bearing face, adjacent radii and clearance to the mating recess.',
 flangeTwo:'Serrated integral flange: review intended tooth contact, permissible marking and the effect on the mating coating.',
 flangeThree:'Separate washer: include washer dimensions, hardness or other required condition and its contribution to the axial stack.',
 flangeOutcome:'Record which faces may contact and which must remain clear. Where marking, preload or repeated service matters, agree an assembly trial for the actual surface system instead of inferring performance from flange diameter.',
 setTitle:'Choose the point by its contact with the mating part',
 setIntro:'The point form determines how contact is made. Select it with the mating surface, adjustment frequency and allowable marking, then define usable thread and tool access.',
 setOne:'Flat point: define the mating face and agree the permitted contact marks.',
 setTwo:'Cone point: show the intended recess or permitted indentation and the location it must engage.',
 setThree:'Dog point: define the projection and mating hole or slot; check both clearance and available depth.',
 setFour:'Cup point: review rim contact and any indentation against the permissible damage to the mating surface.',
 setOutcome:'Review repeated adjustment and retention on the actual joint. Point geometry and screw diameter alone do not provide a universal holding-force or tightening-torque value.',
 setNext:'Compare the four point forms and selection worksheet',
 qualityTitle:'Set three clear release checkpoints',
 qualityIntro:'Use the drawing revision and characteristic IDs to keep sample approval, lot acceptance and change approval connected. Agree the records required for the order before production.',
 qualityOneTitle:'Approve the sample basis',
 qualityOne:'Identify the drawing revision, sample route, critical characteristics and mating-part reference. Record whether the submission contains measured values, screening results, material documents or an assembly trial.',
 qualityTwoTitle:'Accept the lot in its supplied condition',
 qualityTwo:'For each characteristic, agree the method, stage, coverage and record. Keep individual measurements distinct from pass/fail screening, and specify any external test report separately.',
 qualityThreeTitle:'Resolve changes and deviations',
 qualityThree:'Record the affected requirement, proposed disposition and approval before release. If the drawing, route or finish changes, identify which checks and sample approvals must be repeated.',
 qualityNext:'Build a characteristic-by-characteristic inspection plan',
 inspectionTitle:'Match each feature to its inspection evidence',
 inspectionIntro:'For a shoulder screw with a bore, split the review into separate characteristics. This planning example shows why an external camera result, a thread gauge and an internal check are not interchangeable.',
 featureHeading:'Drawing feature',methodHeading:'Method to agree',stageHeading:'Acceptance stage',recordHeading:'Record to retain',
 inspectionProfile:'Visible shoulder profile',
 inspectionProfileMethod:'Suitable calibrated optical measurement; validate the presentation and program for the feature.',
 inspectionProfileStage:'Final supplied condition; add an intermediate check if later work hides the feature.',
 inspectionProfileRecord:'Characteristic ID, program/method revision, limits, coverage and measured or screening result.',
 inspectionThread:'Thread and usable engagement',
 inspectionThreadMethod:'Specified thread gauges plus a separate usable-length check where required.',
 inspectionThreadStage:'After the operations affecting the supplied thread.',
 inspectionThreadRecord:'Thread callout, gauge identity, result and usable-length requirement.',
 inspectionBore:'Internal passage and intersection',
 inspectionBoreMethod:'Suitable accessible bore measurement and a separately agreed internal-edge check.',
 inspectionBoreStage:'Before closure or assembly limits access; confirm the required final condition.',
 inspectionBoreRecord:'Bore/edge requirement, method, stage, result and any access limitation.',
 inspectionFunction:'Seating, motion or retention',
 inspectionFunctionMethod:'Trial with the identified mating parts and an agreed assembly procedure.',
 inspectionFunctionStage:'Sample approval and any repeat check specified for the order.',
 inspectionFunctionRecord:'Mating revision, criterion, outcome, deviation and approval.',
 inspectionClose:'Confirm equipment suitability, any external testing and the reporting scope during quotation. The matrix is a planning example, not a completed inspection report.',
 inspectionImage:'CCD vision inspection illustration; it explains the method and is not a photograph of ZUFEK equipment.',
 thumbTitle:'Check the grip space throughout the adjustment',
 thumbIntro:'The knurled head, threaded support and contact end perform different jobs. Review the installed mechanism at its travel limits, including any gloves or tool holder specified for operation.',
 thumbOne:'Grip envelope: include nearby walls and the space needed to turn the head. A larger head helps only if the operator can actually reach it.',
 thumbTwo:'Travel and engagement: show the support, usable threaded length and both end positions. Agree the means of retaining the setting separately from the knurl.',
 thumbThree:'Contact end: identify the mating pad or surface and permitted marks. Evaluate the return to a reference position with the actual contact arrangement.',
 thumbOutcome:'For sample approval, identify the mating support and contact part, trial the agreed adjustment sequence and record position and contact condition. Hand operation is not a measured tightening procedure; specify a separate method where controlled torque is required.',
 thumbNext:'Prepare grip and adjustment requirements',
 thumbMeta:'Specify custom knurled thumb screws around grip clearance, adjustment travel, contact tips and locking. Review the installed mechanism before sample approval.',
 slotTitle:'Review entry, rotation and bearing as separate states',
 slotIntro:'This sketch illustrates a head designed to rotate below a slot opening. An end-fed T-bolt uses a different installation path. Specify the actual entry method rather than assuming every T-head can turn into every slot.',
 slotOne:'Entry: compare the head in its insertion orientation with the opening and internal cavity. Include any closed slot end or obstruction along the installation path.',
 slotTwo:'Rotation: check the full swept envelope beneath the rails, including head corners, neck and nearby parts. A head that fits at the final angle may still jam while turning.',
 slotThree:'Bearing: show which underside faces support the head when tightened. Confirm seating, usable engagement and the intended anti-rotation contact in the actual slot.',
 slotOutcome:'Send the slot section and the open-to-clamped assembly sequence with the bolt drawing. Sample checks should distinguish entry, turning where intended and final seating. Nominal profile size alone does not establish interchangeable head geometry or a clamping-load rating.',
 slotNext:'Measure the slot before fixing the head dimensions',
 slotMeta:'Define a custom T-slot bolt around the actual slot, entry path, rotation envelope and bearing face. Compare installed fit before releasing the head geometry.',
 studTitle:'Keep end A, the centre section and end B identifiable',
 studIntro:'The sketch deliberately shows different threaded ends. Specify each end independently, then define the centre section that controls installation, seating or tool access.',
 studOne:'End A: state thread system, diameter, pitch, handedness, usable length and intended engagement. Identify which mating component receives this end.',
 studTwo:'Centre section: dimension shoulders and wrench flats from named references. Review installation order and the tool space remaining after the first end is fitted.',
 studThree:'End B: apply its own thread and final-finish acceptance. Define a practical end-identification method that does not damage controlled surfaces.',
 studOutcome:'Keep A/B identification on the drawing, gauge record and package label where orientation matters. Record both mating-part revisions with the approved sample; a change to one end still requires review of installation access and engagement at the other.',
 studNext:'Coordinate mixed-thread identification and inspection',
 studMeta:'Specify each end of a custom double-ended stud: thread system, handedness, usable engagement and identification. Coordinate wrench access, gauging and packaging.',
 eccentricTitle:'Define the datum axis, eccentric centre and angular reference',
 eccentricIntro:'The left view separates the mounting axis A from the eccentric centre B. The right view illustrates a separate angular reference. These are drawing relationships, not a tolerance value inferred from the outer shape.',
 eccentricOne:'Datum axis A: define the feature that establishes the installed axis and how it is located during inspection. A threaded surface needs an agreed datum interpretation.',
 eccentricTwo:'Centre B and offset: dimension the eccentric feature relative to A, including its size and any controlled form. Show the mating contact or follower.',
 eccentricThree:'Angular reference: identify the zero direction, any clocked flat or drive and the permitted adjustment range. Relate the setting to the assembled contact, not only to a loose part.',
 eccentricOutcome:'Agree the measurement setup for the specified offset and angular relationship, then trial the movement in the mating assembly. An outside-diameter screen alone does not establish eccentricity, orientation or the available adjustment once nearby parts are installed.',
 eccentricNext:'Specify eccentric datums and inspection positioning',
 eccentricMeta:'Define eccentric screws by the datum axis, offset centre and angular reference. Connect the adjustment envelope to machining setup and final inspection.'
};
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const c=id=>e(practicalCopy[id]);
const path=(d,extra='')=>`<path d="${d}" ${extra}/>`;
const number=(x,y,n)=>`<circle cx="${x}" cy="${y}" r="21" fill="#fff" stroke="#0754a6"/><text x="${x}" y="${y+10}" text-anchor="middle" fill="#0754a6" stroke="none" font-size="30">${n}</text>`;
const metal='fill="#e5e9eb" stroke="#17343e" stroke-width="3"';
const blue='fill="#eaf2fa" stroke="#0754a6" stroke-width="3"';
const thread=(x,y,n=7)=>Array.from({length:n},(_,i)=>path(`M${x+i*10} ${y}l-5 48`,'stroke="#687380" stroke-width="2"')).join('');
function diagram(kind){
 let drawing='';
 if(kind==='shoulder')drawing=`<rect x="185" y="58" width="300" height="165" ${blue}/><rect x="185" y="112" width="300" height="58" fill="white" stroke="#0754a6" stroke-width="2"/><path d="M98 91h63v101H98zM161 118h358v46H161zM519 122h115v38H519z" ${metal}/>${thread(540,117)}${path('M179 110l-18 8m18 53l-18-7','stroke="#ee7c3c" stroke-width="4"')}${number(337,79,1)}${number(155,224,2)}${number(574,215,3)}`;
 if(kind==='captive')drawing=[80,405].map((x,i)=>`<rect x="${x-28}" y="105" width="230" height="26" ${blue}/><rect x="${x+40}" y="104" width="54" height="28" fill="white"/><path d="M${x+16} ${i?77:22}h102v28H${x+16}zM${x+54} ${i?105:50}h26v111h-26zM${x+44} ${i?216:161}h46v45h-46z" ${metal}/><rect x="${x+35}" y="${i?198:143}" width="64" height="10" fill="#ee7c3c" stroke="#17343e"/><path d="M${x+14} 230h30v52h-30zM${x+90} 230h30v52h-30z" ${blue}/>${thread(x+48,i?214:159,4)}${number(x+158,40,i+1)}`).join('');
 if(kind==='security')drawing=`<path d="M230 130h200v58H230zM290 188h80v72h-80z" ${metal}/><path d="M295 130v24h70v-24M328 154v-16h9v16" fill="white" stroke="#17343e" stroke-width="3"/><path d="M305 30h50v82h-17V92h-16v20h-17z" ${blue}/><path d="M150 75h32v145h-32zM485 75h32v145h-32z" ${blue}/><path d="M275 26v88m110-88v88M195 53h285" stroke="#ee7c3c" stroke-width="3" stroke-dasharray="7 6"/>${number(380,145,1)}${number(459,43,2)}${number(575,217,3)}`;
 if(kind==='hollow'){
  const top=Array.from({length:8},(_,i)=>`L${507.5+i*15} 126L${515+i*15} 110`).join('');
  const bottom=Array.from({length:8},(_,i)=>`L${612.5-i*15} 174L${605-i*15} 190`).join('');
  drawing=`<path d="M90 65h95v45H500${top}H625v35H90Z M90 155H625v35H620${bottom}H185v45H90Z" ${metal}/><path d="M410 110v35h20v-35" fill="white" stroke="#17343e" stroke-width="3"/><path d="M537.5 126v19m-8-19h16m-16 19h16M424 145l14 12" stroke="#ee7c3c" stroke-width="3"/>${number(570,55,1)}${number(420,65,2)}${number(155,151,3)}`;
 }
 if(kind==='flange')drawing=[48,285,522].map((x,i)=>`<rect x="${x}" y="160" width="170" height="48" ${blue}/>${i===2?`<path d="M${x+15} 144h140v16H${x+15}z" fill="#fff" stroke="#17343e" stroke-width="3"/>`:''}<path d="M${x+50} 50h70v45h-70zM${x+25} 95h120v${i===2?49:65}H${x+25}zM${x+68} ${i===2?144:160}h34v85h-34z" ${metal}/>${i===1?path(`M${x+25} 156l12 7 12-7 12 7 12-7 12 7 12-7 12 7 12-7 12 7 12-7`,'stroke="#ee7c3c" fill="none" stroke-width="3"'):''}${number(x+85,266,i+1)}`).join('');
 if(kind==='set')drawing=[28,205,382,559].map((x,i)=>{
  const tip=i===0?'H0Z':i===1?'L40 200 0 150Z':i===2?'H56v48H24v-48H0Z':'V179L40 158 0 179Z';
  const mate=['M-16 150H96v95H-16Z','M-16 170H16L40 200 64 170H96v75H-16Z','M-16 170H20v60h40v-60H96v75H-16Z','M-16 179H96v66H-16Z'][i];
  return `<g transform="translate(${x+29} 0)">${path(mate,blue)}<path d="M0 55h80v95${tip}" ${metal}/>${number(40,22,i+1)}</g>`;
 }).join('');
 if(kind==='thumb')drawing=`<path d="M300 85h155v40H300zM300 155h155v60H300zM555 105h48v80h-48z" ${blue}/><path d="M92 78h78v124H92zM170 126h360v28H170zM530 133h25v14h-25z" ${metal}/>${Array.from({length:7},(_,i)=>path(`M${101+i*9} 82v116`,'stroke="#687380" stroke-width="2"')).join('')}${Array.from({length:22},(_,i)=>path(`M${230+i*10} 126l-5 28`,'stroke="#687380" stroke-width="2"')).join('')}<path d="M55 48h154v190H55zM485 208h65m-65-7v14m65-14v14" fill="none" stroke="#e97843" stroke-width="3" stroke-dasharray="7 5"/>${number(57,28,1)}${number(515,257,2)}${number(620,120,3)}`;
 if(kind==='slot'){
  const top=x=>`<rect x="${x}" y="55" width="160" height="160" ${blue}/><rect x="${x+56}" y="55" width="48" height="160" fill="white"/><rect x="${x+10}" y="65" width="140" height="140" fill="none" stroke="#0754a6" stroke-dasharray="6 5"/>`;
  drawing=top(28)+`<rect x="93" y="88" width="30" height="94" ${metal}/>${number(108,263,1)}`+top(272)+`<circle cx="352" cy="135" r="52" fill="none" stroke="#e97843" stroke-width="3" stroke-dasharray="5 5"/><rect x="305" y="120" width="94" height="30" ${metal}/>${number(352,263,2)}<path d="M515 100h51v50h-34v46h116v-46h-34v-50h51v115H515z" ${blue}/><path d="M575 48h30v102h-30zM543 150h94v30h-94z" ${metal}/><path d="M548 150h18m48 0h18" stroke="#e97843" stroke-width="4"/>${number(590,263,3)}`;
 }
 if(kind==='stud')drawing=`<path d="M70 114h210v-14h42v-15h55v15h38v22h225v44H415v20h-38v15h-55v-15h-42v-14H70z" ${metal}/>${Array.from({length:17},(_,i)=>path(`M${87+i*10} 114l-5 58`,'stroke="#687380" stroke-width="2"')).join('')}${Array.from({length:16},(_,i)=>path(`M${427+i*13} 122l-8 44`,'stroke="#687380" stroke-width="2"')).join('')}<path d="M322 85v116m55-116v116" fill="none" stroke="#0754a6" stroke-width="3"/><text x="160" y="98" fill="#17343e" font-size="28">A</text><text x="525" y="108" fill="#17343e" font-size="28">B</text>${number(170,237,1)}${number(348,248,2)}${number(535,237,3)}`;
 if(kind==='eccentric')drawing=`<circle cx="220" cy="145" r="82" ${metal}/><circle cx="180" cy="145" r="31" ${blue}/><path d="M110 145h205M180 62v166M220 48v194M180 44v18m40-18v18m-40-9h40" fill="none" stroke="#0754a6" stroke-width="2" stroke-dasharray="6 5"/><circle cx="220" cy="145" r="4" fill="#e97843"/><text x="110" y="132" font-size="25" fill="#17343e">A</text><text x="233" y="137" font-size="25" fill="#17343e">B</text><circle cx="555" cy="145" r="77" fill="none" stroke="#687380" stroke-width="2"/><path d="M555 145h95M555 145l38-66M602 145a47 47 0 0 0-23-40" fill="none" stroke="#0754a6" stroke-width="3"/>${number(109,244,1)}${number(275,252,2)}${number(630,246,3)}`;
 return `<figure class="practical-diagram quality-diagram"><svg viewBox="0 0 720 300" role="img" aria-label="${c(kind+'Title')}">${drawing}</svg><figcaption>${c('diagramNote')}</figcaption></figure>`;
}
const products={ 'shoulder-screws':'shoulder','captive-screws':'captive','security-screws':'security','hollow-screws':'hollow','flange-screws':'flange','set-screws':'set','knurled-thumb-screws':'thumb','t-slot-bolts':'slot','double-ended-studs':'stud','eccentric-screws':'eccentric' };
const readings={set:'/blog/set-screw-tip-selection/',thumb:'/blog/knurled-thumb-screw-grip-design/',slot:'/blog/t-slot-bolt-head-fit/',stud:'/blog/double-ended-stud-thread-identification/',eccentric:'/blog/eccentric-screw-datum-drawing/'};
export function practicalDescription(url){const kind=products[url.split('/')[2]];return url.startsWith('/products/')&&kind?practicalCopy[kind+'Meta']:undefined;}
export const practicalPaths=['/','/about/','/quality/','/capabilities/inspection/',...Object.keys(products).map(s=>'/products/'+s+'/')];
export const companyPhoto=()=>`<figure class="quality-company-photo"><img src="/photos/sample-display.jpg" width="1706" height="1279" loading="lazy" decoding="async" alt="${c('companyPhoto')}"><figcaption>${c('companyCaption')}</figcaption></figure>`;
const card=(title,text)=>`<article><h3>${c(title)}</h3><p>${c(text)}</p></article>`;
export function practicalSection(url){
 const kind=products[url.split('/')[2]];
 if(url.startsWith('/products/')&&!kind)return productInterfaceHtml(url.split('/')[2]);
 if(url.startsWith('/products/')&&kind)return `<section class="section compact engineering-depth practical-section" id="practical-interface"><h2>${c(kind+'Title')}</h2><p>${c(kind+'Intro')}</p>${diagram(kind)}<ol class="practical-legend">${(kind==='set'?['One','Two','Three','Four']:['One','Two','Three']).map(n=>`<li>${c(kind+n)}</li>`).join('')}</ol><p>${c(kind+'Outcome')}</p>${readings[kind]?`<a class="text-link" href="${readings[kind]}">${c(kind+'Next')}<span aria-hidden="true"> ↗</span></a>`:''}</section>`;
 if(url==='/about/')return `<section class="section compact practical-section" id="sample-planning"><h2>${c('companyTitle')}</h2><p>${c('companyIntro')}</p><div class="practical-steps">${card('companyReviewTitle','companyReview')}${card('companySampleTitle','companySample')}${card('companyRepeatTitle','companyRepeat')}</div><a class="text-link" href="/blog/first-article-custom-screw-approval/">${c('companyNext')}<span aria-hidden="true"> ↗</span></a></section>`;
 if(url==='/quality/')return `<section class="section compact practical-section" id="release-checkpoints"><h2>${c('qualityTitle')}</h2><p>${c('qualityIntro')}</p><div class="practical-steps">${card('qualityOneTitle','qualityOne')}${card('qualityTwoTitle','qualityTwo')}${card('qualityThreeTitle','qualityThree')}</div><a class="text-link" href="/blog/custom-screw-inspection-plan/">${c('qualityNext')}<span aria-hidden="true"> ↗</span></a></section>`;
 if(url==='/capabilities/inspection/')return `<section class="section compact practical-section" id="feature-evidence"><h2>${c('inspectionTitle')}</h2><p>${c('inspectionIntro')}</p><div class="quality-table-scroll" role="region" tabindex="0" aria-label="${c('inspectionTitle')}"><table><caption>${c('inspectionTitle')}</caption><thead><tr>${['featureHeading','methodHeading','stageHeading','recordHeading'].map(id=>`<th scope="col">${c(id)}</th>`).join('')}</tr></thead><tbody>${['Profile','Thread','Bore','Function'].map(row=>`<tr><th scope="row">${c('inspection'+row)}</th>${['Method','Stage','Record'].map(column=>`<td>${c('inspection'+row+column)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>${c('inspectionClose')}</p></section>`;
 return '';
}
export function practicalImageCaption(url,body){
 if(!['/quality/','/capabilities/inspection/'].includes(url))return body;
 // Label only the inspection illustration, not real product photographs or all site imagery.
 return body.replace(/(<figure class="catalog-image[^>]*>[\s\S]*?<figcaption>)[\s\S]*?(<\/figcaption>)/,(_,a,b)=>a+c('inspectionImage')+b);
}
