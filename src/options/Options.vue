<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Card from '../components/Card/index.vue'
import Settings from '../components/Settings/index.vue'
import Theme from '../components/Theme/index.vue'
import { useBookmarks } from '../composables/useBookmarks'

const hours = new Date().getHours()
const {
  currentPath,
  currentBookmarks,
  fetchBookmarksTree,
  goToRoot,
  navigateTo,
  handleBookmarkClick,
} = useBookmarks()
const showSettings = ref(false)
const cardRefs = ref<any[]>([])

// 初始化主题
onMounted(() => {
  // 监听刷新事件
  window.addEventListener('refresh-all-cards', () => {
    cardRefs.value.forEach((card) => {
      if (card?.refresh) {
        card.refresh()
      }
    })
  })

  fetchBookmarksTree()
})

const helloText = hours < 12 ? '早上好' : hours < 18 ? '下午好' : '晚上好'
</script>

<template>
  <main
    class="min-h-screen transition-colors duration-500 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="container mx-auto p-4 h-screen flex flex-col">
      <!-- 顶部导航栏 -->
      <div class="flex justify-between items-center mb-4">
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
        >
          {{ helloText }}
        </h1>
        <div class="flex items-center space-x-4">
          <Theme />
        </div>
      </div>

      <!-- 设置页面 -->
      <Settings v-if="showSettings" class="flex-1" />

      <!-- 书签列表 -->
      <div v-else class="flex-1 flex flex-col min-h-0">
        <!-- 面包屑导航 -->
        <div class="mb-4 flex items-center space-x-2 text-sm">
          <button class="breadcrumb-link" @click="goToRoot">
            根目录
          </button>
          <template v-for="(node, index) in currentPath" :key="node.id">
            <span v-if="index > 0" class="breadcrumb-separator">/</span>
            <button
              v-if="index > 0"
              class="breadcrumb-link"
              @click="navigateTo(index)"
            >
              {{ node.title }}
            </button>
          </template>
        </div>

        <!-- 书签网格 -->
        <div class="bookmarks-container flex-1 min-h-0">
          <div class="bookmarks-grid">
            <Card
              v-for="item in currentBookmarks"
              :key="item.id"
              ref="cardRefs"
              :item="item"
              :current-path="currentPath"
              @click="handleBookmarkClick(item)"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
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

.settings-button {
  @apply p-3 rounded-xl;
  @apply bg-white/80 dark:bg-gray-800/80;
  @apply shadow-lg shadow-gray-500/10;
  @apply hover:bg-white dark:hover:bg-gray-700;
  @apply transition-all duration-300;
  @apply hover:scale-110 active:scale-95;
}

.settings-icon {
  @apply text-xl;
  @apply transition-transform duration-500;
}

.settings-button:hover .settings-icon {
  transform: rotate(90deg);
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

.breadcrumb-link {
  @apply text-blue-600 dark:text-blue-400;
  @apply hover:text-blue-700 dark:hover:text-blue-300;
  @apply transition-colors duration-300;
  @apply font-medium;
}

.breadcrumb-separator {
  @apply text-gray-400 dark:text-gray-500;
}

.bookmarks-container {
  @apply bg-white/50 dark:bg-gray-800/50;
  @apply backdrop-blur-md rounded-3xl;
  @apply shadow-xl shadow-gray-500/10;
  @apply p-4;
  @apply transition-all duration-300;
  @apply flex-1;
  @apply min-h-0;
}

.bookmarks-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
  @apply h-full;
  @apply overflow-y-auto;
  @apply p-1;
  @apply auto-rows-min;
  @apply content-start;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.bookmarks-grid::-webkit-scrollbar {
  display: none !important;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 暗色主题优化 */
.dark .bookmarks-container {
  @apply shadow-gray-900/20;
}

.back-button {
  @apply bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700;
  @apply hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-500 dark:hover:to-gray-600;
  @apply shadow-lg shadow-gray-500/20 dark:shadow-gray-900/20;
  @apply text-white;
}

.back-icon {
  @apply transition-transform duration-300;
  @apply text-white;
}

.back-button:hover .back-icon {
  transform: translateX(-4px);
}
</style>
