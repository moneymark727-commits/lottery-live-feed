// server.js
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Scrape Powerball.com (official, public, no auth)
async function getPowerball() {
  try {
    const res = await fetch('https://www.powerball.com/', {
      headers: {
        'User-Agent': 'LotteryMechanic/1.0 (+https://lotterymechanic.com)'
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Jackpot: e.g., "Jackpot: $243 Million" → extract "243"
    const jackpotMatch = html.match(/Jackpot:\s*\$(\d+)\s+Million/i);
    const jackpot = jackpotMatch ? `$${jackpotMatch[1]} Million` : 'N/A';

    // Next Draw Date: e.g., "Next Drawing: Monday, June 10, 2025"
    const dateMatch = html.match(/Next Drawing:.*?(\d{1,2}\/\d{1,2}\/\d{4})/i);
    const date = dateMatch ? dateMatch[1] : 'N/A';

    // Winning Numbers: from latest draw
    const numbersMatch = html.match(/<span class="result">(\d+)<\/span>/g);
    const numbers = numbersMatch
      ? numbersMatch.map(tag => tag.replace(/<[^>]*>/g, '')).join(' ')
      : 'N/A';

    return {
      game: 'Powerball',
      jackpot,
      date,
      numbers
    };
  } catch (e) {
    console.error('Powerball scrape failed:', e.message);
    return {
      game: 'Powerball',
      jackpot: 'OFFLINE',
      date: 'OFFLINE',
      numbers: 'OFFLINE'
    };
  }
}

// Scrape Texas Scratch-Offs (from your known plain-text export)
async function getTexasScratchOffs() {
  try {
    const res = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Scratch_Offs/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    // Extract latest start date (for display)
    const lines = text.split('\n');
    let latestDate = 'N/A';
    const dateRegex = /Start:\s*(\d{2}\/\d{2}\/\d{4})/;
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        latestDate = match[1]; // Just grab the first (most recent)
        break;
      }
    }

    return {
      game: 'Texas Scratch-Offs',
      jackpot: 'Active Games Live',
      date: latestDate,
      numbers: 'Check official site for full list'
    };
  } catch (e) {
    console.error('Texas scrape failed:', e.message);
    return {
      game: 'Texas Scratch-Offs',
      jackpot: 'OFFLINE',
      date: 'OFFLINE',
      numbers: 'OFFLINE'
    };
  }
}

// API Endpoint
app.get('/api/lottery', async (req, res) => {
  const [pb, tx] = await Promise.all([getPowerball(), getTexasScratchOffs()]);
  res.json([pb, tx]);
});

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'LotteryMechanic Live Feed' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
