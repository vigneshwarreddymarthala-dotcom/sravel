import { useState, useRef, useEffect } from 'react'
import { GERMAN_CITIES } from '../../lib/constants'

export default function CitySelect({ label, value, onChange, placeholder = 'Search city…', error, required, allowAny = false, cities = GERMAN_CITIES }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = cities.filter(c =>
    c.toLowerCase().includes(query.toLowerCase())
  )

  function select(city) {
    setQuery(city)
    onChange(city)
    setOpen(false)
  }

  function handleInput(e) {
    setQuery(e.target.value)
    onChange('')
    setOpen(true)
  }

  function handleFocus() {
    setOpen(true)
    if (query) setQuery('')
  }

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}{required && ' *'}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          type="text"
          className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={handleFocus}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => { setQuery(''); onChange(''); setOpen(false) }}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
            {allowAny && (
              <button
                type="button"
                onClick={() => select('')}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100 italic"
              >
                Open to everyone (no target city)
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">No cities found</div>
            ) : (
              filtered.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => select(city)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                    value === city ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
