# WebSpeak 加速通道 PoC

这是第一版隔离测试 Demo，不属于 WebSpeak 生产运行链路，也不会被复制到 Docker 镜像或发布包中。

它验证以下核心能力：

- 香港侧客户端向上海侧中继发起认证；
- 每个会话动态指定 TeamSpeak 目标地址；
- 双向 UDP 数据报转发，并保持数据包边界；
- 会话之间按随机 ID 隔离；
- 错误密钥不能建立会话；
- 不修改系统路由，因此不是 VPN。

## 本地冒烟

在仓库根目录运行：

```bash
npm run acceleration:poc
```

成功时会输出 `ACCELERATION_POC_OK`，并显示数据包数量、丢包率和往返延迟。

IPv6 回环验证：

```bash
npm run acceleration:ipv6-smoke
```

## 通过隧道连接上海 TeamSpeak

下面的命令会让 SDK 连接本地代理端口，再由 PoC 中继把 UDP 数据转发到指定 TeamSpeak。它不进入指定频道，只验证 TeamSpeak 握手和断开：

```bash
$env:WEBSPEAK_ACCEL_TS_TARGET="106.15.36.235#9987"
npm run acceleration:sdk-smoke
```

跨机器验证时，需要在上海启动 `relay-server.mjs`，再把 `WEBSPEAK_ACCEL_RELAY` 指向上海中继地址。当前项目不会自动部署或启动该远程进程。

## 手动启动中继

仅用于实验，不要直接暴露到公网：

```bash
WEBSPEAK_ACCEL_TOKEN="change-this-to-a-long-random-token" \
WEBSPEAK_ACCEL_HOST="0.0.0.0" \
WEBSPEAK_ACCEL_PORT="39087" \
node scripts/acceleration-poc/relay-server.mjs
```

当前 Demo 的 UDP 帧协议是实验协议，尚未接入 SDK，也没有替代 GOST 的生产安全审计。正式接入前仍需验证 TeamSpeak 长时间语音、并发会话、IPv6、断线重连和目标地址安全策略。
