# OuVoice 原声资产采集平台

OuVoice 是一个面向 iOS / Android WebView 的移动端方言原声采集与数字资产授权平台。它把任务领取、真实录音、质量审核、链上确权、商业授权和收益结算串成一条完整路径。

## 已实现

- 移动优先的深色金色 / 青色视觉系统，支持刘海屏安全区和 360–480px WebView
- 四区导航：录音工作台、认证声库、地区社区、资产与权利控制台
- 地区方言星图雷达、全网录音/激励计数器、按分钟计价的悬赏方案和领取流程
- `IDLE → RECORDING → ANALYZING → COMPLETED` React 状态机，负责 Web Audio 权限、真实输入波形、计时、录音清理与自动制卡
- 真实 Web Audio 采集桥：48kHz 单声道 PCM 输入、实时分析器波形及标准 16-bit WAV 编码；权限拒绝与 WebView 不兼容会转成界面告警
- `RecordingStateMachine` 组件完全使用 Tailwind CSS utility classes，并通过 `onCompleted` 与制卡流程解耦
- 1.5 秒 Worker 合规分析：低于 5 秒时返回“发现录音中断/过短”，通过后自动打开区块链制卡
- 录音完整性分析：低于 15 秒时触发中断/过短诊断，并提供重录或人工检查路径
- 录音成功制卡：四档授权策略、资产编号预留、模拟区块广播和可复制的链上账本回执
- 声库全局播放器：资产卡展示入库状态、地区和时长，并保证任意时刻只有一条原声播放；支持暂停、切换和删除
- `UserAssetsContext` 在制卡成功后实时追加资产；`AudioPlaybackProvider` 提供跨卡片唯一播放实例、进度和剩余时长
- `AssetAuthorizationProvider` 为每个资产隔离保存授权组合；收益页使用 Tailwind 展示账本、实时单价和带完整风险确认的一键主权撤回
- `AppStoreProvider + useReducer` 统一编排当前标签、悬赏任务、用户资产和实时收益；四个视图持久挂载，切换标签不会清空录音或播放状态
- 社区任务可一键写入录音工作台；制卡完成后，声库计数、资产下拉和收益授权面板无需刷新即可同步
- `REC-WZ-XXXX` 原声资产、声纹指纹、链上交易回执和确权状态
- 商业授权邀约、模型调用收益流、资产级隐私矩阵，以及带链上撤回凭证的一键主权断开
- 前端授权报价联动：文化、科研、商业开关按每条资产分别贡献 ¥0.10 / ¥0.50 / ¥1.50，主权撤回后重置为 ¥0.00/条
- Express REST API、Zod 参数校验、Helmet / CORS 安全中间件
- FastAPI 音频安全微服务：multipart WAV/MP3 等格式分析、5 秒阈值、SHA-256 声纹指纹与本地模拟存储
- Solidity `OuVoiceAssetNFT`：ERC721URIStorage、资产级四项主权开关、所有者更新与一键主权撤回事件
- TypeScript 流式计费引擎：支持独立的按时使用计量和参数化 PostgreSQL 账本插入记录
- PostgreSQL / Prisma 完整关系模型及 Docker Compose 本地数据库
- 无数据库也能立即体验的演示仓储；前后端均有断线降级

## 技术结构

```text
apps/
├── web/                 React 18 + Vite + Tailwind CSS
│   ├── src/components/  资产卡、任务卡、底部导航、详情面板
│   ├── src/screens/     首页、任务、采集、资产、个人中心
│   └── src/hooks/       WebView 录音控制
├── api/                 Express + TypeScript + Zod + streaming billing
│   ├── prisma/          PostgreSQL 数据模型
│   └── src/services/    Mock OuVoice Chain 与 PricingEngine
├── audio-api/           FastAPI + pydub 音频安全微服务
└── contracts/           Solidity 0.8.20 + OpenZeppelin ERC-721
```

前端模块约定、导入示例和完整目录树见 `apps/web/FRONTEND_STRUCTURE.md`。主题变量集中在 `src/styles/theme.css`，Tailwind 语义色、阴影、安全区和动画配置集中在 `tailwind.config.js`。

## 本地运行

需要 Node.js 20+ 和 pnpm。

macOS 可直接双击项目根目录的 `启动OuVoice.command`。终端窗口保持开启期间，浏览器访问 `http://localhost:5173/` 即可使用。

```bash
pnpm install
pnpm dev
```

- 移动端应用：`http://localhost:5173`
- API：`http://localhost:8787`
- 音频 API（另行执行 `pnpm dev:audio`）：`http://localhost:8790`
- 健康检查：`http://localhost:8787/health`

默认启用内存演示数据，不需要数据库即可运行。连接 PostgreSQL 时：

```bash
cp .env.example .env
docker compose up -d postgres
pnpm db:generate
pnpm db:migrate
```

## Web 部署与真实 API 桥接

仓库根目录的 `vercel.json` 已配置 Vite 生产构建、静态资源长期缓存、麦克风权限策略和 SPA 深链接回退；`/api/*` 会保留给云端函数或反向代理，不会被重写成 `index.html`。

```bash
pnpm --filter @ouvoice/web build:production
pnpm --filter @ouvoice/web preview:production
```

在 Vercel 中配置 `VITE_CLOUD_API_URL=https://your-api.example.com` 后，`src/services/api.ts` 会把确权元数据提交到 `${VITE_CLOUD_API_URL}/api/v1/assets/mint`。不配置时使用同源 `/api/v1/assets/mint`，便于接入 Vercel Function 或网关代理。所有 `VITE_*` 变量都会进入客户端包，不要在其中保存私钥或服务端密钥。

## 质量检查

```bash
pnpm typecheck
pnpm test
pnpm build
```

## 主要 API

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/api/overview` | 首页、账户、任务和资产聚合数据 |
| `GET` | `/api/tasks` | 查询采集任务 |
| `POST` | `/api/tasks/:taskId/claim` | 幂等领取任务 |
| `POST` | `/api/recordings` | 提交录音元数据并生成预确权资产 |
| `GET` | `/api/assets` | 查询用户原声资产 |
| `POST` | `/api/assets/:assetId/mint` | 模拟质检完成后的链上铸造 |
| `POST` | `/api/assets/:assetId/confirm-mint` | 选择授权层级并生成区块链确权回执 |
| `POST` | `/api/assets/:assetId/revoke-sovereignty` | 断开训练矩阵并生成主权撤回凭证 |
| `POST` | `/api/assets/:assetId/offers/:offerId/accept` | 签署授权并结算收益 |
| `GET` | `/api/earnings` | 查询余额和收益流水 |

## WebView 接入提示

- iOS 需在 `Info.plist` 配置 `NSMicrophoneUsageDescription`，并在 `WKWebView` 中允许媒体采集。
- Android 需声明 `RECORD_AUDIO`，并在 WebChromeClient 的权限回调中转交麦克风权限。
- 生产环境必须使用 HTTPS；`getUserMedia` 在非安全来源上不可用。
- 建议原声文件使用对象存储直传，API 只接收签名后的对象键和元数据；当前代码聚焦可运行的产品流程，录音二进制保留在客户端演示会话中。

## 数据与权利边界

`MockBlockchainService` 仅模拟资产编号、指纹、交易哈希和授权协议哈希。接入真实链时，应把私钥签名、KMS、对象存储、实名验证、内容审核和法务版本化放在服务端可信边界内，客户端只展示可验证回执。
