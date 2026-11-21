import assert from 'node:assert/strict';
import {createCompletionStream} from './ai-provider.mjs';
const frame=v=>Buffer.from('data: '+JSON.stringify(v)+'\n\n');

// A finished message is kept even when the gateway omits the [DONE] marker.
const noDone=createCompletionStream();
noDone.push(frame({id:'a',choices:[{delta:{content:'complete '}}]}));
noDone.push(frame({choices:[{delta:{content:'article'},finish_reason:'stop'}]}));
const finished=JSON.parse(noDone.end());
assert.equal(finished.choices[0].message.content,'complete article');
assert.equal(finished.choices[0].finish_reason,'stop');

// A stream that stops before any finish_reason still fails, but exposes the received text.
const broken=createCompletionStream();
broken.push(frame({choices:[{delta:{content:'partial body'}}]}));
assert.deepEqual(broken.snapshot(),{content:'partial body',finish:null});
assert.throws(()=>broken.end(),e=>e.code==='STREAM_INTERRUPTED'&&e.partial?.content==='partial body'&&!Object.keys(e).includes('partial'));

// The normal [DONE] path is unchanged.
const normal=createCompletionStream();
normal.push(frame({choices:[{delta:{content:'x'},finish_reason:'stop'}]}));
normal.push(Buffer.from('data: [DONE]\n\n'));
assert.equal(JSON.parse(normal.end()).choices[0].message.content,'x');
console.log(JSON.stringify({finishedWithoutDoneKept:true,interruptedKeepsPartial:true,doneMarkerPath:true}));
