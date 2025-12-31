async function getPowerball() {
  try {
    const res = await fetch('https://www.powerball.com/', {
      headers: { 'User-Agent': 'LotteryMechanic/1.0 (+https://lotterymechanic.com)' }
    });
    const html = await res.text();

    // Jackpot: look for "$XXX Million"
    const jackpotMatch = html.match(/\$(\d+)\s+Million/i);
    const jackpot = jackpotMatch ? `$${jackpotMatch[1]} Million` : 'N/A';

    // Next Draw Date
    const dateMatch = html.match(/Next Draw:\s*(\d{2}\/\d{2}\/\d{4})/i);
    const date = dateMatch ? dateMatch[1] : 'N/A';

    // Don't rely on numbers for now
    const numbers = 'Latest numbers on powerball.com';

    return { game: 'Powerball', jackpot, date, numbers };
  } catch (e) {
    console.error('Powerball error:', e.message);
    return { game: 'Powerball', jackpot: 'OFFLINE', date: 'OFFLINE', numbers: 'OFFLINE' };
  }
}
