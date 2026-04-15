'use client'

import { useState } from 'react'
import SearchForm from '@/components/SearchForm'
import JobList from '@/components/JobList'
import type { SearchCriteria } from '@/app/api/search/route'
import type { JobOffer } from '@/app/api/search/route'

type Step = 'search' | 'results'

export default function Home() {
  const [step, setStep] = useState<Step>('search')
  const [offers, setOffers] = useState<JobOffer[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  async function handleSearch(criteria: SearchCriteria) {
    setSearching(true)
    setSearchError(null)
    setOffers([])

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Błąd wyszukiwania')
      setOffers(data.offers)
      setStep('results')
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Nieznany błąd')
    } finally {
      setSearching(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">JobSearch AI</h1>
            <p className="text-sm text-gray-500">Wyszukiwarka ofert pracy</p>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <StepBadge active={step === 'search'} done={step === 'results'} num={1} label="Kryteria" />
            <div className="w-6 h-px bg-gray-300" />
            <StepBadge active={step === 'results'} done={false} num={2} label="Oferty" />
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {step === 'search' && (
          <SearchForm onSearch={handleSearch} searching={searching} error={searchError} />
        )}
        {step === 'results' && (
          <JobList
            offers={offers}
            onBack={() => setStep('search')}
          />
        )}
      </div>
    </main>
  )
}

function StepBadge({
  active,
  done,
  num,
  label,
}: {
  active: boolean
  done: boolean
  num: number
  label: string
}) {
  return (
    <div className={`flex items-center gap-1.5 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          active ? 'bg-blue-100 text-blue-600' : done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {done ? '✓' : num}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  )
}
