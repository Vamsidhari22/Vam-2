import { useState } from 'react'
import Navbar from './components/Navbar'
import TrendReport from './components/TrendReport'
import BusinessAnalyzer from './components/BusinessAnalyzer'
import PostGenerator from './components/PostGenerator'

export default function App() {
  const [activeTab, setActiveTab] = useState('trends')

  // Shared state between BusinessAnalyzer and PostGenerator
  const [aestheticsData, setAestheticsData] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImages, setSelectedImages] = useState([])

  // Called when the user has selected images in BusinessAnalyzer and clicks "Generate Social Posts"
  const handleImagesSelected = (imgs) => {
    setSelectedImages(imgs)
    setActiveTab('posts')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="mx-auto max-w-7xl px-4 py-10">
        {activeTab === 'trends' && <TrendReport />}

        {activeTab === 'analyzer' && (
          <BusinessAnalyzer
            onAestheticsFound={setAestheticsData}
            aestheticsData={aestheticsData}
            images={images}
            setImages={setImages}
            onImagesSelected={handleImagesSelected}
          />
        )}

        {activeTab === 'posts' && (
          <PostGenerator
            aestheticsData={aestheticsData}
            selectedImages={selectedImages}
          />
        )}
      </main>
    </div>
  )
}
