<script>
  import { TYPE_COLORS } from './typeChart.js';

  export let pokemon;
  export let onClose = () => {};

  // For closing modal when clicking outside
  function handleBackdropClick(e) {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  }

  function textColorFor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#15171a' : '#f4f6f9';
  }

  const statKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  const statLabels = ['HP', 'Atk', 'Def', 'Sp.A', 'Sp.D', 'Spe'];
  const maxStat = 255;
  
  $: statValues = statKeys.map(k => pokemon.stats[k] || 0);
  $: totalStats = statValues.reduce((a, b) => a + b, 0);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={handleBackdropClick}>
  <div class="modal">
    <button class="close-btn" on:click={onClose} aria-label="Close">✕</button>

    <div class="modal-header">
      {#if pokemon.sprite}
        <img class="sprite" src={pokemon.sprite} alt={pokemon.name} />
      {/if}
      <div class="head-text">
        <h2 class="name">{pokemon.name.replace(/-/g, ' ')}</h2>
        <div class="types">
          {#each pokemon.types as t}
            <span class="badge" style="background:{TYPE_COLORS[t]}; color:{textColorFor(TYPE_COLORS[t])}">{t}</span>
          {/each}
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class="section">
        <h3>Base Stats</h3>
        <div class="stats-grid">
          {#each statValues as stat, i}
            <div class="stat-row">
              <span class="stat-label">{statLabels[i]}</span>
              <span class="stat-val">{stat}</span>
              <div class="stat-bar-track">
                <div class="stat-bar-fill" style="width: {(stat / maxStat) * 100}%"></div>
              </div>
            </div>
          {/each}
          <div class="stat-row total-row">
            <span class="stat-label">Total</span>
            <span class="stat-val total-val">{totalStats}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Abilities</h3>
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
        <h3>Moveset ({pokemon.moves ? pokemon.moves.length : 0})</h3>
        <div class="moves-grid">
          {#each (pokemon.moves || []).sort() as move}
            <span class="move-pill">{move.replace(/-/g, ' ')}</span>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--bad);
    color: #fff;
    border-color: var(--bad);
  }

  .modal-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }

  .sprite {
    width: 96px;
    height: 96px;
    background: var(--bg-alt);
    border-radius: 12px;
    object-fit: contain;
  }

  .name {
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
    text-transform: capitalize;
  }

  .types {
    display: flex;
    gap: 0.5rem;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .section h3 {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin: 0 0 0.75rem;
  }

  /* Stats */
  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .stat-label {
    width: 3rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    text-align: right;
  }

  .stat-val {
    width: 2rem;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .stat-bar-track {
    flex: 1;
    height: 8px;
    background: var(--bg-alt);
    border-radius: 99px;
    overflow: hidden;
  }

  .stat-bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 99px;
  }

  .total-row {
    margin-top: 0.5rem;
    border-top: 1px dashed var(--border);
    padding-top: 0.5rem;
  }

  .total-val {
    color: var(--accent);
  }

  /* Abilities */
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
    padding: 0.5rem 0.75rem;
  }

  .ability-name {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    margin-bottom: 0.2rem;
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
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  /* Moves */
  .moves-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .move-pill {
    background: var(--bg-alt);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 99px;
    text-transform: capitalize;
  }
</style>
