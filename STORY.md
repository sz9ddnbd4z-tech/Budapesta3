# Historia i pocztówka

Aktualną aplikacją pozostaje `index.html`. Countdown (11 września 2026, 18:00 czasu Budapesztu), ekran zasad, 27 punktów i kolejność czterech dni pozostają zachowane.

## Pięć tropów
- f1: słowo wyjazdu
- f3: znak pierwszego wieczoru
- s5: kolor soboty
- n2: symbol niedzieli
- m1: obraz finałowy

Stały, zwijany panel „Wasza historia” pokazuje licznik 0/5–5/5. Pola odblokowują się po dotarciu do odpowiedniego punktu. Wcześniejsze tropy można uzupełniać i edytować. Misje pokazują zapisane skojarzenia. Wpisy zapisują się podczas pisania, do 160 znaków każdy.

Stan korzysta z istniejącego klucza `budapeszt_na_dwoje_v7`. Starsze zapisy zachowują postęp. Cofanie punktów nie usuwa tropów. Reset usuwa całą grę. Po odświeżeniu aktywny jest pierwszy nieukończony dzień. Wybór pominięcia mostu jest przywracany. Na końcu dnia dostępne są przejście do następnego dnia i cofnięcie ostatniego punktu.

## Finał
Po 100% trasy i zebraniu 5/5 niepustych tropów aplikacja tworzy prompt ilustracji. „Kopiuj prompt” i „Otwórz ChatGPT” pozwalają przekazać go do generatora; gdy schowek jest niedostępny, tekst można zaznaczyć i skopiować ręcznie. Brakujące tropy można uzupełnić po zakończeniu trasy.

**Ta wersja przygotowuje prompt, nie generuje ani nie zapisuje obrazu w samej aplikacji.** Obraz wymaga wklejenia promptu do ChatGPT i zlecenia generowania. Generowanie bezpośrednio w aplikacji wymaga osobnego backendu i konfiguracji API. Repo nie zawiera kluczy ani płatnych wywołań. Tropy pozostają lokalne do chwili ich ręcznego przekazania.

## Weryfikacja
Test `tests/story-webkit.cjs` uruchamia lokalny serwer i przeglądarkę. Wymaga Node.js i Playwright 1.62.1 oraz zainstalowanych silników WebKit/Chromium. Domyślnie używa WebKit. Zmienna `BROWSER=chromium` uruchamia również test odświeżania offline. Opcjonalna zmienna `PLAYWRIGHT_MODULE` wskazuje istniejącą instalację Playwright.

Uruchomienie: `node tests/story-webkit.cjs`.

Przeszły w obu silnikach: countdown, 27 punktów / 4 dni, blokady, cofanie, pominięcie mostu, zapis i odświeżanie, 5/5 + 100% finału, aktualizacja promptu po edycji, obsługa tekstu zawierającego HTML, zastępcze kopiowanie, migracja v7, ponowienie nieudanego zapisu, uszkodzony zapis, szerokość 375 px i reset. Brak błędów JavaScript strony.

Tryb offline przeszedł w Chromium; WebKit potwierdził zawartość cache nowych plików, ale odświeżenie przy odłączonej sieci wywołało wewnętrzny błąd silnika na Windows. Test fizycznego iPhone'a/Safari (zwłaszcza klawiatura ekranowa, dodanie do ekranu początkowego i ponowne uruchomienie offline) pozostaje do wykonania. Emulacja WebKit nie jest testem na fizycznym iPhonie.

