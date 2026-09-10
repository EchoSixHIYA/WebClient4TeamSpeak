# Changelog

## [0.2.0] — 2026-09-10

### 中文

- 新增 README“高级功能”章节，补充 WebRTC 与中继服务器的配置和使用步骤。
- 明确 WebRTC 的 UDP 端口、安全组与防火墙要求，以及中继令牌和管理员控制台配置方式。
- 标注中继服务为 WebSpeak 自带实现；同时注明 WebRTC 使用 MIT 许可的 `werift` 依赖，TeamSpeak 连接使用项目维护的 SDK fork。
- 细分 TeamSpeak 连接失败原因，服务器需要密码时提示用户输入密码并重试。
- 优化管理员历史连接日志：能够追溯时显示具体原因，无法追溯时使用通用失败提示，不猜测历史原因。

### English

- Added an “Advanced features” section to the README with WebRTC and relay configuration and usage steps.
- Documented WebRTC UDP, security-group, and firewall requirements, plus relay-token and administration-console setup.
- Clarified that the relay is built into WebSpeak, while WebRTC uses the MIT-licensed `werift` dependency and TeamSpeak connectivity uses the project-maintained SDK fork.
- Classified TeamSpeak connection failures and prompt users for a server password with a retry when authentication requires one.
- Improved administrator connection history: show a specific reason when available and use a generic failure message when older records cannot be traced, without guessing.

### Deutsch

- Einen Abschnitt „Erweiterte Funktionen“ mit Anleitungen für WebRTC und Relay-Server zur README hinzugefügt.
- UDP-, Sicherheitsgruppen- und Firewall-Anforderungen für WebRTC sowie Relay-Token und Administrationskonfiguration dokumentiert.
- Klargestellt, dass das Relay Bestandteil von WebSpeak ist; WebRTC verwendet die MIT-lizenzierte Abhängigkeit `werift`, die TeamSpeak-Verbindung den projektgepflegten SDK-Fork.
- TeamSpeak-Verbindungsfehler genauer klassifiziert und bei erforderlichem Serverpasswort eine Eingabe mit Wiederholung angeboten.
- Den Verlauf der Administrator-Verbindungen verbessert: verfügbare Ursachen werden angezeigt, ältere nicht nachvollziehbare Einträge erhalten eine allgemeine Fehlermeldung statt einer Vermutung.

## [0.1.8] — 2026-09-08

### 中文

- Docker 默认使用 host 网络，支持网关访问同机 TeamSpeak 并直接暴露 WebRTC UDP 端口。
- 开放模式统一校验用户提交的目标地址，包括管理员默认目标，修复本机与内网目标绕过限制的问题。
- TeamSpeak SDK 连接握手增加 15 秒超时，失败连接会及时清理。
- 网络性能面板改为持续监测，打开后每 3 秒更新一次延迟与丢包率。

### English

- Docker now uses host networking by default, allowing the gateway to reach a local TeamSpeak server and expose the WebRTC UDP range directly.
- Open access now validates every submitted target, including the administrator default, closing loopback and private-network bypasses.
- Added a 15-second TeamSpeak SDK handshake timeout with prompt cleanup after failed connections.
- The network performance panel now measures continuously and refreshes latency and packet loss every 3 seconds while open.

### Deutsch

- Docker verwendet standardmäßig das Host-Netzwerk, damit das Gateway einen lokalen TeamSpeak-Server erreicht und den WebRTC-UDP-Bereich direkt bereitstellt.
- Der offene Zugriffsmodus prüft nun jedes Ziel einschließlich des Administrator-Standards und schließt Umgehungen für Loopback- und private Netze.
- Für den TeamSpeak-SDK-Handshake gilt jetzt ein Timeout von 15 Sekunden; fehlgeschlagene Verbindungen werden zeitnah bereinigt.
- Das Netzwerkleistungsfeld misst bei geöffneter Ansicht fortlaufend und aktualisiert Latenz und Paketverlust alle 3 Sekunden.

## [0.1.7] — 2026-09-06

### 中文

- 增加 Deutsch 界面支持和 Telegram 群组入口。
- 增加桌面端整体音量滑块，默认收起并在悬停时展开。
- 修复伴奏音量忽大忽小的问题。
- 增加可展开的网络性能面板，显示浏览器、WebSpeak 与 TeamSpeak 之间的延迟和丢包率。
- 管理员连接测试改用服务端多次主机 Ping 并显示丢包率，不再创建临时 TeamSpeak 客户端。
- 统一中文、English、Deutsch 的旗帜代码语言菜单。
- 修复 TeamSpeak 使用 TCP 探测导致的误报丢包，并修正语言菜单异常留白。
- 移除 WebRTC 桥接中的 RMS 静音帧过滤，安静帧仅用于发言状态指示，不再丢弃。
- 修复 Docker 运行环境缺少 ICMP Ping 工具导致管理员测试误报 100% 丢包。

### English

- Added German UI support and a Telegram community link.
- Added a compact desktop master-volume slider that expands on hover.
- Fixed accompaniment volume fluctuations.
- Added an expandable network performance panel with latency and packet loss across the browser, WebSpeak, and TeamSpeak path.
- Updated the administrator connection test to use repeated host pings, report packet loss, and avoid creating temporary TeamSpeak clients.
- Unified the Chinese, English, and German flag/code language menu.
- Fixed false packet-loss reports caused by probing the TeamSpeak UDP service with TCP, and corrected excess space in the language menu.
- Removed RMS-based silence filtering from the WebRTC bridge; quiet frames are now retained for the codec timeline.
- Fixed Docker admin diagnostics falsely reporting 100% packet loss when the runtime lacked the ICMP ping tool.

### Deutsch

- Deutsche Benutzeroberfläche und Telegram-Community-Link hinzugefügt.
- Kompakten Gesamtlautstärkeregler für den Desktop ergänzt, der sich beim Überfahren öffnet.
- Schwankende Lautstärke bei der Begleittonfreigabe behoben.
- Aufklappbares Netzwerkleistungsfeld mit Latenz und Paketverlust zwischen Browser, WebSpeak und TeamSpeak ergänzt.
- Verbindungstest in der Administration auf wiederholte Host-Pings mit Paketverlustanzeige umgestellt, ohne temporäre TeamSpeak-Clients zu erzeugen.
- Einheitliches Sprachmenü mit Flaggen und Sprachcodes für Chinesisch, Englisch und Deutsch ergänzt.
- Falsche Paketverlustmeldungen durch TCP-Prüfung des UDP-Dienstes behoben und übermäßigen Leerraum im Sprachmenü korrigiert.
- RMS-basierte Stillefilterung aus der WebRTC-Brücke entfernt; leise Frames bleiben nun im Codec-Zeitverlauf erhalten.
- Falsche 100-%-Paketverlustmeldungen behoben, wenn dem Docker-Laufzeitimage das ICMP-Ping-Tool fehlte.

## [0.1.6] — 2026-09-04

### 中文

- 新增保持身份并发连接提醒，避免同一浏览器复用身份造成连接卡住。
- 新增桌面端伴奏共享功能。
- 新增网站 favicon，并更新仓库 README 主视觉。

### English

- Added a warning for concurrent remembered-identity connections in the same browser.
- Added desktop accompaniment sharing.
- Added a site favicon and refreshed the repository README branding.

## [0.1.5] — 2026-09-04

### 中文

- 修复并优化主题切换按钮，首次点击即可切换，并使用太阳/月亮图标。
- 修复浏览器身份保存与退出后的保持逻辑。

### English

- Fixed and refined the theme toggle so the first click switches themes, with sun/moon icons.
- Fixed browser identity persistence across exit and return.

All notable changes to WebSpeak are documented here. Versions follow SemVer.

## [0.1.4] — 2026-09-03

### 中文

- 修复 WebRTC 语音收发与发言状态同步。
- 修复频道文字消息在 WebSpeak 客户端之间无法互收。
- 优化管理员页面、运行日志换行和移动端顶部布局。
- 首页新增 Bilibili 入口，管理员登录页新增返回首页。

### English

- Fixed WebRTC voice transport and speaking-state synchronization.
- Fixed channel text messages between WebSpeak clients.
- Refined admin pages, log wrapping, and narrow-screen header layout.
- Added the Bilibili profile link and the admin-login home link.

## [0.1.3] — 2026-09-03

### Added

- Optional WebRTC audio transport for deployments that need lower and more stable realtime voice latency.
- A self-contained WebRTC media service controlled by one administrator switch; the gateway derives the media host from the current WebSpeak address and owns a fixed UDP range.
- Migrated the TeamSpeak integration to the maintained `EchoSixHIYA/teamspeak-js` fork, including live directory snapshots and member/channel synchronization.

### Changed

- WebRTC audio uses negotiated Opus parameters and a bounded newest-frame mixer instead of allowing stale audio to accumulate.
- The browser keeps the WebSocket path available for signaling, control, and compatibility fallback; Docker Compose publishes the built-in `40000–40099/UDP` media range alongside the web port.

### Fixed

- Prevented duplicate playback when WebRTC and the WebSocket audio path overlap during negotiation or fallback.
- Made WebRTC teardown and fallback explicit so a failed negotiation does not leave a server-side media session behind.
- Corrected native Opus decoder usage and cleaned up negotiated payload handling for TeamSpeak-to-browser audio.

### Verification

- After allowing inbound `40000–40099/UDP` on the public WebSpeak host, two browser sessions were tested against the same TeamSpeak target with WebRTC enabled: audio frames flowed in both directions, packet drops remained at `0`, ingress frame gaps peaked at about `27 ms`, and egress gaps peaked at about `81–83 ms`.
- The measured WebRTC path stayed below the previous WebSocket jitter peaks of about `268–376 ms` in the same browser test setup; these figures describe the observed test path, not a universal latency guarantee.

## [0.1.2] — 2026-09-02

### Added

- Current-version badge and a direct changelog link on the welcome page, next to the prominent GitHub repository button.
- Mobile member actions through a three-dot menu, while desktop member actions remain available through the context menu.

### Changed

- Mobile and narrow-screen header controls now collapse longer labels into icons to preserve usable spacing.
- The welcome page and connected workspace now present the GitHub, version, changelog, admin, theme, language, exit, and microphone controls as a consistent responsive control group.
- The version shown on the welcome page is read from the gateway's public configuration so it stays aligned with the running backend.
- Consolidated the post-0.1.1 mobile voice controls, microphone mute replacement for focus-dependent PTT, automatic protocol detection, simplified Docker Compose startup, and live-demo documentation.

### Fixed

- Replaced the visually off-center settings glyph and normalized icon alignment for settings-related controls across the client.
- Fixed narrow-screen exit and microphone controls so their text-collapse rules apply correctly.
- Bounded browser and gateway voice buffering, reset stale browser playback queues, and exposed low-overhead in-memory audio counters for diagnosing jitter without per-frame log writes.
- Moved microphone frame assembly to an `AudioWorklet` with a compatibility fallback to `ScriptProcessorNode`; both paths emit fixed 960-sample frames.

## [0.1.1] — 2026-09-02

### Added

- M009 admin operations dashboard for managed invites, active-session inspection, per-session termination, diagnostics, logs, audit access, diagnostic report download, and SQLite backup export.
- Persistent managed invites with expiry, optional maximum uses, revocation, hashed opaque tokens, and encrypted TeamSpeak credentials at rest.
- Mobile-aware invite joining through the `invite` URL parameter without placing a TeamSpeak password in the URL.
- M010 hardening for per-peer join-ticket rate limiting and bounded rotating runtime logs.
- Bilingual README documentation with parallel Chinese and English feature, deployment, security, and operations sections.

### Changed

- Database schema is now version 2 and migrates existing version 1 installations transactionally with a migration copy.
- Admin overview and diagnostics use the application package version instead of a hard-coded display value.
- The README architecture section now uses GitHub-native Markdown instead of a Mermaid rich-display block.
- The README badge set now uses stable static Shields badges without a repository-metadata 404 dependency.
- Version tags publish Windows/Linux deployment packages to GitHub Releases and publish the matching Docker image.
- Removed the focus-dependent normal browser Space-key PTT mode and replaced it with a one-click microphone mute/unmute control on desktop and mobile.
- Persisted the microphone mute state in browser preferences and suppresses upstream audio before it is sent to TeamSpeak while muted.

### Fixed

- Late WebSpeak browser sessions now reconcile and merge the complete TeamSpeak directory, so members who joined earlier remain visible.
- Private-message delivery no longer disconnects the browser session.
- Member actions are presented through the right-click context menu with hover feedback.
- Docker release builds copy the root `postinstall` patch script before running `npm ci`.
- Release builds skip `npm version` when the project version already matches the requested version, preventing false `Version not changed` failures.

### Verification

- `npm test` — 51 tests passed.
- `npm run build` — backend TypeScript build passed.
- `npm run web:build` — frontend production build passed.
- `npm audit --omit=dev --audit-level=high` — no high or critical vulnerabilities reported.
- Local `/demo` browser checks passed at the documented narrow and desktop widths; `/demo` does not connect to TeamSpeak.

Real TS3/TS6 interoperability, Android microphone behavior, multi-client smoke, and the 24-hour long-run gate require their respective test environments and are not claimed by this local release check.

## [0.1.0] — 2026-08-31

- First normalized release with the browser client, TeamSpeak 3 / 6 gateway, browser audio controls, access modes, administrator operations, and AGPL-3.0-only licensing.
