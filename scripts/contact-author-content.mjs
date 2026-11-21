import fs from 'node:fs';
// Direct contact details and the engineering author profile. Translations below use the de, es, it, fr, zh order.
export const phone={display:'+86 190 6634 8320',tel:'+8619066348320',whatsapp:'https://wa.me/8619066348320',schema:'+86-190-6634-8320'};
export const contactCopy={
 label:'Phone / WhatsApp',
 whatsapp:'WhatsApp',
 hours:'Working hours: Monday–Saturday, 08:00–17:30 China time (UTC+8)'
};
export const authorCopy={
 title:'Theo Wan — Engineering Lead',
 description:'Technical articles by Theo Wan (万天恩), engineering lead at ZUFEK, on custom fastener specifications, manufacturing routes, inspection and procurement.',
 kicker:'ZUFEK ENGINEERING',
 intro:'Theo Wan leads engineering at ZUFEK and writes the company’s practical guides on custom fastener specifications, manufacturing choices, inspection and procurement.',
 approach:'Each guide focuses on information engineers and buyers can use to prepare drawings, compare manufacturing options and agree acceptance requirements.',
 jobTitle:'Engineering Lead'
};
const review={};
const put=(source,de,es,it,fr,zh)=>{review[source]={de,es,it,fr,zh};};
put(contactCopy.label,'Telefon / WhatsApp','Teléfono / WhatsApp','Telefono / WhatsApp','Téléphone / WhatsApp','电话 / WhatsApp');
put(contactCopy.whatsapp,'WhatsApp','WhatsApp','WhatsApp','WhatsApp','WhatsApp');
put(contactCopy.hours,'Arbeitszeit: Montag–Samstag, 08:00–17:30 chinesische Zeit (UTC+8)','Horario: lunes a sábado, 08:00–17:30 hora de China (UTC+8)','Orario: lunedì–sabato, 08:00–17:30 ora cinese (UTC+8)','Horaires : du lundi au samedi, 08:00–17:30 heure de Chine (UTC+8)','工作时间：周一至周六 08:00–17:30（北京时间，UTC+8）');
put(authorCopy.title,'Theo Wan — Leiter Technik','Theo Wan — Responsable de ingeniería','Theo Wan — Responsabile tecnico','Theo Wan — Responsable ingénierie','万天恩 — 工程负责人');
put(authorCopy.description,'Fachartikel von Theo Wan (万天恩), Leiter Technik bei ZUFEK, zu Spezifikation, Fertigungswegen, Prüfung und Beschaffung von Sonderverbindungselementen.','Artículos técnicos de Theo Wan (万天恩), responsable de ingeniería de ZUFEK, sobre especificación, rutas de fabricación, inspección y compra de fijaciones especiales.','Articoli tecnici di Theo Wan (万天恩), responsabile tecnico di ZUFEK, su specifiche, cicli produttivi, controlli e acquisto di fissaggi speciali.','Articles techniques de Theo Wan (万天恩), responsable ingénierie chez ZUFEK, sur la spécification, les gammes de fabrication, le contrôle et l’achat de fixations spéciales.','ZUFEK 工程负责人万天恩（Theo Wan）撰写的技术文章，涵盖非标紧固件规格、加工路线、检验与采购。');
put(authorCopy.kicker,'ZUFEK TECHNIK','INGENIERÍA ZUFEK','INGEGNERIA ZUFEK','INGÉNIERIE ZUFEK','ZUFEK 工程部');
put(authorCopy.intro,'Theo Wan leitet die Technik bei ZUFEK und schreibt die praxisnahen Leitfäden des Unternehmens zu Spezifikation, Fertigungswahl, Prüfung und Beschaffung von Sonderverbindungselementen.','Theo Wan dirige la ingeniería de ZUFEK y escribe las guías prácticas de la empresa sobre especificación, elección de fabricación, inspección y compra de fijaciones especiales.','Theo Wan guida l’ingegneria di ZUFEK e scrive le guide pratiche dell’azienda su specifiche, scelte produttive, controlli e acquisto di fissaggi speciali.','Theo Wan dirige l’ingénierie de ZUFEK et rédige les guides pratiques de l’entreprise sur la spécification, les choix de fabrication, le contrôle et l’achat de fixations spéciales.','万天恩（Theo Wan）负责 ZUFEK 的工程工作，并撰写公司关于非标紧固件规格、加工方式选择、检验和采购的实用指南。');
put(authorCopy.approach,'Jeder Leitfaden konzentriert sich auf Informationen, mit denen Ingenieure und Einkäufer Zeichnungen vorbereiten, Fertigungsoptionen vergleichen und Abnahmeanforderungen vereinbaren.','Cada guía se centra en información que ingenieros y compradores pueden usar para preparar planos, comparar opciones de fabricación y acordar requisitos de aceptación.','Ogni guida si concentra su informazioni utili a ingegneri e buyer per preparare disegni, confrontare opzioni produttive e concordare i requisiti di accettazione.','Chaque guide se concentre sur des informations utiles aux ingénieurs et acheteurs pour préparer les plans, comparer les options de fabrication et convenir des exigences d’acceptation.','每篇指南都聚焦工程师和采购人员可直接使用的信息：准备图纸、比较加工方案、约定验收要求。');
export function applyContactAuthorTranslations(){
 for(const source of [...Object.values(contactCopy),...Object.entries(authorCopy).filter(([k])=>k!=='jobTitle').map(([,v])=>v)])if(!review[source])throw Error('Missing contact/author translation: '+source);
 review[authorCopy.title+' | ZUFEK']=Object.fromEntries(Object.entries(review[authorCopy.title]).map(([l,v])=>[l,v+' | ZUFEK']));
 fs.writeFileSync('translations/contact-author-review.json',JSON.stringify(review,null,2)+'\n');
 for(const locale of ['de','es','it','fr','zh']){const file='translations/'+locale+'.json',dictionary=JSON.parse(fs.readFileSync(file,'utf8'));for(const [source,values]of Object.entries(review))dictionary[source]=values[locale];fs.writeFileSync(file,JSON.stringify(dictionary,null,2)+'\n');}
 return Object.keys(review).length;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/contact-author-content.mjs'))console.log('Applied contact/author translations: '+applyContactAuthorTranslations());
