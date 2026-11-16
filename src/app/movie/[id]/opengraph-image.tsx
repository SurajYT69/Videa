import { shareCard } from "@/lib/share-card";
import { getMovie } from "@/lib/tmdb";

export { size, contentType } from "@/lib/share-card";
export const alt = "oovi share card";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const details = Number.isInteger(id) && id > 0 ? await getMovie(id).catch(() => null) : null;
  return shareCard(details, "Film");
}
