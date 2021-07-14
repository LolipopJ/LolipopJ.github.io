---
title: 为 Archer 主题更换中文字体
date: 2021/6/26
updated: 2021/6/26
categories:
- 前端开发
tags:
- Hexo
- Hexo-Theme-Archer
---
看腻了原先的字体，亦或是想满足独树一帜的设计欲望？不妨更换一下博客的字体吧！本文将基于 Hexo 和主题 [Hexo-Theme-Archer](https://github.com/fi3ework/hexo-theme-archer) 展示如何更换博客的中文字体。

## 下载字体文件

如果字体文件有 CDN 加速，可以跳过此小节。

以更换中文字体为未来荧黑为例，首先，去[开源的 Realease 页](https://github.com/welai/glow-sans/releases)下载字体文件。其中，以 `GlowSansSC` 开头的字体为未来荧黑的简体中文字体。这里我选择下载了 `GlowSansSC-Normal-v0.92.zip`。

解压之，可以很多不同字重的 `.otf` 字体文件，这里我选择了 `GlowSansSC-Normal-Book.otf`。将字体文件复制到 Archer 主题的 `source/font` 目录下。

## 引入字体文件

### 直接引入本地字体文件

最容易理解的方式莫过于编辑 Archer 主题目录下的 `src/scss/_variables.scss` 文件，添加新的 `@font-face` 如下：

```scss
@font-face {
  font-family: 'Glow Sans SC';
  src: url('../font/GlowSansSC-Normal-Book.otf');
}
```

其中，url 路径 `../font/GlowSansSC-Normal-Book.otf` 是如何得来的呢？我们知道，在执行 `hexo g` 时，会将主题目录下的 `source` 中的文件拷贝到博客根目录下的 `public` 目录中。而根据 Archer 主题的 gulp 生成规则，编译好的 `.css` 文件存放在主题目录下的 `source/css` 中。因此，为了最终正确指向博客根目录下 `public/font/GlowSansSC-Normal-Book.otf` 文件，应该设置 url 为上一级目录下的 `font` 目录。

这种方式的优点是，方便配置。但缺点也很明显：慢！尤其对于大多数人建立个人博客时，会使用自己的“小水管”服务器，字体文件要加载老半天才能正常显示出来。最好的方式还是使用 CDN 保平安吧！

### 引入 CDN 字体文件

由于直接在 `@font-face` 中拉取 CDN 的字体文件时，可能会发生跨域错误，因此可以使用 [webfontloader](https://github.com/typekit/webfontloader) 实现加载 CDN 字体。

## 更换博客字体

接下来，只需要修改 Archer 主题 `src/scss/_variables.scss` 文件中的 `$base-font-family` 变量，就可以实现更换中文字体了：

```scss
$base-font-family: 'Glow Sans SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial,
  'PingFang SC', 'Hiragino Sans GB', STHeiti, 'Microsoft YaHei',
  'Microsoft JhengHei', 'Source Han Sans SC', 'Noto Sans CJK SC',
  'Source Han Sans CN', 'Noto Sans SC', 'Source Han Sans TC', 'Noto Sans CJK TC',
  'WenQuanYi Micro Hei', SimSun, sans-serif;
```

在前面，我们定义了 `font-family` 为 `Glow Sans SC`，因此在这里只需要在最前面加上这个值就可以了，这会告诉浏览器优先使用我们自定义的中文字体。等到字体下载完成之后，就会使用此字体了。

特别的，Archer 主题提供了另一个变量 `$feature-font-family`，渲染为主题中 Profile，Intro，Footer 等地方的字体，如果希望，也可以更换。

在上传到 Github 之前，别忘了在主题根目录执行 `yarn build`。

## 压缩中文字体

**笔者并未成功在 Archer 主题中实现**，这里只是给出实现思路和方法。

适用于在本地引入字体的方式。

因为中文字体的编码相比英文字体多很多，导致中文字体通常特别大，十分耗费网络资源，还会降低用户体验。以 Archer 主题自带的字体为例，英文字体 `Oswald-Regular.ttf` 只有 89 KB 大小，而刚刚引入的中文字体 `GlowSansSC-Normal-Book.otf` 有 8971 KB 之大。如果能对中文字体进行压缩，将能大大提高用户体验。

一款国人开源的智能 WebFont 压缩工具 [font-spider](https://github.com/aui/font-spider) 能够满足我们的需求。

这款工具能够获取网页中使用到的中文文字，然后从源字体文件中提取出来这些文字，生成一个只包含这些文字的字体文件。而我们只需要引入这个生成的字体文件，就可以实现压缩中文字体了！

为了能使用 Github Actions 自动集成部署博客，这里我在博客根目录引入了 font-spider 作为项目的开发依赖。

```bash
yarn add -D font-spider
```

由于 font-spider 需要使用 `.ttf` 格式的字体进行转换，因此首先需要把之前下载的 `.otf` 格式转换为 `.ttf` 格式，这可以借助于这个[格式转换网站](https://convertio.co/zh/otf-ttf/)。将转换完成后的 `GlowSansSC-Normal-Book.ttf` 字体文件放在主题目录下的 `source/font` 中。

编辑主题目录下的 `src/scss/_variables.scss` 文件，修改刚刚的样式表属性：

```scss
@font-face {
  font-family: 'Glow Sans SC';
  src: url('../font/GlowSansSC-Normal-Book.eot');
  src:
    url('../font/GlowSansSC-Normal-Book.eot?#font-spider') format('embedded-opentype'),
    url('../font/GlowSansSC-Normal-Book.woff2') format('woff2'),
    url('../font/GlowSansSC-Normal-Book.woff') format('woff'),
    url('../font/GlowSansSC-Normal-Book.ttf') format('truetype'),
    url('../font/GlowSansSC-Normal-Book.svg') format('svg');
}
```

在主题根目录执行 `yarn build` 生成打包好的样式表文件。

回到博客根目录，编辑 `package.json`，添加脚本：

```json
"scripts": {
  "font-spider": "font-spider public/*.html"
}
```

其中，`public` 是 Hexo 生成静态博客文件的默认目录。

在博客根目录分别执行：

```bash
# 生成静态博客文件
hexo g
# 压缩中文字体文件
yarn font-spider
```

## 参考文章

- [網頁是否安裝思源黑體、中文字型的考量﹍影響載入速度的因素及作法分析](https://www.wfublog.com/2019/01/noto-sans-serif-traditional-chinese-web-font_11.html)
