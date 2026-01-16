import express from "express";
import Page from "../models/page.js";

const router = express.Router();

/* =====================================================
   📌 SITEMAP.XML
   URL: /api/sitemap.xml
===================================================== */
router.get("/sitemap.xml", async (req, res) => {
  try {
    const pages = await Page.find({ status: "published" })
      .select("slug updatedAt");

    const baseUrl =
      process.env.FRONTEND_URL || "http://localhost:3000";

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach((page) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${page.slug}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `\n</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Sitemap Error:", error);
    res.status(500).send("Unable to generate sitemap");
  }
});

/* =====================================================
   📌 RSS.XML
   URL: /api/rss.xml
===================================================== */
router.get("/rss.xml", async (req, res) => {
  try {
    const posts = await Page.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(20)
      .select("title slug metaDescription publishedAt");

    const baseUrl =
      process.env.FRONTEND_URL || "http://localhost:3000";

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0">\n<channel>\n`;
    rss += `<title>Blog RSS Feed</title>\n`;
    rss += `<link>${baseUrl}</link>\n`;
    rss += `<description>Latest blog posts</description>\n`;

    posts.forEach((post) => {
      rss += `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${baseUrl}/blog/${post.slug}</link>
    <description><![CDATA[${
      post.metaDescription || ""
    }]]></description>
    <pubDate>${post.publishedAt.toUTCString()}</pubDate>
  </item>`;
    });

    rss += `\n</channel>\n</rss>`;

    res.header("Content-Type", "application/xml");
    res.send(rss);
  } catch (error) {
    console.error("RSS Error:", error);
    res.status(500).send("Unable to generate RSS feed");
  }
});

export default router;
