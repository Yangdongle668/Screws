import fs from 'node:fs';
import {llmsText} from '../lib/seo/templates.mjs';
export function writeLlmResources(_pages,origin){const records=JSON.parse(fs.readFileSync('lib/seo/pages.json','utf8')),texts=JSON.parse(fs.readFileSync('lib/seo/texts.json','utf8'));for(const full of [false,true])fs.writeFileSync('static-site/llms'+(full?'-full':'')+'.txt',llmsText(records,origin,'en','',full,texts));}
