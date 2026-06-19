<script>
  import { onMount } from 'svelte';
  import { fetchPokemon } from './lib/api.js';
  import TeamPanel from './lib/TeamPanel.svelte';
  import MatchupAnalysis from './lib/MatchupAnalysis.svelte';
  import TeamAnalysis from './lib/TeamAnalysis.svelte';

  let myTeam = [];
  let oppTeam = [];
  let mode = 'builder'; // 'builder' or 'comparator'
  let loaded = false;

  onMount(async () => {
    try {
      const savedMy = JSON.parse(localStorage.getItem('myTeamStore') || '[]');
      const savedOpp = JSON.parse(localStorage.getItem('oppTeamStore') || '[]');
      
      const loadTeam = async (savedArr) => {
        const arr = [];
        for (const item of savedArr) {
          try {
            const p = await fetchPokemon(item.name);
            p.isActive = item.isActive !== false;
            arr.push(p);
          } catch(e) {}
        }
        return arr;
      };

      myTeam = await loadTeam(savedMy);
      oppTeam = await loadTeam(savedOpp);
    } catch (e) {
      console.error('Failed to load team from storage', e);
    }
    loaded = true;
  });

  $: if (loaded) {
    localStorage.setItem('myTeamStore', JSON.stringify(myTeam.map(p => ({ name: p.name, isActive: p.isActive }))));
    localStorage.setItem('oppTeamStore', JSON.stringify(oppTeam.map(p => ({ name: p.name, isActive: p.isActive }))));
  }
</script>

<main>
  <header class="hero">
    <span class="eyebrow">Type matchup scanner</span>
    <h1>Pokémon Team Comparator</h1>
    <p class="lede">
      Build your roster, scout the opponent's, and read off types, abilities, weaknesses,
      resistances and immunities for every Pokémon — then see how the two teams match up.
    </p>
  </header>

  <nav class="tabs">
    <button class:active={mode === 'builder'} on:click={() => mode = 'builder'}>Team Builder</button>
    <button class:active={mode === 'comparator'} on:click={() => mode = 'comparator'}>Matchup Comparator</button>
  </nav>

  {#if mode === 'builder'}
    <div class="builder-layout">
      <div class="panel-container">
        <TeamPanel title="My Team" bind:team={myTeam} accent="var(--accent)" />
      </div>
      <div class="analysis-container">
        {#if myTeam.length > 0}
          <TeamAnalysis team={myTeam} />
        {:else}
          <p class="hint">Add at least one Pokémon to see the team analysis.</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="teams-grid">
      <TeamPanel title="My Team" bind:team={myTeam} accent="var(--accent)" />
      <TeamPanel title="Opponent Team" bind:team={oppTeam} accent="var(--warn)" />
    </div>

    {#if myTeam.length > 0 && oppTeam.length > 0}
      <MatchupAnalysis team1={myTeam} team2={oppTeam} team1Name="My Team" team2Name="Opponent Team" />
    {:else}
      <p class="hint">Add at least one Pokémon to each team to see the matchup analysis.</p>
    {/if}
  {/if}

  <footer>
    <p>Data from <a href="https://pokeapi.co" target="_blank" rel="noreferrer">PokéAPI</a>.</p>
  </footer>
</main>

<style>
  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
  }

  .hero {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-width: 640px;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
  }

  .hero h1 {
    font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  }

  .lede {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  .teams-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.75rem;
    align-items: start;
  }

  .tabs {
    display: flex;
    gap: 1.5rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 1rem;
  }

  .tabs button {
    background: transparent;
    border: none;
    padding: 0.75rem 0.5rem;
    font-size: 1.05rem;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    font-weight: 500;
  }

  .tabs button:hover {
    color: var(--text);
  }

  .tabs button.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: 700;
  }

  .builder-layout {
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: 1.75rem;
    align-items: start;
  }

  .panel-container, .analysis-container {
    min-width: 0;
  }

  .hint {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
    font-style: italic;
    padding: 1.5rem;
    border: 1px dashed var(--border);
    border-radius: 10px;
  }

  footer {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.78rem;
    border-top: 1px solid var(--border);
    padding-top: 1.25rem;
  }

  footer p {
    margin: 0;
  }

  @media (max-width: 1000px) {
    .builder-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 860px) {
    .teams-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
