<script>
  import { TYPES, TYPE_COLORS, getDefenseProfile, bestOffense, formatMultiplier } from './typeChart.js';
  import SpeedTiers from './SpeedTiers.svelte';

  export let team1 = [];
  export let team2 = [];
  export let team1Name = 'Team 1';
  export let team2Name = 'Team 2';

  function weaknessSummary(team) {
    const summary = {};
    for (const t of TYPES) summary[t] = { weak: 0, resist: 0, immune: 0 };
    for (const p of team) {
      const profile = getDefenseProfile(p.types);
      for (const t of TYPES) {
        const m = profile[t];
        if (m > 1) summary[t].weak += 1;
        else if (m > 0 && m < 1) summary[t].resist += 1;
        else if (m === 0) summary[t].immune += 1;
      }
    }
    return summary;
  }

  function topThreats(summary, teamSize) {
    return TYPES.filter((t) => summary[t].weak > 0)
      .sort((a, b) => summary[b].weak - summary[a].weak)
      .map((t) => ({ type: t, count: summary[t].weak, pct: (summary[t].weak / teamSize) * 100 }));
  }

  $: activeTeam1 = team1.filter((p) => p.isActive !== false);
  $: activeTeam2 = team2.filter((p) => p.isActive !== false);
  $: sortedTeam1 = [...activeTeam1, ...team1.filter((p) => p.isActive === false)];
  $: sortedTeam2 = [...activeTeam2, ...team2.filter((p) => p.isActive === false)];

  $: summary1 = weaknessSummary(activeTeam1);
  $: summary2 = weaknessSummary(activeTeam2);
  $: threats1 = topThreats(summary1, activeTeam1.length);
  $: threats2 = topThreats(summary2, activeTeam2.length);

  // For an attack multiplier: higher is better for the attacker.
  function atkClass(mult) {
    if (mult > 1) return 'good';
    if (mult < 1) return 'bad';
    return 'neutral';
  }

  // For a defend multiplier: lower is better for the defender (0 = immune is best).
  function defClass(mult) {
    if (mult < 1) return 'good';
    if (mult > 1) return 'bad';
    return 'neutral';
  }
</script>

<section class="matchup">
  <div class="matchup-title">
    <h2>Matchup Analysis</h2>
    <p class="sub">Where each team is exposed, and how every pair stacks up head-to-head.</p>
  </div>

  <div class="weakness-grid">
    <div class="weakness-col">
      <h3>{team1Name} — types that threaten it</h3>
      {#if threats1.length}
        <div class="bars">
          {#each threats1 as t}
            <div class="bar-row">
              <span class="badge" style="background:{TYPE_COLORS[t.type]}">{t.type}</span>
              <div class="track"><div class="fill bad" style="width:{t.pct}%"></div></div>
              <span class="bar-count">{t.count}/{activeTeam1.length}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="none">No shared weaknesses across this team.</p>
      {/if}
    </div>

    <div class="weakness-col">
      <h3>{team2Name} — types that threaten it</h3>
      {#if threats2.length}
        <div class="bars">
          {#each threats2 as t}
            <div class="bar-row">
              <span class="badge" style="background:{TYPE_COLORS[t.type]}">{t.type}</span>
              <div class="track"><div class="fill bad" style="width:{t.pct}%"></div></div>
              <span class="bar-count">{t.count}/{activeTeam2.length}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="none">No shared weaknesses across this team.</p>
      {/if}
    </div>
  </div>

  <div class="h2h-block">
    <h3>Head-to-head: {team1Name} vs {team2Name}</h3>
    <p class="legend">
      Each cell shows <span class="legend-tag good">↗ attack</span> — how hard the row Pokémon hits the column Pokémon —
      and <span class="legend-tag bad">↙ defend</span> — how hard it gets hit back.
    </p>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th class="corner"></th>
            {#each sortedTeam2 as p2}
              <th class="col-head" class:dim={p2.isActive === false}>
                <div class="head-wrap col">
                  {#if p2.sprite}<img src={p2.sprite} alt="" class="head-sprite" loading="lazy" />{/if}
                  <span>{p2.name.replace(/-/g, ' ')}</span>
                </div>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each sortedTeam1 as p1}
            <tr>
              <th class="row-head" class:dim={p1.isActive === false}>
                <div class="head-wrap row">
                  {#if p1.sprite}<img src={p1.sprite} alt="" class="head-sprite" loading="lazy" />{/if}
                  <span>{p1.name.replace(/-/g, ' ')}</span>
                </div>
              </th>
              {#each sortedTeam2 as p2}
                {@const atk = bestOffense(p1.types, p2.types)}
                {@const def = bestOffense(p2.types, p1.types)}
                <td class:dim={p1.isActive === false || p2.isActive === false}>
                  <div class="cell">
                    <span class="atk {atkClass(atk)}">↗ {formatMultiplier(atk)}</span>
                    <span class="def {defClass(def)}">↙ {formatMultiplier(def)}</span>
                  </div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <SpeedTiers
    team1={team1}
    team2={team2}
    {team1Name}
    {team2Name}
  />
</section>

<style>
  .matchup {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .matchup-title h2 {
    font-size: 1.3rem;
  }

  .sub {
    margin: 0.25rem 0 0;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .weakness-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .weakness-col h3 {
    font-size: 0.85rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    margin: 0 0 0.7rem;
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 5.5rem 1fr 3.2rem;
    align-items: center;
    gap: 0.6rem;
  }

  .bar-row .badge {
    justify-self: start;
    color: #15171a;
  }

  .track {
    height: 8px;
    background: var(--bg-alt);
    border-radius: 99px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .fill {
    height: 100%;
    border-radius: 99px;
  }

  .fill.bad {
    background: var(--bad);
  }

  .bar-count {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-muted);
    text-align: right;
  }

  .none {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: italic;
  }

  .h2h-block h3 {
    font-size: 0.85rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
    margin: 0 0 0.4rem;
  }

  .legend {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin: 0 0 0.85rem;
  }

  .legend-tag {
    font-family: var(--font-mono);
    font-weight: 700;
    padding: 0 0.2rem;
    border-radius: 3px;
  }

  .legend-tag.good {
    color: var(--good);
  }

  .legend-tag.bad {
    color: var(--bad);
  }

  .table-scroll {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
    border: 1px solid var(--border);
    padding: 0.4rem 0.5rem;
    text-align: center;
  }

  .corner {
    background: var(--bg-alt);
  }

  .col-head,
  .row-head {
    background: var(--bg-alt);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: capitalize;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .head-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  .head-wrap.col {
    flex-direction: column;
  }

  .head-wrap.row {
    flex-direction: row;
    justify-content: flex-start;
  }

  .head-sprite {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }

  .row-head {
    text-align: left;
  }

  .cell {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
  }

  .cell .good {
    color: var(--good);
  }

  .cell .bad {
    color: var(--bad);
  }

  .cell .neutral {
    color: var(--text-muted);
  }

  .dim {
    opacity: 0.35;
    background: var(--bg-alt);
  }

  @media (max-width: 720px) {
    .weakness-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
