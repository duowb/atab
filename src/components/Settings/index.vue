<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Bookmarks } from 'webextension-polyfill'
import { bookmarks } from 'webextension-polyfill'

const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const isChecking = ref(false)
const checkProgress = ref(0)
const totalBookmarks = ref(0)
const invalidCount = ref(0)
const checkStats = ref<{
  total: number
  invalid: number
  valid: number
  percentage: number
} | null>(null)

// 书签树相关
const bookmarksTree = ref<Bookmarks.BookmarkTreeNode[]>([])

// 当前选中的设置项
const currentSetting = ref('theme')

// 设置项列表
const settings = [
  { id: 'theme', name: '主题设置', icon: '🎨' },
  { id: 'check', name: '书签检查', icon: '🔍' },
  { id: 'cache', name: '缓存管理', icon: '🔄' },
]

// 获取书签树
onMounted(async () => {
  const tree = await bookmarks.getTree()
  bookmarksTree.value = tree
})

// 切换主题
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

// 检查书签是否失效
async function checkInvalidBookmarks() {
  isChecking.value = true
  checkProgress.value = 0
  invalidCount.value = 0
  checkStats.value = null

  const checkUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    }
    catch {
      return false
    }
  }

  const checkNode = async (node: Bookmarks.BookmarkTreeNode) => {
    if (node.url) {
      const isValid = await checkUrl(node.url)
      if (!isValid) {
        invalidCount.value++
      }
      checkProgress.value++
    }
    if (node.children) {
      for (const child of node.children) {
        await checkNode(child)
      }
    }
  }

  // 获取书签树
  const bookmarksTree = await bookmarks.getTree()

  // 计算总书签数
  const countBookmarks = (node: Bookmarks.BookmarkTreeNode) => {
    if (node.url)
      totalBookmarks.value++
    if (node.children) {
      for (const child of node.children) {
        countBookmarks(child)
      }
    }
  }

  totalBookmarks.value = 0
  countBookmarks(bookmarksTree[0])

  // 开始检查
  await checkNode(bookmarksTree[0])

  // 更新统计信息
  checkStats.value = {
    total: totalBookmarks.value,
    invalid: invalidCount.value,
    valid: totalBookmarks.value - invalidCount.value,
    percentage: Math.round((invalidCount.value / totalBookmarks.value) * 100),
  }

  isChecking.value = false
}

// 刷新所有卡片
function refreshAllCards() {
  // 触发全局事件
  window.dispatchEvent(new CustomEvent('refresh-all-cards'))
}
</script>

<template>
  <div class="settings-container">
    <!-- 左侧导航 -->
    <div class="settings-nav">
      <div class="nav-header">
        <h2 class="nav-title">
          设置
        </h2>
        <button
          class="back-button"
          @click="$emit('back')"
        >
          <span class="back-icon">←</span>
          <span>返回</span>
        </button>
      </div>
      <nav class="nav-list">
        <button
          v-for="setting in settings"
          :key="setting.id"
          class="nav-item"
          :class="{ active: currentSetting === setting.id }"
          @click="currentSetting = setting.id"
        >
          <span class="nav-icon">{{ setting.icon }}</span>
          <span class="nav-name">{{ setting.name }}</span>
        </button>
      </nav>
    </div>

    <!-- 右侧内容区域 -->
    <div class="settings-content">
      <!-- 主题设置 -->
      <div v-if="currentSetting === 'theme'" class="setting-section">
        <div class="section-header">
          <span class="section-icon">🎨</span>
          <h3 class="section-title">
            主题设置
          </h3>
        </div>
        <button
          class="theme-toggle"
          @click="toggleTheme"
        >
          <div class="theme-toggle-inner">
            <span v-if="isDarkMode" class="sun-icon">☀️</span>
            <span v-else class="moon-icon">🌙</span>
            <span class="theme-text">{{ isDarkMode ? '深色模式' : '浅色模式' }}</span>
          </div>
        </button>
      </div>

      <!-- 书签检查 -->
      <div v-if="currentSetting === 'check'" class="setting-section">
        <div class="section-header">
          <span class="section-icon">🔍</span>
          <h3 class="section-title">
            书签检查
          </h3>
        </div>
        <div class="setting-content">
          <button
            class="action-button check-button"
            :disabled="isChecking"
            @click="checkInvalidBookmarks"
          >
            <div class="button-content">
              <span v-if="isChecking" class="loading-spinner" />
              {{ isChecking ? '检查中...' : '检查失效书签' }}
            </div>
          </button>

          <!-- 进度条 -->
          <div v-if="isChecking" class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${(checkProgress / totalBookmarks) * 100}%` }"
              />
            </div>
            <div class="progress-text">
              已检查 {{ checkProgress }} / {{ totalBookmarks }} 个书签
            </div>
          </div>

          <!-- 统计信息 -->
          <div v-if="checkStats" class="stats-container">
            <div class="stat-item">
              <span class="stat-label">总书签数</span>
              <span class="stat-value">{{ checkStats.total }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">有效书签</span>
              <span class="stat-value text-emerald-500">{{ checkStats.valid }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">失效书签</span>
              <span class="stat-value text-rose-500">{{ checkStats.invalid }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">失效比例</span>
              <span class="stat-value" :class="checkStats.percentage > 10 ? 'text-rose-500' : 'text-emerald-500'">
                {{ checkStats.percentage }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 缓存管理 -->
      <div v-if="currentSetting === 'cache'" class="setting-section">
        <div class="section-header">
          <span class="section-icon">🔄</span>
          <h3 class="section-title">
            缓存管理
          </h3>
        </div>
        <div class="setting-content">
          <button
            class="action-button refresh-button"
            @click="refreshAllCards"
          >
            <div class="button-content">
              <span class="refresh-icon">🔄</span>
              刷新所有图标和标题
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  @apply h-full flex;
  @apply transition-all duration-300;
}

/* 左侧导航样式 */
.settings-nav {
  @apply w-64 flex flex-col;
  @apply bg-white/90 dark:bg-gray-800/90;
  @apply backdrop-blur-md;
  @apply border-r border-gray-100 dark:border-gray-700;
}

.nav-header {
  @apply flex justify-between items-center;
  @apply p-4;
  @apply border-b border-gray-100 dark:border-gray-700;
}

.nav-title {
  @apply text-lg font-medium;
  @apply text-gray-900 dark:text-white;
}

.back-button {
  @apply flex items-center space-x-1 px-2 py-1 rounded;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-700 dark:text-gray-200;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply transition-all duration-300;
  @apply text-sm;
}

.back-icon {
  @apply transition-transform duration-300;
}

.back-button:hover .back-icon {
  transform: translateX(-2px);
}

.nav-list {
  @apply flex-1;
  @apply p-2;
  @apply space-y-1;
  @apply overflow-y-auto;
}

.nav-item {
  @apply flex items-center space-x-3;
  @apply w-full px-3 py-2 rounded;
  @apply text-gray-700 dark:text-gray-200;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-300;
  @apply text-sm;
}

.nav-item.active {
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply text-blue-600 dark:text-blue-400;
}

.nav-icon {
  @apply text-lg;
}

/* 右侧内容区域样式 */
.settings-content {
  @apply flex-1;
  @apply p-6;
  @apply overflow-y-auto;
}

.setting-section {
  @apply bg-white/90 dark:bg-gray-800/90;
  @apply backdrop-blur-md;
  @apply rounded-lg;
  @apply p-4;
  @apply shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20;
  @apply transition-all duration-300;
  @apply border border-gray-100 dark:border-gray-700;
}

.section-header {
  @apply flex items-center space-x-3 mb-4;
}

.section-icon {
  @apply text-xl;
  @apply transition-transform duration-300;
}

.setting-section:hover .section-icon {
  transform: scale(1.1);
}

.section-title {
  @apply text-lg font-medium;
  @apply text-gray-900 dark:text-white;
}

.setting-content {
  @apply space-y-4;
}

.theme-toggle {
  @apply w-full;
  @apply transition-transform duration-300;
  @apply hover:scale-[1.01] active:scale-98;
}

.theme-toggle-inner {
  @apply flex items-center justify-center space-x-2;
  @apply p-4 rounded-lg;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-700 dark:text-gray-200;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply transition-all duration-300;
}

.theme-text {
  @apply font-medium;
}

.action-button {
  @apply px-5 py-2.5 rounded-xl text-white font-medium;
  @apply transition-all duration-300 transform;
  @apply hover:scale-[1.02] active:scale-98;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.check-button {
  @apply bg-gradient-to-r from-blue-500 to-blue-600;
  @apply hover:from-blue-600 hover:to-blue-700;
  @apply shadow-lg shadow-blue-500/20;
}

.refresh-button {
  @apply bg-gradient-to-r from-green-500 to-green-600;
  @apply hover:from-green-600 hover:to-green-700;
  @apply shadow-lg shadow-green-500/20;
}

.button-content {
  @apply flex items-center space-x-2;
}

.loading-spinner {
  @apply w-4 h-4 border-2 border-white/30 border-t-white rounded-full;
  animation: spin 1s linear infinite;
}

.refresh-icon {
  @apply transition-transform duration-300;
}

.refresh-button:hover .refresh-icon {
  transform: rotate(180deg);
}

.progress-container {
  @apply space-y-2;
}

.progress-bar {
  @apply h-2 rounded-full;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply overflow-hidden;
}

.progress-fill {
  @apply h-full;
  @apply bg-blue-500;
  @apply transition-all duration-300;
}

.progress-text {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.stats-container {
  @apply grid grid-cols-2 gap-4;
  @apply p-4 rounded-lg;
  @apply bg-gray-50 dark:bg-gray-800/50;
}

.stat-item {
  @apply flex flex-col space-y-1;
}

.stat-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.stat-value {
  @apply text-lg font-medium;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
