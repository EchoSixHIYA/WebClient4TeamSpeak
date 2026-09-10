import express from "express";
import { createServer as createHttpsServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { VoiceBridge, type VoiceBridgeOptions } from "./voice-bridge.js";
import type { Logger } from "../logger.js";
import { parseTeamSpeakTarget, teamSpeakTargetKey } from "../domain/teamspeak-target.js";
import { createAdminRouter } from "../admin/admin-router.js";
import type { AdminService } from "../admin/admin-service.js";
import { AdminSessionStore } from "../admin/admin-session.js";
import { resolveSafeOpenTarget } from "../security/open-target-policy.js";
import { identityFromString } from "@echosixhiya/teamspeak-client";
import { JoinRateLimiter } from "./join-rate-limit.js";
import type { AccelerationRelayOptions } from "./acceleration-relay.js";

export interface WebServerOptions {
  port: number;
  version?: string;
  logFile?: string;
  staticDir?: string;
  certDir?: string; // path to cert.pem + key.pem for HTTPS
  voiceBridgeOptions: VoiceBridgeOptions;
  adminService: AdminService;
  logger: Logger;
}

export interface WebServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createWebServer(options: WebServerOptions): WebServer {
  const app = express();
  const logger = options.logger.child({ component: "web" });

  let server: ReturnType<typeof createHttpsServer> | ReturnType<typeof createHttpServer>;

  if (options.certDir) {
    const cert = readFileSync(path.join(options.certDir, "cert.pem"));
    const key = readFileSync(path.join(options.certDir, "key.pem"));
    server = createHttpsServer({ cert, key }, app);
    logger.info("HTTPS enabled");
  } else {
    server = createHttpServer(app);
  }

  app.use(express.json({ limit: "100kb" }));

  const voiceBridge = new VoiceBridge(options.voiceBridgeOptions, logger);
  const adminSessions = new AdminSessionStore();
  const joinRateLimiter = new JoinRateLimiter();
  const startedAt = Date.now();

  const healthHandler: express.RequestHandler = (_request, response) => {
    response.json({ status: "ok", version: options.version ?? "0.1.0" });
  };
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  app.get("/api/public-config", (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    const acceleration = resolveAccelerationOptions(options.voiceBridgeOptions.acceleration);
    response.json({ ...options.adminService.getPublicConfig(), accelerationAvailable: Boolean(acceleration) });
  });

  app.post("/api/join-ticket", async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (!request.is("application/json") || !isSameOrigin(request)) {
      response.status(403).json({ ok: false, code: "ORIGIN_REJECTED" });
      return;
    }
    if (!options.adminService.isInitialized()) {
      response.status(503).json({ ok: false, code: "NOT_INITIALIZED" });
      return;
    }
    if (!joinRateLimiter.allow(request.socket.remoteAddress ?? "unknown")) {
      response.status(429).json({ ok: false, code: "RATE_LIMITED" });
      return;
    }
    const body = isRecord(request.body) ? request.body : {};
    const nickname = typeof body.nickname === "string" ? body.nickname.trim().slice(0, 30) : "";
    const requestedChannel = typeof body.channel === "string" ? body.channel.trim().slice(0, 100) : "";
    const inviteToken = typeof body.invite === "string" ? body.invite.trim().slice(0, 128) : "";
    const requestedIdentity = typeof body.identity === "string" && body.identity.length <= 8192 ? body.identity : "";
    let identity: string | undefined;
    if (requestedIdentity) {
      try {
        identityFromString(requestedIdentity);
        identity = requestedIdentity;
      } catch {
        // A stale/corrupt local identity must not block a normal ephemeral join.
      }
    }
    if (!nickname) {
      response.status(400).json({ ok: false, code: "INVALID_NICKNAME" });
      return;
    }

    const policy = options.adminService.getConnectionPolicy();
    const managedInvite = inviteToken ? options.adminService.consumeManagedInvite(inviteToken) : null;
    if (inviteToken && !managedInvite) {
      response.status(400).json({ ok: false, code: "INVITE_INVALID" });
      return;
    }
    let target = managedInvite?.target ?? policy.defaultTarget;
    let serverPassword = managedInvite?.serverPassword ?? policy.serverPassword;
    const channel = requestedChannel || managedInvite?.channel || "";
    const accelerationRequested = body.accelerated === true;
    const acceleration = resolveAccelerationOptions(options.voiceBridgeOptions.acceleration);
    if (accelerationRequested && !acceleration) {
      response.status(400).json({ ok: false, code: "ACCELERATION_UNAVAILABLE" });
      return;
    }
    if (!managedInvite) {
      try {
        if (policy.accessMode === "open" && typeof body.target === "string" && body.target.trim()) {
          target = parseTeamSpeakTarget(body.target);
          const isDefault = teamSpeakTargetKey(target) === teamSpeakTargetKey(policy.defaultTarget);
          // Open mode must protect the gateway even when a user submits the
          // same address configured as the administrator's default target.
          // The default target only controls which server is prefilled; it is
          // not a trust boundary and must not bypass SSRF protection.
          target = await resolveSafeOpenTarget(target);
          if (!isDefault) serverPassword = typeof body.serverPassword === "string" ? body.serverPassword.slice(0, 512) : "";
        }
      } catch {
        response.status(400).json({ ok: false, code: "TARGET_NOT_ALLOWED" });
        return;
      }
    }

    const ticket = options.voiceBridgeOptions.joinTickets.create({
      target,
      serverPassword,
      nickname,
      ...(channel ? { channel } : {}),
      ...(identity ? { identity, rememberIdentity: true } : body.rememberIdentity === true ? { rememberIdentity: true } : {}),
      ...(accelerationRequested ? { accelerated: true } : {}),
    });
    response.status(201).json({ ok: true, ticket });
  });

  app.use("/api/admin", createAdminRouter({
    service: options.adminService,
    sessions: adminSessions,
    logger,
    getActiveSessions: () => voiceBridge.getActiveCount(),
    getPeakSessions: () => voiceBridge.getPeakCount(),
    getCreatedSessions: () => voiceBridge.getCreatedCount(),
    getSessionSummaries: () => voiceBridge.getSessionSummaries(),
    terminateSession: (id) => voiceBridge.terminateSession(id),
    version: options.version,
    logFile: options.logFile,
    startedAt,
  }));

  // Serve static frontend
  if (options.staticDir) {
    app.use(express.static(options.staticDir));
    app.get(/^(?!\/api|\/ws)/, (_req, res) => {
      res.sendFile(path.join(options.staticDir!, "index.html"));
    });
  }

  voiceBridge.attach(server);

  return {
    start(): Promise<void> {
      return new Promise((resolve) => {
        server.listen(options.port, () => {
          logger.info({ port: options.port }, "Web server started");
          resolve();
        });
      });
    },
    async stop(): Promise<void> {
      await voiceBridge.shutdown();
      adminSessions.clear();
      return new Promise((resolve) => {
        server.close(() => resolve());
      });
    },
  };
}

function resolveAccelerationOptions(
  configured: AccelerationRelayOptions | (() => AccelerationRelayOptions | undefined) | undefined,
): AccelerationRelayOptions | undefined {
  return typeof configured === "function" ? configured() : configured;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSameOrigin(request: express.Request): boolean {
  const origin = request.header("origin");
  const host = request.header("host");
  try {
    return Boolean(origin && host && new URL(origin).host === host);
  } catch {
    return false;
  }
}
