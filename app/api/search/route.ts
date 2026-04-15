import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { loadPortals, Portal } from '@/lib/config'

export interface SearchCriteria {
  title: string
  location: string
  workMode: string[]
  seniority: string[]
  salaryMin: string
  contractType: string[]
  selectedPortals: string[]
}

export interface JobOffer {
  id: string
  title: string
  company: string
  location: string
  workMode: string | null
  seniority: string | null
  salaryRange: string | null
  contractType: string | null
  companySize: string | null
  url: string
  description: string
  portal: string
  postedAt: string | null
}

export async function POST(req: NextRequest) {
  const criteria: SearchCriteria = await req.json()

  const allPortals = loadPortals()
  const activePortals = allPortals.filter(
    (p: Portal) => criteria.selectedPortals.includes(p.name)
  )

  if (activePortals.length === 0) {
    return NextResponse.json({ error: 'Nie wybrano żadnego portalu.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const portalList = activePortals.map((p: Portal) => `- ${p.name} (${p.url})`).join('\n')

  const titles = criteria.title.split(';').map((t) => t.trim()).filter(Boolean)
  const titlesDisplay = titles.length > 1
    ? `Szukaj ofert pasujących do KTÓREGOKOLWIEK z poniższych stanowisk (traktuj je jako alternatywy, nie jako wymagania łączne):\n${titles.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`
    : `Stanowisko: ${criteria.title}`

  const locations = criteria.location.split(';').map((l) => l.trim()).filter(Boolean)
  const locationsDisplay = locations.length > 1
    ? `Lokalizacja (oferta musi pasować do PRZYNAJMNIEJ JEDNEJ z poniższych lokalizacji, traktuj je jako alternatywy):\n${locations.map((l, i) => `  ${i + 1}. ${l}`).join('\n')}`
    : `Lokalizacja: ${criteria.location || 'dowolna'}`

  const prompt = `Jesteś asystentem rekrutacyjnym. Przeszukaj następujące portale z ofertami pracy w poszukiwaniu ofert pasujących do podanych kryteriów.

KRYTERIA WYSZUKIWANIA:
- ${titlesDisplay}
- ${locationsDisplay}
- Tryb pracy: ${criteria.workMode.length > 0 ? criteria.workMode.join(' lub ') : 'dowolny'}
- Poziom: ${criteria.seniority.length > 0 ? criteria.seniority.join(' lub ') : 'dowolny'}
- Minimalne wynagrodzenie: ${criteria.salaryMin || 'bez wymagań'}
- Typ umowy: ${criteria.contractType.length > 0 ? criteria.contractType.join(' lub ') : 'dowolny'}
  (definicje typów umowy: UoP = umowa o pracę na czas nieokreślony; B2B = współpraca na fakturę bez określonej daty końcowej; Kontrakt = zaangażowanie terminowe z określoną datą końcową, np. kontrakt na projekt, interim, fixed-term contract — wyklucz oferty bez podanej daty lub okresu trwania zaangażowania)

PORTALE DO PRZESZUKANIA:
${portalList}

INSTRUKCJE:
1. Użyj narzędzia web_search aby wyszukać oferty na każdym z portali — wyszukuj każde stanowisko osobno
2. Dla każdej znalezionej oferty zbierz: tytuł, firmę, lokalizację, tryb pracy, widełki wynagrodzenia, typ umowy, wielkość firmy, link, krótki opis (2-3 zdania), portal
3. Jeśli dane pole nie jest dostępne w ogłoszeniu, wpisz null
4. Zwróć wyniki WYŁĄCZNIE jako tablicę JSON (bez żadnego dodatkowego tekstu), format:

[
  {
    "id": "unikalny-id-1",
    "title": "Nazwa stanowiska",
    "company": "Nazwa firmy",
    "location": "Miasto lub Zdalnie",
    "workMode": "Zdalnie|Hybrydowo|Stacjonarnie|null",
    "seniority": "Junior|Mid|Senior|Lead|null",
    "salaryRange": "np. 15 000 - 20 000 PLN lub null",
    "contractType": "UoP|B2B|Kontrakt|null",
    "companySize": "Startup|Scaleup|Korporacja|null",
    "url": "https://...",
    "description": "Krótki opis roli i wymagań",
    "portal": "Nazwa portalu",
    "postedAt": "YYYY-MM-DD lub null"
  }
]

Zwróć minimum 5, maksimum 20 ofert. Postaraj się znaleźć jak najbardziej trafne wyniki.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        } as unknown as Anthropic.Tool,
      ],
      messages: [{ role: 'user', content: prompt }],
    })

    // Wyodrębnij tekst z ostatniego bloku tekstowego
    const textBlock = response.content.filter((b) => b.type === 'text').pop()
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Brak wyników od Claude.' }, { status: 500 })
    }

    // Wyciągnij JSON z odpowiedzi
    const text = textBlock.text
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Nie znaleziono ofert.', raw: text }, { status: 404 })
    }

    const offers: JobOffer[] = JSON.parse(jsonMatch[0])
    return NextResponse.json({ offers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Błąd podczas wyszukiwania.' }, { status: 500 })
  }
}
