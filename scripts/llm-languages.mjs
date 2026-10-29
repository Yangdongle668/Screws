import fs from 'node:fs';
import {llmsText} from '../lib/seo/templates.mjs';
export function writeLanguageLlms(_pages,origin){const records=JSON.parse(fs.readFileSync('lib/seo/pages.json','utf8')),texts=JSON.parse(fs.readFileSync('lib/seo/texts.json','utf8'));for(const locale of ['de','es','it','zh','fr'])for(const root of ['static-site']){fs.mkdirSync(root+'/'+locale,{recursive:true});for(const full of [false,true])fs.writeFileSync(root+'/'+locale+'/llms'+(full?'-full':'')+'.txt',llmsText(records,origin,locale,'',full,texts));}}
