<template>
  <div class="word-search">
    <h1 class="app-title">
      <span class="logo">📖</span>
      <span class="title-text">
        WordMate
        <sup class="ai-badge">AI</sup>
      </span>
    </h1>
    <p class="app-subtitle">Your Smart English Learning Companion</p>

    <div class="search-container">
      <div class="search-box">
        <input 
          ref="inputRef"
          v-model="searchWord" 
          @keyup.enter="handleSearch()"
          placeholder="请输入要查询的单词"
          type="text"
          :disabled="isLoading"
        >
        <button 
          @click="handleSearch()"
          :disabled="isLoading"
          class="search-button"
        >
          <span v-if="isLoading" class="button-spinner"></span>
          <span>{{ isLoading ? '查询中...' : '查询' }}</span>
        </button>
      </div>

      <div v-if="searchHistory.length" class="history-list">
        <span 
          v-for="word in sortedHistory" 
          :key="word"
          class="history-tag"
        >
          <span class="word-text" @click="handleHistoryClick(word)">{{ word }}</span>
          <button class="delete-btn" @click.stop="removeFromHistory(word)" aria-label="删除">&times;</button>
        </span>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="wordInfo" class="word-info">
      <div class="word-header" v-if="wordInfo.word">
        <div class="word-title">
          <h2>{{ wordInfo.word }}</h2>
          <button 
            class="favorite-btn"
            :class="{ 'is-favorite': isFavorite }"
            @click="toggleFavorite"
            :title="isFavorite ? '从生词本移除' : '添加到生词本'"
          >
            {{ isFavorite ? '★' : '☆' }}
          </button>
        </div>
        <div v-if="wordInfo.phonetic" class="phonetic">
          <span class="fade-in">/{{ wordInfo.phonetic }}/</span>
          <audio v-if="wordInfo.audioUrl" :src="wordInfo.audioUrl" controls class="audio-player fade-in"></audio>
        </div>
      </div>

      <div v-if="wordInfo.definitions?.length" class="definitions fade-in">
        <div v-for="(def, index) in wordInfo.definitions" :key="index" class="definition">
          <div class="def-header">
            <span class="pos">{{ def.partOfSpeech }}</span>
            <span class="def-text">{{ def.definition }}</span>
          </div>

          <div v-if="def.examples?.length" class="examples fade-in">
            <h4>例句</h4>
            <div v-for="(example, idx) in def.examples" :key="idx" class="example">
              <p class="en">{{ example.en }}</p>
              <p class="zh">{{ example.zh }}</p>
            </div>
          </div>

          <div v-if="def.synonyms?.length" class="synonyms fade-in">
            <h4>同义词</h4>
            <div class="word-list">
              <span v-for="syn in def.synonyms" :key="syn" class="related-word" @click="handleRelatedWordClick(syn)">
                {{ syn }}
              </span>
            </div>
          </div>

          <div v-if="def.antonyms?.length" class="antonyms fade-in">
            <h4>反义词</h4>
            <div class="word-list">
              <span v-for="ant in def.antonyms" :key="ant" class="related-word" @click="handleRelatedWordClick(ant)">
                {{ ant }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="wordInfo.etymology" class="etymology fade-in">
        <h3>词源</h3>
        <p>{{ wordInfo.etymology }}</p>
      </div>

      <div v-if="wordInfo.relatedWords?.length" class="related-words fade-in">
        <h3>相关词汇</h3>
        <div class="word-list">
          <span v-for="word in wordInfo.relatedWords" :key="word" class="related-word" @click="handleRelatedWordClick(word)">
            {{ word }}
          </span>
        </div>
      </div>
    </div>

    <div class="nav-links">
      <router-link to="/wordbook" class="wordbook-link">
        <span class="link-icon">📚</span>
        生词本
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Example {
  en: string;
  zh: string;
}

interface Definition {
  partOfSpeech: string;
  definition: string;
  examples?: Example[];
  synonyms?: string[];
  antonyms?: string[];
}

interface WordInfo {
  word: string;
  phonetic: string;
  audioUrl?: string;
  definitions: Definition[];
  etymology?: string;
  relatedWords?: string[];
}

// 添加新的类型定义
interface StreamData {
  type: string;
  word?: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition?: string;
  forDefinition?: string;
  en?: string;
  zh?: string;
  words?: string[];
  content?: string;
}

interface HistoryItem {
  word: string;
  timestamp: number;
}

interface FavoriteWord {
  word: string;
  timestamp: number;
}

const searchWord = ref('')
const wordInfo = ref<Partial<WordInfo> | null>(null)
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)

// 修改历史记录的数据结构
const searchHistory = ref<HistoryItem[]>([])
const MAX_HISTORY = 5

// 添加收藏相关的状态
const favoriteWords = ref<FavoriteWord[]>([])
const isFavorite = computed(() => {
  return favoriteWords.value.some(item => item.word === wordInfo.value?.word)
})

// 修改计算属性，添加当前查询词过滤
const sortedHistory = computed(() => {
  return [...searchHistory.value]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(item => item.word)
    .filter(word => word !== searchWord.value) // 过滤掉当前查询的单词
})

onMounted(() => {
  inputRef.value?.focus()
  
  // 加载历史记录
  const savedHistory = localStorage.getItem('searchHistory')
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory)
  }
  
  // 加载收藏
  const savedFavorites = localStorage.getItem('favoriteWords')
  if (savedFavorites) {
    favoriteWords.value = JSON.parse(savedFavorites)
  }

  // 处理 URL 查询参数
  const urlParams = new URLSearchParams(window.location.search)
  const wordParam = urlParams.get('word')
  if (wordParam) {
    searchWord.value = wordParam
    handleSearch(wordParam)
  }
})

function addToHistory(word: string) {
  const index = searchHistory.value.findIndex(item => item.word === word)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift({
    word,
    timestamp: Date.now()
  })
  
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value.pop()
  }
  
  saveHistory()
}

function removeFromHistory(word: string) {
  const index = searchHistory.value.findIndex(item => item.word === word)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
    saveHistory()
  }
}

function saveHistory() {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

function handleHistoryClick(word: string) {
  const index = searchHistory.value.findIndex(item => item.word === word)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
    searchHistory.value.unshift({
      word,
      timestamp: Date.now()
    })
    saveHistory()
  }
  
  searchWord.value = word
  handleSearch(word)
}

const handleStreamData = (data: StreamData) => {
  if (!wordInfo.value) {
    wordInfo.value = { 
      word: searchWord.value,
      phonetic: '',
      definitions: []
    }
  }

  console.log('收到数据:', data)

  switch (data.type) {
    case 'basic':
      console.log('处理基本信息:', data)
      if (data.word) wordInfo.value.word = data.word
      if (data.phonetic) wordInfo.value.phonetic = data.phonetic
      break

    case 'definition':
      console.log('处理释义:', data)
      if (data.partOfSpeech && data.definition) {
        wordInfo.value.definitions = [
          ...wordInfo.value.definitions || [],
          {
            partOfSpeech: data.partOfSpeech,
            definition: data.definition,
            examples: [],
            synonyms: [],
            antonyms: []
          }
        ]
      }
      break

    case 'example':
      console.log('处理例句:', data)
      if (data.forDefinition && data.en && data.zh) {
        const def = wordInfo.value.definitions?.find(d => d.partOfSpeech === data.forDefinition)
        if (def) {
          def.examples = [...(def.examples || []), { en: data.en, zh: data.zh }]
        }
      }
      break

    case 'synonyms':
      console.log('处理同义词:', data)
      if (data.words && wordInfo.value.definitions?.length) {
        const lastDef = wordInfo.value.definitions[wordInfo.value.definitions.length - 1]
        lastDef.synonyms = data.words
      }
      break

    case 'antonyms':
      console.log('处理反义词:', data)
      if (data.words && wordInfo.value.definitions?.length) {
        const lastDef = wordInfo.value.definitions[wordInfo.value.definitions.length - 1]
        lastDef.antonyms = data.words
      }
      break

    case 'etymology':
      console.log('处理词源:', data)
      if (data.content) {
        wordInfo.value.etymology = data.content
      }
      break

    default:
      console.log('未知类型数据:', data)
  }
}

const handleSearch = async (searchTerm?: string) => {
  const wordToSearch = searchTerm || searchWord.value.trim()
  if (!wordToSearch) return
  
  try {
    error.value = ''
    wordInfo.value = null
    isLoading.value = true

    const response = await fetch(`/api/dictionary/${encodeURIComponent(wordToSearch)}`)
    if (!response.ok) {
      throw new Error('单词未找到')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get response reader')
    }

    const decoder = new TextDecoder()
    let hasReceivedData = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.trim() === '') continue
        if (line.startsWith('data: ')) {
          const content = line.slice(6).trim()
          if (content === '[DONE]') continue
          
          try {
            console.log('收到原始数据:', content)
            const data = JSON.parse(content) as StreamData
            handleStreamData(data)
            hasReceivedData = true
          } catch (e) {
            console.error('解析错误:', e, '原始数据:', content)
          }
        }
      }
    }

    if (!searchTerm) {
      searchWord.value = wordToSearch
    }

    // 只有在成功接收到数据后才添加到历史记录
    if (hasReceivedData) {
      addToHistory(wordToSearch)
    }

  } catch (err) {
    console.error('搜索错误:', err)
    error.value = err instanceof Error ? err.message : '查询失败'
    wordInfo.value = null
  } finally {
    isLoading.value = false
  }
}

const handleRelatedWordClick = (word: string) => {
  searchWord.value = word
  handleSearch(word)
}

function saveFavorites() {
  localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords.value))
}

function toggleFavorite() {
  if (!wordInfo.value?.word) return

  const word = wordInfo.value.word
  const index = favoriteWords.value.findIndex(item => item.word === word)

  if (index === -1) {
    // 添加到收藏
    favoriteWords.value.unshift({
      word,
      timestamp: Date.now()
    })
  } else {
    // 从收藏中移除
    favoriteWords.value.splice(index, 1)
  }

  saveFavorites()
}
</script>

<style scoped>
.word-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.app-title {
  color: #1976D2;
  text-align: center;
  font-size: 2.8em;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.logo {
  font-size: 1.1em;
  animation: float 3s ease-in-out infinite;
  filter: saturate(1.2);
  line-height: 1;
}

.title-text {
  background: linear-gradient(120deg, #1976D2, #2196F3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-flex;
  align-items: flex-start;
}

.ai-badge {
  font-size: 0.4em;
  background: linear-gradient(120deg, #FF4081, #E91E63);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  margin-left: 4px;
  position: relative;
  top: 4px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0px);
  }
}

.app-subtitle {
  color: #666;
  text-align: center;
  font-size: 1.1em;
  margin: 8px 0 32px;
  font-weight: normal;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0.2px;
}

.search-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

input {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #1976D2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.search-button {
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #1976D2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-button:hover:not(:disabled) {
  background-color: #1565C0;
}

.search-button:disabled {
  background-color: #90CAF9;
  cursor: not-allowed;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
}

.history-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #F5F5F5;
  border-radius: 16px;
  border: 1px solid #E0E0E0;
  transition: all 0.2s ease;
}

.word-text {
  padding: 6px 12px;
  cursor: pointer;
  color: #1976D2;
  font-size: 14px;
}

.delete-btn {
  width: 24px;
  height: 24px;
  margin-right: 6px;
  padding: 0;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  color: #999;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background-color: #E0E0E0;
  color: #666;
}

.word-info {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
}

.phonetic {
  color: #666;
  margin: 10px 0;
  font-style: italic;
}

.definition {
  margin: 15px 0;
  padding: 10px;
  border-left: 3px solid #4CAF50;
  background-color: white;
}

.pos {
  color: #2196F3;
  font-weight: bold;
  margin-right: 10px;
  text-transform: capitalize;
}

h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.word-header {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 20px;
}

.audio-player {
  margin-left: 10px;
  height: 24px;
}

.def-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.def-text {
  font-size: 16px;
}

.examples {
  margin: 15px 0;
  padding-left: 20px;
}

.example {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.en {
  color: #2c3e50;
  margin-bottom: 5px;
}

.zh {
  color: #666;
  font-size: 14px;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.related-word {
  padding: 4px 8px;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #1976d2;
}

.related-word:hover {
  background-color: #bbdefb;
}

h3, h4 {
  color: #455a64;
  margin: 15px 0 10px;
}

.etymology {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff3e0;
  border-radius: 4px;
}

.related-words {
  margin-top: 20px;
}

.loading {
  display: none;
}

.button-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error {
  color: #ff4444;
  margin: 10px 0;
}

.word-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: all 0.3s ease;
  border-radius: 50%;
  margin-left: -4px;
}

.favorite-btn:hover {
  color: #FFB300;
  background-color: rgba(255, 179, 0, 0.1);
}

.favorite-btn.is-favorite {
  color: #FFB300;
  text-shadow: 0 0 8px rgba(255, 179, 0, 0.3);
}

.nav-links {
  position: fixed;
  top: 20px;
  right: 20px;
}

.wordbook-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  text-decoration: none;
  color: #1976D2;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.wordbook-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.link-icon {
  font-size: 16px;
}

@media (max-width: 600px) {
  .word-search {
    padding: 20px 16px;
  }

  .app-title {
    font-size: 2em;
  }

  .search-container {
    padding: 16px;
  }

  .search-box {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }

  .word-info {
    padding: 20px;
  }

  .logo {
    font-size: 0.9em;
  }

  .ai-badge {
    font-size: 0.35em;
    top: 2px;
  }

  .nav-links {
    top: 10px;
    right: 10px;
  }
}
</style> 