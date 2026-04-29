'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STUDENT_NAV = [
  { href: '/chat',      label: 'Chat',      icon: '💬' },
  { href: '/worksheet', label: 'Worksheet', icon: '📝' },
]

const ADMIN_NAV = [
  { href: '/admin', label: 'Admin CMS', icon: '⚙️' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">IGCSE Maths</p>
        <h1 className="text-lg font-bold mt-0.5">Sets Tutor</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {STUDENT_NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              path.startsWith(href)
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}

        <div className="pt-3 mt-3 border-t border-slate-700">
          {ADMIN_NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                path.startsWith(href)
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">Cambridge IGCSE · 0580</p>
      </div>
    </aside>
  )
}
