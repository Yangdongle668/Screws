import { normalizeContentTranslations } from "./content-translation.mjs";
import { randomUUID } from "node:crypto";
import {
  editableFields,
  patchEditable,
  contentPages,
} from "../dist/docker/api.mjs";
const locales = ["en", "de", "es", "fr", "it", "zh"];
const globals = ["@header", "@footer", "@cookie", "@contact", "@messages"];
const json = (v, status = 200) =>
  Response.json(v, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
const localized = (p, l) => (l === "en" ? p : "/" + l + p);
export async function createContentService({ db, render, translateFields }) {
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS content_documents (scope TEXT NOT NULL, locale TEXT NOT NULL, revision INTEGER NOT NULL, draft TEXT NOT NULL, published TEXT, change_id TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(scope,locale))",
    )
    .run();
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS content_versions (id TEXT PRIMARY KEY,scope TEXT NOT NULL,locale TEXT NOT NULL,payload TEXT NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL)",
    )
    .run();
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS content_translation_jobs (id TEXT PRIMARY KEY,scope TEXT NOT NULL,locale TEXT NOT NULL,source TEXT NOT NULL,target_revision INTEGER NOT NULL,result TEXT NOT NULL DEFAULT '{}',state TEXT NOT NULL,error TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)",
    )
    .run();
  await db
    .prepare(
      "UPDATE content_translation_jobs SET state='queued' WHERE state='running'",
    )
    .run();
  const row = (scope, locale) =>
    db
      .prepare("SELECT * FROM content_documents WHERE scope=? AND locale=?")
      .bind(scope, locale)
      .first();
  const pages = async () => {
    const list = Object.entries(contentPages)
      .filter(([p]) => !/^\/(de|es|fr|it|zh|admin|404)(\/|$)/.test(p))
      .map(([path, html]) => ({
        path,
        title: html.match(/<title>(.*?)<\/title>/)?.[1] || path,
      }));
    const stored = await db
      .prepare(
        "SELECT metadata FROM article_publications WHERE state='published'",
      )
      .all()
      .catch(() => ({ results: [] }));
    for (const r of stored.results) {
      try {
        const a = JSON.parse(r.metadata);
        const path = a.path || "/blog/" + a.slug + "/";
        if (!list.some((p) => p.path === path))
          list.push({ path, title: a.title });
      } catch {}
    }
    return list;
  };
  async function fieldsFor(scope, locale) {
    const response = await render(
      localized(scope.startsWith("@") ? "/" : scope, locale),
    );
    if (!response.ok) throw Error("页面当前无法读取");
    const html = await response.text();
    return {
      html,
      fields: editableFields(html).fields.filter(
        (f) => f.group === (scope.startsWith("@") ? scope : "page"),
      ),
    };
  }
  async function save(scope, locale, payload, revision, reason = "draft") {
    const id = randomUUID(),
      at = new Date().toISOString();
    const result = await db.batch([
      db
        .prepare(
          "INSERT INTO content_documents(scope,locale,revision,draft,change_id,updated_at) VALUES (?,?,1,?,?,?) ON CONFLICT(scope,locale) DO UPDATE SET draft=excluded.draft,revision=content_documents.revision+1,change_id=excluded.change_id,updated_at=excluded.updated_at WHERE content_documents.revision=?",
        )
        .bind(scope, locale, JSON.stringify(payload), id, at, revision),
      db
        .prepare(
          "INSERT INTO content_versions SELECT change_id,scope,locale,draft,?,updated_at FROM content_documents WHERE change_id=?",
        )
        .bind(reason, id),
    ]);
    if (!result[0].meta.changes)
      throw Error("内容已被其他操作修改，请刷新后重试");
    return { revision: revision + 1 };
  }
  async function document(scope, locale) {
    const { fields } = await fieldsFor(scope, locale),
      current = await row(scope, locale);
    const draft = JSON.parse(current?.draft || "{}");
    const history = (
      await db
        .prepare(
          "SELECT id,reason,created_at FROM content_versions WHERE scope=? AND locale=? ORDER BY rowid DESC LIMIT 30",
        )
        .bind(scope, locale)
        .all()
    ).results;
    return {
      scope,
      locale,
      revision: current?.revision || 0,
      fields: fields.map(({ start, end, ...f }) => ({
        ...f,
        value: draft[f.key]?.value ?? f.source,
        conflict: !!draft[f.key] && draft[f.key].source !== f.source,
      })),
      history,
      hasPublished: !!current?.published,
      unpublished: current?.draft !== current?.published,
    };
  }
  async function overlays(pathname) {
    const locale = pathname.match(/^\/(de|es|fr|it|zh)(?=\/)/)?.[1] || "en";
    const scope = pathname.replace(/^\/(de|es|fr|it|zh)(?=\/)/, "");
    const records = (
      await db
        .prepare(
          "SELECT scope,published FROM content_documents WHERE locale=? AND scope IN (?,?,?,?,?,?) AND published IS NOT NULL",
        )
        .bind(locale, ...globals, scope)
        .all()
    ).results;
    return Object.assign({}, ...records.map((r) => JSON.parse(r.published)));
  }
  async function transform(response, pathname) {
    if (
      response.status !== 200 ||
      !response.headers.get("Content-Type")?.includes("text/html") ||
      /^\/(admin|auth|api|sign)/.test(pathname)
    )
      return response;
    const edits = await overlays(pathname);
    if (!Object.keys(edits).length) return response;
    const result = patchEditable(await response.text(), edits);
    const headers = new Headers(response.headers);
    headers.delete("Content-Length");
    headers.set("Cache-Control", "no-cache");
    return new Response(result.html, { status: response.status, headers });
  }
  async function handle(request, action) {
    const url = new URL(request.url);
    if (
      request.method !== "GET" &&
      (request.method !== "POST" ||
        request.headers.get("origin") !== url.origin)
    )
      return json({ error: "请从本站后台提交操作" }, 403);
    try {
      if (action === "content-pages")
        return json({
          pages: await pages(),
          globals: globals.map((path) => ({
            path,
            title: {
              "@header": "页头与导航",
              "@footer": "页尾",
              "@cookie": "Cookie弹框与偏好设置",
              "@contact": "快捷联系按钮",
              "@messages": "动态提示与表单消息",
            }[path],
          })),
        });
      if (action === "content-jobs")
        return json({
          jobs: (
            await db
              .prepare(
                "SELECT id,scope,locale,state,error,updated_at FROM content_translation_jobs ORDER BY created_at DESC LIMIT 30",
              )
              .all()
          ).results,
        });
      const input =
        request.method === "GET"
          ? Object.fromEntries(url.searchParams)
          : await request.json();
      const { scope, locale } = input;
      if (
        !locales.includes(locale) ||
        !(
          globals.includes(scope) ||
          (await pages()).some((p) => p.path === scope)
        )
      )
        throw Error("请选择有效页面及语言");
      if (action === "content-document" && request.method === "GET")
        return json(await document(scope, locale));
      if (request.method !== "POST")
        return json({ error: "Method not allowed" }, 405);
      const current = await row(scope, locale);
      if (Number(input.revision) !== (current?.revision || 0))
        return json({ error: "当前版本已发生变化，请刷新后重试" }, 409);
      if (action === "content-save") {
        const { fields } = await fieldsFor(scope, locale);
        const payload = {};
        for (const [key, value] of Object.entries(input.values || {})) {
          const f = fields.find((f) => f.key === key);
          if (!f || typeof value !== "string" || value.length > 50000)
            throw Error("编辑字段无效");
          if (
            f.kind === "url" &&
            value !== f.source &&
            !/^(\/(?!\/)[^\s\\]*|https:\/\/[^\s\\]+|mailto:[^\s<>]+|tel:[+\d -]+)$/.test(
              value,
            )
          )
            throw Error("链接请使用站内路径、HTTPS网址、mailto或tel");
          if (value !== f.source) payload[key] = { source: f.source, value };
        }
        return json(await save(scope, locale, payload, input.revision));
      }
      if (action === "content-publish-all") {
        const records = (
          await db
            .prepare(
              "SELECT locale,revision FROM content_documents WHERE scope=?",
            )
            .bind(scope)
            .all()
        ).results;
        if (locales.some((l) => !records.some((r) => r.locale === l)))
          throw Error("请先完成六种语言的草稿，再统一发布");
        const id = randomUUID(),
          at = new Date().toISOString();
        const statements = [
          db
            .prepare(
              "INSERT INTO content_versions SELECT ?,scope,locale,draft,'published',? FROM content_documents WHERE scope=? AND locale=? AND revision=?",
            )
            .bind(id, at, scope, locale, input.revision),
          db
            .prepare(
              "UPDATE content_documents SET published=draft,revision=revision+1,updated_at=? WHERE scope=? AND EXISTS(SELECT 1 FROM content_versions WHERE id=?)",
            )
            .bind(at, scope, id),
        ];
        for (const l of locales.filter((l) => l !== locale))
          statements.push(
            db
              .prepare(
                "INSERT INTO content_versions SELECT ?,scope,locale,draft,'published',? FROM content_documents WHERE scope=? AND locale=? AND EXISTS(SELECT 1 FROM content_versions WHERE id=?)",
              )
              .bind(randomUUID(), at, scope, l, id),
          );
        const result = await db.batch(statements);
        if (!result[0].meta.changes) throw Error("版本已变化，请刷新");
        return json({ published: true, languages: locales });
      }
      if (action === "content-publish") {
        if (!current) throw Error("请先保存草稿");
        const id = randomUUID(),
          result = await db.batch([
            db
              .prepare(
                "UPDATE content_documents SET published=draft,revision=revision+1,change_id=?,updated_at=? WHERE scope=? AND locale=? AND revision=?",
              )
              .bind(
                id,
                new Date().toISOString(),
                scope,
                locale,
                input.revision,
              ),
            db
              .prepare(
                "INSERT INTO content_versions SELECT change_id,scope,locale,draft,'published',updated_at FROM content_documents WHERE change_id=?",
              )
              .bind(id),
          ]);
        if (!result[0].meta.changes) throw Error("版本已变化");
        return json({ published: true });
      }
      if (action === "content-restore") {
        const version = await db
          .prepare(
            "SELECT payload FROM content_versions WHERE id=? AND scope=? AND locale=?",
          )
          .bind(input.version, scope, locale)
          .first();
        if (!version) throw Error("历史版本不存在");
        return json(
          await save(
            scope,
            locale,
            JSON.parse(version.payload),
            input.revision,
            "restored-draft",
          ),
        );
      }
      if (action === "content-reset")
        return json(
          await save(scope, locale, {}, input.revision, "reset-draft"),
        );
      if (action === "content-preview") {
        const { html } = await fieldsFor(scope, locale);
        const edits = {
          ...(await overlays(
            localized(scope.startsWith("@") ? "/" : scope, locale),
          )),
          ...JSON.parse(current?.draft || "{}"),
        };
        const result = patchEditable(html, edits);
        if (scope === "@cookie")
          result.html = result.html.replace(
            "</head>",
            "<style>.cookie-notice{display:block!important;position:relative!important;inset:auto!important}#cookie-dialog{display:block!important;position:relative!important;inset:auto!important}</style></head>",
          );
        return json({
          html: result.html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ""),
        });
      }
      if (action === "content-translate") {
        if (locale !== "en") throw Error("请从英文定稿创建翻译任务");
        const { fields } = await fieldsFor(scope, locale);
        const edits = JSON.parse(current?.draft || "{}");
        const source = fields
          .filter((f) => f.kind !== "url")
          .map((f) => ({
            key: f.key,
            text: edits[f.key]?.value ?? f.source,
            kind: f.kind,
            label: f.label,
          }));
        for (const target of locales.filter((l) => l !== "en")) {
          if (
            await db
              .prepare(
                "SELECT id FROM content_translation_jobs WHERE scope=? AND locale=? AND source=? AND state IN ('queued','running')",
              )
              .bind(scope, target, JSON.stringify(source))
              .first()
          )
            continue;
          const existing = await row(scope, target);
          await db
            .prepare(
              "INSERT INTO content_translation_jobs(id,scope,locale,source,target_revision,state,created_at,updated_at) VALUES (?,?,?,?,?,'queued',?,?)",
            )
            .bind(
              randomUUID(),
              scope,
              target,
              JSON.stringify(source),
              existing?.revision || 0,
              new Date().toISOString(),
              new Date().toISOString(),
            )
            .run();
        }
        return json({ queued: 5 });
      }
      if (action === "content-job-retry") {
        await db
          .prepare(
            "UPDATE content_translation_jobs SET state='queued',error='',target_revision=? WHERE id=? AND scope=? AND locale=? AND state='failed'",
          )
          .bind(input.revision, input.id, scope, locale)
          .run();
        return json({ queued: true });
      }
      return json({ error: "Unsupported action" }, 405);
    } catch (e) {
      return json({ error: e.message || "内容操作失败" }, 400);
    }
  }
  let busy = false,
    closed = false;
  async function tick() {
    if (busy || closed) return;
    busy = true;
    let job;
    try {
      job = await db
        .prepare(
          "SELECT * FROM content_translation_jobs WHERE state='queued' ORDER BY created_at LIMIT 1",
        )
        .first();
      if (!job) return;
      await db
        .prepare(
          "UPDATE content_translation_jobs SET state='running',updated_at=? WHERE id=?",
        )
        .bind(new Date().toISOString(), job.id)
        .run();
      const targetCurrent = await row(job.scope, job.locale);
      if ((targetCurrent?.revision || 0) !== job.target_revision)
        throw Error("目标草稿已被修改，任务保留供核对");
      const source = JSON.parse(job.source),
        result = JSON.parse(job.result);
      const target = await fieldsFor(job.scope, job.locale);
      const available = new Map(target.fields.map((f) => [f.key, f]));
      const pending = source.filter(
        (f) => available.has(f.key) && !(f.key in result),
      );
      while (pending.length && !closed) {
        const batch = [];
        let size = 0;
        while (
          pending.length &&
          batch.length < 10 &&
          (size < 6000 || !batch.length)
        ) {
          const f = pending.shift();
          batch.push(f);
          size += f.text.length;
        }
        let remaining = batch;
        let failedAttempts = 0,
          singleField = false;
        while (remaining.length && failedAttempts < 10 && !closed) {
          // Smaller requests recover missing fields without paying to translate completed fields again.
          const requestFields = singleField ? remaining.slice(0, 1) : remaining;
          const previousRemaining = remaining.length;
          const translated = normalizeContentTranslations(
            await translateFields(requestFields, job.locale),
            requestFields,
          );
          for (const field of requestFields) {
            if (Object.hasOwn(translated, field.key))
              result[field.key] = translated[field.key];
          }
          remaining = remaining.filter(
            (field) => !Object.hasOwn(result, field.key),
          );
          failedAttempts =
            remaining.length < previousRemaining ? 0 : failedAttempts + 1;
          singleField = true;
          await db
            .prepare(
              "UPDATE content_translation_jobs SET result=?,error=?,updated_at=? WHERE id=?",
            )
            .bind(
              JSON.stringify(result),
              "已完成 " +
                Object.keys(result).length +
                "/" +
                source.length +
                " 个字段" +
                (remaining.length
                  ? "，正在补译 " + remaining.length + " 项"
                  : ""),
              new Date().toISOString(),
              job.id,
            )
            .run();
        }
        if (remaining.length && !closed)
          throw Error(
            "已保留完成的译文；10次补译后仍缺少字段：" +
              remaining
                .map((field) => field.label || field.key)
                .slice(0, 4)
                .join("、") +
              "。可从已完成部分重试",
          );
      }
      if (closed) return;
      const current = await row(job.scope, job.locale);
      if ((current?.revision || 0) !== job.target_revision)
        throw Error("目标语言已有新的人工修改，译文已保留，请核对后重试");
      const payload = JSON.parse(current?.draft || "{}");
      for (const [key, value] of Object.entries(result)) {
        const f = available.get(key);
        if (f && value !== f.source) payload[key] = { source: f.source, value };
        else delete payload[key];
      }
      await save(
        job.scope,
        job.locale,
        payload,
        job.target_revision,
        "translation-draft",
      );
      await db
        .prepare(
          "UPDATE content_translation_jobs SET state='complete',error='',updated_at=? WHERE id=?",
        )
        .bind(new Date().toISOString(), job.id)
        .run();
    } catch (e) {
      if (job)
        await db
          .prepare(
            "UPDATE content_translation_jobs SET state='failed',error=?,updated_at=? WHERE id=?",
          )
          .bind(
            String(e.message).slice(0, 1000),
            new Date().toISOString(),
            job.id,
          )
          .run();
    } finally {
      busy = false;
    }
  }
  return {
    handle,
    transform,
    tick,
    async close() {
      closed = true;
      while (busy) await new Promise((resolve) => setTimeout(resolve, 20));
    },
  };
}
