<script>
  import { onMount } from 'svelte';
  import { fetchPokemon, fetchAllPokemonDetails } from './api.js';
  import PokemonCard from './PokemonCard.svelte';
  import PokemonModal from './PokemonModal.svelte';

  export let title;
  export let team = [];
  export let maxSize = 6;
  export let accent = 'var(--accent)';

  const TYPES = ['All', 'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

  let query = '';
  let typeFilter1 = 'All';
  let typeFilter2 = 'All';
  let abilityFilter = 'All';
  let moveFilter = 'All';
  let loading = false;
  let error = '';

  let allPokemon = [];
  let availableAbilities = [];
  let availableMoves = [];
  let showSuggestions = false;
  let activeIndex = -1;
  let inputRef;
  let activeModalPokemon = null;

  onMount(async () => {
    allPokemon = await fetchAllPokemonDetails();
    const abilitySet = new Set();
    const moveSet = new Set();
    for (const p of allPokemon) {
      if (p.abilities) p.abilities.forEach(a => abilitySet.add(a));
      if (p.moves) p.moves.forEach(m => moveSet.add(m));
    }
    availableAbilities = Array.from(abilitySet).sort();
    availableMoves = Array.from(moveSet).sort();
  });

  $: suggestions = (() => {
    const q = query.trim().toLowerCase();
    const isTyping = q.length > 0;
    
    // If neither searching nor filtering, show nothing
    if (!isTyping && typeFilter1 === 'All' && typeFilter2 === 'All' && abilityFilter === 'All' && moveFilter === 'All') return [];
    
    return allPokemon
      .filter(p => {
        // Match name
        const matchName = !isTyping || (p.name.includes(q) && p.name !== q);
        // Match type 1
        const matchType1 = typeFilter1 === 'All' || (p.types && p.types.includes(typeFilter1));
        // Match type 2
        const matchType2 = typeFilter2 === 'All' || (p.types && p.types.includes(typeFilter2));
        // Match ability
        const matchAbility = abilityFilter === 'All' || (p.abilities && p.abilities.includes(abilityFilter));
        // Match move
        const matchMove = moveFilter === 'All' || (p.moves && p.moves.includes(moveFilter));

        return matchName && matchType1 && matchType2 && matchAbility && matchMove;
      })
      .slice(0, 12);
  })();

  $: {
    // Reset active index when query changes
    query;
    activeIndex = -1;
  }

  async function addPokemon() {
    const name = query.trim();
    if (!name) return;

    if (team.length >= maxSize) {
      error = `Team is full — max ${maxSize} Pokémon.`;
      return;
    }

    loading = true;
    error = '';
    try {
      const p = await fetchPokemon(name);
      if (team.some((t) => t.id === p.id)) {
        error = `${p.name.replace(/-/g, ' ')} is already on this team.`;
      } else {
        p.isActive = true;
        team = [...team, p];
        query = '';
      }
    } catch (e) {
      error = e.message || 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  function removePokemon(p) {
    team = team.filter((t) => t.id !== p.id);
  }

  function togglePokemon(p) {
    team = team; // trigger reactivity
  }

  $: sortedTeam = [
    ...team.filter((p) => p.isActive !== false),
    ...team.filter((p) => p.isActive === false)
  ];

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && activeIndex >= 0 && activeIndex < suggestions.length) {
        query = suggestions[activeIndex].name;
        addPokemon();
        showSuggestions = false;
      } else {
        addPokemon();
        showSuggestions = false;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < suggestions.length - 1) activeIndex++;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex > 0) activeIndex--;
    } else if (e.key === 'Escape') {
      showSuggestions = false;
    }
  }

  function handleBlur() {
    setTimeout(() => {
      showSuggestions = false;
    }, 150);
  }

  function handleFocus() {
    if (query.trim() || typeFilter1 !== 'All' || typeFilter2 !== 'All' || abilityFilter !== 'All' || moveFilter !== 'All') {
      showSuggestions = true;
    }
  }

  function handleInput() {
    showSuggestions = true;
  }

  function selectSuggestion(p) {
    query = p.name;
    addPokemon();
    showSuggestions = false;
    inputRef?.focus();
  }
</script>

<section class="panel">
  <div class="panel-head" style="--accent-local:{accent}">
    <h2>{title}</h2>
    <span class="count">{team.length}/{maxSize}</span>
  </div>

  <div class="search-container">
    <div class="type-filters">
      <select bind:value={typeFilter1} aria-label="Filter by type 1" disabled={loading || team.length >= maxSize} on:change={handleInput}>
        {#each TYPES as t}
          <option value={t}>{t === 'All' ? 'Type 1' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
        {/each}
      </select>
      <select bind:value={typeFilter2} aria-label="Filter by type 2" disabled={loading || team.length >= maxSize} on:change={handleInput}>
        {#each TYPES as t}
          <option value={t}>{t === 'All' ? 'Type 2' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
        {/each}
      </select>
      <select class="ability-select" bind:value={abilityFilter} aria-label="Filter by ability" disabled={loading || team.length >= maxSize} on:change={handleInput}>
        <option value="All">All Abilities</option>
        {#each availableAbilities as a}
          <option value={a}>{a.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
        {/each}
      </select>
      <select class="move-select" bind:value={moveFilter} aria-label="Filter by move" disabled={loading || team.length >= maxSize} on:change={handleInput}>
        <option value="All">All Moves</option>
        {#each availableMoves as m}
          <option value={m}>{m.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
        {/each}
      </select>
    </div>

    <div class="search-row">
      <div class="input-wrapper">
        <input
          bind:this={inputRef}
          bind:value={query}
          on:keydown={handleKeydown}
          on:focus={handleFocus}
          on:blur={handleBlur}
          on:input={handleInput}
          placeholder="Search Pokémon..."
          disabled={loading || team.length >= maxSize}
          aria-label="Search Pokémon to add to {title}"
          autocomplete="off"
        />

        {#if showSuggestions && suggestions.length > 0 && !loading && team.length < maxSize}
          <ul class="suggestions">
            {#each suggestions as p, i}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
              <li
                class:active={i === activeIndex}
                on:click={() => selectSuggestion(p)}
              >
                <div class="sugg-left">
                  <span class="sugg-name">{p.name.replace(/-/g, ' ')}</span>
                  {#if p.abilities && p.abilities.length > 0}
                    <span class="sugg-abilities">{p.abilities.join(', ')}</span>
                  {/if}
                </div>
                <span class="sugg-types">
                  {#if p.types}
                    {#each p.types as t}
                      <span class="type-pill" data-type={t}>{t}</span>
                    {/each}
                  {/if}
                </span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <button on:click={() => { addPokemon(); showSuggestions = false; }} disabled={loading || team.length >= maxSize}>
        {loading ? 'Loading…' : 'Add'}
      </button>
    </div>
  </div>

  {#if error}<p class="error">{error}</p>{/if}

  {#if team.length === 0}
    <p class="empty">No Pokémon yet — search above to build this team.</p>
  {:else}
    <div class="cards">
      {#each sortedTeam as p (p.id)}
        <PokemonCard pokemon={p} onRemove={removePokemon} onToggle={togglePokemon} onInfo={() => activeModalPokemon = p} />
      {/each}
    </div>
  {/if}
</section>

{#if activeModalPokemon}
  <PokemonModal pokemon={activeModalPokemon} onClose={() => activeModalPokemon = null} />
{/if}

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 2px solid var(--accent-local);
    padding-bottom: 0.5rem;
  }

  .panel-head h2 {
    font-size: 1.15rem;
  }

  .count {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .search-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-row {
    display: flex;
    gap: 0.5rem;
  }

  .type-filters {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.55rem 0.7rem;
    color: var(--text);
    font-size: 0.85rem;
  }

  input:disabled {
    opacity: 0.6;
  }

  input::placeholder {
    color: var(--text-muted);
  }

  select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.55rem 0.5rem;
    color: var(--text);
    font-size: 0.8rem;
    min-width: 85px;
    cursor: pointer;
  }

  .ability-select, .move-select {
    min-width: 110px;
    max-width: 140px;
  }

  select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    list-style: none;
    margin: 0;
    padding: 0.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
  }

  .suggestions li {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    color: var(--text);
    cursor: pointer;
    border-radius: 4px;
    text-transform: capitalize;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sugg-types {
    display: flex;
    gap: 0.25rem;
  }

  .type-pill {
    font-size: 0.65rem;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    background: var(--border);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .suggestions li:hover,
  .suggestions li.active {
    background: var(--border);
  }

  button {
    background: var(--accent);
    border: none;
    border-radius: 6px;
    padding: 0.55rem 1rem;
    color: #0d1013;
    font-weight: 600;
    font-size: 0.85rem;
    transition: filter 0.15s;
  }

  button:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    margin: 0;
    font-size: 0.8rem;
    color: var(--bad);
  }

  .empty {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: italic;
    padding: 1rem 0;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 0.85rem;
  }
</style>
