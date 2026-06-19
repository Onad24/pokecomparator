# Pokémon Team Comparator

A small Svelte + Vite app for building two Pokémon teams from live [PokéAPI](https://pokeapi.co)
data and comparing their type matchups.

## Features

- Search any Pokémon by name and add it to **My Team** or **Opponent Team** (up to 6 each).
- Each Pokémon card shows:
  - Official artwork, Pokédex number, and types
  - Abilities, including their in-game effect text (hidden abilities are flagged)
  - Weaknesses (×2 / ×4), resistances (×½ / ×¼), and immunities (×0), computed from the
    standard 18-type effectiveness chart
- Once both teams have at least one Pokémon, a **Matchup Analysis** panel shows:
  - Which types most threaten each team (a "weakness coverage" readout)
  - A head-to-head grid for every pairing across the two teams, with attack/defend
    multipliers color-coded (green = favorable, red = unfavorable)

## Setup

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- All Pokémon and ability data is fetched live from `https://pokeapi.co/api/v2` — an internet
  connection is required while using the app.
- The type effectiveness chart is hardcoded (Gen 6+ rules, including Fairy type) since it
  rarely changes and this avoids extra API calls per type pair.
- Ability and Pokémon lookups are cached in memory for the session to avoid refetching.
# pokematch
# pokecomparator
# pokecomparator
# pokecomparator
# pokecomparator
# pokecomparator
# pokecomparator
# pokecomparator
# pokecomparator
