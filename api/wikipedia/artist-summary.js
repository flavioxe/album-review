import { getArtistSummaryFromWikipedia, sendWikipediaError } from "./_wikipedia.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "Query param 'q' is required" });
  }

  try {
    const summary = await getArtistSummaryFromWikipedia(String(q).trim());
    if (!summary) {
      return res.status(404).json({ error: "Artist not found on Wikipedia" });
    }

    return res.status(200).json(summary);
  } catch (error) {
    return sendWikipediaError(res, error);
  }
}
