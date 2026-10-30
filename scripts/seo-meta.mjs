const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function enrichPageGraph({graph,schema,url,origin,title,description,body}){
 const imagePath=body.match(/<img[^>]+src="(\/images\/[^"?]+)(?:\?[^\"]*)?"/)?.[1]??'/images/custom-screws.webp';
 const image=origin+imagePath,organization=graph.find(s=>s['@type']==='Organization');
 if(organization)Object.assign(organization,{logo:{'@type':'ImageObject',url:origin+'/brand/zufek-symbol.webp',width:512,height:512},contactPoint:{'@type':'ContactPoint',contactType:'sales and engineering inquiries',email:'info@zufek.net'}});
 const breadcrumb=graph.find(s=>s['@type']==='BreadcrumbList');if(breadcrumb)breadcrumb['@id']=origin+url+'#breadcrumb';
 const page=graph.find(s=>s['@type']==='CollectionPage')??(schema?.['@type']==='CollectionPage'?schema:null);
 const common={'@id':origin+url+'#webpage',url:origin+url,name:title,description,inLanguage:'en',isPartOf:{'@id':origin+'/#website'},publisher:{'@id':origin+'/#organization'},primaryImageOfPage:{'@type':'ImageObject',url:image},...(breadcrumb?{breadcrumb:{'@id':breadcrumb['@id']}}:{})};
 if(['WebPage','ProfilePage'].includes(schema?.['@type']))Object.assign(schema,common);else if(page)Object.assign(page,common);else{const product=graph.find(s=>s['@type']==='Product');graph.push({'@context':'https://schema.org','@type':'WebPage',...common,...(product?{mainEntity:{'@id':product['@id']}}:{})});}
 if(['BlogPosting','TechArticle'].includes(schema?.['@type'])){schema['@id']=origin+url+'#article';schema.mainEntityOfPage={'@id':origin+url+'#webpage'};graph.find(s=>s['@type']==='WebPage').mainEntity={'@id':schema['@id']};}
 return '<meta property="og:site_name" content="ZUFEK PRECISION"><meta property="og:locale" content="en_US"><meta property="og:image" content="'+escape(image)+'"><meta property="og:image:alt" content="'+escape(title)+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+escape(title)+'"><meta name="twitter:description" content="'+escape(description)+'"><meta name="twitter:image" content="'+escape(image)+'"><meta name="twitter:image:alt" content="'+escape(title)+'">';
}
