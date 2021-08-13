---
title: 使用 jsDelivr 加速 Github 仓库搭建自己的图床服务
date: 2021/8/13
updated: 2021/8/13
categories:
- 技术琐事
tags:
- Github
- jsDiliver
---
## 起因

今天突然想去搞个图床，使用 CDN 加速图片资源。因为博客放在小水管服务器上，直接用这个服务器向用户传输图片资源对带宽有很大影响。

遂上网搜索有无免费图床的服务，看到有人提起，便出现了此文的主题：使用 jsDelivr 加速 Github 仓库资源，用作图床使用。

在国内，直接使用 Github 链接来加载图片是很慢的，甚至于加载不出来；但访问 jsDelivr 速度较快。通过 jsDelivr 来加速 Github 上的图片资源，即可以实现我们想要的图床服务。

使用其它的可以加速 Github 资源的 CDN 服务来替换 jsDelivr 也可以；这应该算是目前对于个人开发者来说，最简单且经济的方式了。

## 创建图床仓库

在 Github 上自建一个**公开**的仓库即可，与其它仓库区分开，您可以命名为 `img-holder`。

为什么要是公开的仓库？因为 jsDelivr 是 A free CDN for Open Source。咳咳，因为非公开的仓库别人也访问不到啦。

接下来，就可以往这个仓库里扔图片文件了。

## 使用 jsDelivr 加速

使用也非常简单，jsDiliver 提供了这个例子：

```plaintext
// load any GitHub release, commit, or branch
https://cdn.jsdelivr.net/gh/user/repo@version/file
```

按照这个格式依葫芦画瓢，例如在编写 Markdown 时，可以这样使用：

```md
![CDN host image](https://cdn.jsdelivr.net/gh/user/repo/file)
```

其中 `user` 为 Github 账户名，`repo` 为仓库名，`file` 为文件路径。

## 实际使用示例

在我的 `img-folder` 仓库中存放了一个 [`pic/less-spend.gif`](https://github.com/LolipopJ/img-folder/blob/master/pic/less-spend.gif) 文件。

编写 Markdown 内容如下：

```md
![Spend my money less](https://cdn.jsdelivr.net/gh/lolipopj/img-folder/pic/less-spend.gif)
```

渲染为 HTML 文件，显示内容如下：

![Spend my money less](https://cdn.jsdelivr.net/gh/lolipopj/img-folder/pic/less-spend.gif)

值得注意的是，由于 jsDelivr 本身的缓存机制，刚刚上传到 Github 仓库上的图片资源可能无法成功获取。系正常现象，等待一段时间便可。

看到一些博客提到可以使用 [PicGo](https://github.com/Molunerfinn/PicGo) 来管理自己的图床资源，电脑和手机端都可以使用，甚至还提供了 VSCode 插件。Cool，对于使用图片较多的用户可能非常有帮助。

Respect for Github and jsDelivr. 开始愉快地薅羊毛吧！
