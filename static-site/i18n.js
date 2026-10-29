(()=>{const node=document.getElementById('locale-ui');let data={locale:'en',messages:{}};try{if(node)data=JSON.parse(node.textContent);}catch{}const locale=data.locale;const t=(key,values={})=>Object.entries(values).reduce((text,[name,value])=>text.replaceAll('{'+name+'}',String(value)),data.messages[key]??key);window.ZufekI18n={locale,t,path:path=>locale==='en'?path:'/'+locale+(path==='/'?'/':path)};document.querySelectorAll('.filter-grid .article-card').forEach(card=>{if(!card.dataset.category)card.dataset.category=card.querySelector('.article-line span')?.textContent;});
 const menu=document.querySelector('.language-switcher'),details=menu?.querySelector('details');if(!menu)return;
 const links=[...menu.querySelectorAll('a[data-language]')],supported=links.map(a=>a.dataset.language);
 const remember=value=>{try{localStorage.setItem('zufek_language',value);sessionStorage.setItem('zufek_language_visit','1');}catch{}};
 for(const link of links){link.href+=location.search+location.hash;link.addEventListener('click',()=>remember(link.dataset.language));}
 document.addEventListener('click',event=>{if(!menu.contains(event.target))details.open=false;});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&details.open){details.open=false;details.querySelector('summary').focus();}});
 // Explicit localized URLs stay stable; negotiate only the first English entry.
 let visited=false,preferred='';try{visited=sessionStorage.getItem('zufek_language_visit')==='1';preferred=localStorage.getItem('zufek_language')||'';sessionStorage.setItem('zufek_language_visit','1');}catch{}
 let internal=false;try{internal=new URL(document.referrer).origin===location.origin;}catch{}
 if(locale!=='en'||visited||internal||/bot|crawler|spider|headless/i.test(navigator.userAgent))return;
 const browserLanguage=(navigator.languages?.length?navigator.languages:[navigator.language]).map(tag=>String(tag).toLowerCase().split('-')[0]).find(tag=>supported.includes(tag));
 const target=supported.includes(preferred)?preferred:browserLanguage;
 if(target&&target!==locale){const link=links.find(a=>a.dataset.language===target);if(link)location.replace(link.href);}
})();
