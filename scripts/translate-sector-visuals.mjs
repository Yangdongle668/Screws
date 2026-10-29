import fs from 'node:fs';
const briefs=JSON.parse(fs.readFileSync('scripts/sector-visuals.json','utf8'));
const phrases={
 'Industry overview':['Branchenüberblick','Vista general del sector','Panoramica del settore','行业总览','Vue d’ensemble du secteur'],
 'Material appearance reference; grade and properties require documentation.':['Optische Werkstoffreferenz; Güte und Eigenschaften sind durch Unterlagen nachzuweisen.','Referencia del aspecto del material; el grado y las propiedades requieren documentación.','Riferimento visivo del materiale; grado e proprietà richiedono documentazione.','材料外观参考；具体牌号与性能需由材料文件及检测确认。','Aspect du matériau à titre indicatif ; la nuance et les propriétés nécessitent des justificatifs.'],
 'Process outcome reference; final requirements follow the approved drawing.':['Beispiel eines Bearbeitungsergebnisses; maßgeblich ist die freigegebene Zeichnung.','Ejemplo del resultado del proceso; los requisitos finales se rigen por el plano aprobado.','Esempio del risultato della lavorazione; i requisiti finali seguono il disegno approvato.','工艺效果参考；最终结构、性能及验收要求以确认图纸为准。','Exemple de résultat du procédé ; les exigences finales suivent le plan approuvé.'],
 'AFTER PROCESSING':['NACH DER BEARBEITUNG','RESULTADO DEL PROCESO','DOPO LA LAVORAZIONE','加工后的效果','APRÈS TRAITEMENT'],
 'See the resulting feature.':['Das Ergebnis am Bauteil.','El resultado en la pieza.','Il risultato sul componente.','看清加工后的结构与表面','Le résultat sur la pièce.'],
 'Visual references help explain geometry and finish. Material properties, coating performance and acceptance require the agreed inspection methods.':['Die Bilder veranschaulichen Geometrie und Oberfläche. Werkstoffeigenschaften, Beschichtungsleistung und Abnahme werden mit den vereinbarten Prüfverfahren beurteilt.','Las imágenes ayudan a explicar la geometría y el acabado. Las propiedades del material, el rendimiento del recubrimiento y la aceptación requieren los métodos de inspección acordados.','Le immagini illustrano geometria e finitura. Proprietà del materiale, prestazioni del rivestimento e accettazione richiedono i controlli concordati.','图片用于说明零件结构及表面外观。材料性能、涂层性能和成品是否合格，仍需按照约定的检测方法确认。','Les images illustrent la géométrie et la finition. Les propriétés du matériau, les performances du revêtement et la réception nécessitent les contrôles convenus.']
};
const resultTitles=[
 ['Kaltstauchen – geformter Rohling','Conformado en frío: pieza en bruto','Stampaggio a freddo: grezzo formato','冷镦后的成型毛坯','Frappe à froid : ébauche formée'],
 ['CNC-Drehen – abgestufte Geometrie','Torneado CNC: geometría escalonada','Tornitura CNC: geometria a gradini','CNC车削后的多台阶结构','Tournage CNC : géométrie étagée'],
 ['Warmumformen – Schmiederohling','Forja en caliente: pieza en bruto','Stampaggio a caldo: grezzo forgiato','热锻毛坯与后续加工件','Forge à chaud : ébauche forgée'],
 ['Kombinierte Fertigung – fertig bearbeitete Schulter','Fabricación combinada: hombro mecanizado','Lavorazione combinata: spallamento finito','冷镦加精加工后的台阶','Procédé combiné : épaulement usiné'],
 ['Gewindefertigung – fertiges Gewinde','Roscado: rosca terminada','Filettatura: filetto finito','螺纹加工后的牙形','Filetage : filet terminé'],
 ['Sekundärbearbeitung – Querbohrung','Mecanizado secundario: taladro transversal','Lavorazioni secondarie: foro trasversale','二次钻孔后的横向孔','Usinage secondaire : perçage transversal'],
 ['Wärmebehandlung – Endzustand','Tratamiento térmico: estado final','Trattamento termico: stato finale','热处理后的零件状态','Traitement thermique : état final'],
 ['Oberflächenbehandlung – Beschichtungsvarianten','Tratamiento superficial: opciones de acabado','Trattamento superficiale: finiture disponibili','表面处理后的不同外观','Traitement de surface : finitions possibles'],
 ['Nachbearbeitung – gereinigt und entgratet','Posprocesado: limpieza y desbarbado','Finitura: pulizia e sbavatura','去毛刺与清洗后的细节','Finition : nettoyage et ébavurage'],
 ['Prüfung – Maßkontrolle','Inspección: control dimensional','Controllo: verifica dimensionale','检测时的尺寸轮廓','Contrôle : vérification dimensionnelle']
];
for(const [index,locale]of ['de','es','it','zh','fr'].entries()){
 const path='translations/'+locale+'.json',d=JSON.parse(fs.readFileSync(path,'utf8'));
 for(const [key,values]of Object.entries(phrases))d[key]=values[index];
 for(const [i,b]of briefs.entries()){
  if(b.kind==='result'){d[b.title]=resultTitles[i-15][index];continue;}
  const suffix=b.kind==='industry'?' — industry overview':' — example fasteners';
  d[b.title+suffix]=(d[b.title]??b.title)+[' – Branchenüberblick',' — vista general del sector',' — panoramica del settore','行业总览',' — vue d’ensemble du secteur'][index];
  if(b.kind==='material')d[b.title+suffix]=(d[b.title]??b.title)+[' – Beispiel-Verbindungselemente',' — ejemplos de tornillos',' — esempi di viti','螺丝外观示例',' — exemples de vis'][index];
 }
 fs.writeFileSync(path,JSON.stringify(d,null,2)+'\n');
}
