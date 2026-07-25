# UAT checklist

## Fillable form (recommended)

Open in the browser while the dev server runs:

**http://localhost:3000/uat-checklist** (local/dev only)

**Not available on production** (`https://tmkeen.alzaad.org.sa`) — middleware returns 404 unless `ENABLE_UAT_CHECKLIST=true` (do not set this on Coolify).

Progress is saved in `localStorage` (`tmkeen-uat-checklist-v1`).

## Cursor Canvas (optional)

Interactive Canvas lives outside the git repo:

`~/.cursor/projects/workspace/canvases/uat-tools-checklist.canvas.tsx`

Open it from the **Canvas panel beside the agent chat**, not as a normal file in `docs/`.

If Canvas fails to load, use `/uat-checklist` instead.

Static reference: [uat-tools-checklist.md](./uat-tools-checklist.md)
