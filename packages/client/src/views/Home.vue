<template>
  <div class="home">
    <el-container>
      <el-header>
        <el-menu mode="horizontal" :ellipsis="false">
          <el-menu-item index="1">
            <h2>WordMate</h2>
          </el-menu-item>
          <div class="flex-grow" />
          <el-menu-item index="2">
            <el-icon><Document /></el-icon>
            <span>文档</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </el-header>
      
      <el-main>
        <el-row :gutter="20" justify="center">
          <el-col :span="16">
            <el-card class="welcome-card">
              <template #header>
                <div class="card-header">
                  <span>欢迎使用 WordMate</span>
                </div>
              </template>
              <div class="card-content">
                <p>WordMate 是一个强大的单词学习工具</p>
                <el-button type="primary" size="large" class="start-button">
                  开始学习
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { Document, Setting } from '@element-plus/icons-vue'
</script>

<style scoped>
.home {
  height: 100vh;
}

.el-header {
  padding: 0;
  --el-header-height: auto;
}

.el-menu {
  width: 100%;
}

.flex-grow {
  flex-grow: 1;
}

.welcome-card {
  margin-top: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.start-button {
  margin-top: 20px;
}
</style>
