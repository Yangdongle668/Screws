# ZUFEK 标识文件

桌面顶部与页尾共用 `/brand/zufek-logo-aligned.webp`。图标与 ZUFEK 字标组成上排，英文说明下排与上排可见图形的左右边界对齐；图标与字标垂直居中，两行间距固定。比例由图稿本身控制，不依赖客户电脑的字体或浏览器文字宽度。手机端顶部保留原方形图标加 ZUFEK 文字的紧凑样式，不显示下排说明；页尾继续使用组合稿。

- `public/brand/zufek-logo-aligned.svg`：自包含组合稿。图标嵌入原素材，保留原图形和颜色；字标与小字转为轮廓。不是将原位图图标重新描摹为纯矢量。
- `public/brand/zufek-logo-aligned.png`：2400 像素宽的白底导出图。
- `public/brand/zufek-logo-aligned.webp`：800 × 281 的网站用图，页面按比例缩小显示。

这些文件适用于白色和浅色背景。网站使用 multiply 混合，使图标原素材的白色区域与页面浅底融合。原方形图标及浏览器图标继续保留。

修改 SVG 组合稿后执行 `node scripts/prepare-brand-lockup.mjs`，再执行 `node scripts/generate-site.mjs`。网页布局仅调整 Logo 图片的显示宽度，始终保持自动高度，不单独拉伸小字。顶部为200像素宽，页尾为220像素。为避免较长的多语言导航挤压标识，1240像素及以下使用原有折叠菜单交互；相关菜单样式和桌面悬浮条件保持同一断点。没有更改网站正文字体设置。
