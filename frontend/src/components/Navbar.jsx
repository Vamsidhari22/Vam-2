import { TrendingUp, Globe, Share2, Sparkles } from 'lucide-react'

const TABS = [
  { id: 'trends', label: 'Trend Report', icon: TrendingUp },
  { id: 'analyzer', label: 'Business Analyzer', icon: Globe },
  { id: 'posts', label: 'Post Generator', icon: Share2 },
]

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-white">MarketAI</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
