# HydroDane

**HydroDane** to aplikacja do przeglądania i wizualizacji archiwalnych danych hydrologicznych z polskich stacji pomiarowych. Projekt składa się z API Node.js/Express z bazą MySQL oraz frontendu Next.js prezentującego wykresy, filtry i zestawienia ekstremów.

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

Dane źródłowe są publikowane przez IMGW-PIB jako pliki CSV. W aplikacji są importowane do bazy MySQL i przetwarzane na potrzeby wykresów oraz agregacji.

Serwis **nie jest oficjalnym serwisem IMGW-PIB**, nie jest powiązany, afiliowany ani sponsorowany przez IMGW-PIB. HydroDane jest niezależną warstwą wizualizacji danych.

## Przetwarzanie danych

Backend wykonuje podstawowe porządkowanie danych przed zwróceniem ich do frontendu:

- wartości sentinelowe stanu wody `9999` są traktowane jako brak danych,
- temperatury wody powyżej `50°C` są traktowane jako brak danych,
- agregaty roczne są liczone osobno dla wartości minimalnych, średnich i maksymalnych.

Aplikacja jest technicznie agnostyczna względem źródła danych: API i frontend pracują na danych znajdujących się w lokalnej bazie MySQL. Obecnie zakładanym i opisanym źródłem są publiczne dane IMGW-PIB, ale ten sam mechanizm może obsługiwać inne dane, jeśli zostaną zaimportowane do zgodnego schematu.

## Prywatność

Frontend zawiera stronę prywatności i mechanizm zgody na anonimową analitykę. Analityka służy do sprawdzania, które części strony są używane oraz jakie dane są najczęściej przeglądane.

Zgodnie z aktualną implementacją:

- analityka jest anonimowa,
- konfiguracja analityki nie używa plików cookie,
- wybór użytkownika jest zapisywany lokalnie w przeglądarce,
- użytkownik może później zmienić decyzję w ustawieniach prywatności.

## Stack technologiczny

- Backend: Node.js, Express, Sequelize, MySQL
- Frontend: Next.js, React, Mantine, Recharts
- Pobieranie danych: Axios, react-query
- Stan UI: Zustand

## Wymagania

- Node.js 18 lub nowszy
- MySQL
- dane dostępowe do bazy w pliku `.env`

## Uruchomienie lokalne

1. Zainstaluj zależności backendu:

```bash
npm install
```

2. Zainstaluj zależności frontendu:

```bash
cd client
npm install
cd ..
```

3. Przygotuj konfigurację bazy:

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
```

Opcjonalnie:

```bash
DB_DIALECT=mysql
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
```

Przykład lokalnej konfiguracji:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_hydro
DB_USER=root
DB_PASSWORD=your_db_password
```

4. Uruchom backend i frontend:

```bash
npm run dev:all
```

Możesz też uruchomić je osobno:

```bash
# backend
npm run dev

# frontend
npm run dev:client
```

Domyślnie backend działa na porcie `8080`, a frontend Next.js na porcie `3000`.

Frontend powinien wskazywać na API przez zmienną:

```bash
NEXT_PUBLIC_VITE_BASE_URL=http://localhost:8080
```

## Import danych

Baza musi zawierać dane hydrologiczne w tabelach używanych przez aplikację:

- `hydro_monthly_backup_2023` - miesięczne rekordy hydrologiczne,
- `stations` - lista stacji pomiarowych.

Dane można zaimportować z plików CSV IMGW-PIB przy użyciu `LOAD DATA INFILE`, własnego skryptu importującego albo migracji.

Repozytorium zawiera przykładowe pliki w katalogu `example_data`, między innymi:

- `example_data/hydro_monthly_example.csv`,
- `example_data/stations_example.csv`.

Można ich użyć do szybkiego sprawdzenia działania wykresów i interfejsu.

## API

Bazowy adres lokalnego API:

```text
http://localhost:8080/api
```

### Stacje

```http
GET /stations
```

Zwraca listę stacji pomiarowych.

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
