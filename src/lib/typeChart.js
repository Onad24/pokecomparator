// Standard Gen 6+ (post-Fairy) type chart.
// TYPE_CHART[attackingType][defendingType] = damage multiplier.
// Any pair not listed defaults to 1 (normal effectiveness).

export const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

export const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

/** Multiplier when `attackType` hits a single `defendType`. */
export function getMultiplier(attackType, defendType) {
  const entry = TYPE_CHART[attackType];
  if (entry && defendType in entry) return entry[defendType];
  return 1;
}

/**
 * Defensive profile for a Pokémon with one or two types.
 * Returns { typeName: combinedMultiplier } for all 18 attacking types.
 */
export function getDefenseProfile(defendTypes) {
  const profile = {};
  for (const atk of TYPES) {
    let mult = 1;
    for (const def of defendTypes) {
      mult *= getMultiplier(atk, def);
    }
    profile[atk] = mult;
  }
  return profile;
}

/** Buckets a defense profile into weaknesses / resistances / immunities. */
export function categorizeDefense(profile) {
  const weak4 = [];
  const weak2 = [];
  const resist2 = [];
  const resist4 = [];
  const immune = [];

  for (const type of TYPES) {
    const mult = profile[type];
    if (mult === 0) immune.push(type);
    else if (mult === 4) weak4.push(type);
    else if (mult === 2) weak2.push(type);
    else if (mult === 0.5) resist2.push(type);
    else if (mult === 0.25) resist4.push(type);
  }

  return { weak4, weak2, resist2, resist4, immune };
}

/**
 * Best-case offensive multiplier when a Pokémon with `attackerTypes`
 * attacks a Pokémon with `defenderTypes` (assumes STAB on its own types).
 */
export function bestOffense(attackerTypes, defenderTypes) {
  let best = 0;
  for (const atk of attackerTypes) {
    let mult = 1;
    for (const def of defenderTypes) {
      mult *= getMultiplier(atk, def);
    }
    if (mult > best) best = mult;
  }
  return best;
}

/** Formats a multiplier like 0.25 -> "1/4x", 0.5 -> "1/2x", 2 -> "2x". */
export function formatMultiplier(mult) {
  if (mult === 0) return '0x';
  if (mult === 0.25) return '¼x';
  if (mult === 0.5) return '½x';
  return `${mult}x`;
}
