export type ResourceMedia = {
  type: "video" | "playlist" | "channel" | "web";
  videoId?: string;
  thumb?: string;
  host?: string;
};

/**
 * Classify a resource URL so the UI can pick the right card treatment:
 * real YouTube video thumbnails for videos, a branded fallback for
 * channels/playlists, and a domain chip for web articles.
 */
export function classifyResource(url: string | null): ResourceMedia {
  if (!url) return { type: "web" };

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { type: "web" };
  }

  const host = u.hostname.replace(/^www\./, "");
  const isYouTube = host.endsWith("youtube.com") || host === "youtu.be";

  if (isYouTube) {
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1) || null;
    else if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2] ?? null;
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2] ?? null;

    if (id) {
      return {
        type: "video",
        videoId: id,
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        host,
      };
    }
    if (u.pathname.startsWith("/playlist") || u.searchParams.get("list")) {
      return { type: "playlist", host };
    }
    return { type: "channel", host };
  }

  return { type: "web", host };
}
