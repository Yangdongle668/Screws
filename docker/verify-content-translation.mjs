import assert from "node:assert/strict";
import {
  normalizeContentTranslations,
  translateContentFields,
} from "./content-translation.mjs";
const fields = [
  { key: "original-a", text: "Accept all", label: "button" },
  { key: "original-b", text: "Necessary", label: "strong" },
];
for (const response of [
  { "original-a": "Tout accepter", "original-b": "Nécessaire" },
  {
    translations: { "original-a": "Tout accepter", "original-b": "Nécessaire" },
  },
  {
    data: {
      translations: [
        { id: "original-b", text: "Nécessaire" },
        { id: "original-a", translation: "Tout accepter" },
      ],
    },
  },
])
  assert.deepEqual(normalizeContentTranslations(response, fields), {
    "original-a": "Tout accepter",
    "original-b": "Nécessaire",
  });
assert.deepEqual(
  normalizeContentTranslations(["wrong order", "unidentified"], fields),
  {},
);
assert.throws(() =>
  normalizeContentTranslations(
    {
      translations: [
        { id: "original-a", text: "One" },
        { id: "original-a", text: "Two" },
      ],
    },
    fields,
  ),
);
const translated = await translateContentFields(
  fields,
  "fr",
  async (messages) => {
    const request = JSON.parse(messages[1].content);
    assert.equal(request.fields[0].id, "f1");
    return {
      translations: [
        { id: "f2", text: "Nécessaire" },
        { id: "f1", text: "Tout accepter" },
      ],
    };
  },
);
assert.deepEqual(translated, {
  "original-a": "Tout accepter",
  "original-b": "Nécessaire",
});
assert.deepEqual(
  await translateContentFields(fields, "fr", async () => ({
    translations: [{ id: "f2", text: "Nécessaire" }],
  })),
  { "original-b": "Nécessaire" },
);
console.log(
  "PASS response wrappers, explicit IDs, reordered entries, partial results and ambiguous output rejection",
);
