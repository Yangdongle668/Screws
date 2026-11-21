// Additional explanatory content for short worksheet-style guides. Translations: scripts/guide-depth-localization.mjs.
export const rfqItemNotes={
 heading:'What each item tells us',
 intro:'Each line answers a question that otherwise comes back as a follow-up email. If something is still open, say so; a marked gap is more useful than a guess.',
 columns:['Checklist item','Why it matters','If it is not final yet'],
 rows:[
  ['Drawing or sketch, drawing number and revision','Ties the quotation, samples and later orders to one controlled revision.','Send the current sketch or sample photos and mark them as preliminary.'],
  ['Units, overall dimensions and thread specification','Sets the blank size, the forming or turning route and the thread gauges.','Give the nominal size and thread, and mark the dimensions that are still open.'],
  ['Critical features, tolerances and mating assembly','Shows which features control function, and therefore cost and inspection effort.','Describe the mating parts and how the screw is assembled or serviced.'],
  ['Material grade or application requirements','Determines forming behaviour, heat treatment and available stock.','Describe the environment, loading and contact metals so options can be proposed.'],
  ['Surface finish and any acceptance requirements','Coating thickness and friction affect thread fit, shoulder size and tightening.','State the purpose of the finish (corrosion, appearance or friction) and any customer standard.'],
  ['Prototype quantity and production quantity','Decides whether tooling is justified and which route is economical.','Give an expected range, for example samples now and an estimated annual volume.'],
  ['Sample approval and inspection documentation','Defines the evidence that ships with samples and production lots.','Tell us which records your quality team normally requires.'],
  ['Destination and requested delivery date','Affects packaging, shipping method and the schedule we confirm.','Give target dates for samples and for the first production lot.']
 ]
};
export const driveSpecification={
 heading:'Put the drive on the drawing.',
 intro:'A drive name alone rarely defines tool fit. These inputs let the recess be reviewed together with the head geometry, material and finish.',
 items:[
  'Name the drive family and size, and cite the standard where one applies, for example ISO 10664 for hexalobular recesses or ISO 4757 for cross recesses.',
  'For a special or security drive, supply the recess drawing or the tool reference used on your assembly line.',
  'State the minimum recess depth or penetration gauge where engagement matters for tightening.',
  'Show tool access: head clearance, approach angle and any surrounding walls.',
  'Give the tightening method and torque range so the recess and material can be reviewed together.',
  'Note how plating or coating is treated in the recess, because build-up can change tool fit.',
  'Agree how the recess is inspected, for example with a go/no-go gauge or the service tool.'
 ]
};
export const guideDepthStrings=()=>[rfqItemNotes.heading,rfqItemNotes.intro,...rfqItemNotes.columns,...rfqItemNotes.rows.flat().slice(0).filter((_,i)=>i%3!==0),driveSpecification.heading,driveSpecification.intro,...driveSpecification.items];
