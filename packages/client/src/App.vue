<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { onMounted, ref } from 'vue'
import { testApi } from './api'

const apiMessage = ref('')
const error = ref('')

const testBackend = async () => {
  try {
    const data = await testApi()
    apiMessage.value = data.message
    error.value = ''
  } catch (err) {
    error.value = '连接后端失败'
    console.error(err)
  }
}

onMounted(() => {
  testBackend()
})
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  
  <div class="app">
    <h1>WordMate</h1>
    
    <div v-if="apiMessage" class="api-message">
      {{ apiMessage }}
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <button @click="testBackend">测试后端连接</button>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.api-message {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #e8f5e9;
  border-radius: 4px;
  color: #2e7d32;
}

.error-message {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 4px;
  color: #c62828;
}

button {
  padding: 0.6rem 1.2rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}
</style>
