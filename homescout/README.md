# HomeScout v2 — architecture aligned with Travel Planner OS

Responsive web frontend + Cloudflare Worker API + Notion data source.

## Data flow

```
iPhone / desktop browser
   → static site (public/index.html, app.js, styles.css)
   → HTTPS API (worker/worker.js; X-HomeScout-Key)
   → Notion (source of truth; NOTION_TOKEN secret on Worker)
```

The frontend includes a snapshot of eight existing offers as offline fallback. The application **never claims a local draft was saved in Notion** if server writes fail. Reservations stay in every listing unless explicitly filtered by the user. Images are shown only when the URL belongs to a specific listing; no fictional listing photographs are supplied.

## Deployment

1. Deploy `public/` to any static host (Cloudflare Pages, Vercel, ChatGPT Sites if publisher access is available). Keep files in one folder; no build step is needed.
2. Create a Cloudflare Worker using `worker/worker.js` and `worker/wrangler.toml`; set `NOTION_TOKEN` and `SITE_KEY` as Worker **secrets**, never in public frontend code. Use at least 24 random characters for SITE_KEY.
3. Grant the Notion integration read/write access to the source database **Mieszkania Gdańsk — baza ofert**. `NOTION_DATA_SOURCE_ID` is already configured.
4. Set `ALLOWED_ORIGIN` to the exact frontend origin (scheme + host; no trailing slash), redeploy Worker. This prevents browser use from other origins; the shared key protects read/write.
5. In HomeScout open ⚙ Synchronizacja, enter the Worker HTTPS URL and SITE_KEY; repeat per device. `/health` checks Worker status, `/offers` reads Notion, `PATCH /offers/:id` updates only allowed fields.
6. Check an actual read and one write from each device and verify it in Notion. Do not consider the site production-ready until this passes.

**Security:** Do not expose `NOTION_TOKEN` in HTML, JS or GitHub. The shared SITE_KEY is stored locally in each browser. For multiuser access beyond trusted household devices, use Cloudflare Access instead of a shared key. GitHub Pages cannot host the Worker backend.

## Local run / tests

```sh
cd public && python3 -m http.server 8765
# separate terminal:
node --test tests/*.test.mjs
```

## Known data limitations

- Base prices/statuses are historical and are not proof of availability as of today.
- The eight Notion rows currently have no `Zdjęcie główne URL`; the UI displays neutral placeholders, not photographs borrowed from another property.
- Some source listing URLs in Notion are blank or expired; they are not invented in the UI.
- Publishing credentials for a `.chatgpt.site` site and a live Cloudflare Worker are not included in this package. Deployment requires access to the selected hosting account.
