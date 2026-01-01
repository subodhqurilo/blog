import Page from "../models/page.js";

export const generateSitemap = async (req, res) => {
  try {
    const posts = await Page.find({ status: "published" })
      .select("slug updatedAt")
      .sort({ updatedAt: -1 });
    
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
    
    posts.forEach((post) => {
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });
    
    sitemap += `</urlset>`;
    
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};