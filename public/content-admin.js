(() => {
  const workspace = document.querySelector("#admin-workspace"),
    nav = document.querySelector('[aria-label="后台导航"]');
  if (!workspace || !nav) return;
  const el = (tag, text) => {
    const e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  };
  const tab = el("button", "页面与全局文案");
  tab.type = "button";
  tab.dataset.adminTab = "content";
  nav.append(tab);
  const panel = el("section");
  panel.dataset.adminPanel = "content";
  panel.hidden = true;
  workspace.append(panel);
  panel.innerHTML = `<h2>页面与全局文案</h2><p>选择页面或公共区域，按字段修改文字及链接。保存草稿后预览，确认后发布。文章长篇正文也可在文章管理中编辑，Meta与Schema设置可在SEO入口管理。</p><div class="form-grid"><label>页面或公共区域<select id="content-scope"></select></label><label>语言<select id="content-language"><option value="en">English · 英文</option><option value="zh">中文</option><option value="de">Deutsch · 德语</option><option value="es">Español · 西班牙语</option><option value="it">Italiano · 意大利语</option><option value="fr">Français · 法语</option></select></label></div><p id="content-state" role="status"></p><div class="button-row"><button type="button" class="btn primary" id="content-save">保存草稿</button><button type="button" class="btn outline" id="content-preview">预览草稿</button><button type="button" class="btn primary" id="content-publish">发布此语言</button><button type="button" class="btn outline" id="content-publish-all">发布六种语言草稿</button><button type="button" class="btn outline" id="content-translate">英文草稿翻译为其他五种语言</button></div><p>翻译使用后台已保存的AI配置，生成各语言草稿，可分别检查后发布。链接地址保持原语言页面配置。</p><label>查找字段<input type="search" id="content-search" placeholder="输入当前文字、标题或字段类型"></label><div id="content-fields"></div><div class="note-box"><h3>历史版本与恢复</h3><label>选择历史记录<select id="content-history"></select></label><div class="button-row"><button class="btn outline" type="button" id="content-restore">恢复为草稿</button><button class="btn outline" type="button" id="content-reset">恢复内置内容为草稿</button></div><p>恢复后需点击发布才会应用到前台。</p></div><div class="note-box"><h3>翻译任务</h3><button class="btn outline" type="button" id="content-refresh-jobs">刷新任务</button><div id="content-jobs"></div></div><dialog id="content-preview-dialog" style="width:min(1200px,95vw);height:90vh;max-width:95vw"><button type="button" class="btn outline" id="content-preview-close">关闭预览</button><iframe title="页面草稿预览" sandbox style="display:block;width:100%;height:calc(100% - 65px);border:0"></iframe></dialog>`;
  const $ = (s) => panel.querySelector(s),
    state = $("#content-state"),
    scope = $("#content-scope"),
    language = $("#content-language");
  let doc = null,
    loaded = false,
    dirty = false,
    loading = false;
  async function api(action, data) {
    const response = await fetch(
      "/api/admin/" + action + (typeof data === "string" ? data : ""),
      {
        ...(typeof data === "object"
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          : {}),
      },
    );
    const value = await response.json();
    if (!response.ok) throw Error(value.error || "操作失败");
    return value;
  }
  const identity = () => ({
    scope: doc.scope,
    locale: doc.locale,
    revision: doc.revision,
  });
  function lock(value) {
    panel
      .querySelectorAll("button,input,select,textarea")
      .forEach((e) => (e.disabled = value));
    if (!value && doc) $("#content-translate").disabled = doc.locale !== "en";
  }
  async function documentLoad() {
    if (loading) return;
    loading = true;
    lock(true);
    try {
      state.textContent = "正在读取页面…";
      doc = await api(
        "content-document",
        "?scope=" +
          encodeURIComponent(scope.value) +
          "&locale=" +
          language.value,
      );
      dirty = false;
      render();
    } catch (e) {
      state.textContent = e.message;
    } finally {
      loading = false;
      lock(false);
    }
  }
  function render() {
    const root = $("#content-fields");
    root.replaceChildren();
    for (const [index, f] of doc.fields.entries()) {
      const box = el("div");
      box.className = "note-box";
      box.style.margin = "12px 0";
      box.dataset.fieldKey = f.key;
      const label = el(
        "label",
        index +
          1 +
          " · " +
          ({
            text: "正文文字",
            attribute: "图片说明或提示",
            url: "链接地址",
            message: "动态界面文字",
          }[f.kind] || f.kind) +
          " · " +
          f.label,
      );
      const input = el(f.kind === "url" ? "input" : "textarea");
      input.id = "content-field-" + index;
      label.htmlFor = input.id;
      input.value = f.value;
      if (input.tagName === "TEXTAREA")
        input.rows = f.value.length > 200 ? 5 : 2;
      input.oninput = () => {
        f.value = input.value;
        dirty = true;
        state.textContent = "有未保存修改";
      };
      box.append(label, input);
      if (f.conflict)
        box.append(el("p", "此处内置内容已更新，请核对当前文字后保存。"));
      const original = el("details");
      original.append(el("summary", "查看内置原文"), el("p", f.source));
      box.append(original);
      root.append(box);
    }
    const history = $("#content-history");
    history.replaceChildren();
    for (const v of doc.history)
      history.append(
        new Option(
          v.created_at +
            " · " +
            ({
              draft: "保存草稿",
              published: "发布",
              "restored-draft": "恢复历史",
              "reset-draft": "恢复内置",
              "translation-draft": "翻译草稿",
            }[v.reason] || v.reason),
          v.id,
        ),
      );
    state.textContent =
      "共 " +
      doc.fields.length +
      " 个字段 · " +
      (doc.hasPublished ? "已有发布版本" : "沿用内置内容") +
      " · " +
      (doc.unpublished ? "有待发布草稿" : "当前草稿与发布版本一致");
    $("#content-translate").disabled = doc.locale !== "en";
    filter();
  }
  function filter() {
    const q = $("#content-search").value.toLowerCase();
    for (const box of $("#content-fields").children) {
      const field = doc.fields.find((f) => f.key === box.dataset.fieldKey);
      box.hidden = !(field.label + field.source + field.value)
        .toLowerCase()
        .includes(q);
    }
  }
  async function save() {
    if (!doc) throw Error("请先选择页面");
    const values = Object.fromEntries(doc.fields.map((f) => [f.key, f.value]));
    const result = await api("content-save", { ...identity(), values });
    doc.revision = result.revision;
    dirty = false;
  }
  async function run(action) {
    if (loading) return;
    loading = true;
    lock(true);
    try {
      await action();
    } catch (e) {
      state.textContent = e.message;
    } finally {
      loading = false;
      lock(false);
      if (doc) $("#content-translate").disabled = doc.locale !== "en";
    }
  }
  $("#content-save").onclick = () =>
    run(async () => {
      await save();
      loading = false;
      await documentLoad();
    });
  $("#content-publish").onclick = () =>
    run(async () => {
      if (dirty || !doc.revision) await save();
      await api("content-publish", identity());
      loading = false;
      await documentLoad();
      state.textContent = "已发布，前台刷新后生效。";
    });
  $("#content-publish-all").onclick = () =>
    run(async () => {
      if (dirty || !doc.revision) await save();
      await api("content-publish-all", identity());
      loading = false;
      await documentLoad();
      state.textContent = "六种语言草稿已统一发布。";
    });
  $("#content-preview").onclick = () =>
    run(async () => {
      if (dirty || !doc.revision) await save();
      const preview = await api("content-preview", identity());
      $("#content-preview-dialog iframe").srcdoc = preview.html;
      $("#content-preview-dialog").showModal();
      state.textContent = "正在预览草稿。预览中的按钮仅展示文字。";
    });
  $("#content-preview-close").onclick = () =>
    $("#content-preview-dialog").close();
  $("#content-translate").onclick = () =>
    run(async () => {
      if (dirty || !doc.revision) await save();
      await api("content-translate", identity());
      state.textContent = "已加入五种语言翻译任务，译文将保存为草稿。";
      await jobs();
    });
  $("#content-restore").onclick = () =>
    run(async () => {
      if (!$("#content-history").value) throw Error("暂无历史版本");
      await api("content-restore", {
        ...identity(),
        version: $("#content-history").value,
      });
      loading = false;
      await documentLoad();
    });
  $("#content-reset").onclick = () =>
    run(async () => {
      await api("content-reset", identity());
      loading = false;
      await documentLoad();
    });
  $("#content-search").oninput = filter;
  async function change() {
    if (dirty) {
      scope.value = doc.scope;
      language.value = doc.locale;
      state.textContent = "请先保存草稿，再切换页面或语言。";
      return;
    }
    await documentLoad();
  }
  scope.onchange = language.onchange = change;
  async function jobs() {
    try {
      const result = await api("content-jobs"),
        root = $("#content-jobs");
      root.replaceChildren();
      for (const job of result.jobs) {
        const box = el(
          "p",
          job.scope +
            " · " +
            job.locale +
            " · " +
            ({
              queued: "排队中",
              running: "翻译中",
              complete: "草稿已生成",
              failed: "执行失败",
            }[job.state] || job.state) +
            (job.error ? " · " + job.error : ""),
        );
        if (job.state === "failed") {
          const retry = el(
            "button",
            /修改|变化/.test(job.error)
              ? "按当前版本重试，译文覆盖对应字段"
              : "从已完成部分重试",
          );
          retry.type = "button";
          retry.className = "btn outline";
          retry.onclick = () =>
            run(async () => {
              const target = await api(
                "content-document",
                "?scope=" +
                  encodeURIComponent(job.scope) +
                  "&locale=" +
                  job.locale,
              );
              await api("content-job-retry", {
                scope: job.scope,
                locale: job.locale,
                revision: target.revision,
                id: job.id,
              });
              await jobs();
            });
          box.append(retry);
        }
        root.append(box);
      }
      if (!result.jobs.length) root.append(el("p", "暂无翻译任务"));
    } catch (e) {
      state.textContent = e.message;
    }
  }
  $("#content-refresh-jobs").onclick = jobs;
  async function open() {
    if (!loaded) {
      try {
        const list = await api("content-pages");
        const common = el("optgroup");
        common.label = "全局文案";
        for (const item of list.globals)
          common.append(new Option(item.title, item.path));
        const pages = el("optgroup");
        pages.label = "页面内容";
        for (const item of list.pages)
          pages.append(new Option(item.title + " " + item.path, item.path));
        scope.append(common, pages);
        loaded = true;
      } catch (e) {
        state.textContent = e.message;
        return;
      }
    }
    if (!doc) await documentLoad();
    await jobs();
  }
  tab.onclick = () => {
    document
      .querySelectorAll("[data-admin-panel]")
      .forEach((p) => (p.hidden = p !== panel));
    document
      .querySelectorAll("[data-admin-tab]")
      .forEach((b) => b.removeAttribute("aria-current"));
    tab.setAttribute("aria-current", "page");
    history.replaceState(null, "", "#content");
    open();
  };
  window.addEventListener("content-open", open);
  if (location.hash === "#content") tab.click();
})();
