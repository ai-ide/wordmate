<template>
  <div class="word-search">
    <h1>英语单词查询</h1>
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

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="wordInfo" class="word-info">
      <div class="word-header" v-if="wordInfo.word">
        <h2>{{ wordInfo.word }}</h2>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

const searchWord = ref('')
const wordInfo = ref<Partial<WordInfo> | null>(null)
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)

onMounted(() => {
  inputRef.value?.focus()
})

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
            // 直接尝试解析内容
            const data = JSON.parse(content) as StreamData
            handleStreamData(data)
          } catch (e) {
            console.error('解析错误:', e, '原始数据:', content)
          }
        }
      }
    }

    if (!searchTerm) {
      searchWord.value = wordToSearch
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
</script>

<style scoped>
.word-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

input {
  flex: 1;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.error {
  color: #ff4444;
  margin: 10px 0;
}

.word-info {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
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

h1 {
  color: #333;
  text-align: center;
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

.search-button {
  position: relative;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
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

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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
</style> 