import Page from "../models/page.js";

export const generateRSSFeed = async (req, res) => {
  try {
    const posts = await Page.find({ status: "published" })
      .select("title slug metaDescription publishedAt")
      .sort({ publishedAt: -1 })
      .limit(20);
    
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Your Blog Title</title>
    <link>${baseUrl}</link>
    <description>Your blog description</description>
    <language>en-us</language>
`;
    
    posts.forEach((post) => {
      rss += `    <item>
      <title>${post.title}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description>${post.metaDescription || ""}</description>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <guid>${baseUrl}/blog/${post.slug}</guid>
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

