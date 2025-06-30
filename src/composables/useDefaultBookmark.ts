import { computed } from 'vue'
import type { Bookmarks } from 'webextension-polyfill'
import { useWebExtensionStorage } from './useWebExtensionStorage'

const ids = useWebExtensionStorage<string[]>('defaultBookmarkIds', [])

export function useDefaultBookmark(item?: Bookmarks.BookmarkTreeNode) {
  // 检查是否是默认书签
  const isDefault = computed(() => {
    return ids.value.at(-1) === item?.id
  })

  // 设置默认书签
  function setDefault(currentPath: Bookmarks.BookmarkTreeNode[]) {
    if (!item)
      return
    ids.value = [...currentPath, item].map(item => item.id)
  }

  const removeIds = () => ids.value = []

  const getDefault = () => ids.value

  return {
    isDefault,
    setDefault,
    removeIds,
    getDefault,
  }
}
