import { randomBytes } from "node:crypto";
import type { TeamSpeakTarget } from "../domain/teamspeak-target.js";

export interface JoinTicketPayload {
  target: TeamSpeakTarget;
  serverPassword: string;
  nickname: string;
  channel?: string;
  identity?: string;
  rememberIdentity?: boolean;
  accelerated?: boolean;
  accelerationRelayId?: string;
}

interface StoredTicket {
  payload: JoinTicketPayload;
  expiresAt: number;
}

export class JoinTicketStore {
  private readonly tickets = new Map<string, StoredTicket>();

  constructor(private readonly ttlMs = 30_000, private readonly maxTickets = 256) {}

  create(payload: JoinTicketPayload, now = Date.now()): string {
    this.prune(now);
    while (this.tickets.size >= this.maxTickets) {
      const oldest = this.tickets.keys().next().value;
      if (!oldest) break;
      this.tickets.delete(oldest);
    }
    const token = randomBytes(24).toString("base64url");
    this.tickets.set(token, { payload, expiresAt: now + this.ttlMs });
    return token;
  }

  consume(token: string, now = Date.now()): JoinTicketPayload | null {
    const stored = this.tickets.get(token);
    this.tickets.delete(token);
    if (!stored || stored.expiresAt <= now) return null;
    return stored.payload;
  }

  private prune(now: number): void {
    for (const [token, stored] of this.tickets) {
      if (stored.expiresAt <= now) this.tickets.delete(token);
    }
  }
}
