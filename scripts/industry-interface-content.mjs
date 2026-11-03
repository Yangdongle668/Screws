import {productOptions,processData} from './catalog.mjs';

export const industryInterfaceCopy={
 function:'Assembly function',spec:'Specify with the mating parts',acceptance:'Acceptance and next review',qualityLink:'Plan functional tests and records',
 note:'Design-review examples, not customer delivery records. Select the actual limits and checks for the ordered assembly.',
 automationMetaTitle:'Custom Fasteners for Industrial Automation',
 automationMeta:'Compare pivot, locating and adjustment screw interfaces for automation. Connect the mating geometry to suitable products, routes and acceptance records.',
 automationTitle:'Separate pivoting, locating and adjustment',
 automationIntro:'A mechanism may use the same thread size for very different jobs. Start with the surface that establishes motion or position; then define how the screw retains the assembly.',
 automationOne:'Pivot on a smooth shoulder',
 automationOneSpec:'Show bore limits, finished shoulder diameter, contact length and the axial stack. Keep the rotating interface separate from the retaining thread.',
 automationOneCheck:'Check bore-to-shoulder clearance and free movement in the assembled stack. Thread gauging alone does not accept the pivot.',
 automationTwo:'Locate a removable station',
 automationTwoSpec:'Identify the locating pin, mating hole and seating face. Show their datum relationships and the intended removal direction.',
 automationTwoCheck:'Measure the specified locating relationships and trial removal and refitting. A clamp thread is not automatically the locating datum.',
 automationThree:'Adjust a stop or guide',
 automationThreeSpec:'Define travel, contact end, permitted marking and how the selected setting is retained. Include operator and tool clearance at both travel ends.',
 automationThreeCheck:'Record the setting before and after the agreed adjustment sequence. Separate visual marking, position measurement and retention checks.',
 automationCaseTitle:'Change example: replace a pivot bushing',
 automationCase:'A replacement bushing can change the bore limits or effective axial stack even when the screw is unchanged. Compare the new bore and stack with the finished shoulder limits, then review movement and seating. Link the bushing and screw revisions in the sample record. Keep the previous approval for its original configuration; document which checks apply to the revised assembly.',
 automationNext:'Follow the automation pivot design study',
 electronicsMetaTitle:'Custom Screws for Electronics & Optical Assemblies',
 electronicsMeta:'Specify compact screw heads, fine-thread adjusters and eccentric interfaces for electronics and optical assemblies, with access, contact and cleanliness checks.',
 electronicsTitle:'Review access, adjustment and the contact surface',
 electronicsIntro:'Compact housings and optical adjusters need different screw interfaces. Define the screw’s mechanical role alongside adjacent parts; an accurate thread alone does not establish the module’s optical performance.',
 electronicsOne:'Close a compact housing',
 electronicsOneSpec:'Show head height, seating face, driver approach and the depth available in the mating tapped part. Identify appearance-sensitive surfaces.',
 electronicsOneCheck:'Check that the finished screw seats before bottoming and that the intended bit can enter. Record permitted contact marks on the housing.',
 electronicsTwo:'Translate a fine adjustment',
 electronicsTwoSpec:'Specify thread pitch, usable travel, contact-end form and the means of retaining the setting. Include the mating adjuster and its support.',
 electronicsTwoCheck:'Trial the required motion and return to a reference setting. Verify the assembled adjustment separately from thread dimensions.',
 electronicsThree:'Position with an eccentric',
 electronicsThreeSpec:'State offset direction and magnitude relative to named datums, plus the angular reference and mating contact envelope.',
 electronicsThreeCheck:'Check offset geometry in the defined setup and trial adjustment in the module. Do not infer offset from the head outline alone.',
 electronicsCaseTitle:'Change example: add a surface finish',
 electronicsCase:'Review which dimensions apply after finishing, including the driver recess, fine thread and contact end. Define the clean condition required before assembly and which surfaces must avoid handling damage. Compare finished samples with the intended tool and mating components. Dimensional acceptance, cleanliness and any optical-system validation need distinct records; a visually clean part is not evidence of a measured particle limit.',
 electronicsNext:'Review eccentric datums and adjustment geometry',
 energyMetaTitle:'Custom Fasteners for Charging & Energy Equipment',
 energyMeta:'Separate service-cover screws, cable passages and conductive connections in charging and storage equipment. Define contact, finish and assembly acceptance.',
 energyTitle:'Separate enclosure, passage and electrical-contact duties',
 energyIntro:'The screw that closes a service panel is not the same specification as a cable passage or a conductive connection. Identify the actual interface before choosing material and finish.',
 energyOne:'Retain a service cover',
 energyOneSpec:'Define cover thickness, drive access, retaining arrangement and exposure. Identify the released position as well as the tightened position.',
 energyOneCheck:'Review opening, retention and re-engagement with the service tool. Agree coating and any enclosure-level checks for the complete assembly.',
 energyTwo:'Route a cable through a part',
 energyTwoSpec:'Show the cable envelope, bore path, entry edges and nearby constraints. Distinguish mechanical clearance from any insulation requirement.',
 energyTwoCheck:'Inspect the passage and internal edges before access is lost. Trial the intended routing; a bore diameter alone does not establish cable protection.',
 energyThree:'Clamp a conductive connection',
 energyThreeSpec:'Identify the current path, contact materials, finish and clamped stack. State whether the threaded component conducts or only supplies clamping.',
 energyThreeCheck:'Agree assembly conditions and the required electrical and thermal acceptance for the joint. Material conductivity alone is not a connection rating.',
 energyCaseTitle:'Change example: substitute a plated connection part',
 energyCase:'Compare the proposed base material, coating and contact surfaces with the approved joint. Identify changes to seating, thread fit and the assembly procedure before deciding which joint checks to repeat. Preserve the contact-stack and revision information in the record. A screw-level material certificate cannot replace electrical-connection testing or equipment approval.',
 energyNext:'Read the charging-enclosure interface discussion',
 fluidMetaTitle:'Hollow Screws & Fasteners for Fluid Equipment',
 fluidMeta:'Review retaining, flow-passage and sealing functions separately. Specify bore geometry, medium, seal interface, cleanliness and agreed functional tests.',
 fluidTitle:'Distinguish retaining, flow and sealing functions',
 fluidIntro:'A hollow screw can provide a passage without being the sealing element. Show where the medium flows, where the seal acts and which feature retains the assembly.',
 fluidOne:'Retain a cover or component',
 fluidOneSpec:'Define the bearing face, clamped stack, mating thread and load case. Identify any separate seal or gasket in the assembly.',
 fluidOneCheck:'Check seating and usable thread engagement. Define joint acceptance independently of the visible fastener profile.',
 fluidTwo:'Provide an internal passage',
 fluidTwoSpec:'Show the complete bore and cross-holes, remaining wall, internal edges and access for cleaning. State the medium and required flow function.',
 fluidTwoCheck:'Inspect hidden intersections at a suitable process stage. Agree any flow and cleanliness tests against the specified passage.',
 fluidThree:'Form part of a sealing joint',
 fluidThreeSpec:'Identify the seal type, mating seat, contact finish and assembly condition. State the medium, temperature and pressure conditions for the application.',
 fluidThreeCheck:'Define the test setup, duration, measurement and pass criteria for any specified leak or pressure test. An open-bore inspection is a different check.',
 fluidCaseTitle:'Change example: add a radial passage',
 fluidCase:'A new cross-hole changes both the local section and the internal edge that needs finishing. Review the intersection before setting the deburring and cleaning sequence. Agree how that hidden area is checked while it remains accessible, then retain the finished dimensions and any specified functional-test record. No pressure capability follows from the product name or a successful dimensional screen.',
 fluidNext:'Define bore geometry and internal-edge acceptance'
};
export const industryInterfaces={
 'industrial-automation':{key:'automation',products:['shoulder-screws','locating-pin-screws','knurled-thumb-screws'],processes:['hybrid-manufacturing','inspection','secondary-machining'],next:'/applications/automation-pivot-fixture/'},
 'electronics-optics':{key:'electronics',products:['special-head-screws','fine-thread-screws','eccentric-screws'],processes:['secondary-machining','threading','cnc-turning'],next:'/blog/eccentric-screw-datum-drawing/'},
 'energy-equipment':{key:'energy',products:['captive-screws','hollow-screws','double-ended-studs'],processes:['post-processing','secondary-machining','surface-treatment'],next:'/industry-insights/ev-charging-enclosure-fasteners/'},
 'fluid-control':{key:'fluid',products:['flange-screws','hollow-screws','special-head-screws'],processes:['threading','post-processing','inspection'],acceptanceLinks:{Three:['/quality/',industryInterfaceCopy.qualityLink]},next:'/blog/hollow-screw-bore-specification/'}
};
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=id=>e(industryInterfaceCopy[id]);
const acceptanceLink=(r,n,i)=>r.acceptanceLinks?.[n]??['/capabilities/'+r.processes[i]+'/',processData.find(p=>p.slug===r.processes[i]).name];
export const industryInterfaceMetadata=Object.fromEntries(Object.entries(industryInterfaces).map(([slug,{key}])=>['/industries/'+slug+'/',[industryInterfaceCopy[key+'MetaTitle'],industryInterfaceCopy[key+'Meta']]]));
export function industryInterfaceContent(url){
 const slug=url.match(/^\/industries\/([^/]+)\/$/)?.[1],r=industryInterfaces[slug];if(!r)return '';const k=r.key;
 const rows=['One','Two','Three'].map((n,i)=>{
  const [path,label]=acceptanceLink(r,n,i);
  return `<tr><th scope="row">${text(k+n)}</th><td><span class="material-mobile-label" aria-hidden="true">${text('spec')}</span><p>${text(k+n+'Spec')}</p><a href="/products/${r.products[i]}/">${e(productOptions.find(p=>p.slug===r.products[i]).name)}<span aria-hidden="true"> ↗</span></a></td><td><span class="material-mobile-label" aria-hidden="true">${text('acceptance')}</span><p>${text(k+n+'Check')}</p><a href="${e(path)}">${e(label)}<span aria-hidden="true"> ↗</span></a></td></tr>`;
 }).join('');
 return `<section class="section compact industry-interfaces" id="industry-interfaces"><h2>${text(k+'Title')}</h2><p>${text(k+'Intro')}</p><div class="table-scroll material-finder-table" tabindex="0" role="region" aria-label="${text(k+'Title')}"><table><caption>${text(k+'Title')}</caption><thead><tr>${['function','spec','acceptance'].map(id=>`<th scope="col">${text(id)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><h3>${text(k+'CaseTitle')}</h3><p>${text(k+'Case')}</p><p class="fine">${text('note')}</p><a class="text-link" href="${r.next}">${text(k+'Next')}<span aria-hidden="true"> ↗</span></a></section>`;
}
