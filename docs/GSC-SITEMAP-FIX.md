# GSC Sitemap XML 与 HTTPS 修复

线上诊断（2026-10-30）：https://zufek.net/sitemap.xml 返回200，但XML混入展示用XHTML标签，loc为http://zufek.net。GSC报告18处无效XML标记，8个子地图无法抓取。

修复：XML只保留标准地图字段、Google支持的语言与图片扩展；表格展示移到独立sitemap.xsl。支持XSLT的浏览器可点击链接；不支持的浏览器显示原始XML，不向XML添加展示HTML。XML合法不代表Google已接受，更新后需重新提交GSC验证。

在服务器项目目录，先明确公开HTTPS网址（不改变Docker HTTP1573监听、不要求容器管理证书）：

```bash
sed -i '/^PUBLIC_URL=/d' .env.docker
printf '\nPUBLIC_URL=https://zufek.net\n' >> .env.docker
bash update.sh
```

update.sh会读取PUBLIC_URL重新构建并备份数据，不需要改变SMTP。PUBLIC_URL为公开地址，不是内部容器地址。

更新后检查 https://zufek.net/sitemap_index.xml、product-sitemap.xml、robots.txt 中的Sitemap/loc/canonical应使用https://zufek.net。GSC重新提交sitemap_index.xml（sitemap.xml别名仍可用）。旧错误不会即时消失，必须等待Google重新读取。若仍失败，展开GSC错误查看具体标签、行号和抓取时间。
