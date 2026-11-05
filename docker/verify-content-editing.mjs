import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openDatabase } from "./storage.mjs";
import { contentPages, editableFields } from "../dist/docker/api.mjs";
import { createContentService } from "./content-service.mjs";
const data = await fs.mkdtemp(path.join(os.tmpdir(), "zufek-content-"));
const db = openDatabase(path.join(data, "qa.sqlite"), "drizzle");
const render = async (p) =>
  new Response(
    await fs.readFile(path.join("static-site", p, "index.html"), "utf8"),
    { headers: { "Content-Type": "text/html" } },
  );
let service = await createContentService({
  db,
  render,
  translateFields: async (fields, locale) =>
    Object.fromEntries(fields.map((f) => [f.key, locale + " " + f.text])),
});
const get = async (scope = "@cookie", locale = "en") =>
  (
    await service.handle(
      new Request(
        "http://localhost/api/admin/content-document?scope=" +
          encodeURIComponent(scope) +
          "&locale=" +
          locale,
      ),
      "content-document",
    )
  ).json();
const post = async (action, input) =>
  service.handle(
    new Request("http://localhost/api/admin/" + action, {
      method: "POST",
      headers: {
        Origin: "http://localhost",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }),
    action,
  );
const front = async (p = "/") =>
  (await service.transform(await render(p), p)).text();
try {
  let doc = await get();
  assert(doc.fields.length > 10);
  const f =
    doc.fields.find((f) => f.kind === "text" && f.source.includes("Cookie")) ||
    doc.fields.find((f) => f.kind === "text");
  const value = "New cookie copy <img src=x onerror=alert(1)>";
  let r = await post("content-save", {
    scope: "@cookie",
    locale: "en",
    revision: 0,
    values: { [f.key]: value },
  });
  assert.equal(r.status, 200);
  assert(!(await front()).includes("New cookie copy"));
  assert.equal(
    (
      await post("content-save", {
        scope: "@cookie",
        locale: "en",
        revision: 0,
        values: {},
      })
    ).status,
    409,
  );
  const preview = await (
    await post("content-preview", {
      scope: "@cookie",
      locale: "en",
      revision: 1,
    })
  ).json();
  assert(preview.html.includes("&lt;img"));
  assert(!preview.html.includes("<script"));
  assert.equal(
    (
      await post("content-publish", {
        scope: "@cookie",
        locale: "en",
        revision: 1,
      })
    ).status,
    200,
  );
  let html = await front("/products/shoulder-screws/");
  assert(html.includes("New cookie copy"));
  assert(html.includes("&lt;img"));
  assert(!html.includes("<img src=x"));
  assert.equal(
    (html.match(/data-cookie-accept/g) || []).length,
    (
      contentPages["/products/shoulder-screws/"].match(/data-cookie-accept/g) ||
      []
    ).length,
  );
  assert(!(await front("/zh/")).includes("New cookie copy"));
  await service.close();
  service = await createContentService({
    db,
    render,
    translateFields: async (fields, locale) =>
      Object.fromEntries(fields.map((f) => [f.key, locale + " " + f.text])),
  });
  assert((await front()).includes("New cookie copy"));
  doc = await get();
  const version = doc.history.find((v) => v.reason === "draft");
  assert(version);
  await post("content-reset", {
    scope: "@cookie",
    locale: "en",
    revision: doc.revision,
  });
  assert((await front()).includes("New cookie copy"));
  doc = await get();
  await post("content-publish", {
    scope: "@cookie",
    locale: "en",
    revision: doc.revision,
  });
  assert(!(await front()).includes("New cookie copy"));
  doc = await get();
  await post("content-restore", {
    scope: "@cookie",
    locale: "en",
    revision: doc.revision,
    version: version.id,
  });
  doc = await get();
  await post("content-translate", {
    scope: "@cookie",
    locale: "en",
    revision: doc.revision,
  });
  for (let i = 0; i < 5; i++) await service.tick();
  assert.equal(
    (
      await db
        .prepare(
          "SELECT COUNT(*) n FROM content_translation_jobs WHERE state='complete'",
        )
        .first()
    ).n,
    5,
  );
  assert(!(await front("/fr/")).includes("fr "));
  doc = await get();
  assert.equal(
    (
      await post("content-publish-all", {
        scope: "@cookie",
        locale: "en",
        revision: doc.revision,
      })
    ).status,
    200,
  );
  assert((await front("/fr/")).includes("fr "));
  let page = await get("/products/shoulder-screws/");
  const heading = page.fields.find((f) => f.label === "h1");
  assert(heading);
  await post("content-save", {
    scope: page.scope,
    locale: "en",
    revision: 0,
    values: { [heading.key]: "Custom shoulder screw selection" },
  });
  await post("content-publish", {
    scope: page.scope,
    locale: "en",
    revision: 1,
  });
  assert((await front(page.scope)).includes("Custom shoulder screw selection"));
  assert(
    !(await front("/products/security-screws/")).includes(
      "Custom shoulder screw selection",
    ),
  );
  for (const match of (await front(page.scope)).matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  ))
    JSON.parse(match[1]);
  const bad = await post("content-save", {
    scope: page.scope,
    locale: "en",
    revision: 2,
    values: {
      [page.fields.find((f) => f.kind === "url").key]: "javascript:alert(1)",
    },
  });
  assert.equal(bad.status, 400);
  console.log(
    "PASS drafts, publish, preview, escaping, cookie controls, locale isolation, restart, history restore, queued translations, six-language publish, page scope, JSON-LD and URL validation",
  );
} finally {
  await service.close();
  db.close();
  await fs.rm(data, { recursive: true, force: true });
}
