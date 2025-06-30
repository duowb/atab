import { computed, ref } from 'vue'
import type { Bookmarks } from 'webextension-polyfill'
import { bookmarks } from 'webextension-polyfill'
import { useDefaultBookmark } from './useDefaultBookmark'

export function useBookmarks() {
  const bookmarksTree = ref<Bookmarks.BookmarkTreeNode[]>([])
  const currentPath = ref<Bookmarks.BookmarkTreeNode[]>([])

  // 获取书签树
  async function fetchBookmarksTree() {
    const tree = await bookmarks.getTree()
    bookmarksTree.value = tree
    const { getDefault } = useDefaultBookmark()
    const defaultBookmarkIds = getDefault()
    if (defaultBookmarkIds.length === 0) {
      currentPath.value = [tree[0]] // 默认显示根节点
      return
    }
    // 根据保存的路径找到对应的节点
    let currentNode = tree[0]
    const pathNodes = [currentNode]
    for (const id of defaultBookmarkIds) {
      const nextNode = currentNode.children?.find(child => child.id === id)
      if (nextNode) {
        currentNode = nextNode
        pathNodes.push(currentNode)
      }
    }
    currentPath.value = pathNodes
  }

  // 计算当前显示的书签
  const currentBookmarks = computed(() => {
    if (currentPath.value.length === 0)
      return []
    const lastNode = currentPath.value[currentPath.value.length - 1]
    return lastNode.children || []
  })

  // 返回根节点
  function goToRoot() {
    if (bookmarksTree.value.length > 0) {
      currentPath.value = [bookmarksTree.value[0]]
    }
  }

  // 导航到指定节点
  function navigateTo(index: number) {
    currentPath.value = currentPath.value.slice(0, index + 1)
  }

  // 处理书签点击
  function handleBookmarkClick(node: Bookmarks.BookmarkTreeNode) {
    if (node.url) {
      // 如果是URL，在新窗口打开
      window.open(node.url, '_blank')
    }
    else if (node.children) {
      // 如果是文件夹，进入下一级
      currentPath.value.push(node)
    }
  }

  return {
    bookmarksTree,
    currentPath,
    currentBookmarks,
    fetchBookmarksTree,
    goToRoot,
    navigateTo,
    handleBookmarkClick,
  }
}
