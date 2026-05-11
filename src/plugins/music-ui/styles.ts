/**
 * Stylesheet for the music UI plugin.
 *
 * Mounted inside `.nomercymusicplayer` — the kit-managed container that carries
 * all state classes (`playing`, `paused`, `muted`, `buffering`, etc.). The
 * plugin wraps a single overlay div (`.nmmusic-ui`) that occupies the full
 * container. Consumers position the container; the plugin fills it.
 *
 * DOM tree:
 *
 *   .nmmusic-ui
 *     ├─ .nmmusic-art               (album art + crossfade class)
 *     │   ├─ img.nmmusic-art-img
 *     │   └─ .nmmusic-art-placeholder
 *     ├─ .nmmusic-track-info
 *     │   ├─ .nmmusic-track-title
 *     │   ├─ .nmmusic-track-artist
 *     │   └─ .nmmusic-track-album
 *     ├─ .nmmusic-progress-row
 *     │   ├─ .nmmusic-time.nmmusic-current-time
 *     │   ├─ .nmmusic-seek-bar      (role=slider)
 *     │   │   ├─ .nmmusic-seek-buffer
 *     │   │   ├─ .nmmusic-seek-fill
 *     │   │   └─ .nmmusic-seek-thumb
 *     │   └─ .nmmusic-time.nmmusic-duration-time
 *     └─ .nmmusic-controls-row
 *         ├─ .nmmusic-btn[data-action=shuffle]
 *         ├─ .nmmusic-btn[data-action=previous]
 *         ├─ .nmmusic-btn.nmmusic-play-btn[data-action=play]
 *         ├─ .nmmusic-btn[data-action=next]
 *         ├─ .nmmusic-btn[data-action=repeat]
 *         └─ .nmmusic-volume-group
 *             ├─ .nmmusic-btn[data-action=mute]
 *             └─ input.nmmusic-vol-slider
 */

export const STYLE_ELEMENT_ID = 'nmmusic-ui-styles';

export const musicUiCss = `
.nmmusic-ui {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    font-family: system-ui, sans-serif;
    background: #1a1d26;
    color: #fff;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}

/* ── Album art ──────────────────────────────────────────── */
.nmmusic-art {
    width: 200px;
    height: 200px;
    border-radius: 12px;
    overflow: hidden;
    background: #252836;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;
    align-self: center;
}
.nmmusic-art.transitioning { opacity: 0.5; }
.nmmusic-art-img { width: 100%; height: 100%; object-fit: cover; }
.nmmusic-art-placeholder {
    color: #444;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.nmmusic-art[hidden] { display: none !important; }

/* ── Track info ─────────────────────────────────────────── */
.nmmusic-track-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}
.nmmusic-track-info[hidden] { display: none !important; }
.nmmusic-track-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
}
.nmmusic-track-artist {
    font-size: 0.85rem;
    color: #888;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.nmmusic-track-album {
    font-size: 0.75rem;
    color: #555;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* ── Progress row ───────────────────────────────────────── */
.nmmusic-progress-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.nmmusic-progress-row[hidden] { display: none !important; }
.nmmusic-time {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.72rem;
    color: #777;
    min-width: 36px;
    user-select: none;
}
.nmmusic-seek-bar {
    position: relative;
    flex: 1;
    height: 4px;
    background: #2a2d3a;
    border-radius: 2px;
    cursor: pointer;
    transition: height 0.12s;
}
.nmmusic-seek-bar:hover { height: 6px; }
.nmmusic-seek-bar[role=slider]:focus-visible {
    outline: 2px solid rgba(108, 99, 255, 0.7);
    outline-offset: 2px;
}
.nmmusic-seek-buffer {
    position: absolute;
    top: 0; left: 0;
    height: 100%;
    width: 0;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 2px;
    pointer-events: none;
    z-index: 1;
}
.nmmusic-seek-fill {
    position: absolute;
    top: 0; left: 0;
    height: 100%;
    width: 0;
    background: #6c63ff;
    border-radius: 2px;
    pointer-events: none;
    z-index: 2;
}
.nmmusic-seek-thumb {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 3;
}
.nmmusic-seek-bar:hover .nmmusic-seek-thumb { opacity: 1; }

/* ── Controls row ───────────────────────────────────────── */
.nmmusic-controls-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-wrap: wrap;
}
.nmmusic-controls-row[hidden] { display: none !important; }

/* ── Buttons ────────────────────────────────────────────── */
.nmmusic-btn {
    background: transparent;
    border: none;
    color: #aaa;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, background 0.15s;
    position: relative;
}
.nmmusic-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.07); }
.nmmusic-btn:focus-visible { outline: 2px solid rgba(108, 99, 255, 0.7); outline-offset: -2px; }
.nmmusic-btn[hidden] { display: none !important; }
.nmmusic-btn.active { color: #6c63ff; }
.nmmusic-play-btn {
    color: #fff;
    background: #6c63ff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
}
.nmmusic-play-btn:hover { background: #7d75ff; }

/* ── Responsive button priority ─────────────────────────── */
/* tier 3: shuffle + repeat hidden below 280px */
@container (max-width: 280px) {
    .nmmusic-btn[data-priority="3"] { display: none !important; }
}
/* tier 2: prev + next hidden below 200px */
@container (max-width: 200px) {
    .nmmusic-btn[data-priority="2"] { display: none !important; }
}
/* tier 1 (volume group) hidden below 160px */
@container (max-width: 160px) {
    .nmmusic-volume-group { display: none !important; }
}

/* ── Volume group ───────────────────────────────────────── */
.nmmusic-volume-group {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
}
.nmmusic-volume-group[hidden] { display: none !important; }
.nmmusic-vol-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 72px;
    height: 4px;
    background: #2a2d3a;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
}
.nmmusic-vol-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #6c63ff;
}
.nmmusic-vol-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #6c63ff;
    border: none;
}

/* ── Speed menu (hidden by default) ─────────────────────── */
.nmmusic-speed-btn[hidden] { display: none !important; }
`;

export function ensureMusicUiStyles(): void {
    if (document.getElementById(STYLE_ELEMENT_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = musicUiCss;
    document.head.appendChild(style);
}
