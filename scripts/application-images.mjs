export function applicationImage(slug,{hero=false}={}){
 const title=slug==='automotive-module-enclosure'?'Automotive module enclosure with custom integral-flange screws':'Automation fixture with a shoulder-screw pivot and separate knurled adjustment screw';
 return `<figure class="application-image"><img src="/images/application-${slug}.webp" srcset="/images/application-${slug}-small.webp 560w, /images/application-${slug}.webp 1200w" sizes="${hero?'(max-width: 800px) 90vw, 90vw':'(max-width: 700px) 90vw, 42vw'}" width="1200" height="800" loading="${hero?'eager':'lazy'}" decoding="async" alt="${title}; illustrative application concept"><figcaption>Application concept visualization · not a customer installation or dimensioned drawing</figcaption></figure>`;
}
