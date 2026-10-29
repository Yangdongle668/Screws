import sharp from 'sharp';
import {statSync} from 'node:fs';
for(const slug of ['automotive-module-enclosure','automation-pivot-fixture']){
 const input='../outputs/application-images/'+slug+'.png';
 await sharp(input).resize({width:1200,height:800,fit:'cover'}).webp({quality:85}).toFile('public/images/application-'+slug+'.webp');
 await sharp(input).resize({width:560,height:373,fit:'cover'}).webp({quality:81}).toFile('public/images/application-'+slug+'-small.webp');
 console.log(slug,statSync('public/images/application-'+slug+'.webp').size,'bytes');
}
