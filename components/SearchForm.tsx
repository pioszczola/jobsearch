'use client'

import { useState, useEffect } from 'react'
import type { SearchCriteria } from '@/app/api/search/route'

interface Portal {
  name: string
  url: string
  enabled: boolean
}

interface PortalGroup {
  name: string
  portals: Portal[]
}

interface Props {
  onSearch: (criteria: SearchCriteria) => void
  searching: boolean
  error: string | null
}

const WORK_MODES = ['Zdalnie', 'Hybrydowo', 'Stacjonarnie']
const SENIORITY_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager']
const CONTRACT_TYPES = ['UoP', 'B2B', 'Kontrakt']

export default function SearchForm({ onSearch, searching, error }: Props) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState<string[]>([])
  const [seniority, setSeniority] = useState<string[]>([])
  const [salaryMin, setSalaryMin] = useState('')
  const [contractType, setContractType] = useState<string[]>([])
  const [groups, setGroups] = useState<PortalGroup[]>([])
  const [selectedPortals, setSelectedPortals] = useState<string[]>([])
  const [loadingPortals, setLoadingPortals] = useState(true)

  useEffect(() => {
    fetch('/api/portals')
      .then((r) => r.json())
      .then((data) => {
        const g: PortalGroup[] = data.groups || []
        setGroups(g)
        setSelectedPortals(
          g.flatMap((group) => group.portals.filter((p) => p.enabled).map((p) => p.name))
        )
        setLoadingPortals(false)
      })
      .catch(() => setLoadingPortals(false))
  }, [])

  function togglePortal(name: string) {
    setSelectedPortals((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    )
  }

  function toggleGroup(group: PortalGroup) {
    const names = group.portals.map((p) => p.name)
    const allSelected = names.every((n) => selectedPortals.includes(n))
    setSelectedPortals((prev) =>
      allSelected ? prev.filter((n) => !names.includes(n)) : [...new Set([...prev, ...names])]
    )
  }

  function toggleOption(setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) {
    setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch({
      title,
      location,
      workMode,
      seniority,
      salaryMin,
      contractType,
      selectedPortals,
    })
  }

  const totalPortals = groups.reduce((sum, g) => sum + g.portals.length, 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Kryteria wyszukiwania</h2>
        <p className="text-sm text-gray-500">Wypełnij formularz — Claude przeszuka wybrane portale i zwróci pasujące oferty.</p>
      </div>

      {/* Stanowisko — wymagane */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stanowisko <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="np. Senior Product Manager, Frontend Developer"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lokalizacja */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lokalizacja</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="np. Warszawa; Kraków; Zdalnie"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tryb pracy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tryb pracy</label>
        <div className="flex flex-wrap gap-2">
          {WORK_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleOption(setWorkMode, m)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                workMode.includes(m)
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              {workMode.includes(m) ? '✓ ' : ''}{m}
            </button>
          ))}
        </div>
        {workMode.length === 0 && <p className="text-xs text-gray-400 mt-1">Brak zaznaczenia = dowolny</p>}
      </div>

      {/* Seniority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Poziom seniority</label>
        <div className="flex flex-wrap gap-2">
          {SENIORITY_LEVELS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleOption(setSeniority, s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                seniority.includes(s)
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              {seniority.includes(s) ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
        {seniority.length === 0 && <p className="text-xs text-gray-400 mt-1">Brak zaznaczenia = dowolny</p>}
      </div>

      {/* Typ umowy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Typ umowy</label>
        <div className="flex flex-wrap gap-2">
          {CONTRACT_TYPES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleOption(setContractType, c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                contractType.includes(c)
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              {contractType.includes(c) ? '✓ ' : ''}{c}
            </button>
          ))}
        </div>
        {contractType.length === 0 && <p className="text-xs text-gray-400 mt-1">Brak zaznaczenia = dowolny</p>}
      </div>

      {/* Wynagrodzenie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Min. wynagrodzenie (PLN brutto)</label>
        <input
          type="number"
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value)}
          placeholder="np. 15000"
          min={0}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Portale */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Portale do przeszukania</label>
          <span className="text-xs text-gray-400">{selectedPortals.length} z {totalPortals} wybranych</span>
        </div>

        {loadingPortals ? (
          <p className="text-sm text-gray-400">Ładowanie portali...</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const names = group.portals.map((p) => p.name)
              const allSelected = names.every((n) => selectedPortals.includes(n))
              const someSelected = names.some((n) => selectedPortals.includes(n))

              return (
                <div key={group.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{group.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                        allSelected
                          ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100'
                          : someSelected
                          ? 'bg-gray-50 border-gray-300 text-gray-500 hover:border-gray-400'
                          : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {allSelected ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.portals.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => togglePortal(p.name)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          selectedPortals.includes(p.name)
                            ? 'bg-blue-50 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                        }`}
                      >
                        {selectedPortals.includes(p.name) ? '✓ ' : ''}{p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={searching || selectedPortals.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {searching ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Szukam ofert... (może to chwilę potrwać)
          </>
        ) : (
          '🔍 Szukaj ofert'
        )}
      </button>
    </form>
  )
}
