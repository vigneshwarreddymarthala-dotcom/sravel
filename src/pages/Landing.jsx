import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

function HowStep({ number, icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg">
        {icon}
      </div>
      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mb-3">
        {number}
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-black text-blue-600">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  )
}

export default function Landing() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session && profile) navigate('/feed')
  }, [session, profile])

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <span className="font-black text-xl text-gray-900 tracking-tight">sravel</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-blue-100">
          🇩🇪 Built for students in Germany
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight tracking-tight mb-6">
          Travel more.
          <br />
          <span className="text-blue-600">Spend less.</span>
          <br />
          Stay with students.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Sravel connects students across Germany. Find a free place to stay when you travel, or open your door to a fellow student. No hotels. No Airbnb. Just trust.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-lg"
          >
            Join for free →
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-gray-100 text-gray-800 font-semibold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors text-lg"
          >
            Sign in
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-4">Free to join · No credit card · Students only</p>
      </section>

      {/* VISUAL DEMO STRIP */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              type: '🔍 Seeking',
              name: 'Lisa M.',
              uni: 'LMU Munich',
              from: 'Munich',
              to: 'Berlin',
              dates: '12–16 Jul',
              story: 'Going to a workshop in Berlin, need a couch for 4 nights. I cook great pasta 🍝',
              color: 'from-purple-500 to-purple-700',
            },
            {
              type: '🏠 Hosting',
              name: 'Tobias K.',
              uni: 'TU Berlin',
              from: 'Berlin',
              to: null,
              dates: 'Jul–Aug',
              story: "I have a spare room in Prenzlauer Berg. Open to students from anywhere in Germany!",
              color: 'from-green-500 to-green-700',
            },
            {
              type: '🎯 Targeted',
              name: 'Sara H.',
              uni: 'Uni Hamburg',
              from: 'Hamburg',
              to: 'Stuttgart',
              dates: '20–23 Jul',
              story: 'Visiting my exchange partner uni, looking for a student host in Stuttgart for 3 nights.',
              color: 'from-blue-400 to-blue-600',
            },
          ].map((card) => (
            <div key={card.name} className="bg-white rounded-2xl p-5 shadow-xl">
              <div className={`inline-flex items-center bg-gradient-to-r ${card.color} text-white text-xs font-semibold px-3 py-1 rounded-full mb-3`}>
                {card.type}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {card.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{card.name}</p>
                  <p className="text-xs text-gray-500">{card.uni}</p>
                </div>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">"{card.story}"</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                <span>📍 {card.from}{card.to && ` → ${card.to}`}</span>
                <span>·</span>
                <span>📅 {card.dates}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4">How Sravel works</h2>
          <p className="text-gray-500 text-lg">Three steps to your next student adventure</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <HowStep
            number="1"
            icon="✍️"
            title="Post what you need"
            desc="Looking to stay somewhere? Post a seeking request to students in that city. Want to host? Open your door to travelers from across Germany."
          />
          <HowStep
            number="2"
            icon="🤝"
            title="Connect instantly"
            desc="Browse posts in your city or accept a request. One click opens a private chat with the other student — no middleman, no fees."
          />
          <HowStep
            number="3"
            icon="✈️"
            title="Travel & host"
            desc="Sort out the details over chat and go. Build your reputation as a trusted host or traveler with every connection you make."
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Everything you need</h2>
            <p className="text-gray-500 text-lg">Built specifically for the student travel experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="🏙️"
              title="City-based matching"
              desc="Posts are automatically filtered by your home city. Seeking posts only reach students in the target city — no noise, only relevant connections."
            />
            <FeatureCard
              icon="💬"
              title="Real-time chat"
              desc="Once connected, a live chat opens instantly. Coordinate arrival times, share addresses, get to know each other — all in one place."
            />
            <FeatureCard
              icon="🎯"
              title="Seeking & Hosting"
              desc="Post that you need a place to stay, or open your space to incoming students. Both sides of the exchange in one platform."
            />
            <FeatureCard
              icon="🔒"
              title="Students only"
              desc="Every account is a real student. University, city, and bio are required so you always know who you're connecting with."
            />
            <FeatureCard
              icon="⭐"
              title="Trust through stats"
              desc="Your profile shows how many times you've hosted and stayed. Build a reputation that opens more doors across Germany."
            />
            <FeatureCard
              icon="🚨"
              title="Safe community"
              desc="Report posts or users with one tap. Our admin team reviews every report and acts fast to keep the community safe."
            />
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4">Across all of Germany</h2>
        <p className="text-gray-500 text-lg mb-10">Students from every major university city are on Sravel</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Hanover', 'Nuremberg', 'Freiburg', 'Heidelberg', 'Münster', 'Bonn', 'Mainz'].map(city => (
            <span key={city} className="bg-blue-50 text-blue-700 font-medium text-sm px-4 py-2 rounded-full border border-blue-100">
              {city}
            </span>
          ))}
          <span className="bg-gray-100 text-gray-500 font-medium text-sm px-4 py-2 rounded-full">
            + 40 more cities
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Ready to sravel?
        </h2>
        <p className="text-blue-200 text-xl mb-10 max-w-xl mx-auto">
          Join thousands of students connecting across Germany. It's free, it's fast, and it's built for you.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-xl"
        >
          Create your free account →
        </Link>
        <p className="text-blue-300 text-sm mt-4">No credit card required</p>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-bold text-gray-900">sravel</span>
          <span className="text-gray-400 text-sm">· student + travel</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link to="/register" className="hover:text-gray-600">Register</Link>
          <Link to="/login" className="hover:text-gray-600">Login</Link>
          <span>© 2026 Sravel</span>
        </div>
      </footer>
    </div>
  )
}
