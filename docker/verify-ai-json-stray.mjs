import assert from 'node:assert/strict';
import {decodeModelJSON,removeStrayClosers} from './ai-json-recovery.mjs';
// The production failure: an extra "}" closed the root object, followed by more keys.
const early='{"status":"OUTLINE","sections":[{"heading":"Fit","answer":"Check the bore."}],"notes":["Confirm ZUFEK\'s approved scope before describing it as an offering."]},"proposedLedgerTransition":{"state":"outline_proposed","task":"t1"}}';
assert.throws(()=>JSON.parse(early));
const decoded=decodeModelJSON(early);
assert.equal(decoded.mode,'local_syntax');assert(decoded.repairs.includes('removed_stray_closing_bracket'));
assert.equal(decoded.value.proposedLedgerTransition.state,'outline_proposed');assert.equal(decoded.value.sections[0].answer,'Check the bore.');
// Brackets inside strings are never touched; a mismatched closer is removed.
assert.equal(removeStrayClosers('{"a":"x}]y","b":[1,2}]}').text,'{"a":"x}]y","b":[1,2]}');
assert.equal(removeStrayClosers('{"a":"say \\"}\\" ok"}').removed,0);
// More than three stray brackets is treated as broken output and still fails.
assert.throws(()=>decodeModelJSON('{"a":1}}}}},"b":2}'));
// Valid JSON is unchanged.
assert.equal(decodeModelJSON('{"a":[1,{"b":2}]}').mode,'strict');
console.log(JSON.stringify({earlyRootCloseRepairedLocally:true,stringsUntouched:true,boundedRepairs:true}));
