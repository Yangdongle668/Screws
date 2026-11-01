export function sourceAssessment(url,title='',text='',query=''){
 const combined=(String(url)+' '+title).toLowerCase(),technical=/technical|engineering|knowledge|toleran|datum|gd.?t|metrology|inspection|specification|white.?paper|research|publication/.test(combined),catalogue=/catalog|\/products?(?:\/|$)|\/shop(?:\/|$)|product range|product index|catalogue/.test(combined);
 const tokens=[...new Set(String(query).toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>3&&!['screw','screws','custom','fastener','fasteners','technical','guide','with','from','that','this'].includes(t)))];
 const hay=(combined+' '+String(text).toLowerCase()),matchedTerms=tokens.filter(t=>hay.includes(t));
 return {kind:technical?'technical_candidate':catalogue?'catalogue_or_hub':'unclassified',matchedTerms,priority:(technical?8:catalogue?-5:0)+matchedTerms.length,notice:'Page-type and term-match hints only; not proof that a claim is supported.'};
}
