import { discogsFetch, mapArtistFromDiscogs, sendDiscogsError } from "./_discogs.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "Query param 'q' is required" });
  }

  try {
    const searchData = await discogsFetch("/database/search", {
      q: String(q).trim(),
      type: "artist",
      per_page: "5",
    });

    const bestMatch = (searchData.results || [])[0];
    if (!bestMatch) {
      return res.status(404).json({ error: "Artist not found on Discogs" });
    }

    const artistData = await discogsFetch(`/artists/${bestMatch.id}`);
    return res.status(200).json(mapArtistFromDiscogs(artistData));
  } catch (error) {
    return sendDiscogsError(res, error);
  }
}
