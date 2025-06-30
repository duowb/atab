# A Tab

使用卡片形式展示收藏夹的内容.

# 功能

- 可以设置默认展示的收藏夹
- 展示收藏网页的图标

### 构建说明

`build:prepare` 构建前的操作, 用来生成 manifest.json 文件

`build:background` 构建在后台运行的脚本

`build:web` 构建前端界面

`build:js` 构建内容脚本(`contentScripts`)可以全局展示的组件

`build:watch` 构建脚本并且开启监听`web`前端

`build`构建打包

`pack` 生成浏览器的扩展

本地调试可以直接运行`build:watch`脚本,会将代码生成到`extension`文件夹中,使用chrome浏览器,加载`extension`文件夹内容就可以进行调试。

> 注意：在调试的时候部分前端页面,更新即生效,但是有些脚本需要重新加载才可以生效
