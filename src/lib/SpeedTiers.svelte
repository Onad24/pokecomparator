<script>
  export let team1 = [];
  export let team2 = []; // optional
  export let team1Name = 'My Team';
  export let team2Name = 'Opponent Team';

  // Level 50 speed calculation
  function calcSpeed(base, iv, ev, nature) {
    let s = Math.floor(base + iv / 2 + ev / 8 + 5);
    return Math.floor(s * nature);
  }

  $: allPokemon = [
    ...team1.map((p) => ({ ...p, teamLabel: team1Name, isOpponent: false })),
    ...team2.map((p) => ({ ...p, teamLabel: team2Name, isOpponent: true }))
  ].filter((p) => p.isActive !== false);

  $: speedTiers = (() => {
    let pokemonWithSpeed = allPokemon.map(p => ({
      ...p,
      baseSpeed: p.stats?.speed || 0
    })).sort((a, b) => b.baseSpeed - a.baseSpeed);

    let currentRank = 1;
    for (let i = 0; i < pokemonWithSpeed.length; i++) {
      if (i > 0 && pokemonWithSpeed[i].baseSpeed < pokemonWithSpeed[i - 1].baseSpeed) {
        currentRank = i + 1;
      }
      pokemonWithSpeed[i].rank = currentRank;
    }

    return pokemonWithSpeed.map(p => {
      return {
        rank: p.rank,
        name: p.name.replace(/-/g, ' '),
        teamLabel: p.teamLabel,
        isOpponent: p.isOpponent,
        sprite: p.sprite,
        base: p.baseSpeed
      };
    });
  })();
</script>

<section class="speed-tiers-panel">
  <div class="header">
    <h2>Speed Tiers (Base Stats)</h2>
    <p class="sub">Ranking active Pokémon purely by their Base Speed stat. Check if a Pokemon has an ability that can affect speed, e.g. Speed Boost, Swift Swim</p>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th class="rank-col">Rank</th>
          <th class="poke-col">Pokémon</th>
          <th class="num-col">Base Speed</th>
        </tr>
      </thead>
      <tbody>
        {#each speedTiers as p}
          <tr class:opponent={p.isOpponent}>
            <td class="num-col rank-col">#{p.rank}</td>
            <td class="poke-cell">
              <div class="poke-wrap">
                {#if p.sprite}
                  <img src={p.sprite} alt={p.name} class="sprite" loading="lazy" />
                {/if}
                <span class="name">{p.name}</span>
              </div>
            </td>
            <td class="num-col base">{p.base}</td>
          </tr>
        {/each}
        {#if speedTiers.length === 0}
          <tr>
            <td colspan="3" class="empty">No active Pokémon to compare.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</section>

<style>
  .speed-tiers-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .header h2 {
    font-size: 1.3rem;
  }

  .sub {
    margin: 0.25rem 0 0;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .table-scroll {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    min-width: 600px;
  }

  th, td {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.72rem;
    text-transform: uppercase;
    text-align: right;
  }

  th.poke-col, td.poke-cell {
    text-align: left;
  }

  .num-col {
    text-align: right;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  th.rank-col, td.rank-col {
    width: 60px;
    color: var(--text-muted);
    font-weight: 700;
  }

  .poke-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .sprite {
    width: 40px;
    height: 40px;
    object-fit: contain;
    background: var(--bg-alt);
    border-radius: 6px;
  }

  .name {
    font-weight: 600;
    text-transform: capitalize;
  }

  .base {
    font-weight: 700;
    color: var(--accent);
  }

  /* Distinguish opponent rows if there are two teams */
  tr.opponent {
    background: rgba(255, 74, 74, 0.03);
  }

  tr.opponent .name {
    color: var(--warn);
  }

  .empty {
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
    padding: 2rem 0;
  }
</style>
