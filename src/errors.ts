export type WebSpeakErrorCode =
  | "invalid_target"
  | "unreachable"
  | "timeout"
  | "authentication_failed"
  | "protocol_negotiation_failed"
  | "server_full"
  | "unknown";

export type ClientConnectionFailureCode =
  | "INVALID_TARGET"
  | "UNREACHABLE"
  | "TIMEOUT"
  | "SERVER_PASSWORD_REQUIRED"
  | "INVALID_SERVER_PASSWORD"
  | "PROTOCOL_NEGOTIATION_FAILED"
  | "SERVER_REJECTED"
  | "CONNECTION_FAILED";

export class WebSpeakError extends Error {
  readonly code: WebSpeakErrorCode;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(code: WebSpeakErrorCode, message: string, retryable: boolean, cause?: unknown) {
    super(message);
    this.name = "WebSpeakError";
    this.code = code;
    this.retryable = retryable;
    this.cause = cause;
  }
}

export function normalizeTeamSpeakError(error: unknown): WebSpeakError {
  if (error instanceof WebSpeakError) return error;

  const candidate = error as { code?: unknown; id?: unknown; serverMessage?: unknown; message?: unknown } | null;
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  const id = typeof candidate?.id === "string" || typeof candidate?.id === "number" ? String(candidate.id) : "";
  const serverMessage = typeof candidate?.serverMessage === "string" ? candidate.serverMessage : "";
  const message = typeof candidate?.message === "string" ? candidate.message : String(error);
  const text = `${code} ${id} ${serverMessage} ${message}`.toLocaleLowerCase();

  if (/password|authenticate|authentication|not authorized|invalid.*(credential|password)/.test(text)) {
    return new WebSpeakError("authentication_failed", "TeamSpeak authentication failed", false, error);
  }
  if (/timeout|timed out|ack timeout|idle timeout/.test(text)) {
    return new WebSpeakError("timeout", "TeamSpeak connection timed out", true, error);
  }
  if (/econnrefused|enotfound|ehostunreach|enetunreach|network|socket|dns/.test(text)) {
    return new WebSpeakError("unreachable", "TeamSpeak server is unreachable", true, error);
  }
  if (/protocol|handshake|crypto|init1/.test(text)) {
    return new WebSpeakError("protocol_negotiation_failed", "TeamSpeak protocol negotiation failed", true, error);
  }
  return new WebSpeakError("unknown", "TeamSpeak connection failed", false, error);
}

export function clientConnectionFailureCode(error: WebSpeakError, serverPassword = ""): ClientConnectionFailureCode {
  if (error.code === "authentication_failed") {
    return serverPassword.trim() ? "INVALID_SERVER_PASSWORD" : "SERVER_PASSWORD_REQUIRED";
  }
  const mapping: Record<WebSpeakErrorCode, ClientConnectionFailureCode> = {
    invalid_target: "INVALID_TARGET",
    unreachable: "UNREACHABLE",
    timeout: "TIMEOUT",
    authentication_failed: "SERVER_PASSWORD_REQUIRED",
    protocol_negotiation_failed: "PROTOCOL_NEGOTIATION_FAILED",
    server_full: "SERVER_REJECTED",
    unknown: "CONNECTION_FAILED",
  };
  return mapping[error.code];
}
