import { getSeason } from "@/lib/tmdb";

/** Episodes are fetched only when a season is actually opened. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const tvId = Number(params.get("tv"));
  const seasonNumber = Number(params.get("season"));

  if (!Number.isInteger(tvId) || !Number.isInteger(seasonNumber)) {
    return Response.json({ message: "Invalid season request." }, { status: 400 });
  }

  try {
    const season = await getSeason(tvId, seasonNumber);
    if (!season) {
      return Response.json({ message: "Season not found." }, { status: 404 });
    }
    return Response.json({ season });
  } catch {
    return Response.json(
      { message: "Could not load this season." },
      { status: 502 },
    );
  }
}
