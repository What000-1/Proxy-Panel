
# Proxy Panel · 机场订阅管理面板

一个部署在 **Cloudflare Workers + D1** 上的付费机场订阅追踪面板，支持：

- 添加/编辑机场记录（名称、订阅链接、价格、币种、计费周期、购买/到期日、备注）
- 一键续费（自动顺延到期日、记录续费日期）
- 状态一眼看清：正常 / 即将到期 / 已过期 / 已归档
- 搜索、筛选、月均支出统计
- **多币种自动换算**：13 种主流币种（CNY / USD / EUR / HKD / JPY / GBP / TWD / KRW / SGD / AUD / CAD / RUB / INR），每日自动拉汇率，面板可切换「显示币种」，月均支出和单卡价格实时换算
- **机场链接 favicon 自动抓取**：填了 URL 就自动显示图标，用的是 DuckDuckGo 免 key 图标服务
- **Telegram Bot 到期自动提醒**：Cron 每日检查，提前 7 / 3 / 1 / 0 天推送，去重防打扰
- **登录两步验证**：先输入密码 → TG 收到一次性验证码（含登录 IP / 设备 / 时间）→ 输入验证码进入面板
- 现代玻璃拟态 UI，自动跟随系统深色模式，移动端友好

## 登录流程（两步验证）

1. 打开面板 → 输入 `ADMIN_PASSWORD` → 点击「获取验证码」。
2. 服务端校验密码通过后，会立即向配置的 TG 目标推送：
   ```
   🔐 Proxy Panel 登录验证
   验证码：123456
   有效期：5 分钟

   📍 IP: 1.2.3.4
   💻 设备: Windows · Chrome
   🕒 时间: 2026-07-05 12:34:56
   ```
3. 在页面里回填 6 位数字验证码 → 登录成功，session Cookie 14 天有效。
4. 验证码 5 分钟过期、最多尝试 5 次、用一次即失效。
5. 若 `TG_BOT_TOKEN` 或 `TG_CHAT_ID` 未配置，会退化为「仅密码」登录以便首次搭建，页面会提示。

## 一、部署方式 A：Wrangler CLI（推荐）

### 1. 准备

```bash
npm install
npx wrangler login
```

### 2. 创建 D1 数据库

```bash
npx wrangler d1 create proxy-panel-db
```

把返回的 `database_id` 填进 `wrangler.toml` 的 `[[d1_databases]]` 段。

### 3. 初始化表结构

```bash
# 本地开发库
npm run db:init
# 线上库
npm run db:init:remote
```

### 4. 设置密钥

```bash
npx wrangler secret put ADMIN_PASSWORD    # 登录密码
npx wrangler secret put SESSION_SECRET    # 任意 32+ 位随机串
npx wrangler secret put TG_BOT_TOKEN      # 从 @BotFather 获取
npx wrangler secret put TG_CHAT_ID        # 目标 chat id（个人或群组）
```

> 获取 chat_id 的最简方式：先给 bot 发一条消息，然后访问
> `https://api.telegram.org/bot<TOKEN>/getUpdates`，从返回里读 `chat.id`。

### 5. 部署

```bash
npm run deploy
```

访问 Workers 分配的域名即可登录使用。Cron Trigger（每天 UTC 01:00 / 北京时间 09:00）会自动运行到期检查，也可在面板里点「立即检查提醒」手动触发。

## 二、部署方式 B：在 Cloudflare 网页控制台手动部署

不想装 Node/Wrangler？把代码推到 GitHub，全程在 Cloudflare 网页里点鼠标完成。

### 1. 把项目推到 GitHub

在 GitHub 新建一个仓库（可以是私有），把本目录推上去：

```bash
git init
git add .
git commit -m "init proxy panel"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. 在 Cloudflare 控制台创建 D1 数据库

1. 打开 <https://dash.cloudflare.com/> → 左侧 **Storage & Databases** → **D1 SQL Database** → **Create database**。
2. 名字填 **`proxy-panel-db`**（必须一致，否则要同步改 `wrangler.toml`），点 Create。
3. 进入新建的数据库 → 顶部 **Console** 标签页 → 打开本项目 `src/schema.sql`，把里面 SQL **全部内容**粘进去 → **Execute**。执行成功后 `Tables` 里应该能看到 `subscriptions` / `reminder_log` / `login_codes` / `fx_rates` 四张表。

### 3. 创建 Worker 并绑定 GitHub 仓库

1. 左侧 **Compute (Workers)** → **Workers & Pages** → **Create** → **Import a repository**（或 "Connect to Git"）。
2. 授权 Cloudflare 访问你刚推送的仓库，选中它。
3. 项目名建议填 **`proxy-panel`**（会成为默认域名前缀）。
4. 构建设置：
   - **Build command**：留空（本项目无需构建，Wrangler 会自动识别 `wrangler.toml`）。
   - **Deploy command**：`npx wrangler deploy`（一般已是默认）。
   - **Root directory**：`/`。
5. 点 **Save and Deploy**。首次部署可能会因缺少 D1 ID 而失败，没关系，继续下一步。

### 4. 把 D1 ID 填进 `wrangler.toml`

1. 回到刚才创建的 D1 数据库 → 复制页面上的 **Database ID**。
2. 在 GitHub 编辑仓库里的 `wrangler.toml`，把 `REPLACE_WITH_YOUR_D1_ID` 换成刚才复制的 ID，提交。
3. Cloudflare 会自动重新部署一次。

### 5. 在 Worker 页面配置密钥和变量

进入刚创建的 Worker → **Settings** → **Variables and Secrets** → **Add**：

| 名称              | 类型   | 值                          |
| ----------------- | ------ | --------------------------- |
| `ADMIN_PASSWORD`  | Secret | 你想设置的登录密码          |
| `SESSION_SECRET`  | Secret | 一段随机长字符串（32+ 位）  |
| `TG_BOT_TOKEN`    | Secret | 从 [@BotFather](https://t.me/BotFather) 拿到的 Bot Token |
| `TG_CHAT_ID`      | Secret | 接收提醒的 chat id          |
| `REMIND_DAYS`     | Text   | `7,3,1,0`（可选，默认已在 wrangler.toml 里） |
| `TIMEZONE`        | Text   | `Asia/Shanghai`（可选）     |

> **chat_id 获取**：Telegram 里先给你的 bot 发一条 `/start`，再访问
> `https://api.telegram.org/bot<TOKEN>/getUpdates`，返回 JSON 里的 `chat.id` 就是。
> 群组的 id 是负数（如 `-1001234567890`），也可以直接用。

保存后 Worker 会再触发一次部署。

### 6. 确认 D1 绑定和 Cron

- **Settings** → **Bindings** → 应该能看到 `DB` 绑定到 `proxy-panel-db`。若没有，点 **Add** → **D1 database** → Variable name 填 `DB`，选中 `proxy-panel-db`。
- **Settings** → **Triggers** → **Cron Triggers**：确认存在 `0 1 * * *`。如果没有就点 **Add Cron Trigger** 添上。

### 7. 访问面板

打开 `https://proxy-panel.<你的账号子域>.workers.dev`，用你设置的 `ADMIN_PASSWORD` 登录。首次进入点右上角「测试 TG」验证机器人是否正常收信。

### 常见坑

- **登录后立刻被踢回登录页**：多半是 `SESSION_SECRET` 没设置或每次部署都在变。请在 Secrets 里设一个固定值。
- **点「获取验证码」提示发送失败**：说明密码对了但 TG 参数错。到 Worker → **Logs** 找 `send login code failed` 排查；常见原因是 `TG_CHAT_ID` 写错或还没给 bot 发过 `/start`。
- **想跳过 TG 二次验证首次登录**：暂不设置 `TG_BOT_TOKEN` / `TG_CHAT_ID` 即可仅密码进入，等配好 TG 后再补上。
- **面板打开报 500 / D1 error**：D1 未绑定或 `database_id` 不匹配。回到第 4、6 步复查。
- **Cron 不推送**：先手动点面板顶部「立即检查提醒」，如果这里能发就说明是 Cron 没触发；打开 Worker → **Triggers** 再补一次 `0 1 * * *`。若手动也发不了，去 **Logs** 里看 `sendTelegram` 报错。
- **提醒漏发**：`reminder_log` 表按 `(sub_id, days_before, expiry_date)` 去重。若你手动改回了 `expiry_date`，可能触发已有记录，可在 D1 Console 里 `DELETE FROM reminder_log WHERE subscription_id = ?` 后再点「立即检查」。

## 三、本地开发

```bash
# 本地 D1 初始化（只需第一次）
npm run db:init

# 启动本地开发
npm run dev
```

`.dev.vars` 里可放本地开发用变量：

```
ADMIN_PASSWORD=dev
SESSION_SECRET=dev-secret-please-change
TG_BOT_TOKEN=
TG_CHAT_ID=
```

## 三、可调参数（wrangler.toml → [vars]）

- `REMIND_DAYS`：提前几天开始提醒，逗号分隔，默认 `"7,3,1,0"`
- `TIMEZONE`：Cron 判定日期用的时区，默认 `"Asia/Shanghai"`

## 四、目录结构

```
├─ src/
│  ├─ index.ts     # Worker 入口（路由 + API + Cron）
│  ├─ ui.ts        # 前端页面（单文件 HTML/CSS/JS）
│  └─ schema.sql   # D1 建表脚本
├─ wrangler.toml
├─ package.json
└─ tsconfig.json
```

## 五、Telegram 提醒逻辑

- 每次 Cron 触发都会遍历所有未归档订阅，计算剩余天数。
- 命中 `REMIND_DAYS` 的记录发送一次 HTML 消息，写入 `reminder_log`。
- 同一到期日 + 同一天数窗口只发一次，续费后 `expiry_date` 变化，下一轮周期会重新提醒。
- 已过期条目会按 0 天窗口继续每次续费前保留一次提醒。

## 六、多币种换算 & Favicon

### 多币种自动换算

- **汇率来源**：<https://open.er-api.com/v6/latest/USD>（免费、无需 key，每日更新）。
- **刷新时机**：
  - 每天 Cron（`0 1 * * *`）触发时自动刷新一次；
  - 面板顶部点「💱 汇率」立即拉取一次；
  - 首次登录若 `fx_rates` 表为空，会自动触发一次刷新。
- **换算规则**：`fx_rates.per_usd = 1 USD 对应多少该币种`。金额换算 = `amount * (per_usd[目标] / per_usd[来源])`。
- **UI 表现**：
  - 页面顶部有「显示币种」下拉，切换后所有卡片和「月均支出」实时换算，选择记在 `localStorage`，下次进入自动记住。
  - 每张卡片显示原币价格，若与显示币种不同，下方用灰字显示 `≈ 换算价格`。
  - 若某个币种当天没拉到汇率，「月均支出」值旁会出现 `*`，副标提示「N 条汇率缺失」。
- **支持币种**：`CNY / USD / EUR / HKD / JPY / GBP / TWD / KRW / SGD / AUD / CAD / RUB / INR`，可在 `src/index.ts` 的 `FX_SUPPORTED` 与 `src/ui.ts` 的 `COMMON_CURRENCIES` 增删。

### Favicon 自动抓取

- 添加机场时填了 URL，卡片左侧就会显示对应网站图标；抓不到自动退回一个飞机 emoji 占位。
- 图标源：`https://icons.duckduckgo.com/ip3/<hostname>.ico`（免 key、无 CORS）。
- 完全前端行为，不占用 Worker CPU、不写 D1、不需要额外配置。
