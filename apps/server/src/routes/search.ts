import { Router } from "express";

export const searchRouter = Router();

searchRouter.get("/meaning", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim() === "") {
    return res.status(400).json({ success: false, error: "Query is required" });
  }

  try {
    // 1. Fetch Wikipedia Summary (Language-aware, fallback to English)
    let wikiData: any = null;
    try {
      // Find open search suggestion first
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        query
      )}&limit=1&namespace=0&format=json`;
      const searchRes = await fetch(searchUrl);
      const searchData = (await searchRes.json()) as any;

      let searchTitle = query;
      if (searchData && Array.isArray(searchData[1]) && searchData[1].length > 0) {
        searchTitle = searchData[1][0];
      }

      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        searchTitle
      )}`;
      const summaryRes = await fetch(summaryUrl);
      if (summaryRes.ok) {
        wikiData = await summaryRes.json();
      }
    } catch (e) {
      // Non-fatal
    }

    // 2. Try Dictionary API
    let dictionaryData: any = null;
    try {
      const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`;
      const dictRes = await fetch(dictUrl);
      if (dictRes.ok) {
        dictionaryData = await dictRes.json();
      }
    } catch (e) {
      // Non-fatal
    }

    // 3. Build definitions list
    const definitions: any[] = [];
    if (dictionaryData && Array.isArray(dictionaryData) && dictionaryData[0]) {
      const firstEntry = dictionaryData[0];
      if (firstEntry.meanings) {
        firstEntry.meanings.forEach((m: any) => {
          const partOfSpeech = m.partOfSpeech;
          const defs =
            m.definitions?.slice(0, 2).map((d: any) => ({
              definition: d.definition,
              example: d.example || null,
            })) || [];
          if (defs.length > 0) {
            definitions.push({ partOfSpeech, defs });
          }
        });
      }
    }

    const result = {
      title: wikiData?.title || query,
      description: wikiData?.description || "Search Result",
      overview: wikiData?.extract || "No quick overview available.",
      image: wikiData?.thumbnail?.source || null,
      definitions,
      googleResults: [],
    };

    return res.json({ success: true, result });
  } catch (error: any) {
    console.error("Meaning search failed:", error);
    return res.status(500).json({ success: false, error: "Search failed. Please try again." });
  }
});
