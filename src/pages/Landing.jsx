import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

const AVATARS = [
  { name: 'Lisa M.', color: 'bg-purple-500' },
  { name: 'Tobias K.', color: 'bg-blue-500' },
  { name: 'Sara H.', color: 'bg-green-500' },
  { name: 'Max R.', color: 'bg-orange-500' },
]

function Initials({ name, color, size = 'w-9 h-9' }) {
  const ini = name.trim().split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div className={`${size} ${color} rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ring-2 ring-white`}>
      {ini}
    </div>
  )
}

const DEMO_CARDS = [
  {
    type: 'Seeking', typeColor: 'bg-purple-100 text-purple-700',
    name: 'Lisa M.', uni: 'LMU Munich', avatarColor: 'bg-purple-500',
    from: 'Munich', to: 'Berlin', dates: '12–16 Jul',
    story: 'Going to a workshop in Berlin, need a couch for 4 nights. I cook great pasta 🍝',
  },
  {
    type: 'Hosting', typeColor: 'bg-green-100 text-green-700',
    name: 'Tobias K.', uni: 'TU Berlin', avatarColor: 'bg-blue-500',
    from: 'Berlin', to: null, dates: 'Jul – Aug',
    story: 'Spare room in Prenzlauer Berg. Open to any student from Germany!',
  },
  {
    type: 'Seeking', typeColor: 'bg-purple-100 text-purple-700',
    name: 'Sara H.', uni: 'Uni Hamburg', avatarColor: 'bg-green-500',
    from: 'Hamburg', to: 'Stuttgart', dates: '20–23 Jul',
    story: 'Visiting exchange partner uni in Stuttgart, looking for a friendly host.',
  },
]

const FEATURES = [
  { icon: '🏙️', title: 'City-based matching', desc: 'Posts are filtered by city. Seeking posts only reach students in the target city — no noise, only relevant connections.' },
  { icon: '💬', title: 'Real-time chat', desc: 'Once connected, a private live chat opens instantly. Coordinate, plan, and get to know each other before you arrive.' },
  { icon: '🎯', title: 'Seek & Host', desc: 'Need a place to stay or have a spare couch? Both sides of the exchange are built into one simple flow.' },
  { icon: '🔒', title: 'Students only', desc: 'Every account is a real student. University, city, and bio are required so you always know who you are connecting with.' },
  { icon: '⚡', title: 'Instant connections', desc: 'Accept a post and a shared chat opens in one tap. No waiting, no back-and-forth emails, no middleman.' },
  { icon: '🚨', title: 'Safe community', desc: 'Report any post or user with one tap. Our team reviews every report and acts fast to keep the community trusted.' },
]

const CITIES = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Hanover', 'Nuremberg', 'Freiburg', 'Heidelberg', 'Münster', 'Bonn', 'Mainz']

const TESTIMONIALS = [
  { name: 'Julia B.', uni: 'FU Berlin', avatar: 'bg-pink-500', text: 'Stayed with a student from Berlin for 5 days during my internship. Saved over €400 and made a real friend. Sravel is amazing.' },
  { name: 'Marco S.', uni: 'TU Munich', avatar: 'bg-blue-500', text: 'I have hosted 3 students so far and it is so rewarding. Everyone was super respectful and we keep in touch.' },
  { name: 'Hannah W.', uni: 'Uni Hamburg', avatar: 'bg-teal-500', text: 'Found a host in Cologne within 2 hours of posting. The chat made it so easy to coordinate everything.' },
]

export default function Landing() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session && profile) {
      if (profile.role === 'admin') navigate('/admin/dashboard')
      else navigate('/feed')
    }
  }, [session, profile])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-white font-black text-base leading-none">S</span>
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">sravel</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative max-w-6xl mx-auto px-5 pt-20 pb-8 md:pt-28 md:pb-12 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-100/60 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span>🇩🇪</span> Built for students across Germany
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 leading-[1.08] tracking-tight mb-6">
          Travel more.{' '}
          <span className="text-blue-600">Stay free.</span>
          <br className="hidden sm:block" />
          {' '}Stay with students.
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed mb-10">
          sravel connects students across Germany. Find a free place to stay, or open your door to a fellow student.
          No hotels. No Airbnb. Just trust.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link to="/register" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-base">
            Join for free →
          </Link>
          <Link to="/login" className="w-full sm:w-auto bg-white text-gray-700 font-semibold px-8 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors text-base">
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {AVATARS.map(a => <Initials key={a.name} name={a.name} color={a.color} />)}
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">200+ students</span> already connected
          </p>
        </div>
      </section>

      {/* ── DEMO CARDS ── */}
      <section className="max-w-6xl mx-auto px-5 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DEMO_CARDS.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full mb-4 ${card.typeColor}`}>
                {card.type === 'Seeking' ? '🔍' : '🏠'} {card.type}
              </span>
              <div className="flex items-center gap-2.5 mb-3">
                <Initials name={card.name} color={card.avatarColor} size="w-10 h-10" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{card.name}</p>
                  <p className="text-xs text-gray-400">{card.uni}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">"{card.story}"</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>📍 {card.from}{card.to && ` → ${card.to}`}</span>
                <span>·</span>
                <span>📅 {card.dates}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-blue-600 py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '200+', label: 'Students joined' },
            { value: '16+', label: 'Cities covered' },
            { value: '100%', label: 'Free forever' },
            { value: '0€', label: 'No fees ever' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black text-white">{s.value}</p>
              <p className="text-blue-200 text-sm mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-5xl mx-auto px-5 py-20 md:py-28">
        <div className="text-center mb-16">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Three steps to your next adventure</h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">Simple by design. No endless forms, no waiting for approval.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-10 left-[17%] right-[17%] h-px bg-gray-100" />

          {[
            { num: '01', icon: '✍️', title: 'Post what you need', desc: 'Seeking a place to stay? Post a request. Want to host? Open your door. Takes under 2 minutes.' },
            { num: '02', icon: '🤝', title: 'Connect in one tap', desc: 'Browse posts in your city or accept a request. One tap opens a private chat — no fees, no middleman.' },
            { num: '03', icon: '✈️', title: 'Travel & host', desc: 'Coordinate over chat, show up, and enjoy. Build your reputation with every connection you make.' },
          ].map(step => (
            <div key={step.num} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-[11px] font-black rounded-full flex items-center justify-center">
                  {step.num.slice(1)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-gray-50 py-20 md:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Everything built in</h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">Designed specifically for the student travel experience.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <span className="text-2xl block mb-4">{f.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-5xl mx-auto px-5 py-20 md:py-28">
        <div className="text-center mb-16">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Students love it</p>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900">Real stories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex text-yellow-400 mb-4 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <Initials name={t.name} color={t.avatar} size="w-9 h-9" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.uni}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="bg-gray-50 py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Across all of Germany</h2>
          <p className="text-gray-400 text-base mb-8">Students from every major university city are on sravel</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CITIES.map(city => (
              <span key={city} className="bg-white text-gray-700 font-medium text-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors cursor-default">
                {city}
              </span>
            ))}
            <span className="bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-full">
              + 40 more
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-5">
            Ready to sravel?
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-lg mx-auto">
            Join students across Germany who travel smarter. Free place to stay, real connections, zero cost.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg shadow-xl"
          >
            Create your free account →
          </Link>
          <p className="text-blue-300 text-sm mt-5">No credit card · No fees · Students only</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-bold text-gray-900">sravel</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-sm">student + travel</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/register" className="hover:text-gray-700 transition-colors">Register</Link>
            <Link to="/login" className="hover:text-gray-700 transition-colors">Sign in</Link>
            <span>© 2026 sravel</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
