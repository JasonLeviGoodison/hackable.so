import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-stone-900">hackable.so</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-stone-500 hover:text-stone-900 transition-colors text-sm px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 mb-4 tracking-tight leading-tight">
            hackable.so
          </h1>
          <p className="text-lg text-stone-500 mb-12 max-w-lg mx-auto leading-relaxed">
            A social platform with 12 hidden vulnerabilities. How many can you find?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
            <Link href="/login" className="btn-primary text-sm px-8 py-3 w-full sm:w-auto text-center">
              Sign In
            </Link>
            <Link href="/register" className="btn-secondary text-sm px-8 py-3 w-full sm:w-auto text-center">
              Create Account
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            {[
              { title: 'Company Feed', desc: 'Share updates with the team.' },
              { title: 'Direct Messages', desc: 'Private team conversations.' },
              { title: 'User Profiles', desc: 'Employee directory and info.' },
              { title: 'Admin Panel', desc: 'Manage users and settings.' },
            ].map((item) => (
              <div key={item.title} className="py-3 px-4 rounded-lg border border-stone-100 bg-white">
                <h3 className="text-stone-900 font-medium text-sm">{item.title}</h3>
                <p className="text-stone-400 text-sm mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-400 text-xs">
            hackable.so
          </p>
          <p className="text-stone-300 text-xs">
            v2.1.4
          </p>
        </div>
      </footer>
    </div>
  )
}
