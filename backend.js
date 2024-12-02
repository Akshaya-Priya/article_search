const express = require("express");
const fs = require("fs");
const app = express();
const port = 1234;

app.use(express.json());

// In-memory storage for articles
let articles = [];
let idCounter = 1;

// Optional: Load articles from a file if it exists
const dataFile = "articles.json";
if (fs.existsSync(dataFile)) {
  const data = fs.readFileSync(dataFile, "utf-8");
  articles = JSON.parse(data);
  idCounter = articles.length + 1;
}

// Save articles to file
function saveArticles() {
  fs.writeFileSync(dataFile, JSON.stringify(articles, null, 2));
}

// Add Article (POST /articles)
app.post("/articles", (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const article = {
    id: idCounter++,
    title,
    content,
    tags: tags || [],
    createdAt: new Date(),
  };
  articles.push(article);
  saveArticles();
  res.status(201).json({ message: "Article added", article });
});

// Search Articles (GET /articles/search)
app.get("/articles/search", (req, res) => {
  const { keyword, tag, sortBy = "relevance" } = req.query;

  if (!keyword && !tag) {
    return res.status(400).json({ error: "Keyword or tag is required for search" });
  }

  let results = articles.filter(article => {
    const matchesKeyword =
      keyword &&
      (article.title.includes(keyword) || article.content.includes(keyword));
    const matchesTag = tag && article.tags.includes(tag);
    return matchesKeyword || matchesTag;
  });

  // Sort by relevance (based on keyword frequency) or date
  if (sortBy === "relevance" && keyword) {
    results.sort((a, b) => {
      const keywordCountA =
        (a.title.match(new RegExp(keyword, "gi")) || []).length +
        (a.content.match(new RegExp(keyword, "gi")) || []).length;
      const keywordCountB =
        (b.title.match(new RegExp(keyword, "gi")) || []).length +
        (b.content.match(new RegExp(keyword, "gi")) || []).length;
      return keywordCountB - keywordCountA;
    });
  } 
  res.json({ results });
});

// Get Article (GET /articles/:id)
app.get("/articles/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }
  res.json({ article });
});

// Start the server
app.listen(port, () => {
  console.log(`Mini Search Engine backend running on http://localhost:${port}`);
});

console.log(articles);
