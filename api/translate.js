export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, target } = req.query;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Query param 'text' is required" });
  }

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: "auto",
      tl: target || "pt",
      dt: "t",
      q: String(text),
    });

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Translate request failed with status ${response.status}`);
    }

    const data = await response.json();
    const translated = (data?.[0] || []).map((segment) => segment[0]).join("");

    return res.status(200).json({ translatedText: translated });
  } catch (error) {
    return res.status(502).json({ error: "Falha ao traduzir o texto" });
  }
}
