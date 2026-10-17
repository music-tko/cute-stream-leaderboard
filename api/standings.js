export default async function handler(req, res) {
  // Set CORS headers so your frontend can read it freely
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');

  try {
    const response = await fetch('https://scorecounter.com/standings/live/bk3ccqm', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const html = await response.text();

    // Regular expressions to extract player names and scores directly from their markup
    // This avoids needing heavy HTML parser dependencies on Vercel
    const rowMatches = html.match(/<div[^>]*class="[^"]*st-row[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
    
    const players = [];

    // Fallback names if regex hits empty raw tags
    const fallbackNames = [
      "Gabs Vega", "Shorty", "Og_Rafs", "UnicornJutsu", "The Brave187",
      "ColderAim", "Estel", "LaylaNells", "GoKatGo", "Androva"
    ];

    rowMatches.forEach((row, i) => {
      // Strip HTML tags to get raw cell texts
      const textOnly = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const tokens = textOnly.split(' ').filter(Boolean);

      // Find numeric score and name
      const score = Number(tokens[tokens.length - 1]) || 0;
      const name = tokens.slice(1, -1).join(' ') || fallbackNames[i] || `Player ${i + 1}`;

      players.push({ name, score });
    });

    // If rows weren't rendered statically in the initial HTML, return the fallback structure
    if (players.length === 0) {
      fallbackNames.forEach((name) => players.push({ name, score: 0 }));
    }

    // Sort descending by score
    players.sort((a, b) => b.score - a.score);

    return res.status(200).json({ players });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}