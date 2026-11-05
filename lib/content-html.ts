import { parse } from "parse5";
import { createHash } from "node:crypto";
const hash = (s: string) =>
  createHash("sha256").update(s).digest("hex").slice(0, 24);
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export function editableFields(html: string) {
  const tree: any = parse(html, { sourceCodeLocationInfo: true });
  const fields: any[] = [];
  const scripts: any[] = [];
  const visit = (
    node: any,
    group: string,
    route: string,
    insideMain: boolean,
  ) => {
    const attrs = Object.fromEntries(
      (node.attrs || []).map((a: any) => [a.name, a.value]),
    );
    const tag = node.tagName || "";
    const classes = (attrs.class || "").split(/\s+/);
    let root = "";
    if (classes.includes("topbar")) root = "header-top";
    else if (tag === "header" && classes.includes("site-header"))
      root = "header";
    else if (tag === "footer") root = "footer";
    else if (classes.includes("cookie-notice")) root = "cookie-notice";
    else if (attrs.id === "cookie-dialog") root = "cookie-dialog";
    else if (classes.includes("quick-actions")) root = "contact";
    if (root) {
      group = root.startsWith("cookie")
        ? "@cookie"
        : root.startsWith("header")
          ? "@header"
          : root === "footer"
            ? "@footer"
            : "@contact";
      route = root;
    }
    insideMain = insideMain || tag === "main";
    if (tag === "script") {
      if (attrs.id === "locale-ui") {
        try {
          const data = JSON.parse(node.childNodes?.[0]?.value || "{}");
          for (const [key, value] of Object.entries(data.messages || {}))
            if (typeof value === "string" && value.trim())
              fields.push({
                key: "message:" + key,
                group: "@messages",
                kind: "message",
                label: key,
                source: value,
              });
        } catch {}
      } else if (attrs.type === "application/ld+json") scripts.push(node);
      return;
    }
    if (["style", "noscript"].includes(tag)) return;
    const scope = group || "page";
    const add = (
      kind: string,
      source: string,
      start: number,
      end: number,
      label: string,
      attr?: string,
    ) => {
      if (source.trim() && (group || insideMain))
        fields.push({
          key: hash(scope + ":" + route + ":" + kind + ":" + (attr || "")),
          group: scope,
          kind,
          label,
          source,
          start,
          end,
          attr,
        });
    };
    const loc = node.sourceCodeLocation;
    if (node.nodeName === "#text" && loc && node.value.trim())
      add(
        "text",
        node.value,
        loc.startOffset,
        loc.endOffset,
        node.parentNode?.tagName || "正文",
      );
    for (const attr of ["alt", "placeholder", "title", "aria-label", "href"])
      if (attrs[attr] && loc?.attrs?.[attr]) {
        if (
          attr === "href" &&
          ((!group && !insideMain) || attrs[attr].startsWith("#"))
        )
          continue;
        const l = loc.attrs[attr];
        add(
          attr === "href" ? "url" : "attribute",
          attrs[attr],
          l.startOffset,
          l.endOffset,
          tag + " · " + attr,
          attr,
        );
      }
    (node.childNodes || []).forEach((child: any, index: number) =>
      visit(
        child,
        group,
        route + "/" + (child.tagName || child.nodeName) + ":" + index,
        insideMain,
      ),
    );
  };
  visit(tree, "", "", false);
  return { fields, scripts, tree };
}
export function patchEditable(html: string, overrides: Record<string, any>) {
  const { fields, scripts } = editableFields(html);
  const changes: any[] = [];
  const textMap = new Map();
  const conflicts: string[] = [];
  for (const field of fields) {
    const edit = overrides[field.key];
    if (!edit) continue;
    if (edit.source !== field.source) {
      conflicts.push(field.key);
      continue;
    }
    if (field.kind === "message") continue;
    const value = String(edit.value);
    changes.push({
      start: field.start,
      end: field.end,
      value: field.attr
        ? field.attr + '="' + escape(value) + '"'
        : escape(value),
    });
    if (field.kind === "text") textMap.set(field.source.trim(), value.trim());
  }
  const schemaText = new Set([
    "name",
    "headline",
    "description",
    "text",
    "alternateName",
    "caption",
    "email",
    "telephone",
  ]);
  const walk = (value: any, key = ""): any =>
    typeof value === "string"
      ? schemaText.has(key)
        ? textMap.get(value) || value
        : value
      : Array.isArray(value)
        ? value.map((v) => walk(v, key))
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.entries(value).map(([k, v]) => [k, walk(v, k)]),
            )
          : value;
  // Update exact matching visible text in existing JSON-LD without changing schema identity.
  for (const node of scripts) {
    try {
      const text = node.childNodes[0],
        data = JSON.parse(text.value);
      changes.push({
        start: text.sourceCodeLocation.startOffset,
        end: text.sourceCodeLocation.endOffset,
        value: JSON.stringify(walk(data)).replaceAll("<", "\\u003c"),
      });
    } catch {}
  }
  const locale = html.match(
    /<script[^>]*id="locale-ui"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (locale) {
    try {
      const data = JSON.parse(locale[1]);
      let changed = false;
      for (const field of fields.filter((f) => f.kind === "message")) {
        const edit = overrides[field.key];
        if (edit && edit.source === field.source) {
          data.messages[field.label] = edit.value;
          changed = true;
        }
      }
      if (changed) {
        const start = html.indexOf(locale[1], locale.index);
        changes.push({
          start,
          end: start + locale[1].length,
          value: JSON.stringify(data).replaceAll("<", "\\u003c"),
        });
      }
    } catch {}
  }
  for (const change of changes.sort((a, b) => b.start - a.start))
    html = html.slice(0, change.start) + change.value + html.slice(change.end);
  return { html, conflicts };
}
