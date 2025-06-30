<script setup lang="ts">
import { ref } from 'vue'
import type { Bookmarks } from 'webextension-polyfill'
import { useBookmarkCard } from '../../composables/useBookmarkCard'
import { useDefaultBookmark } from '../../composables/useDefaultBookmark'

const props = defineProps<{
  item: Bookmarks.BookmarkTreeNode
  currentPath: Bookmarks.BookmarkTreeNode[]
}>()

const emit = defineEmits<{
  (e: 'click', item: Bookmarks.BookmarkTreeNode): void
}>()

// 使用组合式函数
const { faviconUrl, displayTitle, isFolder } = useBookmarkCard(props.item)
const { isDefault, setDefault, removeIds } = useDefaultBookmark(props.item)

// 处理点击事件
function handleClick() {
  emit('click', props.item)
}

// 处理默认书签点击
function handleDefaultClick() {
  if (isDefault.value) {
    removeIds()
  }
  else {
    setDefault(props.currentPath)
  }
}
const isError = ref(false)
// 处理 favicon 加载错误
function handleFaviconError() {
  isError.value = true
}
</script>

<template>
  <div class="bookmark-card group" @click="handleClick">
    <div class="card-content">
      <div
        class="icon-wrapper"
        :class="{ 'bg-gray-100 dark:bg-gray-700': isFolder }"
      >
        <template v-if="!isFolder">
          <img
            v-if="faviconUrl && !isError"
            :src="faviconUrl"
            :alt="displayTitle"
            class="favicon"
            @error="handleFaviconError"
          >
          <i
            v-else-if="isError"
            class="i-carbon-face-dissatisfied text-red-400 text-xl"
          />
          <i
            v-else
            class="i-carbon-circle-dash text-gray-400 text-xl animate-spin"
          />
        </template>
        <div v-else class="folder-icon i-carbon-folder" />
      </div>
      <div class="title">
        {{ displayTitle }}
      </div>
    </div>
    <button
      v-if="isFolder"
      class="action-button group-hover:block"
      :class="isDefault ? '!block' : 'hidden'"
      title="设置为默认书签页"
      @click.stop="handleDefaultClick"
    >
      <i
        class="block"
        :class="
          !isDefault ? 'i-carbon-star' : 'i-carbon-star-filled color-#3b82f6'
        "
      />
    </button>
  </div>
</template>

<style scoped>
.bookmark-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--card-bg, #ffffff);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color, #e5e7eb);
}

.dark .bookmark-card {
  background: var(--card-bg-dark, #1f2937);
  border-color: var(--border-color-dark, #374151);
}

.bookmark-card:hover {
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
}

.dark .bookmark-card:hover {
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.3);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.icon-wrapper {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.favicon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.folder-icon {
  color: var(--folder-color, #ffb300);
  font-size: 16px;
  transition: all 0.3s ease;
}

.dark .folder-icon {
  color: var(--folder-color-dark, #ffb300);
}

.title {
  font-size: 14px;
  color: var(--text-color, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.dark .title {
  color: var(--text-color-dark, #f3f4f6);
}

.action-button {
  padding: 4px;
  background: none;
  border: none;
  color: var(--text-color, #6b7280);
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 16px;
}

.dark .action-button {
  color: var(--text-color-dark, #9ca3af);
}

.action-button:hover {
  background: var(--hover-bg, #f3f4f6);
  color: var(--hover-color, #3b82f6);
}

.dark .action-button:hover {
  background: var(--hover-bg-dark, #374151);
  /* color: var(--hover-color-dark, #60a5fa); */
}

.action-button.is-default {
  color: var(--primary-color, #3b82f6);
}

.dark .action-button.is-default {
  /* color: var(--primary-color-dark, #60a5fa); */
}

@media (max-width: 768px) {
  .bookmark-card {
    padding: 8px;
  }

  .icon-wrapper {
    width: 20px;
    height: 20px;
  }

  .title {
    font-size: 13px;
  }
}
</style>
