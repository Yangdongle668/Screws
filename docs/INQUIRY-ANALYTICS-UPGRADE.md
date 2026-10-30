# 询盘与访问分析升级

参考版本：CMS-Website `9e417507a02a6fa97fbc9fe2bef24ef61f7c7a43`。参考其询盘收件箱、漏斗、邮件队列和分析仪表盘的功能设计，在ZUFEK现有框架独立实现，不替换整站CMS。

## 功能对照

| 模块 | 本次实现 |
|---|---|
| 询盘列表 | 搜索、销售状态、待跟进、未读、正常/归档/垃圾、人工优先级、完整度排序 |
| 询盘详情 | 原有联系人/需求/图纸/备注/负责人，新增资料分项、来源、活动、IP及查看该IP访问历史 |
| 评分 | 0–100资料完整度：公司10、邮箱10、数量20、详细描述20、图纸25、明确产品15；不是成交预测，不自动拒绝线索 |
| 跟进 | 保留现有new/contacted/quoted/closed，首次转为contacted或quoted时记录响应时间；垃圾分类暂停待发通知 |
| 询盘来源 | 记录来源页、来源/媒介/活动；已有同意归因优先，否则基于近30分钟同日IP+UA访问作近似关联。共享网络可能合并，不能当成身份确认 |
| 漏斗 | 询盘趋势、完整度、当前销售状态、首次响应均值、来源页与活动。询盘/浏览量只作为量级比，不宣称真实用户转化率 |
| 邮件队列 | 内部通知与访客确认状态、失败次数、下次重试、按单重试；接受请求不保证进收件箱 |
| 应急保存 | 正常入库失败返回503时，重新验证表单后加密保存字段和图纸；返回明确的临时保存状态；每分钟幂等恢复，保留原编号 |
| PV与访客估算 | 公开HTML成功GET按请求计PV；IP+UA的HMAC按日轮换，统计跨日累计标识，不等于独立人数 |
| 实时统计 | 最近5分钟活跃标识、最近30分钟趋势，每30秒刷新后台 |
| 来源与设备 | 页面/来源/国家/浏览器/系统/移动与桌面排行 |
| 地图与热力 | 复用现有世界地图，国家点击筛选，按北京时间绘制星期×小时热力图 |
| 明细与筛选 | 完整IP、时间、页面、来源、浏览器、国家、机器人；24h/7d/30d/90d/365d与IP/国家/路径筛选 |
| 保留与导出 | 默认365天，可设1–3650天；排除指定IP；询盘CSV扩展字段；Docker业务备份增加traffic_hits/crm_profiles |

未增加多附件、退出弹窗、资料包表单、短信/即时通讯推送、邮件正文在线回复或邮件打开追踪。原图纸上传仍为单文件10MB。历史流量不能补造，旧询盘无来源的字段保持未知；首次响应不补写成历史真实邮件时间。

## 启用与真实IP

`bash update.sh` 后进入 `/admin/#analytics`、`/admin/#funnel`、`/admin/#mailqueue`。完整IP服务端采集关闭，更新部署不会开启；现有Cookie同意与脱敏统计继续使用。不采集管理员已登录浏览的公开页面；机器人默认从报表排除，但其原始访问仍保存。

如果前面使用同一主机Nginx反代，且只通过Nginx访问应用，可在服务器项目目录设置：

```bash
sed -i '/^TRUST_PROXY=/d; /^BIND_ADDRESS=/d' .env.docker
printf '\nTRUST_PROXY=1\nBIND_ADDRESS=127.0.0.1\n' >> .env.docker
docker compose --env-file .env.docker up -d app
```

主机Nginx需要覆盖/追加可信头：

```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_pass http://127.0.0.1:1573;
```

不要仅打开TRUST_PROXY却让1573端口继续向互联网开放，否则外部请求可伪造转发头。若Nginx本身运行在容器，使用受限Docker内部网络，不直接照搬127.0.0.1绑定示例。前面还有CDN时，应在Nginx正确配置其受信真实IP来源；服务按最靠近应用的已提供转发链地址处理，不自动信任任意CF国家/IP头。

后台会显示TRUST_PROXY状态。未正确配置时看到172.x或127.x属于代理/直连地址，不能假称为实际访客。国家采用本地DB-IP Country Lite（2026-10）数据库，不能提供城市或真实住址；查询不会把IP发送给第三方。

## 数据与故障处理

SQLite新增traffic_hits与crm_profiles，均在Docker启动时幂等创建，不改变既有询盘和AI表。图纸、原销售状态、备注、已发通知状态保持原存储。CRM资料随原询盘删除级联清理。`bash backup.sh`覆盖完整data与密钥配置；后台业务备份含新增访问/CRM表，但不包含AI专用状态或应急文件。

应急目录为`data/inquiry-emergency`，使用MAIL_CONFIG_KEY派生独立AES-GCM密钥。请保留此密钥。只有正常流程未能确认保存且表单再次通过字段、大小和扩展名检查时才落盘。磁盘写入并sync成功后才返回临时成功。每IP每小时最多5条新应急记录，待恢复上限200条；磁盘、配额或加密写入失败仍返回失败，浏览器保留表单，不虚报保存成功。

数据库恢复后，每分钟最多处理10条，仍执行原表单校验、附件保存和限流。限流可能延迟重放。成功后删除包含正文/图纸的应急载荷，仅保留加密的编号/时间收据；需人工核查的无效记录保留为needs-review。原邮件队列随后负责提醒，重放不绕过通知幂等机制。后台显示各类数量，可触发一次恢复。不要把应急目录当作永久客户档案，异常条目应由受权人员及时复核。

访问记录按配置保留期清理；已下载副本、备份和外部Nginx日志不会随之删除。

## 对外说明状态

完整IP采集保持关闭，`createInsights` 默认 `captureFullIP=false`，生产入口不覆盖它。完整IP能力仅在本地合成数据测试中显式开启。未来启用前必须如实同步对外说明、用途及保留期限；后台保留设置不能开启此采集。

## 数据库更新与测试

`node docker/verify-insights.mjs`：临时SQLite及本地GeoIP库，验证不依赖Cookie的完整IP、机器人筛选、来源关联、评分、垃圾阻断、首次响应、CSV、安全设置并发、应急加密/幂等与图纸恢复，不请求真实访客或发送邮件。

`node docker/build.mjs` 后运行`node docker/verify-runtime.mjs`：验证真实Docker管理员边界、代理头与完整IP关闭请求集成。常规内容、翻译、SEO及构建检查仍适用。

参考文件：
- https://github.com/Yangdongle668/CMS-Website/blob/9e417507a02a6fa97fbc9fe2bef24ef61f7c7a43/admin/analytics.html
- https://github.com/Yangdongle668/CMS-Website/blob/9e417507a02a6fa97fbc9fe2bef24ef61f7c7a43/admin/inquiries.html
- https://github.com/Yangdongle668/CMS-Website/blob/9e417507a02a6fa97fbc9fe2bef24ef61f7c7a43/admin/inquiry-funnel.html
- https://github.com/Yangdongle668/CMS-Website/blob/9e417507a02a6fa97fbc9fe2bef24ef61f7c7a43/server/routes/analytics.js
- https://github.com/Yangdongle668/CMS-Website/blob/9e417507a02a6fa97fbc9fe2bef24ef61f7c7a43/server/routes/inquiries.js
