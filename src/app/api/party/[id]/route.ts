import { NextResponse } from "next/server";
import { isPartyId, readParty, writeParty } from "@/lib/party";

type Ctx = { params: Promise<{ id: string }> };

/** Current room state plus the server clock, so clients can correct for skew. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isPartyId(id)) return NextResponse.json({ error: "Bad room" }, { status: 400 });
  try {
    const state = await readParty(id);
    if (!state) return NextResponse.json({ error: "Room ended" }, { status: 404 });
    return NextResponse.json({ state, now: Date.now() });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 502 });
  }
}

/** One viewer played, paused or seeked. Validated: it is untrusted input. */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isPartyId(id)) return NextResponse.json({ error: "Bad room" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  const { playing, time, by } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof playing !== "boolean" ||
    typeof time !== "number" ||
    !Number.isFinite(time) ||
    time < 0 ||
    time > 60 * 60 * 24 ||
    typeof by !== "string" ||
    by.length > 32
  ) {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  try {
    const current = await readParty(id);
    if (!current) return NextResponse.json({ error: "Room ended" }, { status: 404 });
    const state = { playing, time, at: Date.now(), v: current.v + 1, by };
    await writeParty(id, state);
    return NextResponse.json({ state, now: Date.now() });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 502 });
  }
}
