import { computed, ref } from 'vue'
import type { Bookmarks } from 'webextension-polyfill'

export function useBookmarkCard(item: Bookmarks.BookmarkTreeNode) {
  const faviconUrl = ref('')
  const pageTitle = ref('')

  // 计算显示标题
  const displayTitle = computed(() => {
    if (item.title)
      return item.title
    if (pageTitle.value)
      return pageTitle.value
    return '未命名'
  })

  // 检查是否是文件夹
  const isFolder = computed(() => !!item.children)

  // 从缓存获取数据
  function getCachedData(url: string) {
    const cacheKey = `bookmark_${url}`
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      const { favicon, title } = JSON.parse(cachedData)
      faviconUrl.value = favicon
      pageTitle.value = title
      return true
    }
    return false
  }

  // 缓存数据
  function cacheData(url: string, favicon: string, title: string) {
    const cacheKey = `bookmark_${url}`
    localStorage.setItem(cacheKey, JSON.stringify({ favicon, title }))
  }

  // 尝试获取 favicon 和页面标题
  async function fetchPageInfo(url: string) {
    try {
      const urlObj = new URL(url)
      const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`

      // 只请求一次页面内容
      const response = await fetch(url)
      const text = await response.text()

      // 获取页面标题
      const titleMatch = text.match(/<title>(.*?)<\/title>/i)
      if (titleMatch) {
        pageTitle.value = titleMatch[1].trim()
      }

      // 使用 DOM 解析查找 favicon 链接
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      const faviconLink = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
      if (faviconLink) {
        const faviconPath = faviconLink.getAttribute('href')
        if (faviconPath) {
          // 处理相对路径
          if (faviconPath.startsWith('//')) {
            faviconUrl.value = `${urlObj.protocol}${faviconPath}`
          }
          else if (faviconPath.startsWith('/')) {
            faviconUrl.value = `${baseUrl}${faviconPath}`
          }
          else if (faviconPath.startsWith('http')) {
            faviconUrl.value = faviconPath
          }
          else {
            faviconUrl.value = `${baseUrl}/${faviconPath}`
          }
        }
      }
      else {
        // 如果没有找到 favicon 链接，尝试默认路径
        const defaultFavicon = `${baseUrl}/favicon.ico`
        const faviconResponse = await fetch(defaultFavicon, { method: 'HEAD' })
        if (faviconResponse.ok) {
          faviconUrl.value = defaultFavicon
        }
        else {
          // 如果都失败了，使用 Google 的 favicon 服务作为后备
          faviconUrl.value = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`
        }
      }

      // 缓存数据
      cacheData(url, faviconUrl.value, pageTitle.value)
    }
    catch {
      // 如果出错，使用 Google 的 favicon 服务作为后备
      try {
        const urlObj = new URL(url)
        faviconUrl.value = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`
        cacheData(url, faviconUrl.value, pageTitle.value)
      }
      catch {
        faviconUrl.value = ''
      }
    }
  }

  // 初始化
  if (item.url) {
    if (!getCachedData(item.url)) {
      fetchPageInfo(item.url)
    }
  }

  // 刷新方法
  function refresh() {
    if (item.url) {
      fetchPageInfo(item.url)
    }
  }

  return {
    faviconUrl,
    pageTitle,
    displayTitle,
    isFolder,
    refresh,
  }
}
