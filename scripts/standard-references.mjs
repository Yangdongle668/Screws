import fs from 'node:fs';
// Published standards that a drawing-defined part in each family is commonly compared with.
// A standard number is a discussion reference only; it is not a conformity claim for a custom part.
export const standardCopy={
 heading:'Standard references',
 intro:'Custom parts in this family are often derived from the standards below. Use them as a shared starting point; the approved drawing states whether and where the part follows a standard.',
 columns:['Standard','Scope'],
 property:'Property classes: ISO 898-1 for carbon and alloy steel, ISO 3506-1 for stainless steel. Coatings are commonly specified to ISO 4042 (electroplating) or ISO 10683 (zinc flake).'
};
export const standardReferences={
 'shoulder-screws':[['ISO 7379','Hexagon socket shoulder screws: a common starting point for head, socket and shoulder proportions.']],
 'set-screws':[['ISO 4026, 4027, 4028, 4029','Hexagon socket set screws with flat, cone, dog and cup points.']],
 'carriage-bolts':[['DIN 603 / ISO 8677','Cup head square neck bolts.']],
 'flange-screws':[['ISO 4162','Hexagon flange bolts with an integral bearing face.']],
 'lifting-eye-bolts':[['DIN 580','Lifting eye bolts. Lifting use must meet the applicable standard and local regulations, including load marking and verification.']],
 'security-screws':[['ISO 10664','Hexalobular internal driving feature. Pin-in and other security variants are usually defined by the drawing or a tool reference.']],
 'u-bolts':[['DIN 3570','U-bolts for pipe mounting.']],
 't-slot-bolts':[['DIN 186 / DIN 787','T-head bolts with square neck, and T-slot bolts for machine tables.']],
 'square-head-bolts':[['DIN 478, 479, 480','Square head bolts with collar or dog-point variants.']],
 'knurled-thumb-screws':[['DIN 464 / DIN 653','Knurled thumb screws, high and low head types.']],
 'double-ended-studs':[['DIN 835, 938, 939, 940','Double-end studs with metal-end lengths of 2d, 1d, 1.25d and 2.5d.']],
 'eye-bolts':[['DIN 444','Eye bolts for articulating and clamping connections; not intended for lifting.']],
 'fine-thread-screws':[['ISO 261 / ISO 262','ISO metric screw threads: general plan and selected sizes, including fine pitches.']],
 'modified-tip-self-tapping-screws':[['ISO 1478','Tapping screw thread profile. Standard head and drive variants are covered by standards such as ISO 7049.']],
 'hollow-screws':[['DIN 7643','Banjo bolts for pipe unions in fluid connections.']]
};
export function standardSection(slug){const rows=standardReferences[slug];if(!rows)return '';return `<section class="section compact standard-references"><h2>${standardCopy.heading}</h2><p>${standardCopy.intro}</p><table><thead><tr><th scope="col">${standardCopy.columns[0]}</th><th scope="col">${standardCopy.columns[1]}</th></tr></thead><tbody>${rows.map(([s,d])=>`<tr><th scope="row">${s}</th><td>${d}</td></tr>`).join('')}</tbody></table><p class="fine">${standardCopy.property}</p></section>`;}

// Translations: de, es, it, fr, zh.
const review={};
const put=(source,de,es,it,fr,zh)=>{review[source]={de,es,it,fr,zh};};
const same=source=>put(source,source,source,source,source,source);
const r=slug=>standardReferences[slug][0][1];
put(standardCopy.heading,'Normbezüge','Normas de referencia','Norme di riferimento','Normes de référence','参考标准');
put(standardCopy.intro,'Sonderteile dieser Familie werden häufig von den folgenden Normen abgeleitet. Sie dienen als gemeinsamer Ausgangspunkt; die freigegebene Zeichnung legt fest, ob und wo das Teil einer Norm folgt.','Las piezas especiales de esta familia suelen derivarse de las normas siguientes. Úselas como punto de partida común; el plano aprobado indica si la pieza sigue una norma y en qué aspectos.','I particolari speciali di questa famiglia derivano spesso dalle norme seguenti. Usatele come punto di partenza comune; il disegno approvato indica se e dove il pezzo segue una norma.','Les pièces spéciales de cette famille dérivent souvent des normes ci-dessous. Utilisez-les comme point de départ commun ; le plan approuvé précise si et où la pièce suit une norme.','该类非标零件常以下列标准为基础。可将其作为双方沟通的共同起点；零件是否以及在哪些方面遵循标准，以批准图纸为准。');
put(standardCopy.columns[0],'Norm','Norma','Norma','Norme','标准');
put(standardCopy.columns[1],'Inhalt','Alcance','Ambito','Domaine','范围');
put(standardCopy.property,'Festigkeitsklassen: ISO 898-1 für C- und legierten Stahl, ISO 3506-1 für nichtrostenden Stahl. Beschichtungen werden häufig nach ISO 4042 (galvanisch) oder ISO 10683 (Zinklamelle) spezifiziert.','Clases de resistencia: ISO 898-1 para acero al carbono y aleado, ISO 3506-1 para acero inoxidable. Los recubrimientos suelen especificarse según ISO 4042 (electrolíticos) o ISO 10683 (laminillas de zinc).','Classi di resistenza: ISO 898-1 per acciaio al carbonio e legato, ISO 3506-1 per acciaio inossidabile. I rivestimenti si specificano spesso secondo ISO 4042 (elettrolitici) o ISO 10683 (lamellare di zinco).','Classes de qualité : ISO 898-1 pour l’acier au carbone et allié, ISO 3506-1 pour l’acier inoxydable. Les revêtements sont souvent spécifiés selon ISO 4042 (électrolytiques) ou ISO 10683 (lamellaires zinc).','性能等级：碳钢和合金钢参考 ISO 898-1，不锈钢参考 ISO 3506-1。涂层常按 ISO 4042（电镀）或 ISO 10683（锌铝涂层）规定。');
for(const rows of Object.values(standardReferences))for(const [code] of rows)same(code);
put(r('shoulder-screws'),'Innensechskant-Passschulterschrauben: ein üblicher Ausgangspunkt für Kopf-, Antriebs- und Schulterproportionen.','Tornillos con hombro de hexágono interior: punto de partida habitual para las proporciones de cabeza, hueco y hombro.','Viti a spallamento con esagono incassato: punto di partenza comune per proporzioni di testa, impronta e spallamento.','Vis à épaulement à six pans creux : point de départ courant pour les proportions de tête, d’empreinte et d’épaulement.','内六角台阶螺丝（塞打螺丝）：头部、内六角和台阶比例的常用参考。');
put(r('set-screws'),'Gewindestifte mit Innensechskant und Kegelkuppe, Spitze, Zapfen oder Ringschneide.','Prisioneros de hexágono interior con punta plana, cónica, de espiga y de copa.','Grani con esagono incassato a punta piana, conica, cilindrica e a coppa.','Vis sans tête à six pans creux à bout plat, pointu, téton et cuvette.','内六角紧定螺丝：平端、锥端、圆柱端和凹端。');
put(r('carriage-bolts'),'Flachrundschrauben mit Vierkantansatz.','Pernos de cabeza redonda con cuello cuadrado.','Viti a testa tonda con sottotesta quadro.','Vis à tête bombée à collet carré.','圆头方颈螺栓（马车螺栓）。');
put(r('flange-screws'),'Sechskantschrauben mit Flansch und integrierter Auflagefläche.','Tornillos hexagonales con brida y superficie de apoyo integrada.','Viti a testa esagonale flangiata con superficie di appoggio integrata.','Vis à tête hexagonale à embase avec surface d’appui intégrée.','六角法兰螺栓，带一体式支承面。');
put(r('lifting-eye-bolts'),'Ringschrauben zum Heben. Für Hebezwecke gelten die einschlägige Norm und lokale Vorschriften einschließlich Tragfähigkeitskennzeichnung und Prüfung.','Cáncamos de elevación. El uso para elevación debe cumplir la norma aplicable y la normativa local, incluido el marcado de carga y la verificación.','Golfari di sollevamento. L’uso per il sollevamento deve rispettare la norma applicabile e le regole locali, compresi marcatura del carico e verifica.','Anneaux de levage. L’usage en levage doit respecter la norme applicable et la réglementation locale, y compris marquage de charge et vérification.','吊环螺钉。用于起吊时须满足适用标准和当地法规，包括载荷标记和验证。');
put(r('security-screws'),'Innensechsrund-Antrieb. Varianten mit Zapfen und andere Sicherheitsantriebe werden meist über Zeichnung oder Werkzeugreferenz definiert.','Accionamiento hexalobular interior. Las variantes con pivote y otros accionamientos de seguridad suelen definirse por plano o referencia de herramienta.','Impronta esalobata interna. Le varianti con perno e altre impronte di sicurezza sono di solito definite da disegno o riferimento utensile.','Empreinte hexalobulaire interne. Les variantes à téton et autres empreintes de sécurité sont généralement définies par plan ou référence d’outil.','内梅花驱动。带中心柱及其他防盗驱动通常由图纸或工具型号定义。');
put(r('u-bolts'),'U-Bügel zur Rohrbefestigung.','Pernos en U para fijación de tuberías.','Cavallotti per il fissaggio di tubi.','Étriers en U pour la fixation de tubes.','管道固定用 U 型螺栓。');
put(r('t-slot-bolts'),'Hammerschrauben mit Vierkant sowie T-Nutenschrauben für Maschinentische.','Tornillos de cabeza de martillo con cuello cuadrado y tornillos para ranuras en T de mesas de máquina.','Viti a testa a martello con quadro e viti per cave a T di tavole macchina.','Vis à tête marteau à collet carré et vis pour rainures en T de tables de machine.','带方颈的 T 型头螺栓，以及机床工作台 T 型槽螺栓。');
put(r('square-head-bolts'),'Vierkantschrauben mit Bund oder Zapfen-Varianten.','Tornillos de cabeza cuadrada con collar o variantes con espiga.','Viti a testa quadra con collare o varianti con codolo.','Vis à tête carrée à collerette ou variantes à téton.','方头螺栓，带凸缘或短圆柱端等型式。');
put(r('knurled-thumb-screws'),'Rändelschrauben, hohe und niedrige Form.','Tornillos moleteados, tipo alto y bajo.','Viti a testa zigrinata, tipo alto e basso.','Vis moletées, forme haute et basse.','滚花手拧螺丝，高头和低头型。');
put(r('double-ended-studs'),'Stiftschrauben mit Einschraubenden von 2d, 1d, 1,25d und 2,5d.','Espárragos con extremo de rosca de 2d, 1d, 1,25d y 2,5d.','Prigionieri con estremità di avvitamento di 2d, 1d, 1,25d e 2,5d.','Goujons avec bout d’implantation de 2d, 1d, 1,25d et 2,5d.','双头螺柱，旋入端长度为 2d、1d、1.25d 和 2.5d。');
put(r('eye-bolts'),'Augenschrauben für Gelenk- und Spannverbindungen; nicht zum Heben bestimmt.','Tornillos de ojo para uniones articuladas y de amarre; no destinados a elevación.','Viti a occhio per collegamenti articolati e di bloccaggio; non destinate al sollevamento.','Vis à œil pour liaisons articulées et de serrage ; non destinées au levage.','活节螺栓，用于铰接和夹紧连接，不用于起吊。');
put(r('fine-thread-screws'),'Metrisches ISO-Gewinde: Gesamtübersicht und ausgewählte Größen einschließlich Feingewinde.','Roscas métricas ISO: plan general y tamaños seleccionados, incluidos pasos finos.','Filettature metriche ISO: piano generale e dimensioni scelte, inclusi passi fini.','Filetages métriques ISO : plan général et dimensions choisies, y compris pas fins.','ISO 普通螺纹：总体规划和选用规格，包括细牙螺距。');
put(r('modified-tip-self-tapping-screws'),'Gewindeprofil für Blechschrauben. Genormte Kopf- und Antriebsvarianten regeln Normen wie ISO 7049.','Perfil de rosca para tornillos autorroscantes. Las variantes normalizadas de cabeza y accionamiento se recogen en normas como ISO 7049.','Profilo del filetto per viti autofilettanti. Le varianti normalizzate di testa e impronta sono coperte da norme come ISO 7049.','Profil de filetage des vis à tôle. Les variantes normalisées de tête et d’empreinte relèvent de normes comme ISO 7049.','自攻螺纹牙型。标准头型和驱动型式见 ISO 7049 等标准。');
put(r('hollow-screws'),'Hohlschrauben für Ringstutzen in Fluidverbindungen.','Tornillos huecos (banjo) para racores de anillo en conexiones de fluidos.','Viti forate (banjo) per raccordi ad anello nei collegamenti per fluidi.','Vis creuses (banjo) pour raccords orientables dans les circuits de fluides.','用于流体连接环形接头的空心螺栓（油管螺栓）。');

export function applyStandardReferenceTranslations(){
 const sources=[standardCopy.heading,standardCopy.intro,...standardCopy.columns,standardCopy.property,...Object.values(standardReferences).flat().flat()];
 for(const source of sources)if(!review[source])throw Error('Missing standard reference translation: '+source);
 fs.writeFileSync('translations/standard-references-review.json',JSON.stringify(review,null,2)+'\n');
 for(const locale of ['de','es','it','fr','zh']){const file='translations/'+locale+'.json',dictionary=JSON.parse(fs.readFileSync(file,'utf8'));for(const [source,values]of Object.entries(review))dictionary[source]=values[locale];fs.writeFileSync(file,JSON.stringify(dictionary,null,2)+'\n');}
 return Object.keys(review).length;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/standard-references.mjs'))console.log('Applied standard reference translations: '+applyStandardReferenceTranslations());
