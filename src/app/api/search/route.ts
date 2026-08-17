import { searchMulti } from "@/lib/tmdb";

/** Suggestion feed for the header search. Keeps the TMDB key server-side. */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) return Response.json({ results: [] });

  try {
    const results = (await searchMulti(query)).slice(0, 7);
    return Response.json({ results });
  } catch {
    return Response.json(
      { results: [], message: "Search is unavailable right now." },
      { status: 502 },
    );
  }
}
