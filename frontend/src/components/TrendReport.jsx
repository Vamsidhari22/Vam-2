import { useState } from 'react'
import { Search, TrendingUp, Copy, Check, Loader2, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { analyzeTrends } from '../api/client'

const SUGGESTIONS = [
  'Sustainable fashion',
  'AI in marketing',
  'Short-form video',
  'DTC e-commerce',
  'Mental wellness apps',
]

export default function TrendReport() {
  const [topic, setTopic] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = async (t = topic) => {
    const trimmed = t.trim()
    if (!trimmed) return
    setTopic(trimmed)
    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const data = await analyzeTrends(trimmed)
      setReport(data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to generate the trend report. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(report.report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/15">
          <TrendingUp className="text-indigo-400" size={26} />
        </div>
        <h1 className="text-3xl font-bold text-white">Trend Report Generator</h1>
        <p className="mx-auto mt-2 max-w-lg text-gray-400">
          Search the internet for the latest marketing trends in any industry or topic
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={17}
            />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="e.g. sustainable fashion, SaaS marketing, food delivery…"
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3.5 pl-11 pr-4 text-white placeholder-gray-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !topic.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-600"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search size={16} />
                Analyze
              </>
            )}
          </button>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleAnalyze(s)}
              disabled={loading}
              className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-xs text-gray-400 transition hover:border-indigo-500 hover:text-white disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto max-w-2xl flex items-start gap-3 rounded-xl border border-red-800/60 bg-red-900/20 p-4 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="animate-spin text-indigo-400" size={32} />
            <div>
              <p className="font-medium text-white">Searching the internet…</p>
              <p className="mt-1 text-sm text-gray-500">
                Analysing trends for "{topic}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report */}
      {report && !loading && (
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <div>
              <p className="font-semibold text-white">Trend Report</p>
              <p className="mt-0.5 text-sm text-gray-500">Topic: {report.topic}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-700"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Markdown content */}
          <div className="p-6">
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white prose-a:text-indigo-400">
              <ReactMarkdown>{report.report}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!report && !loading && !error && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-dashed border-gray-800 p-14 text-center">
          <TrendingUp className="mx-auto mb-3 text-gray-700" size={36} />
          <p className="text-gray-600">Enter a topic above to generate a live trend report</p>
        </div>
      )}
    </div>
  )
}
