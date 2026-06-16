import { useState } from 'react'
import { LANGUAGES } from '../../lib/constants'

export default function LanguageSelect({ label, value = [], onChange, required }) {
  const [open, setOpen] = useState(false)

  function toggle(lang) {
    if (value.includes(lang)) {
      onChange(value.filter(l => l !== lang))
    } else {
      onChange([...value, lang])
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}{required && ' *'}
        </label>
      )}
      <div
        className="min-h-[42px] w-full border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 cursor-pointer bg-white"
        onClick={() => setOpen(o => !o)}
      >
        {value.length === 0 && (
          <span className="text-sm text-gray-400 self-center">Select languages…</span>
        )}
        {value.map(lang => (
          <span
            key={lang}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {lang}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); toggle(lang) }}
              className="hover:text-blue-900 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {open && (
        <div className="border border-gray-200 rounded-xl shadow-lg bg-white p-3 flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => toggle(lang)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                value.includes(lang)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
