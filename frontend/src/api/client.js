import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Allow up to 90 s for long AI operations
  timeout: 90000,
})

/**
 * Feature 1 — Generate a trend report for a topic using OpenAI web search.
 * @param {string} topic
 * @param {object} [aesthetics] - Optional business aesthetics for tailored trends
 * @returns {Promise<{ report: string, topic: string }>}
 */
export const analyzeTrends = async (topic, aesthetics = null) => {
  const { data } = await api.post('/trends/analyze', { topic, aesthetics })
  return data
}

/**
 * Feature 2 — Scrape a website, analyse its brand aesthetics, and return matching images.
 * @param {string} url
 * @returns {Promise<{ aesthetics: object, images: object[] }>}
 */
export const analyzeAesthetics = async (url) => {
  const { data } = await api.post('/aesthetics/analyze', { url })
  return data
}

/**
 * Feature 2 (refresh) — Search for a new batch of images using the provided keywords.
 * @param {string[]} keywords
 * @param {object} aesthetics
 * @returns {Promise<{ images: object[] }>}
 */
export const searchImages = async (keywords, aesthetics) => {
  const { data } = await api.post('/aesthetics/images', { keywords, aesthetics })
  return data
}

/**
 * Feature 3 — Generate social media posts based on aesthetics and selected images.
 * @param {object} aesthetics
 * @param {object[]} selectedImages
 * @returns {Promise<{ posts: object, status: string }>}
 */
export const generatePosts = async (aesthetics, selectedImages) => {
  const { data } = await api.post('/posts/generate', {
    aesthetics,
    selected_images: selectedImages,
  })
  return data
}

export default api
