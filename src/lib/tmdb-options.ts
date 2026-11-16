/**
 * Filter values the browse pages offer. Plain data with no server imports, so
 * both the server listing (which validates against it) and the client filter
 * bar (which renders it) can use the same list.
 */

/** Original languages, ISO 639-1. Ordered for this site's audience. */
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "ml", label: "Malayalam" },
  { value: "kn", label: "Kannada" },
  { value: "bn", label: "Bengali" },
  { value: "mr", label: "Marathi" },
  { value: "pa", label: "Punjabi" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "tr", label: "Turkish" },
] as const;

/**
 * /tonight moods. TMDB's film and series genre lists differ (series have no
 * Horror, Thriller or Romance; Action and Sci-Fi are merged pairs), so each
 * mood carries both. Ids are ORed.
 */
export const TONIGHT_MOODS = [
  { id: "laugh", label: "Make me laugh", movie: [35], tv: [35] },
  { id: "edge", label: "Edge of my seat", movie: [53, 80, 9648], tv: [80, 9648] },
  { id: "loud", label: "Big and loud", movie: [28, 12], tv: [10759] },
  { id: "feel", label: "Something to feel", movie: [18, 10749], tv: [18] },
  { id: "away", label: "Take me elsewhere", movie: [878, 14], tv: [10765] },
  { id: "scare", label: "Scare me", movie: [27], tv: [9648] },
] as const;

/** How long the viewer has. The kind of title follows from it. */
export const TONIGHT_TIMES = [
  { id: "short", label: "Under 100 minutes", type: "movie", minRuntime: 70, maxRuntime: 99 },
  { id: "film", label: "A whole film", type: "movie", minRuntime: 90, maxRuntime: 170 },
  { id: "series", label: "A few episodes", type: "tv" },
] as const;

export type TonightMood = (typeof TONIGHT_MOODS)[number];
export type TonightTime = (typeof TONIGHT_TIMES)[number];

/**
 * Indian streaming services for /india. Curated rather than read from
 * `getProviders`: TMDB's IN list puts Apple TV Store, JustWatch TV and
 * Netflix Kids in its top ten, none of which earn a "new on" rail.
 */
export const INDIA_PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 2336, name: "JioHotstar" },
  { id: 232, name: "Zee5" },
  { id: 237, name: "Sony LIV" },
] as const;
