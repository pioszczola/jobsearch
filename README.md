# JobSearch AI

Wyszukiwarka ofert pracy wspomagana przez Claude. Przeszukuje wybrane portale rekrutacyjne na podstawie podanych kryteriów i zwraca dopasowane oferty.

## Funkcjonalności

- **Wyszukiwanie wieloportalowe** — jednoczesne przeszukiwanie kilkudziesięciu portali pracy pogrupowanych w kategorie (Polskie IT, Europejskie zdalne, Kontraktowe/freelance, Pozostałe)
- **Elastyczne kryteria** — multi-select dla trybu pracy, poziomu seniority i typu umowy (logika OR)
- **Wiele stanowisk i lokalizacji** — oddzielone średnikiem, np. `IT Project Manager; Scrum Master`
- **Zaznaczanie ofert** — kliknięcie zaznacza ofertę na liście wyników
- **Kopiowanie do schowka** — skopiowanie zaznaczonych ofert w formacie zgodnym z Excel i Notion (stanowisko, portal, link)
- **Grupy portali** — włączanie/wyłączanie całej grupy jednym kliknięciem

## Wymagania

- Node.js 18+
- Klucz API Anthropic z dostępem do modelu `claude-sonnet-4-6` i narzędzia `web_search`

## Instalacja

```bash
git clone https://github.com/pioszczola/jobsearch.git
cd jobsearch
npm install
```

Skopiuj plik środowiskowy i uzupełnij klucz API:

```bash
cp .env.example .env
```

Otwórz `.env` i wpisz swój klucz:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Uruchomienie

```bash
npm run dev
```

Aplikacja dostępna pod adresem [http://localhost:3000](http://localhost:3000).

## Konfiguracja portali

Portale i ich grupy konfigurowane są w pliku `portals.yml`. Każdy portal zawiera:

- `name` — nazwa wyświetlana w UI
- `url` — adres główny portalu
- `search_url` — szablon wyszukiwania z placeholderem `{query}`
- `enabled` — czy portal jest domyślnie zaznaczony

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-python) + narzędzie `web_search`
- TypeScript
