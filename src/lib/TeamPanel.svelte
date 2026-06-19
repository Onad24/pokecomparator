<script>
  import { onMount } from 'svelte';
  import { fetchPokemon, fetchAllPokemonNames } from './api.js';
  import PokemonCard from './PokemonCard.svelte';

  export let title;
  export let team = [];
  export let maxSize = 6;
  export let accent = 'var(--accent)';

  let query = '';
  let loading = false;
  let error = '';

  let allNames = [];
  let showSuggestions = false;
  let activeIndex = -1;
  let inputRef;

  onMount(async () => {
    allNames = await fetchAllPokemonNames();
  });

  $: suggestions = query.trim()
    ? allNames
        .filter(
          (n) => n.includes(query.trim().toLowerCase()) && n !== query.trim().toLowerCase()
        )
        .slice(0, 8)
    : [];

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
        query = suggestions[activeIndex];
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
    if (query.trim()) {
      showSuggestions = true;
    }
  }

  function handleInput() {
    showSuggestions = true;
  }

  function selectSuggestion(name) {
    query = name;
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

  <div class="search-row">
    <div class="input-wrapper">
      <input
        bind:this={inputRef}
        bind:value={query}
        on:keydown={handleKeydown}
        on:focus={handleFocus}
        on:blur={handleBlur}
        on:input={handleInput}
        placeholder="Add a Pokémon, e.g. pikachu"
        disabled={loading || team.length >= maxSize}
        aria-label="Search Pokémon to add to {title}"
        autocomplete="off"
      />
      {#if showSuggestions && suggestions.length > 0 && !loading && team.length < maxSize}
        <ul class="suggestions">
          {#each suggestions as name, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li
              class:active={i === activeIndex}
              on:click={() => selectSuggestion(name)}
            >
              {name.replace(/-/g, ' ')}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <button on:click={() => { addPokemon(); showSuggestions = false; }} disabled={loading || team.length >= maxSize}>
      {loading ? 'Loading…' : 'Add'}
    </button>
  </div>

  {#if error}<p class="error">{error}</p>{/if}

  {#if team.length === 0}
    <p class="empty">No Pokémon yet — search above to build this team.</p>
  {:else}
    <div class="cards">
      {#each sortedTeam as p (p.id)}
        <PokemonCard pokemon={p} onRemove={removePokemon} onToggle={togglePokemon} />
      {/each}
    </div>
  {/if}
</section>

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

  .search-row {
    display: flex;
    gap: 0.5rem;
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
