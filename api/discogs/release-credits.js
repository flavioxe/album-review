import { discogsFetch, mapCreditsFromRelease, sendDiscogsError } from "./_discogs.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { artist, album } = req.query;
  if (!artist || !album) {
    return res.status(400).json({ error: "Query params 'artist' and 'album' are required" });
  }

  try {
    const searchData = await discogsFetch("/database/search", {
      artist: String(artist).trim(),
      release_title: String(album).trim(),
      type: "release",
      per_page: "1",
    });

    const bestMatch = (searchData.results || [])[0];
    if (!bestMatch) {
      return res.status(404).json({ error: "Release not found on Discogs" });
    }

    const releaseData = await discogsFetch(`/releases/${bestMatch.id}`);
    return res.status(200).json(mapCreditsFromRelease(releaseData));
  } catch (error) {
    return sendDiscogsError(res, error);
  }
}
