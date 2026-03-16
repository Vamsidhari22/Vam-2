import { TrendingUp, Globe, Share2, Sparkles, RotateCcw } from 'lucide-react'

const TABS = [
  { id: 'trends', label: 'Trend Report', icon: TrendingUp },
  { id: 'analyzer', label: 'Business Analyzer', icon: Globe },
  { id: 'posts', label: 'Post Generator', icon: Share2 },
]

export default function Navbar({ activeTab, setActiveTab, onClearState }) {
  const handleClearState = () => {
    const confirmed = window.confirm(
      'Clear all saved reports, analyzer results, selected images, and generated posts?'
    )

    if (confirmed) {
      onClearState()
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-white">MarketAI</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
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

            <button
              onClick={handleClearState}
              className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-400 transition hover:border-red-800/60 hover:bg-red-900/20 hover:text-red-300"
              title="Clear saved state"
            >
              <RotateCcw size={14} />
              <span className="hidden md:inline">Clear Saved State</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
