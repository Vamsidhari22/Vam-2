import { Check, RefreshCw, ArrowRight, ImageIcon } from 'lucide-react'

export default function ImageGallery({
  images,
  selectedIds,
  onToggle,
  onSearchAgain,
  onGeneratePost,
  loading,
}) {
  if (!images || images.length === 0) return null

  const selectedCount = selectedIds.size

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Matching Images</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Select the images that best represent your brand
            {selectedCount > 0 && (
              <span className="ml-2 rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-400">
                {selectedCount} selected
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onSearchAgain}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-400 transition hover:border-gray-600 hover:text-white disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Search Again
        </button>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {images.map((img) => {
          const isSelected = selectedIds.has(img.id)
          return (
            <button
              key={img.id}
              onClick={() => onToggle(img)}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'border-transparent hover:border-gray-600'
              }`}
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-800">
                <img
                  src={img.thumb}
                  alt={img.description}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Selection overlay */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/30">
                  <div className="rounded-full bg-indigo-600 p-1.5">
                    <Check size={14} className="text-white" />
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-gray-200">{img.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Empty images */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 py-12">
          <ImageIcon className="mb-3 text-gray-700" size={32} />
          <p className="text-sm text-gray-600">No images found. Try searching again.</p>
        </div>
      )}

      {/* CTA */}
      {selectedCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onGeneratePost}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
          >
            Generate Social Posts
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
