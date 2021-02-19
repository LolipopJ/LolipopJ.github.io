---
title: Hello Hexo World
date: 2019/12/27
updated: 2021/2/19
categories:
- web 前端
tags:
- 博客开发
---
搭建一个自己的博客是多少投身于IT行业的男人女人们的梦想！撇开维护所花费的巨量时间开销不看，能够在网络上划得一片净土去传递自己的故事与思考，是一件何等快乐的事情！

正如许多人的第一篇博客那样，在这里记录下搭建博客的流程，也许能带给你些许决意和帮助。

## 开始前

假设你已了解何为 Github Pages，并充分认识到它对于一个渴望搭建博客的中国人的难以替代性（是的，我不愿意备案）。在开始之前，我们首先要选择博客框架，并下载与之对应的依赖软件。

### Hello, Hexo

Hexo 基于 Node.js，是一个快速、简洁且高效的博客框架。Hexo 使用 Markdown（或其他渲染引擎）解析文章，在几秒内，即可利用靓丽的主题生成静态网页。

类似的生成静态网页的框架还有 Hugo、Jekyll、Ghost 等，各有所长。权衡利弊，我最终选择了简单且高效的 Hexo 框架。

访问 [Hexo 官网](https://hexo.io/zh-cn)总是开始的不二之选。

### 依赖程序

安装 Hexo 十分简单，只需要先安装下列应用程序：

- [Node.js](https://nodejs.org/en/)（版本不低于 10.13.0）
- [Git](https://git-scm.com/)

通常选择最新版本即可。

### 安装 Hexo

安装完毕依赖程序后，打开 Git bash，使用 npm 命令一键安装 Hexo 5.x 版本以及所需依赖。

``` bash
npm install -g hexo-cli
```

## 搭建博客

### 初始化

首先在 Git bash 的工作目录新建存放 Hexo 文件的文件夹，进入该文件夹并初始化。

``` bash
hexo init [文件夹名]
cd [文件夹名]
npm install
```

### 修改配置文件

在 Hexo 目录下的 `_config.yml` 修改大部分的配置，包括网站标题、副标题、您的名字、网站语言和网站时区等等。

可以参见 [Hexo 配置官方文档](https://hexo.io/zh-cn/docs/configuration)，按照自己的需求进行更改。

### 部署到 Github Pages

登录你的 Github，新建一个 Repository，命名为 **你的Github用户名.github.io**。

现在你可以随时通过浏览器访问 `https://你的Github用户名.github.io` 的方式，进入到库中根目录下的 `index.html` 页面（如果有的话）。

Hexo 提供了快速方便的一键部署功能，配置完成以后只需要一条命令就可以将网站刷新并部署到网站上！

1.安装 hexo-deployer-git。

``` bash
npm install hexo-deployer-git --save
```

2.修改 Hexo 目录下的配置文件 `_config.yml` 中 deploy 的内容如下。

``` json
deploy:
  type: git
  repo: 你的 Github Pages 链接 # 例如https://bitbucket.org/JohnSmith/johnsmith.bitbucket.io
  branch: master
```

3.生成站点文件并推送至Github库。

``` bash
hexo clean && hexo deploy
```

至此，博客便已经搭建完毕了！Hexo 拥有一个 landscape 的初始主题，意味着现在你就可以访问你自己的 Github Pages 了！

更多的主题可以在 [Hexo 官方主题页面](https://hexo.io/themes)上选择。

### 维护与更新博客

当执行 `hexo deploy` 时，Hexo 会将 `public` 目录中的文件和目录推送至 `_config.yml` 中指定的远端仓库和分支中，并且**完全覆盖**该分支下的已有内容。

编写好博客推送以后，只需要用 Git bash 移动到 Hexo 目录，使用 `hexo clean && hexo deploy` 命令（在 windows terminal 上请使用 `hexo clean ; hexo deploy`），即可完成博客页面的更新与同步了。

## 关于

上述步骤由 [Hexo 官方文档](https://hexo.io/docs/)简化而来。

您可以随时访问官方文档获取最新的搭建博客方法和更多重要的使用方法。
