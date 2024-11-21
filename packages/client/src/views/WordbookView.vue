<template>
  <div class="wordbook">
    <h1 class="app-title">
      <span class="logo">📖</span>
      <span class="title-text">
        WordMate
        <sup class="ai-badge">AI</sup>
      </span>
    </h1>
    <p class="app-subtitle">Your Smart English Learning Companion</p>
    
    <div class="wordbook-container">
      <div class="wordbook-header">
        <h2>我的生词本</h2>
        <router-link to="/" class="back-link">
          返回查词
        </router-link>
      </div>
      
      <div v-if="favoriteWords.length" class="wordbook-list">
        <div v-for="item in sortedFavorites" :key="item.word" class="word-item">
          <div class="word-item-header">
            <span class="word-text" @click="handleWordClick(item.word)">{{ item.word }}</span>
            <button 
              class="remove-btn"
              @click="removeFavorite(item.word)"
              title="从生词本移除"
            >
              移除
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>还没有收藏任何单词</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface FavoriteWord {
  word: string
  timestamp: number
}

const router = useRouter()
const favoriteWords = ref<FavoriteWord[]>([])

const sortedFavorites = computed(() => {
  return [...favoriteWords.value].sort((a, b) => b.timestamp - a.timestamp)
})

onMounted(() => {
  const saved = localStorage.getItem('favoriteWords')
  if (saved) {
    favoriteWords.value = JSON.parse(saved)
  }
})

function handleWordClick(word: string) {
  router.push({
    path: '/',
    query: { word }
  })
}

function removeFavorite(word: string) {
  const index = favoriteWords.value.findIndex(item => item.word === word)
  if (index !== -1) {
    favoriteWords.value.splice(index, 1)
    localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords.value))
  }
}
</script>

<style scoped>
.wordbook {
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

.app-subtitle {
  color: #666;
  text-align: center;
  font-size: 1.1em;
  margin: 8px 0 32px;
  font-weight: normal;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0.2px;
}

.wordbook-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.wordbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.wordbook-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5em;
}

.back-link {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 20px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  transition: all 0.2s ease;
}

.back-link:hover {
  background: #e0e0e0;
  color: #333;
}

.wordbook-list {
  display: grid;
  gap: 12px;
}

.word-item {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.word-item:hover {
  background: #f0f0f0;
}

.word-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-text {
  font-size: 18px;
  color: #1976D2;
  cursor: pointer;
  font-weight: 500;
}

.word-text:hover {
  text-decoration: underline;
}

.remove-btn {
  padding: 6px 12px;
  border: 1px solid #ff4444;
  background: none;
  color: #ff4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ff4444;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .wordbook {
    padding: 20px 16px;
  }

  .app-title {
    font-size: 2em;
  }

  .wordbook-container {
    padding: 16px;
  }

  .wordbook-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .word-item {
    padding: 12px;
  }
}
</style> 