// Human editorial review notes, not keyword-volume data or automated SEO gates.
// Each next step is a proposed increment; the report checks what already exists.
export const productNotes={
 'custom-screws':['custom screw manufacturer','采购＋设计工程师','图纸尚不完整时，怎样明确可报价条件并比较样品与量产方案？','增加匿名化的技术澄清单填写示例，记录已定接口、待定项、报价假设和样品批准事项。','C05,C06,C08,C09,C11,C18','P1'],
 'shoulder-screws':['custom shoulder screws','设计＋质量工程师','肩轴尺寸、轴向间隙和螺纹要求分别怎样验收？','保留现有极限间隙算例；下一步补配合孔与最终表面状态的同一张图纸评审示例，不再重复解释现有算式。','C09,C11,C14,C15,C18','P1'],
 'captive-screws':['custom captive screws','设计工程师＋采购','面板打开后螺丝怎样被保留，行程和配合螺纹怎样协调？','补一个面板、保持结构、打开及锁紧位置的双状态示意，标清保留与旋合是不同验收项。','C09,C12,C15','P1'],
 'special-head-screws':['custom special head screws','设计工程师＋采购','特殊头部是为工具空间、承压面还是防转服务？','按三种目的比较头部包络、工具操作空间和制造路线，避免与防拆槽型页面重复。','C08,C09,C12','P2'],
 'security-screws':['custom security screws','采购＋设计工程师','防拆槽型与配套工具、设备维护空间怎样匹配？','现有驱动验收表应保留；补已批准槽型与工具啮合示意，分别说明防随意拆卸和授权维护，不承诺绝对防盗。','C08,C12,C15','P1'],
 'hollow-screws':['custom hollow screws','设计＋工艺工程师','走线、流通与密封用途分别需要哪些孔道和验收信息？','保留用途矩阵；补螺纹牙底与交叉孔最小壁厚的标注示意，以及可进入的去毛刺/复检位置。','C09,C12,C14,C15','P1'],
 'flange-screws':['custom flange screws','设计＋装配工程师','加大法兰是否适合当前承压面和表面涂层？','用同一配合件比较光面、齿面及独立垫片的接触方式；列明哪些差异需要装配试验确认。','C08,C11,C13,C15','P1'],
 'knurled-thumb-screws':['custom knurled thumb screws','设计工程师＋采购','手指空间、调节行程及锁定要求能否同时满足？','补戴手套与邻近零件遮挡的操作包络示意，区分滚花握持、螺距调节和独立锁止。','C09,C12,C15','P1'],
 'set-screws':['custom set screws','设计＋装配工程师','哪种端型适合接触面和调整频率？','将端型选型文章的有效比较入口提前，补配合孔或平面的接口示例；不从牙径推算通用保持力。','C09,C12,C13,C15','P1'],
 't-slot-bolts':['custom T-slot bolts','设计工程师＋采购','T头能否装入槽口、转位并贴合槽肩？','补插入方向、旋转扫掠包络和槽肩承压面的装配顺序图，而不是只列头宽头厚。','C08,C10,C12','P2'],
 'eye-bolts':['custom eye bolts for articulated joints','设计工程师＋采购','环孔或叉头怎样与销轴形成允许摆动的连接？','补销轴直径、配合宽度和摆角的接口图；与专门吊装设计页面明确分工。','C09,C10,C15','P2'],
 'lifting-eye-bolts':['custom lifting eye bolt designs','设计＋质量工程师','定制吊环的设计责任、载荷方向和放行依据是什么？','优先整理经批准设计、试验及追溯的交付清单；没有验证文件时维持设计评审表述，不发布额定载荷或认证暗示。','C10,C13,C15,C21','P1'],
 'u-bolts':['custom U bolts','设计工程师＋采购','U形尺寸与管件或支架怎样定义，弯曲后两腿怎样对齐？','提供内宽、弯曲半径、腿长、两端螺纹及配合座的标注示例；载荷和预紧要求由实际连接确定。','C12,C13,C15','P2'],
 'square-head-bolts':['custom square head bolts','设计工程师＋采购','方头用于扳手操作还是被槽口捕获防转？','比较两类用途的头部间隙、角部避空及安装方向，避免把一种配合方案当作通用尺寸。','C08,C10,C12','P2'],
 'carriage-bolts':['custom carriage bolts','设计＋装配工程师','非标方颈怎样与面板配合防转，同时让头部贴合？','补方颈长度、孔口与板厚的剖面示例，分别检查防转和头部落座。','C08,C12,C13','P2'],
 'eccentric-screws':['custom eccentric adjustment screws','设计＋检测工程师','偏心量、基准轴和角位置怎样共同决定调节？','提供明确基准的偏心调节示意及检测定位说明，不只展示外形或名义偏心量。','C09,C12,C15','P2'],
 'double-ended-studs':['custom double ended studs','采购＋设计工程师','两端不同螺纹如何识别，安装先后与有效旋合怎样确定？','用A/B端标识示例列明牙型、旋向、有效牙长和扳手位，补混料识别及包装要求。','C09,C12,C17','P2'],
 'fine-thread-screws':['custom fine pitch screws','设计工程师＋采购','细牙能提供怎样的名义位移，怎样验收实际调节？','用一圈位移、反向间隙和接触端条件区分螺距与实际调节性能，关联量规和最终表面状态。','C09,C12,C15','P2'],
 'special-thread-profiles':['custom special thread profiles','设计＋工艺工程师','特殊牙型应该用哪些参数和验收依据定义？','给牙型截面填写示例，分别记录导程、螺距、旋向、配合件和验收方法，不把所有特殊牙合并为一种能力。','C09,C12,C15','P2'],
 'modified-tip-self-tapping-screws':['custom self tapping screw tips','设计＋制造工程师','尾端、底孔和被连接材料怎样共同影响安装？','补尾端、底孔及板厚的试装记录模板，明确排屑和安装验证，不承诺无碎屑或绝不顶穿。','C08,C12,C13,C15','P2'],
 'reduced-shank-screws':['custom reduced shank screws','设计＋质量工程师','缩杆段的实际目的是什么，过渡区域怎样评审？','补截面、圆角和功能要求的图纸示例；疲劳或弹性效果仅在有相应设计验证时陈述。','C09,C11,C15','P2'],
 'tapered-screws':['custom tapered shank screws','设计＋检测工程师','锥面如何定位，锥度和螺纹之间怎样建立基准？','补锥面长度、角度/锥度、轴向位置及接触验证的示例，区分定位与密封用途。','C09,C12,C15','P2'],
 'locating-pin-screws':['screws with integral locating pins','设计＋质量工程师','定位销与螺纹或肩轴之间的位置关系怎样表达？','补同轴与非同轴两种基准关系示意，并说明量规、尺寸测量和位置关系检查的分工。','C09,C12,C15','P2'],
 'double-ended-shoulder-screws':['custom double ended shoulder screws','设计＋装配工程师','两端连接先后顺序会不会改变中间定位和旋合状态？','补两个接头共享肩轴的装配顺序及端面基准图，记录拧紧第一端后第二端的验收条件。','C09,C11,C12','P2'],
 'cross-drilled-screws':['custom cross drilled screws','设计＋工艺工程师','横孔用于穿销、保险线还是流通，孔口与孔位如何验收？','按孔用途展示孔位基准与毛刺可达性；将功能要求与简单外轮廓检查区分。','C09,C12,C15','P2'],
 'multi-step-screws':['custom multi step screws','设计＋检测工程师','多级台阶如何避免逐级尺寸的累积误差？','补以共同基准表达多级定位的图纸示意及处理前后测量计划，不给出未经确认的通用同轴度。','C09,C11,C15','P2'],
 'custom-clinch-fasteners':['custom clinch screws and studs','设计＋质量工程师','压铆结构怎样与板材、孔和安装条件共同确认？','提供板厚、硬度、孔与压装条件的联合填写表；推出力/扭出力由实际试验约定，不套用品牌标准件额定值。','C08,C12,C15','P2']
};
export const processNotes={
 'cold-heading':['custom screw cold heading','采购＋工艺工程师','哪些特征适合成型，哪些仍要二次加工？','用一个零件逐特征标记成型与机加工分界，并补设备/外协范围确认记录。','C08,C11','P1'],
 'cnc-turning':['CNC Swiss turning custom screws','设计工程师＋采购','走心与走刀怎样按细长比、支撑和局部特征比较？','给两类装夹与工序的对照示意，记录可公开的机型、工件条件和外协范围，避免泛称高精度。','C09,C12','P1'],
 'hot-forging':['hot forged custom bolts','采购＋工艺工程师','热锻坯料后还需要哪些切削、热处理和检验？','补锻坯到最终件的工序/基准示例，并核实自制与外协、材料和试验范围。','C10,C13,C15','P2'],
 'hybrid-manufacturing':['cold heading with secondary machining','采购＋工艺工程师','同一成品图纸的复合路线怎样比较完整费用？','保留已有费用算例；补成型特征、精加工表面和验收工序的对应关系，不重复增加成本段落。','C08,C09,C11','P1'],
 'threading':['thread rolling vs cutting for custom screws','设计＋工艺工程师','牙型、材料状态和数量怎样决定螺纹加工方案？','补外牙滚/切与内牙攻/挤的功能比较，列出完整牙长、表面状态和各自验收方法。','C12,C15','P2'],
 'secondary-machining':['secondary machining custom screws','设计＋制造工程师','哪些局部特征需要新装夹，哪些表面会改变后续验收？','补孔、铣扁、退刀槽和磨削的工序卡示例，标明定位基准、毛刺与复检位置。','C09,C12,C15','P2'],
 'heat-treatment':['heat treatment for custom screws','采购＋质量工程师','材料牌号、交付状态和最终机械要求怎样对应？','核对实际处理渠道及可交付记录，补区分来料证明、热处理批次和最终检验的匿名模板。','C13,C16,C17','P1'],
 'surface-treatment':['surface finishes for custom screws','采购＋质量工程师','涂层怎样与基材、尺寸、腐蚀和装配要求共同定义？','补处理规范填写例与供应链责任范围；盐雾、摩擦或除氢声明仅按真实记录及适用条件列出。','C13,C15,C16','P1'],
 'post-processing':['fastener cleaning locking and assembly','制造＋质量工程师','去毛刺、清洗、防松和预装配分别交付什么结果？','补清洁度/防松材料/预装件的输入和记录样式，区分内部筛查与外部试验。','C12,C13,C15,C17','P2'],
 'inspection':['CCD screw inspection','质量工程师＋采购','CCD能检查哪些可成像特征，哪些还需其他测量？','现有CCD图片是说明图，不能证明工厂设备；优先取得真实设备/程序验证资料及脱敏报告，明确外协检测范围。','C14,C15,C22','P1'],
 'process-routes':['custom screw manufacturing route selection','采购＋工艺工程师','打样和量产的路线、审批及关键验收如何衔接？','为三条现有路线补工序输入、输出、处理后复检与变更责任表，保留不同路线的真实能力边界。','C08,C09,C10,C11,C13','P2']
};
export const materialNotes={
 'carbon-alloy-steel':['carbon alloy steel custom screws','采购＋设计工程师','C45、42CrMo4、4140与成品等级之间怎样选择？','补一份指定牌号、交付状态和成品要求的填写例；相近牌号仅作比较，不默认等同。','C13,C16','P2'],
 '10b21-boron-steel':['10B21 custom screws','工艺＋质量工程师','10B21来料、成型及热处理状态怎样分别验收？','补线材身份、成型状态与最终要求的分阶段记录，避免由牌号直接推定强度或渗碳工艺。','C08,C13,C16','P2'],
 'stainless-steel-304-316':['304 vs 316 stainless steel screws','采购＋设计工程师','环境选材和成品强度如何分别确认？','保留现有应用比较及填写表；后续接入脱敏材料记录，不把材料证明当成成品强度证明。','C16,C22','P1'],
 'aluminum-alloys':['aluminum alloy custom screws','设计工程师＋采购','不同铝合金和状态如何影响螺纹、磨损和处理？','以现有牌号表为基础补状态、螺纹旋合和阳极后尺寸的联合填写例。','C13,C16','P2'],
 'copper':['copper custom screws','设计工程师＋采购','导电需求与机械连接怎样共同选铜牌号和表面？','给电接触与机械固定两种用途的规格对比，电阻和接触性能仅在具体试验下确认。','C13,C16','P2'],
 'brass':['brass custom screws','采购＋设计工程师','黄铜切削性能、环境和成分限制怎样共同约定？','补具体牌号、产品形态和客户成分限制的采购填写示例，不由外观判定无铅或合规。','C16','P2'],
 'titanium-alloys':['titanium alloy custom screws','设计＋质量工程师','Grade 2与Ti-6Al-4V怎样按功能和最终状态比较？','将现有牌号比较落到一份采购要求例；认证、追溯、咬合与特殊行业要求分别确认。','C16,C21','P2']
};
export const industryNotes={
 'automotive-components':['custom screws automotive components','采购＋设计＋质量工程师','是否理解模块盖、涂装支架和定位接口的不同要求？','保留现有接口矩阵；企业确认的供应链背景需对应脱敏项目材料及公开授权，不能扩大为直接OEM认可。','C07,C17,C19,C21','P1'],
 'industrial-automation':['custom fasteners industrial automation','设计工程师＋采购','定位、转动和调节分别适合哪种结构与检验？','补三种机构接口的简明比较，并把现有治具设计示例置于明确的设计/验证语境。','C09,C11,C15,C19','P1'],
 'electronics-optics':['custom screws electronics optical equipment','设计工程师＋采购','小型外壳、精密调节与光学模组的紧固需求如何区分？','补工具空间、接触端、清洁和装配损伤的接口示例，不笼统承诺微小公差或光学性能。','C09,C12,C15','P2'],
 'energy-equipment':['custom screws charging energy storage equipment','采购＋设计＋质量工程师','外壳维护、走线与指定电连接分别需要什么证据？','用设备接口区分机械固定、孔道和电接触，关联行业洞察；不要把电池产品或认证套到螺丝网站。','C13,C15,C16,C19','P1'],
 'molds-fixtures':['custom screws molds test fixtures','设计＋制造工程师','定位、止挡、磨损和重复调整怎样反映在图纸上？','补夹具止挡与旋转配合的对照，记录配合件状态和更换件验收。','C09,C11,C15','P2'],
 'security-equipment':['tamper resistant screws security equipment','采购＋设计工程师','怎样兼顾限制随意拆卸与授权维护？','补外壳工具通道、配套驱动和维护顺序，避免将防拆外形表述为认证安全等级。','C12,C15','P2'],
 'fluid-control':['hollow screws fluid pneumatic equipment','设计＋质量工程师','孔道、密封与承压分别由什么要求和测试控制？','补介质、温度、压力、密封及清洁要求的接口表，压力适用性依实际设计和试验确认。','C09,C12,C15','P1'],
 'general-machinery':['custom fasteners machinery','采购＋设计工程师','不同机械连接怎样选择紧固、定位与调节结构？','补三类连接的产品/工艺路径，不重复罗列所有产品，载荷与装配要求按实际零件确认。','C08,C09,C15,C17','P2']
};
export const specialNotes={
 '/':['custom screw manufacturer','采购＋工程师','ZUFEK做什么，怎样快速找到相关零件和制造依据？','保留现有产品、行业和材料入口；把真实能力资料与公司身份集中关联，首页无需继续堆技术段落。','C01,C02,C03,C04,C05,C06,C18','P1'],
 '/about/':['custom fastener manufacturer Dongguan','采购／供应商审核','企业身份、位置、经验和供应链背景有哪些可核对依据？','用证据索引补齐身份、成立时间、产能与供应链表述的依据；待公开授权的资料只保留准确摘要。','C01,C02,C03,C04,C05,C06,C07,C18','P1'],
 '/quality/':['custom screw inspection records','质量工程师＋采购','哪些质量记录可以在订单中约定，哪些已有实证？','保留新检验模板，优先归档真实检验、校准和外部试验记录；实物照片与空白表不等于检验能力证明。','C14,C15,C17,C18,C22','P1'],
 '/products/':['custom screw types manufacturer','采购＋设计工程师','应该从功能结构进入哪种产品，而不是选哪个标准库存SKU？','为产品入口建立按定位、孔道、承压、防拆、调节的选择分工，不以通用products catalog作为核心排名词。','C08,C09,C18','P1'],
 '/products/core-custom-screws/':['custom screw types shoulder hollow flange','采购＋设计工程师','常用非标结构各解决什么装配需求？','在现有卡片之外补一张用途与接口的轻量对照，避免重复产品总览正文。','C08,C09','P2'],
 '/products/special-head-bolts/':['custom special head bolts','设计工程师＋采购','T头、方头、活节和吊环的用途怎样区分？','按安装、防转、铰接和吊装分别引导，特别区分普通活节与经验证的吊装设计。','C08,C10,C15','P2'],
 '/products/special-thread-screws/':['custom threads and shanks','设计＋工艺工程师','特殊牙型、尾端或变径功能应该进入哪个详细页？','明确按传动/调节、安装、截面和定位分流，避免细牙与特殊牙型页争抢同一说明。','C09,C12','P2'],
 '/products/compound-structure-screws/':['custom compound feature screws','设计＋质量工程师','复合特征怎样共用基准并分别验收？','补带销、多台阶、双头及压铆的接口分工，链接对应测量与装配要求。','C09,C11,C12,C15','P2'],
 '/capabilities/':['custom screw manufacturing processes','采购＋工艺工程师','四条主路线和后续工序怎样组成完整制造方案？','在现有工序导航上标出能力确认范围、自制/外协状态及可交付记录，不用示意设备图冒充工厂实拍。','C08,C09,C10,C11,C12,C13,C14,C15','P1'],
 '/materials/':['custom screw material selection','采购＋设计工程师','材料族、具体牌号、最终状态和成品要求怎样比较？','保留带条件的强度参考与牌号入口；补用途导向，不再把不同材料的单一强度值直接排名。','C16','P1'],
 '/industries/':['custom fastener applications industries','采购＋设计工程师','本行业的哪些装配接口与ZUFEK产品相关？','按行业接口引导产品与工艺，行业总览图只作场景说明，不作为已服务客户的证据。','C07,C19,C21','P1']
};

export const noteFor=route=>{
 if(specialNotes[route])return specialNotes[route];
 const [,group,slug]=route.split('/');
 return ({products:productNotes,capabilities:processNotes,materials:materialNotes,industries:industryNotes}[group]||{})[slug];
};
