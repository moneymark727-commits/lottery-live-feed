// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Scrape Powerball
async function getPowerball() {
  try {
    const res = await fetch('https://www.powerball.com/', {
      headers: { 'User-Agent': 'LotteryMechanic/1.0 (+https://lotterymechanic.com)' }
    });
    const html = await res.text();

    // Extract jackpot
    const jackpotMatch = html.match(/Jackpot:\s*\$?([\d,]+)/i);
    const jackpot = jackpotMatch ? `$${jackpotMatch[1]}` : 'N/A';

    // Extract next draw date (look for "Next Drawing" pattern)
    const dateMatch = html.match(/Next Drawing.*?(\d{1,2}\/\d{1,2}\/\d{4})/i);
    const date = dateMatch ? dateMatch[1] : 'N/A';

    // Extract numbers (from latest results)
    const numbersMatch = html.match(/<span class="result">(\d+)<\/span>/g);
    const numbers = numbersMatch 
      ? numbersMatch.map(n => n.replace(/<[^>]*>/g, '')).join(' ') 
      : 'N/A';

    return { game: 'Powerball', jackpot, date, numbers };
  } catch (e) {
    console.error('Powerball scrape failed:', e);
    return { game: 'Powerball', jackpot: 'ERROR', date: 'ERROR', numbers: 'ERROR' };
  }
}

// Scrape Mega Millions
async function getMegaMillions() {
  try {
    const res = await fetch('https://www.megamillions.com/', {
      headers: { 'User-Agent': 'LotteryMechanic/1.0 (+https://lotterymechanic.com)' }
    });
    const html = await res.text();

    const jackpotMatch = html.match(/Jackpot:\s*\$?([\d,]+)/i);
    const jackpot = jackpotMatch ? `$${jackpotMatch[1]}` : 'N/A';

    const dateMatch = html.match(/Next Drawing.*?(\d{1,2}\/\d{1,2}\/\d{4})/i);
    const date = dateMatch ? dateMatch[1] : 'N/A';

    const numbersMatch = html.match(/<li class="ball">(\d+)<\/li>/g);
    const numbers = numbersMatch 
      ? numbersMatch.map(n => n.replace(/<[^>]*>/g, '')).join(' ') 
      : 'N/A';

    return { game: 'Mega Millions', jackpot, date, numbers };
  } catch (e) {
    console.error('Mega Millions scrape failed:', e);
    return { game: 'Mega Millions', jackpot: 'ERROR', date: 'ERROR', numbers: 'ERROR' };
  }
}

// API Endpoint
app.get('/api/lottery', async (req, res) => {
  const [pb, mm] = await Promise.all([getPowerball(), getMegaMillions()]);
  res.json([pb, mm]);
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'LotteryMechanic Live Feed' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
