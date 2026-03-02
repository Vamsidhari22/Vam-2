import { useState } from 'react'
import { Globe, Loader2, AlertCircle, Palette, Users, Megaphone, Tag } from 'lucide-react'
import ImageGallery from './ImageGallery'
import { analyzeAesthetics, searchImages } from '../api/client'

function AestheticsCard({ aesthetics }) {
  const cp = aesthetics.color_palette || {}

  const swatches = [cp.primary, cp.secondary, cp.accent, cp.background].filter(Boolean)

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Palette size={18} className="text-indigo-400" />
        <h3 className="font-semibold text-white">{aesthetics.brand_name || 'Brand'} — Aesthetic Profile</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Colour palette */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Colour Palette</p>
          <div className="flex gap-2">
            {swatches.map((s, i) => (
              <div
                key={i}
                title={s}
                className="h-7 w-7 rounded-full border border-gray-700 shadow-inner"
                style={{ background: s.startsWith('#') ? s : undefined, backgroundColor: s.startsWith('#') ? undefined : s }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400">{cp.mood_description}</p>
        </div>

        {/* Visual style */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Visual Style</p>
          <p className="text-sm text-gray-200">{aesthetics.visual_style}</p>
        </div>

        {/* Brand mood */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Brand Mood</p>
          <p className="text-sm text-gray-200">{aesthetics.brand_mood}</p>
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Industry</p>
          <p className="text-sm text-gray-200">{aesthetics.industry}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Target audience */}
        <div className="flex gap-3 rounded-xl border border-gray-800 bg-gray-950/50 p-4">
          <Users size={16} className="mt-0.5 shrink-0 text-indigo-400" />
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Target Audience</p>
            <p className="text-sm text-gray-300">{aesthetics.target_audience}</p>
          </div>
        </div>

        {/* Brand voice */}
        <div className="flex gap-3 rounded-xl border border-gray-800 bg-gray-950/50 p-4">
          <Megaphone size={16} className="mt-0.5 shrink-0 text-indigo-400" />
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Brand Voice</p>
            <p className="text-sm text-gray-300">{aesthetics.brand_voice}</p>
          </div>
        </div>
      </div>

      {/* Key themes */}
      {aesthetics.key_themes?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {aesthetics.key_themes.map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-indigo-800/50 bg-indigo-900/20 px-3 py-1 text-xs text-indigo-300"
            >
              <Tag size={10} />
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BusinessAnalyzer({
  onAestheticsFound,
  aestheticsData,
  images,
  setImages,
  onImagesSelected,
}) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState(null)

  // Track selected images as a Map<id, imageObject>
  const [selectedMap, setSelectedMap] = useState(new Map())

  const handleAnalyze = async () => {
    const trimmed = url.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setSelectedMap(new Map())

    try {
      const data = await analyzeAesthetics(trimmed)
      onAestheticsFound(data.aesthetics)
      setImages(data.images)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to analyse the website. Check the URL and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSearchAgain = async () => {
    if (!aestheticsData) return
    setImageLoading(true)
    setSelectedMap(new Map())

    try {
      const keywords =
        aestheticsData.search_keywords || aestheticsData.aesthetic_tags || []
      const data = await searchImages(keywords, aestheticsData)
      setImages(data.images)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to refresh images.')
    } finally {
      setImageLoading(false)
    }
  }

  const handleToggleImage = (img) => {
    setSelectedMap((prev) => {
      const next = new Map(prev)
      if (next.has(img.id)) {
        next.delete(img.id)
      } else {
        next.set(img.id, img)
      }
      return next
    })
  }

  const handleGeneratePost = () => {
    const selected = Array.from(selectedMap.values())
    onImagesSelected(selected)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/15">
          <Globe className="text-indigo-400" size={26} />
        </div>
        <h1 className="text-3xl font-bold text-white">Business Analyzer</h1>
        <p className="mx-auto mt-2 max-w-lg text-gray-400">
          Enter your business URL to analyse its brand aesthetics and discover matching visuals
        </p>
      </div>

      {/* URL input */}
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={17}
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="https://yourbusiness.com"
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3.5 pl-11 pr-4 text-white placeholder-gray-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-600"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Globe size={16} />
                Analyse
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto max-w-2xl flex items-start gap-3 rounded-xl border border-red-800/60 bg-red-900/20 p-4 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-indigo-400" size={32} />
          <p className="font-medium text-white">Analysing your website…</p>
          <p className="mt-1 text-sm text-gray-500">
            Reading content, identifying aesthetics, and finding matching images
          </p>
        </div>
      )}

      {/* Results */}
      {aestheticsData && !loading && (
        <div className="space-y-8">
          <AestheticsCard aesthetics={aestheticsData} />

          <ImageGallery
            images={images}
            selectedIds={new Set(selectedMap.keys())}
            onToggle={handleToggleImage}
            onSearchAgain={handleSearchAgain}
            onGeneratePost={handleGeneratePost}
            loading={imageLoading}
          />
        </div>
      )}

      {/* Empty state */}
      {!aestheticsData && !loading && !error && (
        <div className="mx-auto max-w-4xl rounded-2xl border border-dashed border-gray-800 p-14 text-center">
          <Globe className="mx-auto mb-3 text-gray-700" size={36} />
          <p className="text-gray-600">Enter a business URL above to get started</p>
        </div>
      )}
    </div>
  )
}
