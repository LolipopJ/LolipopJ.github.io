---
title: 为 Archer 主题更换字体
date: 2021/6/26
updated: 2021/8/10
categories:
  - 前端开发
tags:
  - Node
  - Hexo
  - hexo-theme-archer
---

看腻了原先的字体，亦或是想满足独树一帜的设计欲望？不妨更换一下博客的字体吧！本文将基于 Hexo 和主题 [Hexo-Theme-Archer](https://github.com/fi3ework/hexo-theme-archer) 展示如何更换博客的中文字体。

## 引入字体文件

这里提供两种引入的思路，一种是 CDN 引入，一种是本地引入。建议通过 CDN 的方式引入，可以大大提高加载效率。

### 引入 CDN 字体文件

以更换字体为思源黑体（Google 字体上叫 `Noto Sans`，Adobe 版本叫 `Source Han Sans`）为例，考虑到中文站点面向的读者在国内，无法直接下载思源黑体这款 Google 字体，因此考虑通过 CDN 的方式引入它。据笔者测试，目前有这四个 CDN 站点可以提供稳定的服务：

- `https://fonts.googleapis.cnpmjs.org`
- `https://fonts.font.im`，可参考：<http://www.googlefonts.cn/old>
- `https://fonts.proxy.ustclug.org`
- `https://fonts.loli.net`，可参考：<https://sb.sb/blog/css-cdn>

使用方法非常简单，在 Google 字体上选择[思源黑体简体中文版本](https://fonts.google.com/specimen/Noto+Sans+SC?subset=chinese-simplified#standard-styles)，再选择需要的字重如 `Regular 400`，如果使用 `<link>` 的方式引入，则代码如下所示：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap"
  rel="stylesheet"
/>
```

使用 CDN 加速的方式，只需要将上面代码中的 `https://fonts.googleapis.com` 部分更换为前边对应 CDN 链接即可。例如使用中国科学技术大学的镜像站加速，应修改代码如下：

```html
<link rel="preconnect" href="https://fonts.proxy.ustclug.org" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.proxy.ustclug.org/css2?family=Noto+Sans+SC&display=swap"
  rel="stylesheet"
/>
```

然后将上面这段代码放到 Archer 主题目录下的 `layout/_partial/base-head.ejs` 代码片段中即可。

这段代码同时定义了一个名为 `Noto Sans SC` 的字体族，在后面就可以直接使用这个值引入字体了。

### 直接引入本地字体文件

以更换字体为未来荧黑为例，首先，去[开源的 Realease 页](https://github.com/welai/glow-sans/releases)下载字体文件。其中，以 `GlowSansSC` 开头的字体为未来荧黑的简体中文字体。这里我选择下载了 `GlowSansSC-Normal-v0.92.zip`。

解压之，可以很多不同**字重**的 `.otf` 字体文件，这里我选择了 `GlowSansSC-Normal-Book.otf`。将字体文件复制到 Archer 主题的 `source/font` 目录下。

编辑 Archer 主题目录下的 `src/scss/_variables.scss` 文件，添加新的 `@font-face` 如下：

```scss
@font-face {
  font-family: "Glow Sans SC";
  src: url("../font/GlowSansSC-Normal-Book.otf");
}
```

我们定义了一个名为 `Glow Sans SC` 的字体族，在后面就可以直接使用这个值引入字体了。

其中，url 路径 `../font/GlowSansSC-Normal-Book.otf` 是如何得来的呢？我们知道，在执行 `hexo g` 时，会将主题目录下的 `source` 中的文件拷贝到博客根目录下的 `public` 目录中。而根据 Archer 主题的 gulp 生成规则，编译好的 `.css` 文件存放在主题目录下的 `source/css` 中。因此，为了最终正确指向博客根目录下 `public/font/GlowSansSC-Normal-Book.otf` 文件，应该设置 url 为上一级目录下的 `font` 目录。

这种方式的优点是：配置方便。

但缺点也很明显：慢！尤其对于大多数人建立个人博客时，会使用自己的“小水管”服务器，字体文件要加载老半天才能正常显示出来（包括中文的字体文件大约 9 MB 左右，而下载速度大约为 200 KB/s）。此外，由于 Archer 主题在开头处就会引入包含字体配置的 CSS 文件，要留待字体加载完成后才渲染后续内容，极大影响首次浏览体验。

## 更换博客字体

接下来，修改 Archer 主题 `src/scss/_variables.scss` 文件中的 `$base-font-family` 变量：

```scss
$base-font-family:
  "Noto Sans SC",
  -apple-system,
  BlinkMacSystemFont,
  "Helvetica Neue",
  Arial,
  "PingFang SC",
  "Hiragino Sans GB",
  STHeiti,
  "Microsoft YaHei",
  "Microsoft JhengHei",
  "Source Han Sans SC",
  "Noto Sans CJK SC",
  "Source Han Sans CN",
  "Noto Sans SC",
  "Source Han Sans TC",
  "Noto Sans CJK TC",
  "WenQuanYi Micro Hei",
  SimSun,
  sans-serif;
```

如上所示，在 `$base-font-family` 最前面加上 `Noto Sans SC`（或 `Glow Sans SC`）就可以更换字体为思源黑体（或未来黑体）了。浏览器按顺序读取并使用字体，如果前面的字体没有，则依次使用后面的字体。

特别的，Archer 主题提供了另一个变量 `$feature-font-family`，渲染为主题中 Profile，Intro，Footer 等地方的字体，如果希望，也可以更换。

在上传到 Github 之前，别忘了在主题根目录执行 `npm run build`。

## 压缩中文字体

**笔者并未成功在 Archer 主题中实现**，这里只是给出实现思路和方法。

适用于在[**本地引入字体**](#直接引入本地字体文件)的方式。

因为中文字体的编码相比英文字体多很多，导致中文字体文件通常特别大，十分耗费网络资源，还会降低用户体验。以 Archer 主题自带的字体为例，英文字体 `Oswald-Regular.ttf` 只有 89 KB 大小，而刚刚本地引入示例中的中文字体 `GlowSansSC-Normal-Book.otf` 有 8971 KB 之大。如果能对中文字体进行压缩，将能大大提高用户体验。

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
  font-family: "Glow Sans SC";
  src: url("../font/GlowSansSC-Normal-Book.eot");
  src:
    url("../font/GlowSansSC-Normal-Book.eot?#font-spider") format("embedded-opentype"),
    url("../font/GlowSansSC-Normal-Book.woff2") format("woff2"),
    url("../font/GlowSansSC-Normal-Book.woff") format("woff"),
    url("../font/GlowSansSC-Normal-Book.ttf") format("truetype"),
    url("../font/GlowSansSC-Normal-Book.svg") format("svg");
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

特别的，假如使用 Github Actions 一类的 CI 系统，别忘了将压缩中文字体文件的步骤加入到 CI 配置中。

## 文末碎碎念

笔者最开始使用的是 Github 上[开源的思源黑体](https://github.com/adobe-fonts/source-han-sans)，通过本地引入的方式加载字体。而后选择使用了 CDN 引入 Google 字体中的思源黑体。发现两者竟然有不小的区别，总的来说前者更好看一些……均使用 `Regular` 字重，页面效果如下：

Github 开源版本：

![Github 开源版本思源黑体](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2021/06/25/web-font-for-hexo-theme-archer/Github-Open-Source-Version.png)

Google 字体版本：

![Google 字体版本思源黑体](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2021/06/25/web-font-for-hexo-theme-archer/Google-Fonts-Version.png)

前者字形更高，颜色更淡雅一些。可能需要额外的配置？考虑到页面加载速度，暂且选用 CDN 加速版本。

## 参考文章

- [網頁是否安裝思源黑體、中文字型的考量﹍影響載入速度的因素及作法分析](https://www.wfublog.com/2019/01/noto-sans-serif-traditional-chinese-web-font_11.html)
