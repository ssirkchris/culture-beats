# Moduł wysyłkowy Web Push

Oddzielna usługa HTTPS przyjmuje `POST /subscriptions` z obiektem `{ subscription, time, timeZone, weekends }`. Klient wysyła subskrypcję w formacie PushSubscriptionJSON, czas HH:mm, strefę Europe/Warsaw i `weekends: true`. Usługa przyjmuje żądania z originu wdrożenia przez CORS, waliduje subskrypcje i plan, i rejestruje harmonogram według endpointu subskrypcji. W przypadku aktualizacji endpoint zachowuje dotychczasowy stan dostarczenia.

Scheduler przelicza czas lokalny przez IANA TZDB, obsługuje zmianę czasu i deduplikuje wysyłkę według endpointu i lokalnej daty. Przy wyłączeniu przypomnienia klient wyrejestrowuje subskrypcję po stronie przeglądarki. Sender usuwa wygasłe endpointy po odpowiedzi 404 lub 410 od usługi push. Wysyłka używa standardowego Web Push z VAPID, bez treści wymaganej przez service worker. Klucz prywatny należy do usługi. Do modułu trafia wyłącznie subskrypcja i ustawienia przypomnienia.

Przed uruchomieniem publicznego nadawcy należy wdrożyć kontrolę dostępu do rejestracji, ograniczenia żądań i kontrolę dozwolonych endpointów, aby usługa nie wykonywała żądań do dowolnych adresów. Frontend pilotażu nie dostarcza mechanizmu uwierzytelniania, więc integracja wymaga jego uzgodnienia na etapie wdrożenia nadawcy.
