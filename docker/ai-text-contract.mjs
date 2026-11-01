// Line-delimited typed fields: body text never needs JSON escaping.
export const TEXT_CONTRACT=`OUTPUT TRANSPORT OVERRIDE (takes precedence over all JSON-output instructions):
Return ZUFEK_FIELDS_V1 fixed-format text, NOT JSON and NOT code fences.
Represent the complete requested object using typed field blocks and JSON Pointer paths.
First line: ZUFEK_FIELDS_V1
Each block starts with: @@FIELD <type> <path>
Then its raw value on subsequent lines, followed by a line containing exactly @@END.
Types: string, number, boolean, null, object, array. Container blocks have no value.
Declare every object/array before its children. Root is an object at path /.
Array children use contiguous indices starting at 0. Empty arrays still need an array block.
Escape path components only: ~ becomes ~0 and / becomes ~1. Never escape body text.
A string block may contain real paragraph breaks, quotes, Markdown and backslashes unchanged.
Reserved marker lines must not occur inside values. Finish with ZUFEK_FIELDS_END on its own line.
Example:
ZUFEK_FIELDS_V1
@@FIELD object /
@@END
@@FIELD string /status
READY_FOR_REVIEW
@@END
@@FIELD object /article
@@END
@@FIELD string /article/intro
Choose the "bearing face" first.

Then define the shoulder fit.
@@END
@@FIELD array /article/checklist
@@END
@@FIELD string /article/checklist/0
Confirm the mating surface.
@@END
ZUFEK_FIELDS_END
The example is not a complete article. Include ALL fields required by the supplied article or translation contract, including SEO, sections, lists and workflow status. Do not return JSON serialized inside string blocks.`;
export function parseTextContract(raw){
 const lines=String(raw).replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim().split('\n');
 if(lines.shift()!=='ZUFEK_FIELDS_V1'||lines.pop()!=='ZUFEK_FIELDS_END')throw Error('固定格式缺少开始或结束标记');
 let root;const nodes=new Map();let count=0;
 while(lines.length){if(lines[0]===''){lines.shift();continue;}const header=lines.shift().match(/^@@FIELD (string|number|boolean|null|object|array) (\/\S*)$/);if(!header)throw Error('固定字段标记无效');const [,type,pointer]=header;const body=[];while(lines.length&&lines[0]!=='@@END'){if(lines[0].startsWith('@@FIELD '))throw Error('字段缺少结束标记：'+pointer);body.push(lines.shift());}if(lines.shift()!=='@@END')throw Error('字段未结束：'+pointer);if(nodes.has(pointer)||++count>3000)throw Error('字段重复或过多：'+pointer);
 const text=body.join('\n');let value;if(type==='string')value=text;else if(type==='object'||type==='array'||type==='null'){if(text)throw Error('容器或空值字段不应有正文：'+pointer);value=type==='object'?{}:type==='array'?[]:null;}else if(type==='boolean'){if(!['true','false'].includes(text))throw Error('布尔字段无效：'+pointer);value=text==='true';}else{if(!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(text)||!Number.isFinite(Number(text)))throw Error('数字字段无效：'+pointer);value=Number(text);}
 if(pointer==='/'){if(root!==undefined||type!=='object')throw Error('根字段必须是对象');root=value;}else{const cut=pointer.lastIndexOf('/'),parent=nodes.get(cut===0?'/':pointer.slice(0,cut)),key=pointer.slice(cut+1).replace(/~1/g,'/').replace(/~0/g,'~');if(['__proto__','constructor','prototype'].includes(key))throw Error('字段名不允许');if(!parent||typeof parent!=='object')throw Error('缺少父字段：'+pointer);if(Array.isArray(parent)){if(String(parent.length)!==key)throw Error('数组序号不连续：'+pointer);parent.push(value);}else{if(Object.hasOwn(parent,key))throw Error('字段重复：'+pointer);parent[key]=value;}}
 nodes.set(pointer,value);
 }
 if(!root)throw Error('缺少根字段');return root;
}
