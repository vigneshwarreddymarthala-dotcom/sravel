const COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
]

function getColor(name = '') {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Avatar({ name = '', size = 'md', className = '', src, onClick, editable = false }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  return (
    <div
      onClick={onClick}
      className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
        : getInitials(name)
      }
      {editable && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}
    </div>
  )
}
