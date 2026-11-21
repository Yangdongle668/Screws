import fs from 'node:fs';
import {comparisonStrings} from './comparison-tables.mjs';
// source: [de, es, it, fr, zh]
const t={
 'General comparison. The route and requirements for a specific part are confirmed against its drawing.':['Allgemeiner Vergleich. Fertigungsweg und Anforderungen eines konkreten Teils werden anhand seiner Zeichnung bestätigt.','Comparación general. La ruta y los requisitos de una pieza concreta se confirman con su plano.','Confronto generale. Ciclo e requisiti di un pezzo specifico si confermano sul suo disegno.','Comparaison générale. La gamme et les exigences d’une pièce donnée sont confirmées sur son plan.','一般性对比。具体零件的工艺路线和要求以其图纸确认为准。'],
 'Factor':['Kriterium','Factor','Fattore','Critère','对比项'],
 'State in the RFQ':['In der Anfrage angeben','Indicar en la RFQ','Da indicare nella RFQ','À préciser dans la demande','询价时应写明'],
 'Suited to':['Geeignet für','Adecuado para','Adatto a','Adapté à','适用于'],

 'At a glance: cold heading vs CNC turning':['Auf einen Blick: Kaltstauchen oder CNC-Drehen','De un vistazo: estampación en frío o torneado CNC','In sintesi: stampaggio a freddo o tornitura CNC','En bref : frappe à froid ou décolletage CNC','一览：冷镦与 CNC 车削'],
 'Cold heading':['Kaltstauchen','Estampación en frío','Stampaggio a freddo','Frappe à froid','冷镦'],
 'CNC / Swiss-type turning':['CNC- / Langdrehen','Torneado CNC / tipo suizo','Tornitura CNC / a fantina mobile','Décolletage CNC / poupée mobile','CNC / 走心机车削'],
 'Typical quantity':['Typische Menge','Cantidad típica','Quantità tipica','Quantité typique','典型数量'],
 'Repeat volumes that justify tooling':['Wiederholmengen, die das Werkzeug rechtfertigen','Volúmenes repetidos que justifican el utillaje','Volumi ripetuti che giustificano l’attrezzatura','Volumes répétés qui justifient l’outillage','足以摊薄模具成本的批量返单'],
 'Prototypes, small batches and changing designs':['Prototypen, Kleinserien und sich ändernde Konstruktionen','Prototipos, lotes pequeños y diseños cambiantes','Prototipi, piccoli lotti e progetti in evoluzione','Prototypes, petites séries et conceptions évolutives','样件、小批量和设计经常变动的零件'],
 'Tooling':['Werkzeug','Utillaje','Attrezzatura','Outillage','模具'],
 'Dies and punches are made before production':['Matrizen und Stempel werden vor der Fertigung hergestellt','Matrices y punzones se fabrican antes de producir','Matrici e punzoni si realizzano prima della produzione','Matrices et poinçons sont réalisés avant la production','生产前需制作模具和冲针'],
 'Mainly programs and standard cutting tools':['Vor allem Programme und Standard-Schneidwerkzeuge','Principalmente programas y herramientas de corte estándar','Soprattutto programmi e utensili da taglio standard','Surtout des programmes et des outils de coupe standard','主要是程序和标准刀具'],
 'Material use':['Materialausnutzung','Aprovechamiento del material','Utilizzo del materiale','Utilisation de la matière','材料利用'],
 'Little material loss; grain flow follows the formed shape':['Geringer Materialverlust; Faserverlauf folgt der Umformkontur','Poca pérdida de material; la fibra sigue la forma conformada','Poco scarto di materiale; la fibratura segue la forma stampata','Peu de perte matière ; le fibrage suit la forme frappée','材料损耗少；金属流线沿成形轮廓分布'],
 'Material is removed as chips; grain flow is cut':['Material wird zerspant; der Faserverlauf wird geschnitten','El material se elimina como viruta; la fibra queda cortada','Il materiale si asporta come truciolo; la fibratura viene interrotta','La matière est enlevée en copeaux ; le fibrage est coupé','材料以切屑形式去除；金属流线被切断'],
 'Suited geometry':['Geeignete Geometrie','Geometría adecuada','Geometria adatta','Géométrie adaptée','适合的结构'],
 'Heads, flanges and steps that can be formed in stages':['Köpfe, Flansche und Absätze, die stufenweise umformbar sind','Cabezas, bridas y escalones que pueden conformarse por etapas','Teste, flange e gradini formabili in più stadi','Têtes, embases et épaulements formables en plusieurs étapes','可分工位成形的头部、法兰和台阶'],
 'Deep bores, cross holes, eccentric and tight local features':['Tiefe Bohrungen, Querbohrungen, exzentrische und enge lokale Merkmale','Taladros profundos, agujeros transversales, rasgos excéntricos y locales ajustados','Fori profondi, fori trasversali, elementi eccentrici e locali stretti','Alésages profonds, trous transversaux, formes excentrées et détails serrés','深孔、横孔、偏心结构和精密局部特征'],
 'Design changes':['Konstruktionsänderungen','Cambios de diseño','Modifiche di progetto','Modifications de conception','设计变更'],
 'Die changes take longer and cost more':['Werkzeugänderungen dauern länger und kosten mehr','Cambiar matrices lleva más tiempo y cuesta más','Modificare le matrici richiede più tempo e costa di più','Modifier les matrices prend plus de temps et coûte plus cher','改模周期更长、成本更高'],
 'Program changes are quick':['Programmänderungen gehen schnell','Los cambios de programa son rápidos','Le modifiche di programma sono rapide','Les modifications de programme sont rapides','修改程序很快'],

 'At a glance: rolled vs cut threads':['Auf einen Blick: gerolltes oder geschnittenes Gewinde','De un vistazo: rosca laminada o tallada','In sintesi: filetto rullato o tagliato','En bref : filetage roulé ou taillé','一览：滚压螺纹与切削螺纹'],
 'Rolled thread':['Gerolltes Gewinde','Rosca laminada','Filetto rullato','Filetage roulé','滚压螺纹'],
 'Cut thread':['Geschnittenes Gewinde','Rosca tallada','Filetto tagliato','Filetage taillé','切削螺纹'],
 'How it is made':['Herstellung','Cómo se fabrica','Come si ottiene','Mode d’obtention','加工方式'],
 'Material is displaced between dies':['Werkstoff wird zwischen Rollwerkzeugen verdrängt','El material se desplaza entre peines o rodillos','Il materiale viene spostato tra i rulli','La matière est refoulée entre les molettes','材料在滚丝模之间挤压成形'],
 'Material is removed by turning, die cutting or milling':['Werkstoff wird durch Drehen, Schneiden oder Fräsen abgetragen','El material se elimina por torneado, terraja o fresado','Il materiale si asporta con tornitura, filiera o fresatura','La matière est enlevée par tournage, filière ou fraisage','通过车削、板牙或铣削去除材料'],
 'Blank':['Rohling','Pieza en bruto','Grezzo','Ébauche','坯料'],
 'A reduced blank near the pitch diameter':['Ein reduzierter Rohling nahe dem Flankendurchmesser','Un bruto reducido cercano al diámetro de flancos','Un grezzo ridotto vicino al diametro medio','Une ébauche réduite proche du diamètre sur flancs','接近中径的缩径坯料'],
 'Stock at the full major diameter':['Material mit vollem Außendurchmesser','Material al diámetro exterior completo','Materiale al diametro esterno pieno','Matière au diamètre extérieur complet','按螺纹大径备料'],
 'Surface and fatigue':['Oberfläche und Dauerfestigkeit','Superficie y fatiga','Superficie e fatica','Surface et fatigue','表面与疲劳性能'],
 'Cold-worked, smooth flanks; generally better fatigue resistance':['Kaltverfestigte, glatte Flanken; meist bessere Dauerfestigkeit','Flancos lisos y endurecidos en frío; en general mejor resistencia a la fatiga','Fianchi lisci incruditi; in genere migliore resistenza a fatica','Flancs lisses écrouis ; en général meilleure tenue en fatigue','冷作硬化、牙面光滑，通常抗疲劳性能更好'],
 'Grain flow is cut; finish depends on tool and setup':['Faserverlauf wird geschnitten; Oberfläche hängt von Werkzeug und Einrichtung ab','La fibra queda cortada; el acabado depende de la herramienta y el ajuste','La fibratura viene tagliata; la finitura dipende da utensile e setup','Le fibrage est coupé ; l’état de surface dépend de l’outil et du réglage','金属流线被切断；表面质量取决于刀具和调整'],
 'Volume production and many special profiles':['Serienfertigung und viele Sonderprofile','Producción en serie y muchos perfiles especiales','Produzione in serie e molti profili speciali','Production en série et de nombreux profils spéciaux','批量生产及多种特殊牙型'],
 'Large pitches, small batches and threads close to a shoulder':['Große Steigungen, Kleinserien und Gewinde nahe einer Schulter','Pasos grandes, lotes pequeños y roscas cerca de un hombro','Passi grandi, piccoli lotti e filetti vicini a uno spallamento','Grands pas, petites séries et filetages proches d’un épaulement','大螺距、小批量以及靠近台阶的螺纹'],
 'Thread designation, class, gauging and whether rolling is required':['Gewindebezeichnung, Toleranzklasse, Lehrung und ob Rollen gefordert ist','Designación, clase, calibrado y si se exige laminado','Designazione, classe, calibratura e se è richiesta la rullatura','Désignation, classe, calibrage et si le roulage est exigé','螺纹标记、精度等级、量规检验以及是否必须滚压'],
 'Thread designation, class, gauging and whether cutting is acceptable':['Gewindebezeichnung, Toleranzklasse, Lehrung und ob Schneiden zulässig ist','Designación, clase, calibrado y si se acepta el tallado','Designazione, classe, calibratura e se il taglio è accettabile','Désignation, classe, calibrage et si la taille est acceptée','螺纹标记、精度等级、量规检验以及是否接受切削'],

 'At a glance: nickel plating vs stainless passivation':['Auf einen Blick: Vernickeln oder Passivieren von Edelstahl','De un vistazo: niquelado o pasivado de inoxidable','In sintesi: nichelatura o passivazione dell’inox','En bref : nickelage ou passivation de l’inox','一览：镀镍与不锈钢钝化'],
 'Nickel plating':['Vernickeln','Niquelado','Nichelatura','Nickelage','镀镍'],
 'Stainless passivation':['Passivieren von Edelstahl','Pasivado de inoxidable','Passivazione dell’inox','Passivation de l’inox','不锈钢钝化'],
 'Applies to':['Anwendbar auf','Se aplica a','Si applica a','S’applique à','适用材料'],
 'Steel, brass and other substrates':['Stahl, Messing und andere Grundwerkstoffe','Acero, latón y otros sustratos','Acciaio, ottone e altri substrati','Acier, laiton et autres substrats','钢、黄铜及其他基材'],
 'Stainless steel only':['Nur nichtrostender Stahl','Solo acero inoxidable','Solo acciaio inossidabile','Acier inoxydable uniquement','仅限不锈钢'],
 'What it does':['Wirkung','Qué hace','Cosa fa','Effet','作用'],
 'Adds a metallic nickel layer':['Bringt eine metallische Nickelschicht auf','Añade una capa metálica de níquel','Aggiunge uno strato metallico di nichel','Ajoute une couche métallique de nickel','增加一层金属镍层'],
 'Removes free iron and supports the passive film; adds no layer':['Entfernt freies Eisen und unterstützt die Passivschicht; keine Auflage','Elimina el hierro libre y favorece la película pasiva; no añade capa','Rimuove il ferro libero e favorisce il film passivo; non aggiunge strati','Élimine le fer libre et favorise le film passif ; n’ajoute pas de couche','去除游离铁并促进钝化膜形成；不增加镀层'],
 'Dimensional effect':['Maßliche Auswirkung','Efecto dimensional','Effetto dimensionale','Effet dimensionnel','尺寸影响'],
 'Adds thickness; threads and fits need an allowance':['Erhöht die Dicke; Gewinde und Passungen brauchen eine Zugabe','Añade espesor; roscas y ajustes necesitan una tolerancia previa','Aggiunge spessore; filetti e accoppiamenti richiedono un sovrametallo','Ajoute de l’épaisseur ; filetages et ajustements nécessitent une réserve','增加厚度；螺纹和配合需预留余量'],
 'Negligible dimensional change':['Vernachlässigbare Maßänderung','Cambio dimensional despreciable','Variazione dimensionale trascurabile','Variation dimensionnelle négligeable','尺寸变化可忽略'],
 'Common reference':['Übliche Referenz','Referencia habitual','Riferimento comune','Référence courante','常用标准'],
 'ISO 4042 for electroplated fasteners':['ISO 4042 für galvanisch beschichtete Verbindungselemente','ISO 4042 para fijaciones electrolíticas','ISO 4042 per fissaggi elettrodepositati','ISO 4042 pour fixations à revêtement électrolytique','电镀紧固件参考 ISO 4042'],
 'ASTM A967 or ASTM A380':['ASTM A967 oder ASTM A380','ASTM A967 o ASTM A380','ASTM A967 o ASTM A380','ASTM A967 ou ASTM A380','ASTM A967 或 ASTM A380'],
 'Hydrogen risk':['Wasserstoffrisiko','Riesgo de hidrógeno','Rischio idrogeno','Risque hydrogène','氢脆风险'],
 'High-strength steel needs a hydrogen-embrittlement review':['Hochfester Stahl erfordert eine Prüfung auf Wasserstoffversprödung','El acero de alta resistencia requiere revisar la fragilización por hidrógeno','L’acciaio ad alta resistenza richiede una verifica dell’infragilimento da idrogeno','L’acier haute résistance nécessite une revue de fragilisation par l’hydrogène','高强度钢需评估氢脆风险'],
 'Not an electroplating process':['Kein galvanisches Verfahren','No es un proceso electrolítico','Non è un processo galvanico','Ce n’est pas un procédé électrolytique','不属于电镀工艺'],

 'At a glance: sampling vs 100% inspection':['Auf einen Blick: Stichprobe oder 100 % Prüfung','De un vistazo: muestreo o inspección al 100 %','In sintesi: campionamento o controllo al 100 %','En bref : échantillonnage ou contrôle à 100 %','一览：抽样检验与全检'],
 'Sampling inspection':['Stichprobenprüfung','Inspección por muestreo','Controllo a campione','Contrôle par échantillonnage','抽样检验'],
 '100% inspection':['100 % Prüfung','Inspección al 100 %','Controllo al 100 %','Contrôle à 100 %','全检'],
 'Coverage':['Umfang','Cobertura','Copertura','Couverture','覆盖范围'],
 'A defined sample from each lot':['Eine festgelegte Stichprobe aus jedem Los','Una muestra definida de cada lote','Un campione definito da ogni lotto','Un échantillon défini par lot','每批按规定抽取样本'],
 'Every part, for the named characteristics':['Jedes Teil, für die benannten Merkmale','Cada pieza, para las características indicadas','Ogni pezzo, per le caratteristiche indicate','Chaque pièce, pour les caractéristiques désignées','针对指定特性逐件检查'],
 'Stable processes and lower-risk characteristics':['Stabile Prozesse und Merkmale mit geringerem Risiko','Procesos estables y características de menor riesgo','Processi stabili e caratteristiche a rischio minore','Procédés stables et caractéristiques à moindre risque','稳定工艺和风险较低的特性'],
 'Functional or safety-relevant characteristics and unstable processes':['Funktions- oder sicherheitsrelevante Merkmale und instabile Prozesse','Características funcionales o de seguridad y procesos inestables','Caratteristiche funzionali o di sicurezza e processi instabili','Caractéristiques fonctionnelles ou de sécurité et procédés instables','功能或安全相关特性，以及不稳定的工艺'],
 'Typical methods':['Typische Methoden','Métodos típicos','Metodi tipici','Méthodes typiques','常用方法'],
 'Gauges and instruments under a plan such as ISO 2859-1':['Lehren und Messmittel nach einem Plan wie ISO 2859-1','Calibres e instrumentos según un plan como ISO 2859-1','Calibri e strumenti secondo un piano come ISO 2859-1','Calibres et instruments selon un plan tel que l’ISO 2859-1','按 ISO 2859-1 等抽样方案使用量规和量具'],
 'Optical (CCD) sorting, go/no-go gauging or functional checks':['Optische (CCD-)Sortierung, Gut-/Schlecht-Lehrung oder Funktionsprüfung','Clasificación óptica (CCD), calibre pasa/no pasa o comprobación funcional','Selezione ottica (CCD), calibri passa/non passa o prove funzionali','Tri optique (CCD), calibrage entre/n’entre pas ou contrôle fonctionnel','CCD 光学筛选、通止规检验或功能检查'],
 'Evidence':['Nachweis','Evidencia','Evidenze','Preuves','证据'],
 'Sample records and lot acceptance':['Stichprobenaufzeichnungen und Losfreigabe','Registros de muestra y aceptación del lote','Registrazioni del campione e accettazione del lotto','Enregistrements d’échantillon et acceptation du lot','抽样记录和批次判定'],
 'Sorting records, reject counts and system verification':['Sortierprotokolle, Ausschusszahlen und Systemverifizierung','Registros de clasificación, rechazos y verificación del sistema','Registrazioni di selezione, scarti e verifica del sistema','Enregistrements de tri, rebuts et vérification du système','筛选记录、剔除数量和设备验证'],
 'Characteristics, sampling plan and acceptance numbers':['Merkmale, Stichprobenplan und Annahmezahlen','Características, plan de muestreo y números de aceptación','Caratteristiche, piano di campionamento e numeri di accettazione','Caractéristiques, plan d’échantillonnage et critères d’acceptation','检验特性、抽样方案和接收数'],
 'Characteristics, method and how the system is verified':['Merkmale, Methode und wie das System verifiziert wird','Características, método y cómo se verifica el sistema','Caratteristiche, metodo e come si verifica il sistema','Caractéristiques, méthode et vérification du système','检验特性、方法以及设备如何验证']
};
export function applyComparisonTranslations(){
 const review={};for(const [source,[de,es,it,fr,zh]]of Object.entries(t))review[source]={de,es,it,fr,zh};
 for(const source of comparisonStrings())if(!review[source])throw Error('Missing comparison translation: '+source);
 fs.writeFileSync('translations/comparison-review.json',JSON.stringify(review,null,2)+'\n');
 for(const locale of ['de','es','it','fr','zh']){const file='translations/'+locale+'.json',dictionary=JSON.parse(fs.readFileSync(file,'utf8'));for(const [source,values]of Object.entries(review))dictionary[source]=values[locale];fs.writeFileSync(file,JSON.stringify(dictionary,null,2)+'\n');}
 return Object.keys(review).length;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/comparison-localization.mjs'))console.log('Applied comparison translations: '+applyComparisonTranslations());
