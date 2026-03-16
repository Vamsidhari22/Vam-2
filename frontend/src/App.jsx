import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import TrendReport from './components/TrendReport'
import BusinessAnalyzer from './components/BusinessAnalyzer'
import PostGenerator from './components/PostGenerator'

const STORAGE_KEY = 'marketai-app-state'

const DEFAULT_STATE = {
  activeTab: 'trends',
  aestheticsData: null,
  images: [],
  selectedImages: [],
  trendState: {
    topic: '',
    report: null,
    loading: false,
    error: null,
  },
  analyzerState: {
    url: '',
    loading: false,
    imageLoading: false,
    error: null,
  },
  postState: {
    result: null,
    loading: false,
    error: null,
  },
}

function loadInitialState() {
  if (typeof window === 'undefined') return DEFAULT_STATE

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE

    const saved = JSON.parse(raw)
    return {
      ...DEFAULT_STATE,
      ...saved,
      trendState: { ...DEFAULT_STATE.trendState, ...saved.trendState, loading: false },
      analyzerState: {
        ...DEFAULT_STATE.analyzerState,
        ...saved.analyzerState,
        loading: false,
        imageLoading: false,
      },
      postState: { ...DEFAULT_STATE.postState, ...saved.postState, loading: false },
    }
  } catch {
    return DEFAULT_STATE
  }
}

function buildPersistedState(state) {
  const next = {
    ...state,
    trendState: { ...state.trendState, loading: false },
    analyzerState: {
      ...state.analyzerState,
      loading: false,
      imageLoading: false,
    },
    postState: { ...state.postState, loading: false },
  }

  const imageUrl = next.postState?.result?.generated_image?.url
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
    next.postState = {
      ...next.postState,
      result: {
        ...next.postState.result,
        generated_image: {
          ...next.postState.result.generated_image,
          url: null,
        },
      },
    }
  }

  return next
}

export default function App() {
  const [appState, setAppState] = useState(loadInitialState)
  const {
    activeTab,
    aestheticsData,
    images,
    selectedImages,
    trendState,
    analyzerState,
    postState,
  } = appState

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(buildPersistedState(appState)),
    )
  }, [appState])

  const setActiveTab = (tab) => {
    setAppState((prev) => ({ ...prev, activeTab: tab }))
  }

  const setAestheticsData = (data) => {
    setAppState((prev) => ({ ...prev, aestheticsData: data }))
  }

  const setImages = (nextImages) => {
    setAppState((prev) => ({ ...prev, images: nextImages }))
  }

  const setSelectedImages = (nextSelectedImages) => {
    setAppState((prev) => ({
      ...prev,
      selectedImages:
        typeof nextSelectedImages === 'function'
          ? nextSelectedImages(prev.selectedImages)
          : nextSelectedImages,
    }))
  }

  const setTrendState = (nextTrendState) => {
    setAppState((prev) => ({
      ...prev,
      trendState:
        typeof nextTrendState === 'function'
          ? nextTrendState(prev.trendState)
          : nextTrendState,
    }))
  }

  const setAnalyzerState = (nextAnalyzerState) => {
    setAppState((prev) => ({
      ...prev,
      analyzerState:
        typeof nextAnalyzerState === 'function'
          ? nextAnalyzerState(prev.analyzerState)
          : nextAnalyzerState,
    }))
  }

  const setPostState = (nextPostState) => {
    setAppState((prev) => ({
      ...prev,
      postState:
        typeof nextPostState === 'function'
          ? nextPostState(prev.postState)
          : nextPostState,
    }))
  }

  const handleClearSavedState = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setAppState(DEFAULT_STATE)
  }

  // Called when the user has selected images in BusinessAnalyzer and clicks "Generate Social Posts"
  const handleImagesSelected = (imgs) => {
    setSelectedImages(imgs)
    setActiveTab('posts')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClearState={handleClearSavedState}
      />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className={activeTab === 'trends' ? 'block' : 'hidden'}>
          <TrendReport state={trendState} setState={setTrendState} />
        </div>

        <div className={activeTab === 'analyzer' ? 'block' : 'hidden'}>
          <BusinessAnalyzer
            state={analyzerState}
            setState={setAnalyzerState}
            onAestheticsFound={setAestheticsData}
            aestheticsData={aestheticsData}
            images={images}
            setImages={setImages}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            onImagesSelected={handleImagesSelected}
          />
        </div>

        <div className={activeTab === 'posts' ? 'block' : 'hidden'}>
          <PostGenerator
            aestheticsData={aestheticsData}
            selectedImages={selectedImages}
            state={postState}
            setState={setPostState}
          />
        </div>
      </main>
    </div>
  )
}
