# 行业、材料及工艺效果配图

本次使用内置 imagegen 生成并人工检查25张图片。行业采用能直接识别行业的总览场景，不采用螺丝接口特写；材料采用对应外观的非标螺丝及原料参考；工艺采用加工后零件和特征。它们是视觉参考，不作为工厂实拍、客户项目、材质鉴定或检测结果的证明。

- 8张行业总览：汽车、工业自动化、电子光学、充电储能、模具工装、安防门禁、流体气动、通用机械。
- 7张材料外观：碳钢合金钢、10B21、不锈钢、铝、铜、黄铜、钛。
- 10张工艺结果：冷镦毛坯、车削台阶、锻造毛坯、复合加工、螺纹、横孔、热处理状态、表面处理外观、清洗去毛刺、光学检测轮廓。

公开资源保存在 `public/images/industry-*.webp`、`material-*.webp`、`result-*.webp`，每张有1100×734和560×374两种尺寸。所选原始PNG保存在本机 `outputs/sector-images/`，不随仓库提交。行业和材料图片用于各自列表与详情页；工艺结果图用于相应工艺详情页，并保留原有加工过程图。六种语言共用相同图片映射，替代文本和说明分别翻译。

## 提示词与生成约束

逐图主体提示词保存在 `scripts/sector-visuals.json`，其中 `slug` 与网站文件名一一对应。实际生成在主体提示词外统一使用以下约束：

行业：premium photorealistic INDUSTRY OVERVIEW photograph; landscape 3:2; wide establishing shot; recognizable industry-specific equipment and environment; coherent realistic perspective; professional industrial photography; legible as a small thumbnail; not a screw closeup; no text, logos, brands, watermarks or customer claims; no collage.

材料：premium photorealistic macro catalog photograph; landscape 3:2; neutral light gray studio background; soft directional light; plausible continuous helical screw threads; material-family appearance illustration; no labels, stamped grades, logos, watermarks, tested-strength or certification claims.

工艺：technically plausible photorealistic after-process result; landscape 3:2; neutral light gray studio backdrop; sharp metal texture; emphasize resulting feature rather than a generic machine; accurate threads and physically possible geometry; no lettering, dimensions, logos, watermarks or performance claims.

初次生成的局部行业场景不符合后续“行业总览”要求，未用于项目，已重新生成。不要重新采用这些未选中的图片。

维护入口为 `scripts/sector-images.mjs` 和 `scripts/industry-material-content.mjs`。新增或替换图后运行 `prepare-sector-images.mjs`、`translate-sector-visuals.mjs`、`generate-site.mjs`，再运行 `verify-sector-images.mjs`、`verify-images.mjs`、`verify-multilingual.mjs`。不要仅替换某个语言目录下的生成页面。
