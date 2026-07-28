# Statyczne dane hydrologiczne

Pliki w tym katalogu generuje polecenie uruchomione z katalogu głównego projektu:

```bash
npm run export:static-data
```

Eksporter łączy się z bazą według zmiennych z `.env` i tworzy dwa pliki na stację:

- `monthly/<stationId>.json` — rekordy `[rok hydrologiczny, miesiąc, minLevel, avgLevel, maxLevel, minFlow, avgFlow, maxFlow, minTemperature, avgTemperature, maxTemperature]`.
- `yearly/<stationId>.json` — rekordy `[rok hydrologiczny, minLevel, avgLevel, maxLevel, minFlow, avgFlow, maxFlow, minTemperature, avgTemperature, maxTemperature]`.

`null` oznacza brak danych. W `yearly` wartość jest `null`, gdy dla tej konkretnej serii min/avg/max brakuje choć jednego z 12 miesięcy hydrologicznych. `manifest.json` zawiera wersję formatu, moment eksportu i listę identyfikatorów stacji.
