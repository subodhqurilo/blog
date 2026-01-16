import Page from "../models/page.js";

/**
 * ========================================
 * SITEMAP.XML
 * ========================================
 */
export const sitemap = async (req, res) => {
  try {
    const pages = await Page.find({ status: "published" }).select("slug updatedAt");

    const urls = pages
      .map(
        (p) => `
  <url>
    <loc>${process.env.FRONTEND_URL}/blog/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
  </url>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * ========================================
 * RSS.XML
 * ========================================
 */
export const rss = async (req, res) => {
  try {
    const posts = await Page.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(20);

    const items = posts
      .map(
        (p) => `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${process.env.FRONTEND_URL}/blog/${p.slug}</link>
    <pubDate>${p.publishedAt.toUTCString()}</pubDate>
    <description><![CDATA[${p.excerpt}]]></description>
  </item>`
      )
      .join("");

    const xml = `<?xml version="1.0"?>
<rss version="2.0">
<channel>
<title>Blog RSS</title>
<link>${process.env.FRONTEND_URL}</link>
<description>Latest blog posts</description>
${items}
</channel>
</rss>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
