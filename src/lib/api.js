const BASE = 'https://pokeapi.co/api/v2';

const pokemonCache = new Map();
const abilityCache = new Map();
let allPokemonNames = [];

/** Fetches a cached list of all Pokémon names for autocomplete. */
export async function fetchAllPokemonNames() {
  if (allPokemonNames.length > 0) return allPokemonNames;
  try {
    const res = await fetch(`${BASE}/pokemon?limit=10000`);
    if (!res.ok) return [];
    const data = await res.json();
    allPokemonNames = data.results.map((r) => r.name);
    return allPokemonNames;
  } catch {
    return [];
  }
}

/** Fetches a single ability's short English effect text, with caching. */
export async function fetchAbility(name) {
  if (abilityCache.has(name)) return abilityCache.get(name);

  try {
    const res = await fetch(`${BASE}/ability/${name}`);
    if (!res.ok) return 'No description available.';
    const data = await res.json();

    const entries = data.effect_entries || [];
    const enEntry = entries.find((e) => e.language?.name === 'en');
    const raw = enEntry ? enEntry.short_effect || enEntry.effect : null;
    const text = raw ? raw.replace(/\s+/g, ' ').trim() : 'No description available.';

    abilityCache.set(name, text);
    return text;
  } catch {
    return 'No description available.';
  }
}

/** Fetches a Pokémon by name or id, including resolved type list and ability descriptions. */
export async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).trim().toLowerCase().replace(/\s+/g, '-');
  if (!key) throw new Error('Enter a Pokémon name.');

  if (pokemonCache.has(key)) {
    const cached = pokemonCache.get(key);
    // If cache is from before stats were added, ignore it
    if (cached.stats) return cached;
  }

  const res = await fetch(`${BASE}/pokemon/${key}`);
  if (!res.ok) {
    throw new Error(`Couldn't find a Pokémon named "${nameOrId}".`);
  }
  const data = await res.json();

  const types = [...data.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);

  const abilities = await Promise.all(
    data.abilities.map(async (a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      effect: await fetchAbility(a.ability.name)
    }))
  );

  const sprite =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.front_default ||
    '';

  const stats = {};
  data.stats.forEach((s) => {
    stats[s.stat.name] = s.base_stat;
  });

  const pokemon = {
    id: data.id,
    name: data.name,
    sprite,
    types,
    abilities,
    stats
  };

  pokemonCache.set(key, pokemon);
  return pokemon;
}
