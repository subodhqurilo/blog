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

export const generateRSSFeed = async (req, res) => {
  try {
    const posts = await Page.find({ status: "published" })
      .select("title slug metaDescription publishedAt author")
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(20);
    
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Your Blog Title</title>
    <link>${baseUrl}</link>
    <description>Your amazing blog description</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/api/rss.xml" rel="self" type="application/rss+xml" />
`;
    
    posts.forEach((post) => {
      const author = post.author?.name || 'Admin';
      rss += `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description>${escapeXml(post.metaDescription || '')}</description>
      <author>${escapeXml(author)}</author>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
    </item>
`;
    });
    
    rss += `  </channel>
</rss>`;
    
    res.header("Content-Type", "application/xml");
    res.send(rss);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

