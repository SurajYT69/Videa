import { getAiring } from "@/lib/tmdb";

/** At most this many shows per request; the client sends ten. */
const MAX_IDS = 10;

/**
 * Air dates for the series a browser has saved. The ids come from that
 * browser's LocalStorage, so they are validated here rather than trusted.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [
    ...new Set(
      raw
        .split(",")
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ].slice(0, MAX_IDS);

  if (!ids.length) return Response.json({ shows: [] });

  const results = await Promise.allSettled(ids.map((id) => getAiring(id)));
  const shows = results.flatMap((result) =>
    result.status === "fulfilled" && result.value ? [result.value] : [],
  );
  return Response.json({ shows });
}
