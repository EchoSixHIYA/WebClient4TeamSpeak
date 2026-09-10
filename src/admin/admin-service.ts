import { createHash, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import type { Logger } from "../logger.js";
import { loadConfig } from "../config.js";
import { formatTeamSpeakTarget, parseTeamSpeakTarget, type TeamSpeakTarget } from "../domain/teamspeak-target.js";
import { type AccessMode, type ManagedInviteRecord, type PersistedRelayNode, type SettingsUpdate, WebSpeakDatabase } from "../persistence/database.js";
import { hashAdminPassword, validateAdminPassword, verifyAdminPassword } from "../security/admin-password.js";
import { decryptSecret, encryptSecret } from "../security/secret-crypto.js";
import { probeTeamSpeak, TeamSpeakProbeError } from "../server/teamspeak-probe.js";
import { pingTeamSpeakHost } from "../server/network-probe.js";
import type { WebRtcAudioOptions } from "../server/webrtc-audio.js";
import { DEFAULT_ACCELERATION_RELAY_PORT, type ConfiguredAccelerationRelay } from "../server/acceleration-relay.js";
import { DEFAULT_WEBRTC_UDP_PORT_RANGE, WEBRTC_UDP_PORT_MAX, WEBRTC_UDP_PORT_MIN } from "../server/webrtc-config.js";

export interface AdminSettingsInput {
  target: string;
  serverPassword?: string;
  passwordAction?: "keep" | "replace" | "remove";
  accessMode: AccessMode;
  siteName: string;
  welcomeText: string;
  welcomeTextEn?: string;
  webRtcEnabled: boolean;
  webRtcUdpStart?: number;
  webRtcUdpEnd?: number;
  relaySettingsAction?: "keep" | "replace" | "remove";
  relayEnabled?: boolean;
  relayName?: string;
  relayTarget?: string;
  relayToken?: string;
  relayTokenAction?: "keep" | "replace" | "remove";
  relayNodes?: RelayNodeInput[];
}

export interface RelayNodeInput {
  id?: string;
  name: string;
  target: string;
  enabled: boolean;
  token?: string;
  tokenAction?: "keep" | "replace" | "remove";
}

export interface ConnectionPolicy {
  defaultTarget: TeamSpeakTarget;
  serverPassword: string;
  accessMode: AccessMode;
}

export interface ManagedInviteInput {
  channel: string;
  expiresInHours: number;
  maxUses: number;
}

export interface ManagedInviteView {
  id: string;
  target: string;
  channel: string;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  createdAt: string;
  revokedAt: string | null;
  status: "active" | "expired" | "exhausted" | "revoked";
}

type ProbeFunction = typeof probeTeamSpeak;

export class AdminService {
  constructor(
    readonly database: WebSpeakDatabase,
    private readonly masterSecret: Buffer,
    private readonly logger: Logger,
    private readonly legacyConfigPath: string,
    private readonly probe: ProbeFunction = probeTeamSpeak,
    private readonly version = "0.1.0",
  ) {}

  async initialize(): Promise<void> {
    this.importLegacyConfigOnce();
    if (!this.database.hasAdmin()) {
      const credential = await hashAdminPassword("admin", { username: "admin", mustChangePassword: true, allowWeakPassword: true });
      this.database.initializeAdmin(credential, this.toSettingsUpdate(this.database.getSettings()));
      this.logger.warn("Default admin account created. Change the password on first login.");
    }
  }

  isInitialized(): boolean {
    return this.database.hasAdmin();
  }

  async verifyPassword(username: string, password: string): Promise<boolean> {
    const credential = this.database.getAdminCredential();
    return credential?.username === username && await verifyAdminPassword(password, credential);
  }

  isPasswordChangeRequired(): boolean {
    return this.database.getAdminCredential()?.mustChangePassword === true;
  }

  async changePassword(password: string): Promise<void> {
    const credential = this.database.getAdminCredential();
    if (!credential) throw new AdminInputError("NOT_INITIALIZED", "The administrator account is not initialized");
    const passwordError = validateAdminPassword(password);
    if (passwordError) throw new AdminInputError("INVALID_ADMIN_PASSWORD", passwordError);
    const replacement = await hashAdminPassword(password, { username: credential.username, mustChangePassword: false });
    this.database.updateAdminCredential(replacement);
    this.database.addAudit("ADMIN_PASSWORD_CHANGED");
  }

  getPublicConfig(): Record<string, unknown> {
    const settings = this.database.getSettings();
    return {
      version: this.version,
      initialized: this.isInitialized(),
      siteName: settings.siteName,
      welcomeText: settings.welcomeText,
      welcomeTextEn: settings.welcomeTextEn,
      accessMode: settings.accessMode,
      target: formatTeamSpeakTarget({ host: settings.tsHost, port: settings.tsPort }),
    };
  }

  getAdminSettings(): Record<string, unknown> {
    const settings = this.database.getSettings();
    return {
      target: formatTeamSpeakTarget({ host: settings.tsHost, port: settings.tsPort }),
      hasPassword: Boolean(settings.tsPasswordEncrypted),
      accessMode: settings.accessMode,
      siteName: settings.siteName,
      welcomeText: settings.welcomeText,
      welcomeTextEn: settings.welcomeTextEn,
      lastTestAt: settings.lastTestAt,
      lastTestLatencyMs: settings.lastTestLatencyMs,
      lastTestError: settings.lastTestError,
      webRtcEnabled: settings.webRtcEnabled,
      webRtcUdpStart: settings.webRtcUdpStart,
      webRtcUdpEnd: settings.webRtcUdpEnd,
      relayConfigured: settings.relayConfigured,
      relayEnabled: settings.relayEnabled,
      relayName: settings.relayName,
      relayTarget: settings.relayHost ? formatRelayTarget(settings.relayHost, settings.relayPort) : "",
      hasRelayToken: Boolean(settings.relayTokenEncrypted),
      relayNodes: this.getRelayNodeViews(),
      internalPort: 3040,
      updatedAt: settings.updatedAt,
    };
  }

  getWebRtcAudioOptions(): WebRtcAudioOptions {
    const settings = this.database.getSettings();
    return {
      enabled: settings.webRtcEnabled,
      udpPortRange: [settings.webRtcUdpStart, settings.webRtcUdpEnd],
    };
  }

  getAccelerationRelayOptions(): ConfiguredAccelerationRelay[] {
    const relays: ConfiguredAccelerationRelay[] = [];
    for (const node of this.database.listRelayNodes()) {
      if (!node.enabled || !node.host || !node.tokenEncrypted) continue;
      try {
        const token = decryptSecret(node.tokenEncrypted, this.masterSecret);
        relays.push({ id: node.id, name: node.name, relayHost: node.host, relayPort: node.port, token });
      } catch (error: unknown) {
        this.logger.error({ err: error instanceof Error ? error.message : String(error), relayId: node.id }, "Stored acceleration relay token could not be decrypted");
      }
    }
    return relays;
  }

  getAccelerationRelayName(): string | undefined {
    return this.getAccelerationRelayOptions()[0]?.name;
  }

  updateSettings(input: AdminSettingsInput): void {
    const current = this.database.getSettings();
    const relayNodes = input.relayNodes === undefined ? undefined : this.normalizeRelayNodes(input.relayNodes);
    const settings = this.normalizeSettings(input, current, relayNodes);
    const targetChanged = current.tsHost !== settings.tsHost || current.tsPort !== settings.tsPort;
    this.database.updateSettings(settings);
    if (relayNodes !== undefined) {
      this.database.replaceRelayNodes(relayNodes);
    } else if (input.relaySettingsAction && input.relaySettingsAction !== "keep") {
      this.database.replaceRelayNodes(this.legacyRelayNodesFromSettings(settings));
    }
    if (targetChanged) this.database.clearConnectionTest();
  }

  getConnectionPolicy(): ConnectionPolicy {
    const settings = this.database.getSettings();
    let serverPassword = "";
    try {
      serverPassword = decryptSecret(settings.tsPasswordEncrypted, this.masterSecret);
    } catch (error: unknown) {
      this.logger.error({ err: error instanceof Error ? error.message : String(error) }, "Stored TeamSpeak password could not be decrypted");
    }
    return {
      defaultTarget: { host: settings.tsHost, port: settings.tsPort },
      serverPassword,
      accessMode: settings.accessMode,
    };
  }

  async testConnection(targetText: string, password: string, persistResult: boolean): Promise<{ ok: boolean; checkType: "network" | "protocol"; passwordVerified: boolean; latencyMs: number; serverName: string | null; requiresPassword: boolean; packetLossPercent?: number; attempts?: number; successfulAttempts?: number; errorCode?: string }> {
    let target: TeamSpeakTarget;
    try {
      target = parseTeamSpeakTarget(targetText);
    } catch {
      throw new AdminInputError("INVALID_TARGET", "TeamSpeak target is invalid");
    }
    try {
      // The admin connection test must not create a temporary TeamSpeak
      // client: that client becomes visible in the target channel. Use the
      // WebSpeak host's ICMP route measurement instead. The injected probe is
      // retained for unit tests and explicit protocol-probe callers.
      if (this.probe === probeTeamSpeak) {
        const result = await pingTeamSpeakHost(target.host, { attempts: 4 });
        const publicResult = {
          ok: result.ok,
          checkType: "network" as const,
          passwordVerified: false,
          latencyMs: result.latencyMs ?? 0,
          serverName: null,
          requiresPassword: false,
          packetLossPercent: result.packetLossPercent,
          attempts: result.attempts,
          successfulAttempts: result.successfulAttempts,
          ...(result.errorCode ? { errorCode: result.errorCode } : {}),
        };
        if (persistResult) {
          this.database.recordConnectionTest({ protocol: null, latencyMs: result.latencyMs, error: result.ok ? null : (result.errorCode ?? "UNREACHABLE") });
          this.database.addAudit(result.ok ? "CONNECTION_TEST_SUCCEEDED" : "CONNECTION_TEST_FAILED", {
            latencyMs: result.latencyMs,
            packetLossPercent: result.packetLossPercent,
            ...(result.errorCode ? { code: result.errorCode } : {}),
          });
        }
        return publicResult;
      }
      const result = await this.probe(target, password, this.logger);
      if (persistResult) {
        this.database.recordConnectionTest({ protocol: result.protocol, latencyMs: result.latencyMs, error: null });
        this.database.addAudit("CONNECTION_TEST_SUCCEEDED", { protocol: result.protocol, latencyMs: result.latencyMs });
      }
      const { protocol: _protocol, ...publicResult } = result;
      return { ...publicResult, checkType: "protocol", passwordVerified: true };
    } catch (error: unknown) {
      const probeError = error instanceof TeamSpeakProbeError
        ? error
        : new TeamSpeakProbeError("INTERNAL_ERROR", "Connection test failed", error);
      if (persistResult) {
        this.database.recordConnectionTest({ protocol: null, latencyMs: null, error: probeError.code });
        this.database.addAudit("CONNECTION_TEST_FAILED", { code: probeError.code });
      }
      throw probeError;
    }
  }

  getOverview(activeSessions: number, peakSessions: number, startedAt: number): Record<string, unknown> {
    const settings = this.database.getSettings();
    return {
      gateway: {
        status: "running",
        version: this.version,
        uptimeSeconds: Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
      },
      teamSpeak: {
        target: formatTeamSpeakTarget({ host: settings.tsHost, port: settings.tsPort }),
        status: settings.lastTestError ? "unreachable" : settings.lastTestAt ? "reachable" : "unknown",
        lastTestAt: settings.lastTestAt,
        latencyMs: settings.lastTestLatencyMs,
        lastError: settings.lastTestError,
      },
      sessions: { active: activeSessions, peak: peakSessions, limit: 100 },
      recentEvents: this.database.recentAudit(),
      legacyConfigImported: this.database.getMeta("legacy_import_notice_pending") === "1",
    };
  }

  createManagedInvite(input: ManagedInviteInput): { invite: ManagedInviteView; token: string } {
    const channel = input.channel.trim();
    if (channel.length > 100) throw new AdminInputError("INVALID_INVITE_CHANNEL", "Invite channel cannot exceed 100 characters");
    if (!Number.isFinite(input.expiresInHours) || input.expiresInHours < 1 || input.expiresInHours > 720) {
      throw new AdminInputError("INVALID_INVITE_EXPIRY", "Invite expiry must be between 1 and 720 hours");
    }
    if (!Number.isInteger(input.maxUses) || input.maxUses < 0 || input.maxUses > 10000) {
      throw new AdminInputError("INVALID_INVITE_USES", "Invite max uses must be between 0 and 10000");
    }
    const settings = this.database.getSettings();
    const token = randomBytes(32).toString("base64url");
    const record = this.database.createManagedInvite({
      id: `invite-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`,
      tokenHash: hashInviteToken(token),
      targetHost: settings.tsHost,
      targetPort: settings.tsPort,
      serverPasswordEncrypted: settings.tsPasswordEncrypted,
      channel,
      expiresAt: new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000).toISOString(),
      maxUses: input.maxUses,
    });
    this.database.addAudit("INVITE_CREATED", { id: record.id, channel, maxUses: input.maxUses });
    return { invite: this.toInviteView(record), token };
  }

  listManagedInvites(): ManagedInviteView[] {
    return this.database.listManagedInvites().map((record) => this.toInviteView(record));
  }

  revokeManagedInvite(id: string): boolean {
    if (!/^invite-[a-z0-9-]+$/i.test(id) || id.length > 100) throw new AdminInputError("INVALID_INVITE_ID", "Invite id is invalid");
    const revoked = this.database.revokeManagedInvite(id);
    if (revoked) this.database.addAudit("INVITE_REVOKED", { id });
    return revoked;
  }

  consumeManagedInvite(token: string): { target: TeamSpeakTarget; serverPassword: string; channel: string } | null {
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) return null;
    const record = this.database.consumeManagedInvite(hashInviteToken(token));
    if (!record) return null;
    let serverPassword = "";
    try {
      serverPassword = decryptSecret(record.serverPasswordEncrypted, this.masterSecret);
    } catch (error: unknown) {
      this.logger.error({ err: error instanceof Error ? error.message : String(error), inviteId: record.id }, "Managed invite password could not be decrypted");
    }
    this.database.addAudit("INVITE_CONSUMED", { id: record.id });
    return { target: { host: record.targetHost, port: record.targetPort }, serverPassword, channel: record.channel };
  }

  dismissLegacyImportNotice(): void {
    this.database.setMeta("legacy_import_notice_pending", "0");
  }

  private normalizeSettings(input: AdminSettingsInput, current: ReturnType<WebSpeakDatabase["getSettings"]>, relayNodes?: PersistedRelayNode[]): SettingsUpdate {
    let target: TeamSpeakTarget;
    try {
      target = parseTeamSpeakTarget(input.target);
    } catch {
      throw new AdminInputError("INVALID_TARGET", "TeamSpeak target is invalid");
    }
    const siteName = input.siteName.trim();
    const welcomeText = input.welcomeText.trim();
    const welcomeTextEn = typeof input.welcomeTextEn === "string" ? input.welcomeTextEn.trim() : current.welcomeTextEn;
    if (!siteName || siteName.length > 80) throw new AdminInputError("INVALID_SITE_NAME", "Site name must contain 1 to 80 characters");
    if (welcomeText.length > 500) throw new AdminInputError("INVALID_WELCOME_TEXT", "Welcome text cannot exceed 500 characters");
    if (welcomeTextEn.length > 500) throw new AdminInputError("INVALID_WELCOME_TEXT_EN", "English welcome text cannot exceed 500 characters");
    if (input.accessMode !== "fixed" && input.accessMode !== "open") {
      throw new AdminInputError("INVALID_ACCESS_MODE", "Access mode is invalid");
    }
    if (typeof input.webRtcEnabled !== "boolean") {
      throw new AdminInputError("INVALID_WEBRTC_ENABLED", "WebRTC enabled value is invalid");
    }
    const webRtcUdpStart = input.webRtcUdpStart ?? current.webRtcUdpStart ?? DEFAULT_WEBRTC_UDP_PORT_RANGE[0];
    const webRtcUdpEnd = input.webRtcUdpEnd ?? current.webRtcUdpEnd ?? DEFAULT_WEBRTC_UDP_PORT_RANGE[1];
    if (!Number.isInteger(webRtcUdpStart) || webRtcUdpStart < WEBRTC_UDP_PORT_MIN || webRtcUdpStart > WEBRTC_UDP_PORT_MAX) {
      throw new AdminInputError("INVALID_WEBRTC_PORT_RANGE", "WebRTC UDP start port must be between 1024 and 65535");
    }
    if (!Number.isInteger(webRtcUdpEnd) || webRtcUdpEnd < WEBRTC_UDP_PORT_MIN || webRtcUdpEnd > WEBRTC_UDP_PORT_MAX) {
      throw new AdminInputError("INVALID_WEBRTC_PORT_RANGE", "WebRTC UDP end port must be between 1024 and 65535");
    }
    if (webRtcUdpStart > webRtcUdpEnd) {
      throw new AdminInputError("INVALID_WEBRTC_PORT_RANGE", "WebRTC UDP start port must not exceed the end port");
    }
    if (current.webRtcEnabled && (webRtcUdpStart !== current.webRtcUdpStart || webRtcUdpEnd !== current.webRtcUdpEnd)) {
      throw new AdminInputError("WEBRTC_PORT_LOCKED", "Disable WebRTC and save before changing its UDP port range");
    }

    let encryptedPassword = current.tsPasswordEncrypted;
    const action = input.passwordAction ?? (input.serverPassword === undefined ? "keep" : "replace");
    if (action === "remove") encryptedPassword = null;
    if (action === "replace") encryptedPassword = input.serverPassword ? encryptSecret(input.serverPassword, this.masterSecret) : null;

    let relayConfigured = current.relayConfigured;
    let relayEnabled = current.relayEnabled;
    let relayName = current.relayName;
    let relayHost = current.relayHost;
    let relayPort = current.relayPort || DEFAULT_ACCELERATION_RELAY_PORT;
    let relayTokenEncrypted = current.relayTokenEncrypted;
    const relaySettingsAction = input.relaySettingsAction ?? "keep";
    if (relaySettingsAction === "remove") {
      relayConfigured = true;
      relayEnabled = false;
      relayName = "";
      relayHost = "";
      relayPort = DEFAULT_ACCELERATION_RELAY_PORT;
      relayTokenEncrypted = null;
    } else if (relaySettingsAction === "replace") {
      const relayTarget = (input.relayTarget ?? "").trim();
      relayEnabled = input.relayEnabled === true;
      relayName = (input.relayName ?? "").trim();
      if (relayName.length > 80) throw new AdminInputError("INVALID_RELAY_NAME", "Relay name must contain 80 characters or fewer");
      if (relayEnabled && !relayName) throw new AdminInputError("INVALID_RELAY_NAME", "Relay name is required when the relay is enabled");
      if (relayEnabled && !relayTarget) throw new AdminInputError("INVALID_RELAY_TARGET", "Relay target is required when the relay is enabled");
      if (relayTarget) {
        try {
          const relay = parseTeamSpeakTarget(relayTarget, DEFAULT_ACCELERATION_RELAY_PORT);
          relayHost = relay.host;
          relayPort = relay.port;
        } catch {
          throw new AdminInputError("INVALID_RELAY_TARGET", "Relay target is invalid");
        }
      } else {
        relayHost = "";
        relayPort = DEFAULT_ACCELERATION_RELAY_PORT;
      }
      const relayTokenAction = input.relayTokenAction ?? (input.relayToken === undefined ? "keep" : "replace");
      if (relayTokenAction === "remove") relayTokenEncrypted = null;
      if (relayTokenAction === "replace") relayTokenEncrypted = input.relayToken ? encryptSecret(input.relayToken, this.masterSecret) : null;
      if (relayEnabled && !relayTokenEncrypted) throw new AdminInputError("INVALID_RELAY_TOKEN", "Relay token is required when the relay is enabled");
      relayConfigured = true;
    }
    if (relayNodes) {
      const primary = relayNodes.find((node) => node.enabled) ?? relayNodes[0];
      relayConfigured = relayNodes.length > 0;
      relayEnabled = primary?.enabled === true;
      relayName = primary?.name ?? "";
      relayHost = primary?.host ?? "";
      relayPort = primary?.port ?? DEFAULT_ACCELERATION_RELAY_PORT;
      relayTokenEncrypted = primary?.tokenEncrypted ?? null;
    }
    return {
      siteName,
      welcomeText,
      welcomeTextEn,
      accessMode: input.accessMode,
      tsHost: target.host,
      tsPort: target.port,
      tsPasswordEncrypted: encryptedPassword,
      webRtcEnabled: input.webRtcEnabled,
      webRtcUdpStart,
      webRtcUdpEnd,
      relayConfigured,
      relayEnabled,
      relayName,
      relayHost,
      relayPort,
      relayTokenEncrypted,
    };
  }

  private normalizeRelayNodes(inputs: RelayNodeInput[]): PersistedRelayNode[] {
    if (!Array.isArray(inputs) || inputs.length > 16) throw new AdminInputError("INVALID_RELAY_NODES", "At most 16 relay nodes may be configured");
    const current = new Map(this.database.listRelayNodes().map((node) => [node.id, node]));
    const seen = new Set<string>();
    const now = new Date().toISOString();
    return inputs.map((input) => {
      const name = typeof input.name === "string" ? input.name.trim() : "";
      const targetText = typeof input.target === "string" ? input.target.trim() : "";
      if (!name || name.length > 80) throw new AdminInputError("INVALID_RELAY_NAME", "Relay name must contain 1 to 80 characters");
      if (!targetText || targetText.length > 300) throw new AdminInputError("INVALID_RELAY_TARGET", "Relay target is invalid");
      let target: TeamSpeakTarget;
      try { target = parseTeamSpeakTarget(targetText, DEFAULT_ACCELERATION_RELAY_PORT); }
      catch { throw new AdminInputError("INVALID_RELAY_TARGET", "Relay target is invalid"); }
      const id = typeof input.id === "string" && /^relay-[a-z0-9-]{1,100}$/i.test(input.id)
        ? input.id
        : `relay-${randomBytes(8).toString("hex")}`;
      if (seen.has(id)) throw new AdminInputError("INVALID_RELAY_ID", "Relay id must be unique");
      seen.add(id);
      const previous = current.get(id);
      const tokenAction = input.tokenAction ?? (input.token === undefined ? "keep" : "replace");
      let tokenEncrypted = previous?.tokenEncrypted ?? null;
      if (tokenAction === "remove") tokenEncrypted = null;
      if (tokenAction === "replace") {
        const token = typeof input.token === "string" ? input.token.trim() : "";
        tokenEncrypted = token ? encryptSecret(token, this.masterSecret) : null;
      }
      if (input.enabled === true && (!tokenEncrypted || !this.canDecryptToken(tokenEncrypted))) {
        throw new AdminInputError("INVALID_RELAY_TOKEN", "A relay token of at least 16 characters is required when the relay is enabled");
      }
      return {
        id,
        name,
        enabled: input.enabled === true,
        host: target.host,
        port: target.port,
        tokenEncrypted,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
      };
    });
  }

  private canDecryptToken(encrypted: string): boolean {
    try {
      return decryptSecret(encrypted, this.masterSecret).length >= 16;
    } catch {
      return false;
    }
  }

  private getRelayNodeViews(): Array<{ id: string; name: string; enabled: boolean; target: string; hasToken: boolean }> {
    return this.database.listRelayNodes().map((node) => ({
      id: node.id,
      name: node.name,
      enabled: node.enabled,
      target: formatRelayTarget(node.host, node.port),
      hasToken: Boolean(node.tokenEncrypted),
    }));
  }

  private legacyRelayNodesFromSettings(settings: SettingsUpdate): PersistedRelayNode[] {
    if (!settings.relayConfigured || !settings.relayHost || !settings.relayTokenEncrypted) return [];
    const previous = this.database.listRelayNodes()[0];
    const now = new Date().toISOString();
    return [{
      id: previous?.id ?? "relay-default",
      name: settings.relayName || "中继加速",
      enabled: settings.relayEnabled,
      host: settings.relayHost,
      port: settings.relayPort || DEFAULT_ACCELERATION_RELAY_PORT,
      tokenEncrypted: settings.relayTokenEncrypted,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    }];
  }

  private toInviteView(record: ManagedInviteRecord): ManagedInviteView {
    const now = Date.now();
    const expired = Date.parse(record.expiresAt) <= now;
    const exhausted = record.maxUses > 0 && record.useCount >= record.maxUses;
    return {
      id: record.id,
      target: formatTeamSpeakTarget({ host: record.targetHost, port: record.targetPort }),
      channel: record.channel,
      expiresAt: record.expiresAt,
      maxUses: record.maxUses,
      useCount: record.useCount,
      createdAt: record.createdAt,
      revokedAt: record.revokedAt,
      status: record.revokedAt ? "revoked" : expired ? "expired" : exhausted ? "exhausted" : "active",
    };
  }

  private toSettingsUpdate(settings: ReturnType<WebSpeakDatabase["getSettings"]>): SettingsUpdate {
    return {
      siteName: settings.siteName,
      welcomeText: settings.welcomeText,
      welcomeTextEn: settings.welcomeTextEn,
      accessMode: settings.accessMode,
      tsHost: settings.tsHost,
      tsPort: settings.tsPort,
      tsPasswordEncrypted: settings.tsPasswordEncrypted,
      webRtcEnabled: settings.webRtcEnabled,
      webRtcUdpStart: settings.webRtcUdpStart,
      webRtcUdpEnd: settings.webRtcUdpEnd,
      relayConfigured: settings.relayConfigured,
      relayEnabled: settings.relayEnabled,
      relayName: settings.relayName,
      relayHost: settings.relayHost,
      relayPort: settings.relayPort,
      relayTokenEncrypted: settings.relayTokenEncrypted,
    };
  }

  private importLegacyConfigOnce(): void {
    if (this.database.getMeta("legacy_config_checked") === "1") return;
    if (existsSync(this.legacyConfigPath)) {
      const legacy = loadConfig(this.legacyConfigPath);
      const current = this.database.getSettings();
      this.database.updateSettings({
        siteName: current.siteName,
        welcomeText: current.welcomeText,
        welcomeTextEn: current.welcomeTextEn,
        accessMode: current.accessMode,
        tsHost: legacy.tsHost,
        tsPort: legacy.tsPort,
        tsPasswordEncrypted: legacy.tsServerPassword ? encryptSecret(legacy.tsServerPassword, this.masterSecret) : null,
        webRtcEnabled: current.webRtcEnabled,
        webRtcUdpStart: current.webRtcUdpStart,
        webRtcUdpEnd: current.webRtcUdpEnd,
        relayConfigured: current.relayConfigured,
        relayEnabled: current.relayEnabled,
        relayName: current.relayName,
        relayHost: current.relayHost,
        relayPort: current.relayPort,
        relayTokenEncrypted: current.relayTokenEncrypted,
      }, "LEGACY_CONFIG_IMPORTED");
      this.database.setMeta("legacy_config_imported", "1");
      this.database.setMeta("legacy_import_notice_pending", "1");
      this.logger.info("Legacy config imported; WebSpeak settings are now managed from /admin");
    }
    this.database.setMeta("legacy_config_checked", "1");
  }
}

function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function formatRelayTarget(host: string, port: number): string {
  return `${host.includes(":") ? `[${host}]` : host}#${port}`;
}

export class AdminInputError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "AdminInputError";
  }
}
