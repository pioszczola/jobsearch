'use client'

import { useState } from 'react'
import type { JobOffer } from '@/app/api/search/route'

interface Props {
  offers: JobOffer[]
  onBack: () => void
}

export default function JobList({ offers, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function copySelected() {
    const rows = offers
      .filter((o) => selected.has(o.id))
      .map((o) => [o.title, o.portal, o.url])

    const tsv = rows.map((r) => r.join('\t')).join('\n')
    const html = `<table><tbody>${rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('')}</tbody></table>`

    navigator.clipboard
      .write([
        new ClipboardItem({
          'text/plain': new Blob([tsv], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ])
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Znalezione oferty</h2>
          <p className="text-sm text-gray-500">{offers.length} ofert</p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={copySelected}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? '✓ Skopiowano!' : `Kopiuj zaznaczone (${selected.size})`}
            </button>
          )}
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← Zmień kryteria
          </button>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>Brak wyników</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              selected={selected.has(offer.id)}
              onToggle={() => toggleSelect(offer.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OfferCard({
  offer,
  selected,
  onToggle,
}: {
  offer: JobOffer
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer ${
        selected ? 'border-blue-400 ring-1 ring-blue-300' : 'border-gray-200'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center ${
              selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}
          >
            {selected && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{offer.title}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{offer.portal}</span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{offer.company}</p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            <Tag value={offer.location} icon="📍" />
            <Tag value={offer.workMode} icon="🏠" />
            <Tag value={offer.seniority} icon="⭐" />
            <Tag value={offer.contractType} icon="📄" />
            <Tag value={offer.salaryRange} icon="💰" />
          </div>

          {offer.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{offer.description}</p>
          )}
        </div>

        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap flex-shrink-0"
        >
          Otwórz ogłoszenie ↗
        </a>
      </div>
    </div>
  )
}

function Tag({ value, icon }: { value: string | null; icon: string }) {
  if (!value) return null
  return (
    <span className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
      {icon} {value}
    </span>
  )
}
