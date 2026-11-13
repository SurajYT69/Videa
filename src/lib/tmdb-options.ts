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
