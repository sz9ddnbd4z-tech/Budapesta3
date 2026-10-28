# HomeScout v2 — opublikowany frontend i backend do Notion

## Publiczna witryna

**https://sz9ddnbd4z-tech.github.io/Budapesta3/homescout/**

- Wdrożenie GitHub Pages: workflow `.github/workflows/publish-homescout.yml`
- Jeden responsywny widok na komputer i iPhone; PWA (manifest, service worker, możliwość dodania ikony)
- Migawka 8 ofert z istniejącej bazy Notion; `Rezerwacja` nie jest usuwana
- Wspólna opinia i status decyzji: lokale szkice do czasu uruchomienia API
- Strona jest publiczna; nie umieszczaj na niej prywatnych danych ani tokenów

## Backend — Railway / Node 20+

Kod serwera: `server.mjs` (adaptuje `worker.js` do Node); `railway.json` oraz `package.json` są gotowe.

1. Połącz Railway z ChatGPT lub kontem GitHub i utwórz usługę z tego repo.
2. W Railway ustaw **Root Directory = /homescout**.
3. W sekcji Variables w Railway ustaw sekrety:
   - `NOTION_TOKEN` — token integracji Notion z dostępem do bazy **Mieszkania Gdańsk — baza ofert**
   - `SITE_KEY` — losowy, długi prywatny klucz dostępu (co najmniej 24 znaki)
   - `NOTION_DATA_SOURCE_ID=1616d3a7-735d-4361-839c-73cad6fbc0c9`
   - `ALLOWED_ORIGIN=https://sz9ddnbd4z-tech.github.io`
4. Udostępnij integracji Notion docelową bazę ofert z uprawnieniami odczytu i edycji.
5. Wygeneruj publiczną domenę HTTPS Railway. Test: `GET /health` powinien zwrócić `notionConfigured:true`.
6. W witrynie HomeScout otwórz **⚙ Synchronizacja** i ustaw URL Railway oraz `SITE_KEY` na każdym urządzeniu.
7. Test akceptacyjny: edycja opinii w witrynie → odczyt tej samej opinii w Notion → odświeżenie na drugim urządzeniu.

Sekretów **nigdy nie wpisuj do publicznego HTML, GitHuba ani do wiadomości czatu**. Umieść je wyłącznie w Railway Variables. Bez nich API nie ma autoryzacji do Notion.

## Źródła i weryfikacja

Dane ofert są historyczne, dlatego dostępność, ceny i fotografie trzeba sprawdzić w ogłoszeniach. Nie używamy losowych zdjęć innych nieruchomości. GitHub Pages publikuje frontend, lecz nie uruchamia backendu Notion. Bez skonfigurowanego Railway widok używa migawki 8 ofert i zapisuje szkice **lokalnie**, co jest wyraźnie komunikowane w interfejsie.
