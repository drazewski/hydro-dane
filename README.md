# HydroDane

**HydroDane** to aplikacja do przeglądania i wizualizacji archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Domyślnie frontend Next.js działa bez backendu: odczytuje gotowe pliki JSON i prezentuje wykresy, filtry oraz zestawienia ekstremów.

Repozytorium zachowuje także API Node.js/Express z MySQL. Może ono służyć do importu, kontroli i eksportu danych, lecz obecny frontend nie wysyła do niego żądań w czasie działania.

## Co robi aplikacja

- pozwala wyszukać stację pomiarową po nazwie rzeki, miejscowości lub identyfikatorze stacji,
- wyświetla archiwalne dane miesięczne oraz agregaty roczne,
- pokazuje wartości minimalne, średnie i maksymalne,
- obsługuje trzy typy danych: stan wody, przepływ i temperaturę wody,
- pozwala ograniczyć wykres do wybranego zakresu lat,
- prezentuje tabelę ekstremów dla wybranej stacji i zakresu.

## Źródło danych

Dane prezentowane w aplikacji pochodzą z publicznych zasobów Instytutu Meteorologii i Gospodarki Wodnej - Państwowego Instytutu Badawczego (IMGW-PIB), w szczególności z katalogu publicznych danych hydrologicznych:

https://danepubliczne.imgw.pl/data/dane_pomiarowo_obserwacyjne/dane_hydrologiczne/miesieczne/

Dane źródłowe są publikowane przez IMGW-PIB jako pliki CSV. Mogą zostać zaimportowane do lokalnej bazy MySQL, a następnie wyeksportowane do statycznych JSON-ów używanych przez frontend.

Źródłem pochodzenia danych jest Instytut Meteorologii i Gospodarki Wodnej – Państwowy Instytut Badawczy. Dane IMGW-PIB zostały przetworzone na potrzeby wizualizacji i agregacji.

Serwis **nie jest oficjalnym serwisem IMGW-PIB**, nie jest powiązany, afiliowany ani sponsorowany przez IMGW-PIB. HydroDane jest niezależną warstwą wizualizacji danych.

## Domyślny tryb: statyczne JSON-y

Frontend pobiera dane z katalogu `client/public/data`:

- `monthly/<stationId>.json` — dane miesięczne,
- `yearly/<stationId>.json` — agregaty roczne,
- `manifest.json` — wersja formatu, data eksportu i lista stacji.

Pliki są serwowane przez Next.js pod adresami `/data/monthly/<stationId>.json` i `/data/yearly/<stationId>.json`. Nie są potrzebne uruchomiony Express, MySQL ani zmienne środowiskowe backendu.

Podczas eksportu danych obowiązują następujące reguły:

- wartości sentinelowe stanu wody `9999` są traktowane jako brak danych,
- temperatury wody powyżej `50°C` są traktowane jako brak danych,
- listopad i grudzień należą do poprzedniego roku hydrologicznego,
- agregat roczny dla konkretnej serii min/avg/max jest `null`, jeśli brakuje choć jednego z 12 miesięcy hydrologicznych.

Opis zwartego formatu JSON znajduje się w [client/public/data/README.md](client/public/data/README.md).

## Prywatność

Frontend zawiera stronę prywatności i mechanizm zgody na anonimową analitykę. Analityka służy do sprawdzania, które części strony są używane oraz jakie dane są najczęściej przeglądane.

Zgodnie z aktualną implementacją:

- analityka jest anonimowa,
- konfiguracja analityki nie używa plików cookie,
- wybór użytkownika jest zapisywany lokalnie w przeglądarce,
- użytkownik może później zmienić decyzję w ustawieniach prywatności.

## Stack technologiczny

- Domyślny frontend: Next.js, React, Mantine, Recharts, react-query, Zustand
- Opcjonalny backend: Node.js, Express, Sequelize, MySQL

## Wymagania

- Node.js 18 lub nowszy
- MySQL i plik `.env` są potrzebne wyłącznie do uruchomienia API lub wykonania eksportu z bazy.

## Uruchomienie lokalne

1. Zainstaluj zależności frontendu:

```bash
cd client
npm install
```

2. Uruchom frontend:

```bash
npm run dev
```

Next.js będzie dostępny pod `http://localhost:3000` i użyje plików z `client/public/data`.

## Opcjonalny tryb API z MySQL

Backend nie jest wymagany przez obecny frontend, ale pozostaje w repozytorium jako źródło danych i API do dalszego wykorzystania.

1. Zainstaluj zależności w katalogu głównym:

```bash
npm install
```

2. Przygotuj konfigurację bazy:

```bash
cp .env.example .env
```

Wymagane zmienne:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DIALECT=mysql
```

3. Uruchom API:

```bash
npm run dev
```

API działa domyślnie pod `http://localhost:8080/api`.

## Import i eksport danych

Baza musi zawierać dane hydrologiczne w tabelach używanych przez aplikację:

- `hydro_monthly` - miesięczne rekordy hydrologiczne,
- `stations` - lista stacji pomiarowych.

Dane można zaimportować z plików CSV IMGW-PIB przy użyciu `LOAD DATA INFILE`, własnego skryptu importującego albo migracji.

Repozytorium zawiera przykładowe pliki w katalogu `example_data`, między innymi:

- `example_data/hydro_monthly_example.csv`,
- `example_data/stations_example.csv`.

Można ich użyć do szybkiego sprawdzenia działania wykresów i interfejsu.

Po zaimportowaniu danych do MySQL wygeneruj pliki statyczne dla frontendu:

```bash
npm run export:static-data
```

Polecenie zapisuje pliki w `client/public/data`. Dzięki temu można zaktualizować dane w aplikacji bez uruchamiania backendu w produkcji.

## Zachowane API

Bazowy adres lokalnego API:

```text
http://localhost:8080/api
```

### Stacje

```http
GET /stations
```

Zwraca listę stacji pomiarowych. Obecny frontend korzysta z lokalnego pliku `stations.json`, a nie z tego endpointu.

Przykład:

```bash
curl http://localhost:8080/api/stations
```

### Dane miesięczne

```http
GET /records/monthly/:stationId
GET /records/monthly/:stationId/:year
GET /records/monthly/:stationId?from=YYYY&to=YYYY
```

Zwraca miesięczne rekordy dla stacji, opcjonalnie ograniczone do roku lub zakresu lat.

Przykład:

```bash
curl "http://localhost:8080/api/records/monthly/123?from=1990&to=2000"
```

### Agregaty roczne

```http
GET /records/yearly/:stationId
GET /records/yearly/:stationId/:year
GET /records/yearly/:stationId?from=YYYY&to=YYYY
GET /records/yearly/withTemperature
```

Zwraca roczne wartości minimalne, średnie i maksymalne dla stanu wody, przepływu oraz temperatury wody.

Przykład:

```bash
curl "http://localhost:8080/api/records/yearly/123?from=1990&to=2000"
```

## Licencja

Projekt jest udostępniany na licencji **GPL-3.0-only**.

## Autor

Luk Drazewski
