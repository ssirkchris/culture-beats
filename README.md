# CULTURE//BEATS

Anglojęzyczna PWA dla Niny do nauki kultury Wielkiej Brytanii i USA. Pytania i objaśnienia są wbudowane w aplikację, a odpowiedzi i preferencje zapisują się lokalnie w IndexedDB.

## Uruchomienie

Wymagany Node.js 22.18+ i npm. Polecenia wykonaj w katalogu projektu.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Użyj adresu z terminala. Tryb `preview` serwuje produkcyjną PWA z service workerem. Po komunikacie **Available offline** wyłącz sieć i odśwież. Quizy, objaśnienia, historia, ustawienia i obsługa plików działają z lokalnych danych. Odnośniki do źródeł prowadzą do zewnętrznych stron i wymagają połączenia.

## Zakres konkursu 2026/2027

[Zarządzenie nr 938/2026 i regulamin, rozdział X § 17](https://sto3.gda.pl/wp-content/uploads/2026/10/English_regulamin-wojewodzkiego-konkursu-z-jezyka-angielskiego-compressed.pdf) · [oficjalny rejestr zarządzeń Kuratorium](https://www.gov.pl/web/bip-kuratorium-gdansk/rejestr-zarzadzen-wydanych-w-2026).

| Stopień | Wiedza kulturowa o UK i USA | Sprawność językowa wg regulaminu |
| --- | --- | --- |
| I · szkolny | Politics, Food, Sports | B1 |
| II · rejonowy | Geography, Literature, Science, Current Affairs | B2, w tym różnice British i American English |
| III · wojewódzki | History, Cinema, Music, Holidays & Traditions | B2+, w tym różnice British i American English |

Aplikacja ćwiczy część kulturową. Regulamin obejmuje również szkolną podstawę programową i środki językowe. Bank zawiera 14 faktów i 28 wariantów, reprezentujących wszystkie 11 działów. Każdy fakt ma kraj, trudność, objaśnienie i źródło, a każde pytanie własny identyfikator, cztery opcje i indeks poprawnej odpowiedzi. Aktualności mają datę wydarzenia. Trudność Foundation / Challenge opisuje pytania w aplikacji.

## Powtórki i dane

Daily Practice wybiera 10 różnych faktów. Priorytet mają zaległe słabe fakty, pozostałe zaległe fakty, nowe fakty i na końcu fakty z przyszłym terminem, aby dopełnić zestaw. All Topics ogranicza wybór do wybranego działu. Weak Spots pozwala wrócić do błędów od razu. Kolejne próby obracają warianty faktu i tasują odpowiedzi.

Po poprawnej odpowiedzi odstępy wynoszą kolejno 1, 3, 7, 14, 30 i 60 dni. Błąd zeruje serię i wyznacza termin za 10 minut. Dwie poprawne odpowiedzi odrabiają słaby punkt, a trzy z rzędu dają opanowanie. Terminy są liczone w czasie od ostatniej odpowiedzi.

Odpowiedzi zapisują się na bieżąco, również przy przerwaniu sesji. W **Settings → Practice history** można wyeksportować JSON i scalić sesje z pliku po walidacji. Import pomija duplikaty i uzupełnia dłuższe wersje sesji. Preferencje przypomnień należą do urządzenia. Wersja formatu pliku to 1. Po publikacji na innej domenie przenieś historię eksportem i importem.

## GitHub Pages

1. Umieść zawartość tego katalogu w głównym katalogu repozytorium na GitHub i wypchnij na gałąź `main`.
2. W **Settings → Pages → Build and deployment → Source** wybierz **GitHub Actions**.
3. W **Actions → Publish GitHub Pages** uruchom workflow ręcznie, jeśli potrzeba. Workflow instaluje zależności, testuje, buduje i publikuje `dist/`.
4. Otwórz URL z kroku wdrożenia. Vite używa względnej ścieżki bazowej, więc ten sam build działa również pod ścieżką repozytorium.

## Instalacja na iPhone

Otwórz adres HTTPS w Safari, wybierz **Udostępnij → Dodaj do ekranu początkowego**, a następnie uruchom aplikację z ikony. Przy pierwszym uruchomieniu pozostaw połączenie do chwili wyświetlenia **Available offline**. Do instalacji wystarcza Safari i hosting HTTPS. Apple Developer i TestFlight są zbędne.

## Web Push

Domyślna lokalna preferencja to 18:00 Europe/Warsaw, codziennie. Integracja klienta jest w `src/push.ts`, a obsługa powiadomień i otwierania aplikacji w `src/sw.ts`. Przycisk połączenia wymaga aktywnego service workera i wywołuje systemową zgodę po kliknięciu. Na iPhonie Web Push wymaga instalacji na ekranie początkowym i iOS 16.4 lub nowszego. [Dokumentacja WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

Moduł wysyłkowy jest do wdrożenia oddzielnie. Ustawienie w buildzie `VITE_PUSH_API` i `VITE_VAPID_PUBLIC_KEY` włącza integrację klienta. Kontrakt modułu i granice odpowiedzialności opisano w [docs/push.md](docs/push.md).
