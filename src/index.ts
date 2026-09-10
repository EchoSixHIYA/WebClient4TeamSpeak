import path from "node:path";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createLogger } from "./logger.js";
import { createWebServer } from "./server/server.js";
import { APP_PORT } from "./constants.js";
import { WebSpeakDatabase } from "./persistence/database.js";
import { loadOrCreateMasterSecret } from "./security/master-secret.js";
import { AdminService } from "./admin/admin-service.js";
import { JoinTicketStore } from "./server/join-ticket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT_DIR, "config.json");
const CERT_DIR = path.join(ROOT_DIR, "certs");
// Production images mount the persistent volume at /data. Source installs
// keep the historical project-local data directory unless overridden.
const DATA_DIR = process.env.WEBSPEAK_DATA_DIR?.trim() || path.join(ROOT_DIR, "data");
const LOG_DIR = path.join(DATA_DIR, "logs");
const STATIC_DIR = path.join(ROOT_DIR, "web", "dist");
const APP_VERSION = readPackageVersion();

async function main() {
  const logger = createLogger(LOG_DIR);
  const database = new WebSpeakDatabase(path.join(DATA_DIR, "webspeak.db"));
  const masterSecret = loadOrCreateMasterSecret(path.join(DATA_DIR, "master.key"));
  const adminService = new AdminService(
    database,
    masterSecret,
    logger,
    CONFIG_PATH,
    undefined,
    APP_VERSION,
  );
  await adminService.initialize();
  removeObsoleteBootstrapFile();
  const joinTickets = new JoinTicketStore();

  logger.info({ dataDir: DATA_DIR }, "Starting WebSpeak server");

  const hasCert = existsSync(path.join(CERT_DIR, "cert.pem"));

  const webServer = createWebServer({
    port: APP_PORT,
    version: APP_VERSION,
    logFile: path.join(LOG_DIR, "webspeak.log"),
    staticDir: STATIC_DIR,
    certDir: hasCert ? CERT_DIR : undefined,
    voiceBridgeOptions: {
      joinTickets,
      webRtc: () => adminService.getWebRtcAudioOptions(),
      // The public gateway only uses the relay configuration explicitly
      // saved in the admin console. Environment variables belong to the
      // standalone relay process and must never make the relay option appear
      // in the visitor UI after an administrator disables it.
      acceleration: () => adminService.getAccelerationRelayOptions(),
      accelerationName: () => adminService.getAccelerationRelayName(),
    },
    adminService,
    logger,
  });

  await webServer.start();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    await webServer.stop();
    database.close();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

function readPackageVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(path.join(ROOT_DIR, "package.json"), "utf8")) as { version?: unknown };
    return typeof packageJson.version === "string" && packageJson.version ? packageJson.version : "0.1.0";
  } catch {
    return "0.1.0";
  }
}

function removeObsoleteBootstrapFile(): void {
  try {
    unlinkSync(path.join(DATA_DIR, "bootstrap"));
  } catch (error: unknown) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
