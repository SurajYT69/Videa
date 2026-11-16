/**
 * Watch party rooms, kept in Upstash Redis over its REST API (plain fetch, no
 * SDK). A room is one small JSON value that expires six hours after its last
 * write, so abandoned parties clean themselves up.
 */

export type PartyState = {
  playing: boolean;
  /** Player position in seconds when `at` was written. */
  time: number;
  /** Server clock (ms) of the last write; clients extrapolate from it. */
  at: number;
  /** Bumped on every write so clients only act on news. */
  v: number;
  /** Client that wrote it, so the writer does not re-apply its own change. */
  by: string;
};

const TTL_SECONDS = 6 * 60 * 60;
const ID_RE = /^[a-z0-9]{10}$/;

export class PartyConfigError extends Error {}

function config() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new PartyConfigError("Watch party storage is not configured");
  return { url, token };
}

async function redis<T>(command: (string | number)[]): Promise<T | null> {
  const { url, token } = config();
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  const data = (await res.json()) as { result?: T | null };
  return data.result ?? null;
}

const key = (id: string) => `party:${id}`;

export function isPartyId(id: string): boolean {
  return ID_RE.test(id);
}

export function newPartyId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
}

export async function readParty(id: string): Promise<PartyState | null> {
  const raw = await redis<string>(["GET", key(id)]);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PartyState;
  } catch {
    return null;
  }
}

export async function writeParty(id: string, state: PartyState): Promise<void> {
  await redis(["SET", key(id), JSON.stringify(state), "EX", TTL_SECONDS]);
}
