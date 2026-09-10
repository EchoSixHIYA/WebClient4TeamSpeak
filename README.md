<div align="center">
  <a id="readme-top"></a>

  <img src="./image.png" alt="WebSpeak 项目图标"/>

  <h1>WebSpeak</h1>

  <p><strong>让 TeamSpeak 自然地进入浏览器。</strong></p>
  <p>A self-hosted browser voice client for TeamSpeak 3 and TeamSpeak 6.</p>

  [![Latest Release](https://img.shields.io/github/v/release/EchoSixHIYA/WebSpeak-client-for-TeamSpeak?sort=semver&display_name=tag&style=flat-square&color=0f766e)](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/latest)
  [![Docker Image](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/actions/workflows/docker-publish.yml/badge.svg?branch=master)](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/actions/workflows/docker-publish.yml)
  [![License](https://img.shields.io/badge/license-AGPL--3.0--only-0f766e?style=flat-square)](./LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/EchoSixHIYA/WebSpeak-client-for-TeamSpeak?style=flat-square&logo=github&color=0f766e)](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/stargazers)
  <br />
  [![TeamSpeak](https://img.shields.io/badge/TeamSpeak-3%20%7C%206-2580C3?style=flat-square)](https://www.teamspeak.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.5-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Vue](https://img.shields.io/badge/Vue-3-42B883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Docker](https://img.shields.io/badge/Docker-GHCR-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/users/EchoSixHIYA/packages/container/package/webspeak)
  [![Platforms](https://img.shields.io/badge/packages-Windows%20x64%20%7C%20Linux%20x64-59636e?style=flat-square)](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/latest)

  <p>
    <a href="#简体中文">简体中文</a> ·
    <a href="#english">English</a> ·
    <a href="#deutsch">Deutsch</a> ·
    <a href="#demo">在线 Demo</a> ·
    <a href="#community">社区 / Community</a> ·
    <a href="https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/latest">下载</a>
  </p>
</div>

<details>
<summary><kbd>目录 / Table of contents</kbd></summary>

- [项目简介 · Overview](#overview)
- [在线 Demo · Live Demo](#demo)
- [社区 · Community](#community)
- [简体中文](#简体中文)
  - [界面截图](#zh-screenshots)
  - [特性](#zh-features)
  - [高级功能](#zh-advanced)
  - [更新日志](#zh-changelog)
  - [部署方案](#zh-deployment)
  - [要求和注意事项](#zh-requirements)
  - [许可证](#zh-license)
- [English](#english)
  - [Screenshots](#en-screenshots)
  - [Features](#en-features)
  - [Advanced features](#en-advanced)
  - [Changelog](#en-changelog)
  - [Deployment](#en-deployment)
  - [Requirements and notes](#en-requirements)
  - [License](#en-license)
- [Deutsch](#deutsch)
  - [Screenshots](#de-screenshots)
  - [Funktionen](#de-features)
  - [Erweiterte Funktionen](#de-advanced)
  - [Änderungsprotokoll](#de-changelog)
  - [Bereitstellung](#de-deployment)
  - [Voraussetzungen und Hinweise](#de-requirements)
  - [Lizenz](#de-license)

</details>

<a id="overview"></a>

## 项目简介 · Overview

| 逻辑 | 中文 | English |
| --- | --- | --- |
| **WHAT** | WebSpeak 是一个可自行部署的 TeamSpeak 3 / TeamSpeak 6 网页客户端与语音网关。用户打开网页即可进入频道、交流和管理自己的音频设备。 | WebSpeak is a self-hosted browser client and voice gateway for TeamSpeak 3 and TeamSpeak 6. Users can join channels, communicate, and manage their audio devices directly in a browser. |
| **WHY** | 它降低了临时加入 TeamSpeak 的门槛：无需安装桌面客户端，只需分享一个网页地址，同时仍由部署者控制目标服务器、访问方式和数据。 | It lowers the barrier to joining TeamSpeak: no desktop installation is required, only a web address, while the operator keeps control of targets, access policies, and data. |
| **HOW** | 部署 WebSpeak 后，管理员在网页控制台设置默认 TeamSpeak 目标和访问策略。浏览器负责交互与音频，WebSpeak 负责连接 TeamSpeak；需要更低延迟时可启用内置 WebRTC。 | After deployment, the administrator configures the default TeamSpeak target and access policy in the web console. The browser handles interaction and audio, WebSpeak connects to TeamSpeak, and the bundled WebRTC path can be enabled for lower latency. |

<a id="demo"></a>

## 在线 Demo · Live Demo

**在线地址 / Live URL：<https://webspeak.online>**

> [!WARNING]
> **中文：** 公共演示服务器位于香港，网络和运行负载可能不稳定。延迟、断线或暂时不可用不代表自行部署后的实际表现，请勿将该节点用于重要或长期会话。
>
> **English:** The public demo is hosted in Hong Kong and its network conditions and load may be unstable. Latency, disconnections, or temporary downtime do not represent a self-hosted deployment. Do not rely on this node for important or long-running sessions.

<a id="community"></a>

## 社区 · Community

<div align="center">

<a href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=yhumUMDD9PmyYFWdXWUb_x7hM5trFQY8&authKey=Pw3HBGT7GwMinTQnuFGfnpf0aRSzXOJKcAiujVP1%2BXMpjheAKrncTRivicBJxpjV&noverify=0&group_code=869500475">
  <img src="./web/public/qq-group-qr.jpg" alt="WebSpeak QQ 群二维码" width="290" />
</a>

**群号 / Group ID：`869500475`**

[通过群聊链接直接加入 / Join directly through the group link](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=yhumUMDD9PmyYFWdXWUb_x7hM5trFQY8&authKey=Pw3HBGT7GwMinTQnuFGfnpf0aRSzXOJKcAiujVP1%2BXMpjheAKrncTRivicBJxpjV&noverify=0&group_code=869500475)

中文：在群内获取部署帮助、版本通知和使用交流。<br />
English: Join for deployment help, release announcements, and user discussion.<br />
Deutsch: Hilfe bei der Bereitstellung, Versionsankündigungen und Austausch in der Community.<br />
Telegram: [Join the Telegram group](https://t.me/+8qShpTcuN9A3MWY9)

</div>

---

<a id="简体中文"></a>

## 简体中文

WebSpeak 面向希望通过网页提供 TeamSpeak 语音服务的个人、社区和服务器管理员。它提供完整的访客页面、语音工作区和管理控制台，并可使用 Docker、预编译包或源码部署。

<a id="zh-screenshots"></a>

### 🖼️ 界面截图

以下截图来自上海测试节点，展示中文界面下的欢迎页、语音工作区、音量控制和成员操作菜单。

#### 欢迎页

<p align="center">
  <img src="./docs/screenshots/webspeak-zh-home.png" alt="WebSpeak 中文欢迎页" width="100%" />
</p>

#### 语音工作区

<p align="center">
  <img src="./docs/screenshots/webspeak-zh.png" alt="WebSpeak 中文语音工作区" width="100%" />
</p>

#### 音量控制

<p align="center">
  <img src="./docs/screenshots/webspeak-zh-audio.png" alt="WebSpeak 中文音量控制" width="100%" />
</p>

#### 成员右键菜单

<p align="center">
  <img src="./docs/screenshots/webspeak-zh-menu.png" alt="WebSpeak 中文成员右键菜单" width="100%" />
</p>

<a id="zh-features"></a>

### ✨ 特性

| 能力 | 说明 |
| --- | --- |
| TeamSpeak 兼容 | 支持 TeamSpeak 3 与 TeamSpeak 6，并自动探测目标服务器协议。 |
| 频道与成员 | 浏览完整频道树、查看各频道成员和实时状态，并可切换频道。 |
| 实时语音 | 使用 Opus 语音；支持兼容传输和可选的内置 WebRTC 低延迟传输。 |
| 音频控制 | 选择麦克风与扬声器、调节输入/输出音量、测试麦克风、闭麦、VOX，以及单独调整成员音量。 |
| 消息与互动 | 支持频道消息、服务器消息、私聊、戳一戳和耳语目标。 |
| 桌面端伴奏 | 在桌面浏览器中选择带音频的窗口或标签页，将其声音分享给当前 TeamSpeak 频道。 |
| 身份与访问 | 支持浏览器身份保持、默认目标、访客自定义目标及可撤销、可过期的邀请链接。 |
| 管理控制台 | 管理默认目标、访问策略、WebRTC、邀请链接、活动会话、连接历史、日志、诊断与数据库备份。 |
| 界面体验 | 提供中文、English 和 Deutsch 界面、浅色/深色主题，以及桌面端和移动端响应式布局。 |
| 自托管 | 数据由部署者保存；提供 Docker 镜像、Windows x64 和 Linux x64 发布包。 |

<a id="zh-advanced"></a>

### 🧩 高级功能

高级功能都是可选项；不开启时，WebSpeak 仍可使用兼容语音传输。配置入口均在管理员控制台的“服务器”页，保存后对新连接生效。

#### WebRTC 低延迟语音

WebRTC 将浏览器的实时语音从兼容传输切换为更适合实时音频的媒体通道，也支持桌面端伴奏。它由当前 WebSpeak 网关直接提供，不需要另设媒体服务器。

1. 登录 `/admin`，打开“服务器”页的“高级参数”。
2. 关闭 WebRTC 时设置 UDP 起止端口；默认范围为 `40000–40099`。
3. 在 WebSpeak 主机的云安全组和防火墙中放行完整 UDP 范围。Docker Compose 使用项目默认配置时，应让宿主机直接承载这些端口。
4. 勾选“启用 WebRTC”并保存。用户重新进入后即可协商 WebRTC；浏览器或网络不支持时会自动回退到兼容模式。

启用后端口范围会锁定；要修改范围，先关闭 WebRTC 并保存，再修改端口并重新放行。公网使用时还需要 HTTPS，浏览器才会稳定提供麦克风和窗口音频权限。

#### 中继服务器 / 国内服务器加速

中继用于目标 TeamSpeak 服务器拒绝境外连接或直连不稳定的场景。它不是 VPN，只转发当前 WebSpeak 会话的 TeamSpeak UDP 数据；目标服务器仍由用户在网页中选择。

**部署中继服务：**

使用与 WebSpeak 相同的发布包或容器，在中继所在主机启动 `dist/relay.js`。令牌必须是至少 16 个字符的随机值，并在中继与 WebSpeak 管理控制台中保持一致：

```bash
WEBSPEAK_ACCELERATION_RELAY_TOKEN='replace-with-a-long-random-token' \
WEBSPEAK_ACCELERATION_RELAY_HOST='0.0.0.0' \
WEBSPEAK_ACCELERATION_RELAY_PORT='39087' \
node dist/relay.js
```

也可以使用发布的 Docker 镜像启动独立中继：

```bash
docker run -d --name webspeak-relay --restart unless-stopped --network host \
  -e WEBSPEAK_ACCELERATION_RELAY_TOKEN='replace-with-a-long-random-token' \
  -e WEBSPEAK_ACCELERATION_RELAY_PORT='39087' \
  ghcr.io/echosixhiya/webspeak:latest node dist/relay.js
```

放行中继主机的 UDP 监听端口（默认 `39087`）。默认情况下，中继拒绝显式写入的回环、私网和保留地址；只有在可信内网中确实需要访问这类目标时，才在中继进程设置 `WEBSPEAK_ACCELERATION_RELAY_ALLOW_PRIVATE=true`。

**在 WebSpeak 中启用：**

1. 管理员控制台 → “服务器” → “中继服务器”。
2. 开启“中继加速”，填写显示名称，例如“大陆节点”。
3. 填写中继地址，格式为 `relay.example.com#39087`，并输入与中继进程相同的令牌。
4. 保存后，访客欢迎页会出现以该名称显示的加速选项。用户勾选后，该连接才会通过中继访问目标 TeamSpeak。

关闭并保存中继配置后，访客页面不会继续显示该选项；环境变量不会替代管理员控制台中的公开网关配置。

#### 依赖与归属

- **中继服务：** WebSpeak 自带实现，基于 Node.js 标准库 `node:dgram`、`node:crypto`、`node:dns/promises` 和 `node:net`，不使用 GOST、sing-box 或其他代理框架。
- **WebRTC：** 使用 [werift](https://github.com/shinyoshiaki/werift-webrtc) `0.24.4`，其上游项目采用 MIT 许可证。
- **TeamSpeak 协议：** 使用项目维护的 [EchoSixHIYA/teamspeak-js](https://github.com/EchoSixHIYA/teamspeak-js) SDK fork；它负责 TeamSpeak 协议连接，不是中继服务本身。

<a id="zh-changelog"></a>

### 🧾 更新日志

| 版本 | 日期 | 摘要 |
| --- | --- | --- |
| 0.2.0-preview | 2026-09-10 | 补充 WebRTC、中继服务器和高级扩展功能的配置教程，明确依赖与组件归属。 |
| [v0.1.8](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.8) | 2026-09-08 | 简化 Docker 部署并支持连接同机 TeamSpeak；开放模式加强目标校验；SDK 增加 15 秒连接超时；网络性能面板改为每 3 秒持续监测。 |
| [v0.1.7](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.7) | 2026-09-06 | 增加德语支持、Telegram 群组入口、网络性能面板和丢包率测试；管理员测试不再创建临时客户端，并修复语言菜单留白与伴奏音量波动。 |
| [v0.1.6](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.6) | 2026-09-04 | 新增桌面端伴奏、身份保持提醒和网站图标，并修复 WebRTC 下的成员独立音量。 |
| [v0.1.5](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.5) | 2026-09-04 | 修复身份保持逻辑，优化主题切换按钮。 |
| [v0.1.4](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.4) | 2026-09-03 | 修复 WebRTC 语音和频道聊天，优化管理页、日志与移动端布局。 |
| [v0.1.3](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.3) | 2026-09-03 | 引入内置 WebRTC，迁移 TeamSpeak SDK，并改善成员同步和语音缓冲。 |
| [v0.1.2](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.2) | 2026-09-02 | 大幅改进移动端、设备选择、AudioWorklet 和响应式顶部操作。 |
| [v0.1.1](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.1) | 2026-09-02 | 完成网页客户端、管理后台、邀请链接及运维能力的首轮规范化。 |
| [v0.1.0](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.0) | 2026-08-31 | 首个规范化版本。 |

完整记录见 [CHANGELOG.md](./CHANGELOG.md)。

<a id="zh-deployment"></a>

### 🚀 部署方案

| 方案 | 适用场景 | 运行环境 |
| --- | --- | --- |
| **Docker Compose（推荐）** | 服务器长期运行、便于升级和持久化 | Docker Engine + Docker Compose |
| **发布包** | 不希望安装 Node.js 或构建依赖 | Windows x64 或 Linux x64 |
| **源码运行** | 开发、调试或二次开发 | Node.js 22.5+、Git 与本地编译工具 |

#### Docker Compose（推荐）

```bash
git clone --depth 1 https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak.git
cd WebSpeak-client-for-TeamSpeak
docker compose pull
docker compose up -d
```

启动后访问 `http://<你的主机>:3040`。如使用反向代理，将上游设置为 `http://<你的主机>:3040`；启用 WebRTC 时，放行管理后台显示的 UDP 端口范围。数据保存在 Docker volume `webspeak-data`。查看状态：

```bash
docker compose ps
docker compose logs -f webspeak
```

升级：

```bash
git pull --ff-only
docker compose pull
docker compose up -d
```

不要执行 `docker compose down -v`，否则会删除数据库、管理员设置和其他持久化数据。

#### Windows / Linux 发布包

1. 从 [GitHub Releases](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/latest) 下载对应的 `windows-x64.zip` 或 `linux-x64.tar.gz`。
2. 解压到独立目录。
3. Windows 运行 `start-webspeak.cmd`；Linux 运行 `./start-webspeak.sh`。
4. 发布包自带 Node.js 运行时和生产依赖，无需再次执行 `npm install`。

#### 源码运行

```bash
git clone https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak.git
cd WebSpeak-client-for-TeamSpeak
npm ci --ignore-scripts
npm run prepare:sdk
npm rebuild @discordjs/opus --foreground-scripts
npm --prefix web ci
npm --prefix web run build
npm run build
npm start
```

源码构建 `@discordjs/opus` 时需要 Python、Make 和 C/C++ 编译工具。开发模式可分别使用 `npm run dev` 与 `npm run web:dev`。

#### 首次配置（所有方案）

1. 打开 `http://<你的主机>:3040/admin`。
2. 使用默认账号 `admin`、默认密码 `admin` 登录，并按提示立即设置至少 12 位的新密码。
3. 在“服务器”页填写默认 TeamSpeak 目标和访问方式；目标可写为 `voice.example.com#9987`。
4. 公网使用时为站点配置 HTTPS。若启用 WebRTC，还需放行管理后台显示的 UDP 端口范围。

<a id="zh-requirements"></a>

### ⚠️ 要求和注意事项

| 项目 | 要求或注意事项 |
| --- | --- |
| 浏览器 | 建议使用最新版 Chrome、Edge 或其他支持 WebRTC 的现代浏览器。麦克风和屏幕音频通常要求 HTTPS 安全上下文。 |
| TeamSpeak 网络 | WebSpeak 主机必须能够访问目标 TeamSpeak 服务器。目标默认语音端口为 `9987`，也可在网页中填写其他端口。 |
| Web 服务网络 | 服务使用 `3040/TCP`。公网部署建议通过 HTTPS 反向代理提供网页和 WebSocket。 |
| WebRTC | 默认使用 `40000–40099/UDP`，请在云安全组和主机防火墙中放行。自定义范围时同步放行对应端口；启用 WebRTC 后需先关闭它才能修改端口范围。 |
| 身份保持 | 同一浏览器身份同时只能保持一条活动连接。需要并行连接时，请取消第二条连接的“保持身份”，或使用另一个浏览器/浏览器配置文件。 |
| 伴奏 | 仅桌面端提供，并要求启用 WebRTC。选择窗口或标签页时必须同时勾选共享音频；浏览器无法直接任意读取本地应用音频。 |
| 数据 | Docker 数据位于 `webspeak-data` volume；发布包和源码运行的数据位于程序目录的 `data/`。升级或迁移前建议从管理后台导出数据库备份。 |
| 会话上限 | 单实例最多允许 100 个活动网页会话。 |
| 项目关系 | WebSpeak 是社区项目，不是 TeamSpeak 官方产品；TeamSpeak 名称及商标归其权利人所有。 |

<a id="zh-license"></a>

### 📜 许可证

WebSpeak 使用 [GNU Affero General Public License v3.0 only](./LICENSE) 发布。你可以使用、研究、修改和再分发本项目；如果修改后的版本通过网络向用户提供服务，需要按照 AGPL-3.0 向这些用户提供对应源代码。

<div align="right"><a href="#readme-top">返回顶部 ↑</a></div>

---

<a id="english"></a>

## English

WebSpeak is built for individuals, communities, and server operators who want to offer TeamSpeak voice access through the web. It includes a complete visitor page, voice workspace, and administration console, with Docker, prebuilt-package, and source deployment options.

<a id="en-screenshots"></a>

### 🖼️ Screenshots

These screenshots come from the Shanghai test node and show the welcome page, voice workspace, audio controls, and member actions in English.

#### Welcome page

<p align="center">
  <img src="./docs/screenshots/webspeak-en-home.png" alt="WebSpeak English welcome page" width="100%" />
</p>

#### Voice workspace

<p align="center">
  <img src="./docs/screenshots/webspeak-en.png" alt="WebSpeak English voice workspace" width="100%" />
</p>

#### Audio controls

<p align="center">
  <img src="./docs/screenshots/webspeak-en-audio.png" alt="WebSpeak English audio controls" width="100%" />
</p>

#### Member context menu

<p align="center">
  <img src="./docs/screenshots/webspeak-en-menu.png" alt="WebSpeak English member context menu" width="100%" />
</p>

<a id="en-features"></a>

### ✨ Features

| Capability | Description |
| --- | --- |
| TeamSpeak compatibility | Supports TeamSpeak 3 and TeamSpeak 6 and automatically detects the target server protocol. |
| Channels and members | Browse the complete channel tree, see members and live states in each channel, and switch channels. |
| Realtime voice | Uses Opus audio with a compatibility transport and an optional bundled WebRTC low-latency transport. |
| Audio controls | Select microphones and speakers, adjust input/output volume, test the microphone, mute, use VOX, and control each member's volume. |
| Messaging and actions | Supports channel chat, server chat, private messages, poke actions, and whisper targets. |
| Desktop accompaniment | Select an audio-enabled window or browser tab on desktop and share its sound with the current TeamSpeak channel. |
| Identity and access | Supports remembered browser identities, a default target, visitor-defined targets, and revocable expiring invite links. |
| Administration | Manage the default target, access policy, WebRTC, invites, active sessions, connection history, logs, diagnostics, and database backups. |
| User experience | Chinese, English, and German interfaces, light/dark themes, and responsive desktop/mobile layouts. |
| Self-hosting | Data stays with the operator; Docker images and Windows x64 / Linux x64 packages are provided. |

<a id="en-advanced"></a>

### 🧩 Advanced features

These features are optional. WebSpeak continues to work with its compatibility voice transport when they are disabled. Configure them from **Administration → Servers**; saved changes apply to new connections.

#### WebRTC low-latency voice

WebRTC moves browser voice from the compatibility transport to a realtime media path and also enables desktop accompaniment. The current WebSpeak gateway provides it directly; no separate media server is required.

1. Sign in at `/admin` and open **Advanced settings** on the **Servers** page.
2. While WebRTC is disabled, choose the UDP start and end ports. The default range is `40000–40099`.
3. Allow the complete UDP range in the WebSpeak host's cloud security group and firewall. With the default Docker Compose file, let the host receive these ports directly.
4. Enable **WebRTC** and save. New visitors will negotiate WebRTC; unsupported browsers or networks fall back to the compatibility transport.

The port range is locked while WebRTC is enabled. Disable and save WebRTC before changing it, then update the firewall rules. Public deployments also need HTTPS for reliable microphone and window-audio permissions.

#### Relay server / mainland acceleration

Use a relay when a TeamSpeak server rejects connections from outside its region or when a direct path is unstable. It is not a VPN: it forwards only the TeamSpeak UDP traffic of the current WebSpeak session, while the visitor still chooses the target server in the web page.

**Start the relay:**

Run `dist/relay.js` from the same release package or container used by WebSpeak. Use a random token of at least 16 characters and configure the same token on the relay and in the WebSpeak administration console:

```bash
WEBSPEAK_ACCELERATION_RELAY_TOKEN='replace-with-a-long-random-token' \
WEBSPEAK_ACCELERATION_RELAY_HOST='0.0.0.0' \
WEBSPEAK_ACCELERATION_RELAY_PORT='39087' \
node dist/relay.js
```

You can also run a standalone relay from the published Docker image:

```bash
docker run -d --name webspeak-relay --restart unless-stopped --network host \
  -e WEBSPEAK_ACCELERATION_RELAY_TOKEN='replace-with-a-long-random-token' \
  -e WEBSPEAK_ACCELERATION_RELAY_PORT='39087' \
  ghcr.io/echosixhiya/webspeak:latest node dist/relay.js
```

Allow the relay host's UDP listen port (default `39087`). The relay blocks explicitly entered loopback, private, and reserved targets by default. Only set `WEBSPEAK_ACCELERATION_RELAY_ALLOW_PRIVATE=true` when a trusted internal deployment deliberately needs those targets.

**Enable it in WebSpeak:**

1. Open **Administration → Servers → Relay server**.
2. Enable relay acceleration and enter a display name such as `Mainland relay`.
3. Enter the relay endpoint as `relay.example.com#39087` and the same token used by the relay process.
4. After saving, the welcome page shows an acceleration option with that display name. A visitor must select it for that connection to use the relay.

Disable and save the relay configuration to remove the option from the welcome page. Environment variables do not replace the public gateway configuration saved in the administration console.

#### Dependencies and attribution

- **Relay service:** built into WebSpeak with Node.js built-ins (`node:dgram`, `node:crypto`, `node:dns/promises`, and `node:net`); it does not use GOST, sing-box, or another proxy framework.
- **WebRTC:** uses [werift](https://github.com/shinyoshiaki/werift-webrtc) `0.24.4`, whose upstream project is licensed under MIT.
- **TeamSpeak protocol:** uses the project-maintained [EchoSixHIYA/teamspeak-js](https://github.com/EchoSixHIYA/teamspeak-js) SDK fork. This handles TeamSpeak protocol connectivity; it is not the relay implementation.

<a id="en-changelog"></a>

### 🧾 Changelog

| Version | Date | Summary |
| --- | --- | --- |
| 0.2.0-preview | 2026-09-10 | Added configuration guides for WebRTC, relay servers, and advanced extensions, with dependency and component attribution. |
| [v0.1.8](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.8) | 2026-09-08 | Simplified Docker deployment for local TeamSpeak targets; hardened open-target validation; added a 15-second SDK connection timeout; network metrics now refresh every 3 seconds. |
| [v0.1.7](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.7) | 2026-09-06 | Added German support, a Telegram community link, network performance and packet-loss checks; admin tests no longer create temporary clients, and language-menu spacing and accompaniment volume fluctuations were fixed. |
| [v0.1.6](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.6) | 2026-09-04 | Added desktop accompaniment, remembered-identity guidance, and the site icon; fixed per-member volume under WebRTC. |
| [v0.1.5](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.5) | 2026-09-04 | Fixed identity persistence and refined the theme switch. |
| [v0.1.4](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.4) | 2026-09-03 | Fixed WebRTC voice and channel chat; improved administration, logs, and mobile layouts. |
| [v0.1.3](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.3) | 2026-09-03 | Added bundled WebRTC, migrated the TeamSpeak SDK, and improved member sync and voice buffering. |
| [v0.1.2](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.2) | 2026-09-02 | Major mobile, device-selection, AudioWorklet, and responsive-header improvements. |
| [v0.1.1](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.1) | 2026-09-02 | First normalized browser client, admin console, invite, and operations feature set. |
| [v0.1.0](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.0) | 2026-08-31 | First normalized release. |

See [CHANGELOG.md](./CHANGELOG.md) for the complete history.

<a id="en-deployment"></a>

### 🚀 Deployment

| Method | Best for | Runtime |
| --- | --- | --- |
| **Docker Compose (recommended)** | Long-running servers, simple upgrades, and persistent data | Docker Engine + Docker Compose |
| **Release packages** | Running without installing Node.js or build dependencies | Windows x64 or Linux x64 |
| **From source** | Development, debugging, and customization | Node.js 22.5+, Git, and native build tools |

#### Docker Compose (recommended)

```bash
git clone --depth 1 https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak.git
cd WebSpeak-client-for-TeamSpeak
docker compose pull
docker compose up -d
```

After startup, open `http://<your-host>:3040`. If you use a reverse proxy, set its upstream to `http://<your-host>:3040`. When WebRTC is enabled, allow the UDP range shown in the administration console. Persistent data is stored in the `webspeak-data` Docker volume. Check the service with:

```bash
docker compose ps
docker compose logs -f webspeak
```

Upgrade with:

```bash
git pull --ff-only
docker compose pull
docker compose up -d
```

Do not run `docker compose down -v`; it removes the database, administrator settings, and other persistent data.

#### Windows / Linux release packages

1. Download the matching `windows-x64.zip` or `linux-x64.tar.gz` from [GitHub Releases](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/latest).
2. Extract it into a dedicated directory.
3. Run `start-webspeak.cmd` on Windows or `./start-webspeak.sh` on Linux.
4. Release packages include the Node.js runtime and production dependencies; do not run `npm install` inside them.

#### Run from source

```bash
git clone https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak.git
cd WebSpeak-client-for-TeamSpeak
npm ci --ignore-scripts
npm run prepare:sdk
npm rebuild @discordjs/opus --foreground-scripts
npm --prefix web ci
npm --prefix web run build
npm run build
npm start
```

Building `@discordjs/opus` requires Python, Make, and a C/C++ toolchain. For development, run `npm run dev` and `npm run web:dev` separately.

#### First-time setup (all methods)

1. Open `http://<your-host>:3040/admin`.
2. Sign in with the default username `admin` and password `admin`, then immediately set a new password of at least 12 characters as prompted.
3. Configure the default TeamSpeak target and access mode on the **Servers** page. A target can be written as `voice.example.com#9987`.
4. Configure HTTPS for public access. If WebRTC is enabled, also allow the UDP range shown in the administration console.

<a id="en-requirements"></a>

### ⚠️ Requirements and notes

| Area | Requirement or note |
| --- | --- |
| Browser | Use a current Chrome, Edge, or another modern browser with WebRTC support. Microphone and shared-screen audio normally require an HTTPS secure context. |
| TeamSpeak network | The WebSpeak host must be able to reach the target TeamSpeak server. The default voice port is `9987`, and other ports can be entered in the web interface. |
| Web network | The service uses `3040/TCP`. Public deployments should expose the page and WebSocket through an HTTPS reverse proxy. |
| WebRTC | The default range is `40000–40099/UDP`; allow it in the cloud security group and host firewall. For a custom range, allow the corresponding ports. Disable WebRTC before changing the range. |
| Remembered identity | One browser identity can hold only one active remembered connection at a time. For parallel connections, disable **Remember identity** on the second connection or use another browser/profile. |
| Accompaniment | Desktop only and requires WebRTC. When selecting a window or tab, enable audio sharing as well. Browsers cannot arbitrarily capture every local application's audio. |
| Data | Docker data is stored in the `webspeak-data` volume. Release packages and source installs store data in the program directory's `data/` folder. Export a database backup from the admin console before upgrades or migration. |
| Session limit | One instance accepts up to 100 active browser sessions. |
| Project relationship | WebSpeak is a community project and is not an official TeamSpeak product. TeamSpeak names and trademarks belong to their respective owners. |

<a id="en-license"></a>

### 📜 License

WebSpeak is released under the [GNU Affero General Public License v3.0 only](./LICENSE). You may use, study, modify, and redistribute the project. If a modified version is made available to users over a network, the corresponding source code must be offered to those users under AGPL-3.0.

<div align="right"><a href="#readme-top">Back to top ↑</a></div>

---

<a id="deutsch"></a>

## Deutsch

WebSpeak ist ein selbst gehosteter TeamSpeak-3-/TeamSpeak-6-Webclient und ein Sprach-Gateway. Nutzer können direkt im Browser Kanälen beitreten, sprechen und chatten; Administratoren verwalten Zielserver und Zugriff über die Webkonsole.

<a id="de-screenshots"></a>

### 🖼️ Screenshots

Diese Screenshots stammen vom Shanghai-Testknoten und zeigen die Willkommensseite, den Sprachbereich, die Audiosteuerung und das Mitglieder-Menü auf Deutsch.

#### Willkommensseite

<p align="center">
  <img src="./docs/screenshots/webspeak-de-home.png" alt="WebSpeak deutsche Willkommensseite" width="100%" />
</p>

#### Sprachbereich

<p align="center">
  <img src="./docs/screenshots/webspeak-de.png" alt="WebSpeak deutscher Sprachbereich" width="100%" />
</p>

#### Audiosteuerung

<p align="center">
  <img src="./docs/screenshots/webspeak-de-audio.png" alt="WebSpeak deutsche Audiosteuerung" width="100%" />
</p>

#### Mitglieder-Menü

<p align="center">
  <img src="./docs/screenshots/webspeak-de-menu.png" alt="WebSpeak deutsches Mitglieder-Menü" width="100%" />
</p>

<a id="de-features"></a>

### ✨ Funktionen

| Funktion | Beschreibung |
| --- | --- |
| TeamSpeak-Kompatibilität | Unterstützt TeamSpeak 3 und TeamSpeak 6 und erkennt das Protokoll des Zielservers automatisch. |
| Kanäle und Mitglieder | Zeigt die Kanalstruktur, Mitglieder und ihren aktuellen Status an. |
| Echtzeit-Sprache | Opus-Audio mit kompatiblem Transport und optionalem integriertem WebRTC für geringere Latenz. |
| Audiosteuerung | Mikrofon und Lautsprecher auswählen, Lautstärke anpassen, testen und einzelne Mitglieder regeln. |
| Nachrichten und Interaktion | Kanal- und Serverchat, private Nachrichten, Anstupsen und Flüsterziele. |
| Begleitton auf dem Desktop | Audio eines freigegebenen Fensters oder Browser-Tabs mit dem TeamSpeak-Kanal teilen. |
| Identität und Zugriff | Geräteidentität speichern, Standardziele verwalten, eigene Ziele erlauben und zeitlich begrenzte Einladungen erstellen. |
| Administrationskonsole | Ziele, Zugriff, WebRTC, Sitzungen, Verbindungen, Protokolle, Diagnosen und Datenbanksicherungen verwalten. |
| Responsive Oberfläche | Deutsche, englische und chinesische Oberfläche, helle/dunkle Designs sowie Desktop- und Mobilansicht. |
| Selbst gehostet | Die Daten bleiben beim Betreiber; Docker-, Windows-x64- und Linux-x64-Pakete sind verfügbar. |

<a id="de-advanced"></a>

### 🧩 Erweiterte Funktionen

Diese Funktionen sind optional. Ohne sie arbeitet WebSpeak weiterhin mit dem kompatiblen Sprachtransport. Die Einstellungen befinden sich unter **Administration → Server** und gelten für neue Verbindungen.

#### WebRTC-Sprache mit niedriger Latenz

WebRTC verwendet für Browser-Sprache einen Echtzeit-Medienpfad und ermöglicht außerdem Desktop-Begleitton. Der aktuelle WebSpeak-Gateway stellt WebRTC selbst bereit; ein zusätzlicher Medienserver ist nicht erforderlich.

1. Unter `/admin` anmelden und auf der Seite **Server** die **Erweiterten Einstellungen** öffnen.
2. Bei deaktiviertem WebRTC Start- und Endport für UDP festlegen. Der Standardbereich ist `40000–40099`.
3. Den gesamten UDP-Bereich in Sicherheitsgruppe und Firewall des WebSpeak-Hosts freigeben. Bei der Standard-Docker-Compose-Datei müssen diese Ports direkt am Host erreichbar sein.
4. **WebRTC** aktivieren und speichern. Neue Besucher handeln WebRTC aus; nicht unterstützte Browser oder Netzwerke wechseln automatisch zum kompatiblen Transport.

Der Portbereich ist bei aktiviertem WebRTC gesperrt. Zum Ändern WebRTC zuerst deaktivieren und speichern, danach Firewall-Regeln anpassen. Für öffentliche Bereitstellungen ist außerdem HTTPS für Mikrofon- und Fenster-Audio-Berechtigungen erforderlich.

#### Relay-Server / Beschleunigung

Ein Relay hilft, wenn ein TeamSpeak-Server Verbindungen aus anderen Regionen ablehnt oder der direkte Weg instabil ist. Es ist kein VPN, sondern leitet nur den TeamSpeak-UDP-Verkehr der aktuellen WebSpeak-Sitzung weiter.

**Relay starten:**

`dist/relay.js` aus demselben Release-Paket oder Container wie WebSpeak starten. Ein zufälliges Token mit mindestens 16 Zeichen verwenden und dasselbe Token im Relay sowie in der WebSpeak-Administrationskonsole eintragen:

```bash
WEBSPEAK_ACCELERATION_RELAY_TOKEN='replace-with-a-long-random-token' \
WEBSPEAK_ACCELERATION_RELAY_HOST='0.0.0.0' \
WEBSPEAK_ACCELERATION_RELAY_PORT='39087' \
node dist/relay.js
```

Das UDP-Listening-Port des Relay-Hosts freigeben (Standard `39087`). Explizit eingetragene Loopback-, private und reservierte Ziele werden standardmäßig abgelehnt. `WEBSPEAK_ACCELERATION_RELAY_ALLOW_PRIVATE=true` nur in einer vertrauenswürdigen internen Umgebung setzen, wenn solche Ziele absichtlich benötigt werden.

**In WebSpeak aktivieren:**

1. **Administration → Server → Relay-Server** öffnen.
2. Relay-Beschleunigung aktivieren und einen Anzeigenamen eintragen, zum Beispiel `Mainland relay`.
3. Den Relay-Endpunkt im Format `relay.example.com#39087` und dasselbe Token eintragen.
4. Nach dem Speichern erscheint die Beschleunigungsoption mit diesem Namen auf der Willkommensseite. Besucher müssen sie für die jeweilige Verbindung auswählen.

Relay deaktivieren und speichern, um die Option von der Willkommensseite zu entfernen. Umgebungsvariablen ersetzen nicht die im Administrationsbereich gespeicherte öffentliche Gateway-Konfiguration.

#### Abhängigkeiten und Hinweise zur Herkunft

- **Relay-Dienst:** Bestandteil von WebSpeak und mit Node.js-Standardmodulen (`node:dgram`, `node:crypto`, `node:dns/promises`, `node:net`) implementiert; GOST, sing-box oder ein anderes Proxy-Framework wird nicht verwendet.
- **WebRTC:** verwendet [werift](https://github.com/shinyoshiaki/werift-webrtc) `0.24.4`; das Upstream-Projekt steht unter MIT-Lizenz.
- **TeamSpeak-Protokoll:** verwendet den projektgepflegten [EchoSixHIYA/teamspeak-js](https://github.com/EchoSixHIYA/teamspeak-js)-SDK-Fork. Dieser ist für die TeamSpeak-Protokollverbindung zuständig, nicht für den Relay-Dienst.

<a id="de-changelog"></a>

### 🧾 Änderungsprotokoll

| Version | Datum | Zusammenfassung |
| --- | --- | --- |
| 0.2.0-preview | 2026-09-10 | Konfigurationsanleitungen für WebRTC, Relay-Server und erweiterte Funktionen ergänzt sowie Abhängigkeiten und Komponenten eindeutig zugeordnet. |
| [v0.1.8](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.8) | 2026-09-08 | Docker-Bereitstellung für lokale TeamSpeak-Ziele vereinfacht; Zielprüfung im offenen Modus gehärtet; 15-Sekunden-Timeout für SDK-Verbindungen ergänzt; Netzwerkmetriken werden alle 3 Sekunden aktualisiert. |
| [v0.1.7](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.7) | 2026-09-06 | Deutsche Oberfläche, Telegram-Link sowie Netzwerk- und Paketverlustprüfung hinzugefügt; Admin-Tests erzeugen keine temporären Clients mehr, außerdem wurden Sprachmenü-Leerraum und Begleitton-Schwankungen behoben. |
| [v0.1.6](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.6) | 2026-09-04 | Desktop-Begleitton, Hinweise zur Identität und Website-Symbol hinzugefügt; individuelle Lautstärke unter WebRTC korrigiert. |
| [v0.1.5](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.5) | 2026-09-04 | Identitätsspeicherung korrigiert und Designumschaltung verbessert. |
| [v0.1.4](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.4) | 2026-09-03 | WebRTC und Kanalchat korrigiert; Administrationsseite, Protokolle und Mobilansicht verbessert. |
| [v0.1.3](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/tag/v0.1.3) | 2026-09-03 | Integriertes WebRTC, aktualisiertes TeamSpeak-SDK und bessere Mitgliedersynchronisierung. |

Vollständige Historie: [CHANGELOG.md](./CHANGELOG.md).

<a id="de-deployment"></a>

### 🚀 Bereitstellung

| Methode | Geeignet für | Umgebung |
| --- | --- | --- |
| **Docker Compose (empfohlen)** | Dauerbetrieb, einfache Updates und persistente Daten | Docker Engine + Docker Compose |
| **Release-Paket** | Betrieb ohne Node.js und Build-Werkzeuge | Windows x64 oder Linux x64 |
| **Aus dem Quellcode** | Entwicklung und Anpassungen | Node.js 22.5+, Git und native Build-Werkzeuge |

#### Docker Compose

```bash
git clone --depth 1 https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak.git
cd WebSpeak-client-for-TeamSpeak
docker compose pull
docker compose up -d
```

Nach dem Start ist WebSpeak unter `http://<dein-host>:3040` erreichbar. Bei einem Reverse Proxy muss das Upstream-Ziel `http://<dein-host>:3040` sein. Für WebRTC muss der im Adminbereich angezeigte UDP-Portbereich freigegeben werden. Die persistenten Daten liegen im Docker-Volume `webspeak-data`.

#### Release-Pakete

Lade das passende Paket von [GitHub Releases](https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/releases/latest), entpacke es in ein eigenes Verzeichnis und starte unter Windows `start-webspeak.cmd` bzw. unter Linux `./start-webspeak.sh`.

#### Erste Konfiguration

Öffne `/admin`, melde dich zunächst mit `admin` / `admin` an und ändere das Passwort. Konfiguriere anschließend das Standard-TeamSpeak-Ziel und die gewünschte Zugriffsmethode.

<a id="de-requirements"></a>

### ⚠️ Voraussetzungen und Hinweise

| Bereich | Hinweis |
| --- | --- |
| Browser | Aktuelles Chrome, Edge oder ein moderner WebRTC-fähiger Browser wird empfohlen. Für Mikrofon- und Bildschirm-Audio ist normalerweise HTTPS erforderlich. |
| TeamSpeak-Netzwerk | Der WebSpeak-Host muss den Zielserver erreichen können. Der Standard-Sprachport ist `9987`; andere Ports können im Webinterface eingetragen werden. |
| WebRTC | Der Standardbereich ist `40000–40099/UDP`; Firewall und Sicherheitsgruppe müssen den gesamten Bereich erlauben. Bei einem benutzerdefinierten Bereich sind die entsprechenden Ports freizugeben. |
| Gespeicherte Identität | Eine Browseridentität kann nur eine aktive gespeicherte Verbindung gleichzeitig halten. Für parallele Verbindungen die Option deaktivieren oder ein anderes Browserprofil verwenden. |
| Begleitton | Nur auf Desktop-Browsern verfügbar und WebRTC erforderlich. Bei der Freigabe eines Fensters oder Tabs muss auch Audio freigegeben werden. |
| Selbsthosting | WebSpeak ist kein offizielles TeamSpeak-Produkt. Namen und Marken gehören den jeweiligen Rechteinhabern. |

<a id="de-license"></a>

### 📜 Lizenz

WebSpeak wird unter der [GNU Affero General Public License v3.0 only](./LICENSE) veröffentlicht. Bei Bereitstellung einer veränderten Version über ein Netzwerk muss der entsprechende Quellcode den Nutzern unter AGPL-3.0 angeboten werden.

<div align="right"><a href="#readme-top">Nach oben ↑</a></div>
