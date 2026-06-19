<script>
  import { getDefenseProfile, categorizeDefense, TYPE_COLORS, formatMultiplier } from './typeChart.js';

  export let pokemon;
  export let onRemove = () => {};
  export let onToggle = () => {};

  if (pokemon.isActive === undefined) pokemon.isActive = true;

  $: profile = getDefenseProfile(pokemon.types);
  $: cats = categorizeDefense(profile);

  function textColorFor(hex) {
    // simple luminance check so badge text stays legible on light/dark type colors
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#15171a' : '#f4f6f9';
  }
</script>

<article class="card" class:inactive={!pokemon.isActive}>
  <div class="card-actions">
    <label class="toggle-wrap">
      <input type="checkbox" bind:checked={pokemon.isActive} on:change={() => onToggle(pokemon)} />
      <span class="toggle-label">Active</span>
    </label>
    <button class="remove" on:click={() => onRemove(pokemon)} aria-label="Remove {pokemon.name}">✕</button>
  </div>

  <div class="card-head">
    {#if pokemon.sprite}
      <img class="sprite" src={pokemon.sprite} alt={pokemon.name} loading="lazy" />
    {/if}
    <div class="head-text">
      <span class="dex">#{String(pokemon.id).padStart(3, '0')}</span>
      <h3 class="name">{pokemon.name.replace(/-/g, ' ')}</h3>
      <div class="types">
        {#each pokemon.types as t}
          <span class="badge" style="background:{TYPE_COLORS[t]}; color:{textColorFor(TYPE_COLORS[t])}">{t}</span>
        {/each}
      </div>
    </div>
  </div>

  <div class="section">
    <h4>Abilities</h4>
    <ul class="abilities">
      {#each pokemon.abilities as a}
        <li>
          <span class="ability-name">{a.name.replace(/-/g, ' ')}{#if a.isHidden}<span class="hidden-tag">hidden</span>{/if}</span>
          <span class="ability-effect">{a.effect}</span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="section">
    <h4>Weak to</h4>
    {#if cats.weak4.length || cats.weak2.length}
      <div class="chip-row">
        {#each cats.weak4 as t}
          <span class="badge" style="background:{TYPE_COLORS[t]}; color:{textColorFor(TYPE_COLORS[t])}">{t} {formatMultiplier(4)}</span>
        {/each}
        {#each cats.weak2 as t}
          <span class="badge" style="background:{TYPE_COLORS[t]}; color:{textColorFor(TYPE_COLORS[t])}">{t} {formatMultiplier(2)}</span>
        {/each}
      </div>
    {:else}
      <p class="none">No weaknesses</p>
    {/if}
  </div>

  <div class="section">
    <h4>Resists</h4>
    {#if cats.resist2.length || cats.resist4.length}
      <div class="chip-row">
        {#each cats.resist4 as t}
          <span class="badge" style="background:{TYPE_COLORS[t]}; color:{textColorFor(TYPE_COLORS[t])}">{t} {formatMultiplier(0.25)}</span>
        {/each}
        {#each cats.resist2 as t}
          <span class="badge" style="background:{TYPE_COLORS[t]}; color:{textColorFor(TYPE_COLORS[t])}">{t} {formatMultiplier(0.5)}</span>
        {/each}
      </div>
    {:else}
      <p class="none">No resistances</p>
    {/if}
  </div>

  <div class="section">
    <h4>Immune to</h4>
    {#if cats.immune.length}
      <div class="chip-row">
        {#each cats.immune as t}
          <span class="badge" style="background:{TYPE_COLORS[t]}; color:{textColorFor(TYPE_COLORS[t])}">{t} {formatMultiplier(0)}</span>
        {/each}
      </div>
    {:else}
      <p class="none">No immunities</p>
    {/if}
  </div>
</article>

<style>
  .card {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    transition: opacity 0.2s;
  }

  .card.inactive {
    opacity: 0.6;
  }

  .card-actions {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 2;
  }

  .toggle-wrap {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    font-size: 0.7rem;
    font-family: var(--font-mono);
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .toggle-wrap input {
    cursor: pointer;
  }

  .remove {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: background 0.15s, color 0.15s;
  }

  .remove:hover {
    background: var(--bad);
    color: #fff;
    border-color: var(--bad);
  }

  .card-head {
    display: flex;
    gap: 0.85rem;
    align-items: center;
  }

  .sprite {
    width: 72px;
    height: 72px;
    object-fit: contain;
    background: var(--bg-alt);
    border-radius: 8px;
    flex-shrink: 0;
  }

  .head-text {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
  }

  .dex {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }

  .name {
    font-size: 1.05rem;
    text-transform: capitalize;
  }

  .types {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .section h4 {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin: 0 0 0.4rem;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .none {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
    font-style: italic;
  }

  .abilities {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .abilities li {
    background: var(--bg-alt);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.45rem 0.6rem;
  }

  .ability-name {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
    margin-bottom: 0.15rem;
  }

  .hidden-tag {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    text-transform: uppercase;
    color: var(--warn);
    border: 1px solid var(--warn);
    border-radius: 3px;
    padding: 0.05rem 0.3rem;
    margin-left: 0.4rem;
    font-weight: 700;
  }

  .ability-effect {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.4;
  }
</style>
