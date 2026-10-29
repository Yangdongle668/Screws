import fs from 'node:fs';
const file='translations/zh-editorial.json',d=JSON.parse(fs.readFileSync(file,'utf8'));
Object.assign(d,{
 'Where this design fits':'典型应用', 'What to include in the RFQ':'询价时请提供', 'Make the features work together.':'结合零件结构选择加工工艺', 'Useful technical reading':'相关技术文章', 'Follow a complete application design':'查看完整的应用设计示例', 'Material & final condition':'材料与交付状态', 'Connect the part to its requirements.':'从零件结构延伸到材料、工艺与验收', 'RELATED SPECIFICATION TOPICS':'相关技术要求', 'Review the route before fixing the quote':'报价前先确认加工方案', 'From drawing to approved sample':'从图纸评审到样品确认', 'DRAWING-DEFINED FEATURES':'按图确认的关键结构', 'RELEVANT PROCESS OPTIONS':'可评估的加工工艺', 'Related product designs':'相关产品结构', 'Common specification questions':'常见技术问题', 'Interface':'配合部位', 'What to define':'需要明确的要求', 'Verification discussion':'检测与验收方法', 'Axial shoulder length':'台阶轴向长度', 'Multi-Step & Multi-Shoulder Screws':'多台阶螺丝', 'Considered solutions.':'结合应用需求制定方案。', 'Let’s connect':'联系我们', 'Explore':'产品与能力', 'Knowledge':'技术资料',
 'Shoulder & Step Screws to Drawing':'台阶螺丝定制｜塞打螺丝按图加工',
 'Shoulder fits, thread classes and when grinding matters':'台阶配合、螺纹等级与磨削工艺的选择',
 'Use the required surface method; a silhouette does not establish texture':'按规定方法检测表面粗糙度，外轮廓影像不能代替粗糙度测量',
 'A practical guide to shoulder screw drawings':'台阶螺丝图纸设计与询价指南',
 'How to prepare an inspection plan for custom screws':'非标螺丝检测计划怎么制定',
 'Special Screw Drive & Security Recess Guide':'特殊驱动槽与防拆槽型选型指南',
 'How to specify a tamper-resistant screw drive':'防拆螺丝槽型的选型与标注',
 'Five questions before specifying a captive screw':'选用松不脱螺丝前需要确认的五个问题',
 'Clear specifications. Considered solutions.':'要求沟通清楚，方案结合实际。',
 'These routes are options for technical review. The approved drawing, quantity and material determine the actual sequence.':'以上工艺供技术评审时比较，实际加工顺序需结合确认图纸、数量和材料确定。',
 'Explore a proposed assembly, fastener selection, manufacturing review and sample-validation plan. This is an illustrative design study, with no claimed customer delivery or measured performance.':'通过设计示例了解装配结构、紧固件选型、加工评审和样品验证的完整思路。示例用于说明设计方法，不代表客户交付案例，也不包含实测性能承诺。',
 'Review these related topics for this design or route. Grade, treatment, geometry and acceptance remain drawing-specific.':'可结合以下材料与技术资料进一步确认设计方案。材料牌号、处理方式、结构尺寸和验收要求仍以具体图纸为准。'
});
fs.writeFileSync(file,JSON.stringify(d,null,2)+'\n');
