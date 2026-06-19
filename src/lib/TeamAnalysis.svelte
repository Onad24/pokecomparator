<script>
  import { TYPES, TYPE_COLORS, getDefenseProfile, getMultiplier } from './typeChart.js';
  import SpeedTiers from './SpeedTiers.svelte';

  export let team = [];

  // Recompute analysis whenever team changes
  $: analysis = analyzeTeam(team);
  $: coverage = getCoverage(analysis, team);

  function analyzeTeam(currentTeam) {
    const activeTeam = currentTeam.filter((p) => p.isActive !== false);
    let results = TYPES.map(type => {
      let stats = {
        type,
        def_4x: [],
        def_2x: [],
        def_1x: [],
        def_05x: [],
        def_025x: [],
        def_0x: [],
        off_se: [], // Number of pokemon that can hit this type super effectively with STAB
        total_weaknesses: 0
      };

      for (const p of activeTeam) {
        // Defensive: how much damage does `p` take from an attack of `type`
        const defProfile = getDefenseProfile(p.types);
        const mult = defProfile[type];
        if (mult === 4) stats.def_4x.push(p.name);
        else if (mult === 2) stats.def_2x.push(p.name);
        else if (mult === 1) stats.def_1x.push(p.name);
        else if (mult === 0.5) stats.def_05x.push(p.name);
        else if (mult === 0.25) stats.def_025x.push(p.name);
        else if (mult === 0) stats.def_0x.push(p.name);

        // Offensive: can `p` hit `type` super effectively with STAB?
        let canHitSE = false;
        for (const atkType of p.types) {
          if (getMultiplier(atkType, type) > 1) {
            canHitSE = true;
            break;
          }
        }
        if (canHitSE) stats.off_se.push(p.name);
      }

      stats.total_weaknesses = stats.def_4x.length + stats.def_2x.length;
      return stats;
    });

    // Sort by total weaknesses descending
    results.sort((a, b) => b.total_weaknesses - a.total_weaknesses);
    return results;
  }

  function getCoverage(analysisResults, currentTeam) {
    const activeTeam = currentTeam.filter((p) => p.isActive !== false);
    const presentTypes = new Set();
    activeTeam.forEach(p => p.types.forEach(t => presentTypes.add(t)));

    const missingTypes = TYPES.filter(t => !presentTypes.has(t));

    const offensivelyUncovered = analysisResults
      .filter(r => r.off_se.length === 0)
      .map(r => r.type);

    const defensivelyUncovered = analysisResults
      .filter(r => r.total_weaknesses > 0 && (r.def_05x.length + r.def_025x.length + r.def_0x.length === 0))
      .map(r => r.type);

    return { missingTypes, offensivelyUncovered, defensivelyUncovered };
  }
</script>

<section class="analysis-panel">
  <div class="header">
    <h2>Team Type Analysis</h2>
    <p class="sub">Detailed breakdown of how your team handles incoming threats and its offensive coverage.</p>
  </div>

  <div class="coverage-summaries">
    <div class="summary-card">
      <h3>Missing Types</h3>
      <p class="desc">Types that are not present on your team.</p>
      {#if coverage.missingTypes.length > 0}
        <div class="type-tags">
          {#each coverage.missingTypes as t}
            <span class="badge" style="background:{TYPE_COLORS[t]}">{t}</span>
          {/each}
        </div>
      {:else}
        <p class="none">You have all types... wait, that's impossible on a team of 6!</p>
      {/if}
    </div>

    <div class="summary-card">
      <h3>Offensively Uncovered</h3>
      <p class="desc">Types your team cannot hit for super effective damage (with STAB).</p>
      {#if coverage.offensivelyUncovered.length > 0}
        <div class="type-tags">
          {#each coverage.offensivelyUncovered as t}
            <span class="badge" style="background:{TYPE_COLORS[t]}">{t}</span>
          {/each}
        </div>
      {:else}
        <p class="none">Great coverage! You can hit every type super effectively.</p>
      {/if}
    </div>

    <div class="summary-card">
      <h3>Defensively Uncovered</h3>
      <p class="desc">Types your team is weak against, but has no resistances or immunities to fall back on.</p>
      {#if coverage.defensivelyUncovered.length > 0}
        <div class="type-tags">
          {#each coverage.defensivelyUncovered as t}
            <span class="badge" style="background:{TYPE_COLORS[t]}">{t}</span>
          {/each}
        </div>
      {:else}
        <p class="none">Good defensive synergy! All weaknesses have a matching resistance.</p>
      {/if}
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th title="Number of Pokemon that can hit this type super effectively">Offense SE</th>
          <th class="weakness-col">4x Weak</th>
          <th class="weakness-col">2x Weak</th>
          <th>1x Neut</th>
          <th class="resist-col">½x Res</th>
          <th class="resist-col">¼x Res</th>
          <th class="immune-col">0x Imm</th>
        </tr>
      </thead>
      <tbody>
        {#each analysis as row}
          <tr>
            <td>
              <span class="badge" style="background:{TYPE_COLORS[row.type]}">{row.type}</span>
            </td>
            <td>
              <div class="cell-content">
                <span class="count {row.off_se.length > 0 ? 'good' : 'bad'}">{row.off_se.length}</span>
                {#if row.off_se.length > 0}<div class="tooltip">{row.off_se.map(n => n.replace(/-/g, ' ')).join(', ')}</div>{/if}
              </div>
            </td>
            <td>
              <div class="cell-content">
                <span class="count {row.def_4x.length > 0 ? 'bad' : 'muted'}">{row.def_4x.length}</span>
                {#if row.def_4x.length > 0}<div class="tooltip">{row.def_4x.map(n => n.replace(/-/g, ' ')).join(', ')}</div>{/if}
              </div>
            </td>
            <td>
              <div class="cell-content">
                <span class="count {row.def_2x.length > 0 ? 'bad' : 'muted'}">{row.def_2x.length}</span>
                {#if row.def_2x.length > 0}<div class="tooltip">{row.def_2x.map(n => n.replace(/-/g, ' ')).join(', ')}</div>{/if}
              </div>
            </td>
            <td>
              <div class="cell-content">
                <span class="count muted">{row.def_1x.length}</span>
                {#if row.def_1x.length > 0}<div class="tooltip">{row.def_1x.map(n => n.replace(/-/g, ' ')).join(', ')}</div>{/if}
              </div>
            </td>
            <td>
              <div class="cell-content">
                <span class="count {row.def_05x.length > 0 ? 'good' : 'muted'}">{row.def_05x.length}</span>
                {#if row.def_05x.length > 0}<div class="tooltip">{row.def_05x.map(n => n.replace(/-/g, ' ')).join(', ')}</div>{/if}
              </div>
            </td>
            <td>
              <div class="cell-content">
                <span class="count {row.def_025x.length > 0 ? 'good' : 'muted'}">{row.def_025x.length}</span>
                {#if row.def_025x.length > 0}<div class="tooltip">{row.def_025x.map(n => n.replace(/-/g, ' ')).join(', ')}</div>{/if}
              </div>
            </td>
            <td>
              <div class="cell-content">
                <span class="count {row.def_0x.length > 0 ? 'good' : 'muted'}">{row.def_0x.length}</span>
                {#if row.def_0x.length > 0}<div class="tooltip">{row.def_0x.map(n => n.replace(/-/g, ' ')).join(', ')}</div>{/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <SpeedTiers
    team1={team}
    team1Name="My Team"
  />
</section>

<style>
  .analysis-panel {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
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

  .coverage-summaries {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.25rem;
  }

  .summary-card {
    background: var(--bg-alt);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-card h3 {
    font-size: 0.9rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text);
    margin: 0;
  }

  .desc {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0 0 0.5rem;
    line-height: 1.4;
  }

  .type-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .badge {
    color: #15171a;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
  }

  .none {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: italic;
    margin: 0;
  }

  .table-container {
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  th, td {
    padding: 0.6rem 0.5rem;
    text-align: center;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.72rem;
    text-transform: uppercase;
  }

  td:first-child, th:first-child {
    text-align: left;
  }

  .count {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 0.9rem;
  }

  .cell-content {
    position: relative;
    display: inline-flex;
    justify-content: center;
    cursor: default;
  }

  .tooltip {
    display: none;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text);
    color: var(--surface);
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    width: max-content;
    max-width: 150px;
    white-space: normal;
    text-align: center;
    line-height: 1.3;
    pointer-events: none;
    z-index: 999;
    margin-bottom: 4px;
    font-family: var(--font-sans);
    font-weight: 600;
    text-transform: capitalize;
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--text);
  }

  .cell-content:hover .tooltip {
    display: block;
  }

  .count.good {
    color: var(--good);
  }

  .count.bad {
    color: var(--bad);
  }

  .count.muted {
    color: var(--border);
    font-weight: 400;
  }

  .weakness-col {
    background: rgba(255, 74, 74, 0.05);
  }

  .resist-col {
    background: rgba(64, 196, 99, 0.05);
  }

  .immune-col {
    background: rgba(64, 196, 99, 0.1);
  }

  @media (max-width: 860px) {
    .table-container {
      overflow-x: auto;
    }
    
    .coverage-summaries {
      grid-template-columns: 1fr;
    }
  }
</style>
