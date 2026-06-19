import fs from 'fs';

const url = 'https://www.serebii.net/pokemonchampions/pokemon.shtml';

console.log('Fetching latest roster from Serebii...');

async function main() {
  try {
    const serebiiRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await serebiiRes.text();

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
    
    const namesArray = matches.map(m => {
      const baseName = m[1].toLowerCase().trim();
      const serebiiSuffix = m[2] ? m[2].toLowerCase() : '';
      const pokeApiSuffix = suffixMap[serebiiSuffix] || '';
      return baseName + pokeApiSuffix;
    });

    const names = [...new Set(namesArray)];
    
    if (names.length === 0) {
      console.error('Failed to find any Pokémon. Serebii might have changed their layout.');
      return;
    }

    console.log(`Found ${names.length} Pokémon. Fetching types from PokéAPI...`);
    const rosterData = [];
    const BATCH_SIZE = 15;

    for (let i = 0; i < names.length; i += BATCH_SIZE) {
      const batch = names.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (name) => {
        try {
          const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
          if (!pRes.ok) {
            console.warn(`\nWarning: ${name} not found in PokéAPI.`);
            return { name, types: [] };
          }
          const pData = await pRes.json();
          const types = pData.types.sort((a, b) => a.slot - b.slot).map(t => t.type.name);
          return { name, types };
        } catch (e) {
          console.warn(`\nError fetching ${name}: ${e.message}`);
          return { name, types: [] };
        }
      });

      const results = await Promise.all(batchPromises);
      rosterData.push(...results);
      process.stdout.write(`\rProgress: ${rosterData.length} / ${names.length}`);
    }
    console.log('');

    const content = `export const CHAMPIONS_ROSTER = ${JSON.stringify(rosterData, null, 2)};\n`;
    fs.writeFileSync('src/lib/championsRoster.js', content);
    console.log(`✅ Successfully updated src/lib/championsRoster.js with ${rosterData.length} Pokémon + types!`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
