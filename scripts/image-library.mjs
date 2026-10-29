import {productOptions,processData} from './catalog.mjs';
export const imageSlugs=new Set([...productOptions,...processData].map(p=>p.slug));
const descriptions={
 'shoulder-screws':'Shoulder screw illustration with smooth locating shoulder and smaller threaded end',
 'security-screws':'Tamper-resistant screw illustration with six-lobe recess and central pin',
 'hollow-screws':'Hollow bolt illustration showing the continuous axial through bore',
 'flange-screws':'Hex flange screw illustration with an integral bearing flange',
 'knurled-thumb-screws':'Manual thumb screw illustration with a diamond knurled head',
 'set-screws':'Headless socket set screw illustrations with different tip forms',
 't-slot-bolts':'T-slot bolt illustration with a rectangular T-shaped head',
 'eye-bolts':'Articulating bolt illustration with a drilled flat eye lug',
 'lifting-eye-bolts':'Forged closed-ring eye bolt geometry illustration without a load rating',
 'u-bolts':'U-bolt illustration with threads at both free ends',
 'square-head-bolts':'Square head bolt illustration with four flat head sides',
 'carriage-bolts':'Carriage bolt illustration with a smooth dome and square neck',
 'eccentric-screws':'Eccentric adjustment screw illustration showing the offset head and shaft axes',
 'double-ended-studs':'Double-ended stud illustration with different threaded ends and a plain center',
 'fine-thread-screws':'Fine pitch adjustment screw illustration with a magnified thread detail',
 'special-thread-profiles':'Cross-section illustrations of trapezoidal, buttress and high-low thread profiles',
 'modified-tip-self-tapping-screws':'Self-tapping screw illustration with a slotted cutting tip',
 'reduced-shank-screws':'Reduced-shank bolt illustration with a narrow smooth waist',
 'tapered-screws':'Tapered locating screw illustration with a conical smooth shoulder',
 'locating-pin-screws':'Custom screw illustration with an offset integral locating pin',
 'double-ended-shoulder-screws':'Double-ended shoulder stud illustration with a broad smooth central shoulder',
 'cross-drilled-screws':'Socket head screw illustration with a transverse hole through the head',
 'multi-step-screws':'Multi-step screw illustration with distinct smooth shoulder diameters',
 'custom-clinch-fasteners':'Clinch stud and sheet cutaway illustrating the press-in retention feature',
 'custom-screws':'Illustrative assortment of four distinct custom metal screw geometries',
 'captive-screws':'Captive panel screw cutaway illustrating the retaining ring and reduced neck',
 'special-head-screws':'Illustrative selection of three different custom screw head forms',
 'cold-heading':'Cold heading process illustration with cut blank, forming punch, die and headed blank',
 'cnc-turning':'CNC turning illustration with a supported bar and cutting insert at a shoulder',
 'hot-forging':'Hot forging process illustration with a heated eye-shaped blank and aligned dies',
 'hybrid-manufacturing':'Hybrid process illustration from cold-headed blank to secondary turned part',
 'threading':'External thread rolling illustration with the workpiece supported between grooved dies',
 'secondary-machining':'Radial drilling illustration with the shoulder screw supported in a V-block',
 'heat-treatment':'Heat-treatment furnace illustration with fasteners in a supported basket',
 'surface-treatment':'Rack electroplating illustration with immersed screws and side anodes',
 'post-processing':'Ultrasonic cleaning illustration with an immersed basket and external transducers',
 'inspection':'CCD inspection cabinet displaying non-standard shoulder screw dimensions and threaded-end checks',
};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function catalogImage(slug,{hero=false,caption=false}={}){
 if(!imageSlugs.has(slug))throw new Error('No matching image brief: '+slug);
 const isProcess=processData.some(p=>p.slug===slug);
 const version=slug==='inspection'?'?v=ccd-cabinet-label-v2-20261029':'';
 const img=`<img src="/images/${slug}.webp${version}" srcset="/images/${slug}-small.webp${version} 560w, /images/${slug}.webp${version} 1100w" sizes="${hero?'(max-width:760px) 90vw, 50vw':'(max-width:760px) 90vw, 33vw'}" width="1100" height="734" alt="${esc(descriptions[slug])}" ${hero?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
 const name=(isProcess?processData:productOptions).find(p=>p.slug===slug)?.name??slug;
 return `<figure class="catalog-image ${hero?'catalog-image-hero':''}">${img}${caption?`<figcaption>${esc(name)}</figcaption>`:''}</figure>`;
}
