import { NextResponse } from "next/server";
import { newPartyId, PartyConfigError, writeParty } from "@/lib/party";

/** Start a room, paused at the start. The watch page URL carries the title. */
export async function POST() {
  try {
    const id = newPartyId();
    await writeParty(id, { playing: false, time: 0, at: Date.now(), v: 1, by: "" });
    return NextResponse.json({ id });
  } catch (error) {
    const status = error instanceof PartyConfigError ? 503 : 502;
    return NextResponse.json({ error: "Could not start a watch party" }, { status });
  }
}
