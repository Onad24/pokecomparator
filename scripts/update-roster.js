import fs from 'fs';
import https from 'https';

const url = 'https://www.serebii.net/pokemonchampions/pokemon.shtml';

console.log('Fetching latest roster from Serebii...');

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Regex to capture the base name from href and the optional suffix from the image src
    // e.g. <a href="/pokedex-champions/charizard/"><img src="/pokemonhome/pokemon/small/006-mx.png"
    const regex = /href="\/pokedex-champions\/([^"]+)\/"[^>]*><img src="\/pokemonhome\/pokemon\/(?:small\/)?(?:[0-9]+)(-[a-z0-9]+)?\.png"/g;
    const matches = [...data.matchAll(regex)];
    
    const suffixMap = {
      '-m': '-mega',
      '-mx': '-mega-x',
      '-my': '-mega-y',
      '-a': '-alola',
      '-g': '-galar',
      '-h': '-hisui',
      '-p': '-paldea',
      '-e': '-eternal'
    };
    
    // Build the final PokeAPI names
    const namesArray = matches.map(m => {
      const baseName = m[1].toLowerCase().trim();
      const serebiiSuffix = m[2] ? m[2].toLowerCase() : '';
      const pokeApiSuffix = suffixMap[serebiiSuffix] || '';
      return baseName + pokeApiSuffix;
    });

    // Clean, lowercase, and remove duplicates
    const names = [...new Set(namesArray)];
    
    if (names.length === 0) {
      console.error('Failed to find any Pokémon. Serebii might have changed their layout.');
      return;
    }

    const content = `export const CHAMPIONS_ROSTER = ${JSON.stringify(names, null, 2)};\n`;
    
    fs.writeFileSync('src/lib/championsRoster.js', content);
    console.log(`✅ Successfully updated src/lib/championsRoster.js with ${names.length} Pokémon!`);
  });
}).on('error', err => {
  console.error('Network Error:', err.message);
});
