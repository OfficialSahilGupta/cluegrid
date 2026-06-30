import { Router } from "express";
import { load } from "cheerio";

export const searchRouter = Router();

searchRouter.get("/meaning", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim() === "") {
    return res.status(400).json({ success: false, error: "Query is required" });
  }

  try {
    // 1. Fetch Google Search Results HTML Page
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
    const googleRes = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const googleHtml = await googleRes.text();
    const $ = load(googleHtml);

    // 2. Parse Featured Snippet / Answer Box / Translation card
    let featuredSnippet = "";
    const featuredSelectors = [
      "div.hgKElc",             // Google featured snippet text
      "span.RUv55",             // Translation result
      "div.tw-data-text",       // Google Translate widget target text
      "span#tw-answ-target-text",
      "div#tw-target-text",
      "div.L5e5ec",
      "div.c2gGi",
      "div.Z0LcW",
      "div.kno-rdesc span",     // Knowledge panel description
      "div.kno-rdesc",
      "div.BNeawe.s3ap9b.AP7Wnd", // Organic snippet text in some layouts
    ];
    for (const selector of featuredSelectors) {
      const txt = $(selector).first().text().trim();
      if (txt) {
        featuredSnippet = txt;
        break;
      }
    }

    // Direct Translate card text check (e.g. for foreign language words)
    const twTargetText = $("#tw-target-text, .tw-target-text, span#tw-answ-target-text").first().text().trim();
    const twSourceText = $("#tw-source-text, .tw-source-text, #tw-source-text-container").first().text().trim();
    if (twTargetText) {
      const translationLabel = twSourceText ? `Translation of "${twSourceText}": ` : "Translation: ";
      featuredSnippet = `${translationLabel}${twTargetText}` + (featuredSnippet ? `\n\n${featuredSnippet}` : "");
    }

    // 3. Parse Organic Search Results
    const googleResults: any[] = [];
    $("div.g, div.MjjYud, div.tF3i6c").each((_i, el) => {
      const titleEl = $(el).find("h3").first();
      const linkEl = $(el).find("a").first();
      const snippetEl = $(el)
        .find("div.VwiC3b, div.yD5geB, span.aCO62e, div.s3ap9b, div.kb0PBd")
        .first();

      const title = titleEl.text().trim();
      const link = linkEl.attr("href") || "";
      let snippet = snippetEl.text().trim();

      if (!snippet) {
        // Fallback: extract text inside this card that is relatively long
        $(el)
          .find("div, span")
          .each((_j, subEl) => {
            const txt = $(subEl).text().trim();
            if (txt.length > 50 && txt.length < 300 && !txt.includes(title)) {
              snippet = txt;
              return false;
            }
            return true;
          });
      }

      let cleanLink = link;
      if (link.startsWith("/url?q=")) {
        const urlMatch = link.match(/\/url\?q=([^&]+)/);
        if (urlMatch && urlMatch[1]) {
          cleanLink = decodeURIComponent(urlMatch[1]);
        }
      }

      if (title && cleanLink && cleanLink.startsWith("http")) {
        googleResults.push({ title, link: cleanLink, snippet });
      }
    });

    // 4. Resolve Wikipedia Summary (language-aware scanning of organic search links)
    let resolvedWikiTitle = "";
    let resolvedWikiLang = "en";

    for (const res of googleResults) {
      if (res.link && res.link.includes("wikipedia.org/wiki/")) {
        const match = res.link.match(/https?:\/\/([a-z-]+)\.wikipedia\.org\/wiki\/([^/?#]+)/);
        if (match && match[1] && match[2]) {
          resolvedWikiLang = match[1];
          resolvedWikiTitle = decodeURIComponent(match[2]);
          break;
        }
      }
    }

    let wikiData: any = null;
    try {
      if (resolvedWikiTitle) {
        const summaryUrl = `https://${resolvedWikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          resolvedWikiTitle
        )}`;
        const summaryRes = await fetch(summaryUrl);
        if (summaryRes.ok) {
          wikiData = await summaryRes.json();
        }
      } else {
        // Fallback to English Wikipedia OpenSearch
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
      }
    } catch (e) {
      // Wiki errors are non-fatal
    }

    // 5. Try Dictionary API
    let dictionaryData: any = null;
    try {
      const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`;
      const dictRes = await fetch(dictUrl);
      if (dictRes.ok) {
        dictionaryData = await dictRes.json();
      }
    } catch (e) {
      // Dictionary API errors are non-fatal
    }

    // 6. Build response object
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
      overview: featuredSnippet || wikiData?.extract || "No quick overview available.",
      image: wikiData?.thumbnail?.source || null,
      definitions,
      googleResults: googleResults.slice(0, 4),
    };

    return res.json({ success: true, result });
  } catch (error: any) {
    console.error("Meaning search failed:", error);
    return res.status(500).json({ success: false, error: "Search failed. Please try again." });
  }
});
