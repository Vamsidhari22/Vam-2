import { useState } from 'react'
import {
  Share2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Instagram,
  Sparkles,
  Hash,
  MessageSquare,
  Download,
  Image as ImageIcon,
  Info,
} from 'lucide-react'
import { generatePosts } from '../api/client'

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-gray-700 hover:text-white"
    >
      {copied ? (
        <><Check size={12} className="text-green-400" /> Copied!</>
      ) : (
        <><Copy size={12} /> {label}</>
      )}
    </button>
  )
}

function GeneratedImage({ src, prompt }) {
  const [showPrompt, setShowPrompt] = useState(false)

  const handleDownload = () => {
    // Open in new tab — DALL-E URLs are temporary so direct download via anchor works
    window.open(src, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-pink-400" />
          <span className="text-sm font-medium text-white">Generated Image</span>
          <span className="rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-400">
            Expires in ~1 hr — download now
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrompt((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-gray-700 hover:text-white"
          >
            <Info size={12} />
            {showPrompt ? 'Hide' : 'View'} Prompt
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-pink-800/60 bg-pink-900/20 px-3 py-1.5 text-xs text-pink-300 transition hover:bg-pink-900/40"
          >
            <Download size={12} />
            Open / Download
          </button>
        </div>
      </div>

      {/* Square image — matches Instagram format */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        <img
          src={src}
          alt="AI-generated Instagram image"
          className="aspect-square w-full object-cover"
        />
      </div>

      {showPrompt && (
        <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
          <p className="text-xs leading-relaxed text-gray-400">{prompt}</p>
        </div>
      )}
    </div>
  )
}

function InstagramPost({ data, imageUrl, imagePrompt }) {
  const caption = data?.caption || ''
  const hashtags = data?.hashtags || []
  const cta = data?.cta || ''
  const storyIdea = data?.story_idea || ''

  const fullCaption = `${caption}\n\n${hashtags.map((h) => `#${h}`).join(' ')}`

  return (
    <div className="space-y-5">
      {/* Generated image */}
      {imageUrl && (
        <GeneratedImage src={imageUrl} prompt={imagePrompt} />
      )}

      {/* Caption card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Instagram size={18} className="text-pink-400" />
            <span className="font-medium text-white">Instagram Caption</span>
          </div>
          <CopyButton text={fullCaption} label="Copy Caption + Tags" />
        </div>

        {/* Caption body */}
        <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
            {caption}
          </p>
        </div>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Hashtags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400"
                >
                  <Hash size={9} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {cta && (
          <div className="flex items-start gap-2 rounded-lg border border-gray-800 bg-gray-950/40 p-3">
            <MessageSquare size={13} className="mt-0.5 shrink-0 text-gray-500" />
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">Call to Action</p>
              <p className="text-xs text-gray-300">{cta}</p>
            </div>
          </div>
        )}

        {/* Story idea */}
        {storyIdea && (
          <div className="rounded-lg border border-pink-900/30 bg-pink-900/10 px-4 py-3">
            <p className="text-xs text-pink-300">
              <span className="font-semibold">Story idea: </span>
              {storyIdea}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PostGenerator({ aestheticsData, selectedImages, state, setState }) {
  const { result, loading, error } = state

  const canGenerate = aestheticsData && selectedImages?.length > 0

  const handleGenerate = async () => {
    if (!canGenerate) return
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      result: null,
    }))

    try {
      const data = await generatePosts(aestheticsData, selectedImages)
      setState((prev) => ({
        ...prev,
        result: data,
        loading: false,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err.response?.data?.detail ||
          'Failed to generate post. Please try again.',
        loading: false,
      }))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-600/15">
          <Instagram className="text-pink-400" size={26} />
        </div>
        <h1 className="text-3xl font-bold text-white">Instagram Post Generator</h1>
        <p className="mx-auto mt-2 max-w-lg text-gray-400">
          Generate a brand-aligned caption and AI image ready to post on Instagram
        </p>
      </div>

      {/* No data notice */}
      {!canGenerate && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-800/40 bg-amber-900/15 p-6 text-center">
          <AlertCircle className="mx-auto mb-2 text-amber-400" size={24} />
          <p className="font-medium text-amber-300">No brand data yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Head to <strong>Business Analyzer</strong>, analyse a website, and select at least one image.
          </p>
        </div>
      )}

      {/* Setup panel */}
      {canGenerate && (
        <div className="mx-auto max-w-4xl space-y-5">
          {/* Selected images strip */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <p className="mb-3 text-sm font-medium text-gray-400">
              {selectedImages.length} reference image{selectedImages.length > 1 ? 's' : ''}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {selectedImages.map((img) => (
                <img
                  key={img.id}
                  src={img.thumb || img.url}
                  alt={img.description}
                  className="h-20 w-32 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>

          {/* Brand chips */}
          {aestheticsData && (
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              <span className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1">
                {aestheticsData.brand_name || 'Brand'}
              </span>
              <span className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1">
                {aestheticsData.industry}
              </span>
              <span className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1">
                {aestheticsData.brand_mood}
              </span>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 py-4 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating caption &amp; image…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Instagram Post
              </>
            )}
          </button>

          {loading && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 text-center space-y-2">
              <p className="text-sm font-medium text-white">This may take 15-30 seconds</p>
              <p className="text-xs text-gray-500">
                Writing caption → building image prompt → generating with DALL-E 3
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-auto max-w-4xl flex items-start gap-3 rounded-xl border border-red-800/60 bg-red-900/20 p-4 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mx-auto max-w-4xl space-y-6">
          <InstagramPost
            data={result.instagram}
            imageUrl={result.generated_image?.url}
            imagePrompt={result.generated_image?.prompt_used}
          />

          {/* Regenerate */}
          <button
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-800 bg-gray-900 py-3.5 text-sm font-medium text-gray-400 transition hover:border-pink-700 hover:text-white"
          >
            <Sparkles size={15} />
            Regenerate Post
          </button>
        </div>
      )}
    </div>
  )
}
