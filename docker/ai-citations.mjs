export function citationURL(value){try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;u.hash='';return u.href;}catch{return null;}}
export function reconcileDraftSources(draft,evidence){
 const registry=new Map();for(const e of evidence){const canonical=citationURL(e.url);if(!canonical)continue;for(const value of [e.url,...(e.aliases||[])]){const key=citationURL(value);if(key)registry.set(key,e.url);}}
 const missing=[];const match=url=>{const key=citationURL(url),found=key&&registry.get(key);if(found)return found;missing.push(String(url||'').slice(0,1500));return url;};
 const result={...draft,sources:Array.isArray(draft.sources)?draft.sources.map(s=>({...s,url:match(s.url)})):draft.sources};
 if(draft.article)result.article={...draft.article,sources:Array.isArray(draft.article.sources)?draft.article.sources.map(s=>Array.isArray(s)?[s[0],match(s[1])]:s):draft.article.sources};
 return {result,missing:[...new Set(missing)],allowed:evidence.map(e=>e.url)};
}
