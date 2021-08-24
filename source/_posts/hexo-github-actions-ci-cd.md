---
title: 使用 Github Actions 持续集成与部署 Hexo 博客
date: 2021/2/19
updated: 2021/2/19
categories:
- 技术琐事
tags:
- Github-actions
- Hexo
---
这是我撰写的第一篇与 Github Actions 有关的博客，那么就首先对 Github Actions 做一个简短的介绍吧。

Github Actions 是 Github 于 2018 年 10 月推出的持续集成服务（CI）。

> 大家知道，持续集成由很多操作组成，比如抓取代码、运行测试、登录远程服务器，发布到第三方服务等等。GitHub 把这些操作就称为 actions。
> 很多操作在不同项目里面是类似的，完全可以共享。GitHub 注意到了这一点，想出了一个很妙的点子，允许开发者把每个操作写成独立的脚本文件，存放到代码仓库，使得其他开发者可以引用。
> 如果你需要某个 action，不必自己写复杂的脚本，直接引用他人写好的 action 即可，整个持续集成过程，就变成了一个 actions 的组合。这就是 GitHub Actions 最特别的地方。
> —— [GitHub Actions 入门教程](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)

不过在 Github Actions 的发展的过程中，它早已不局限于 CI 等功能，还可以用于各种自动化操作，例如[百度贴吧自动签到](https://github.com/srcrs/TiebaSignIn)（注：已失效。Github 官方会对此类利用服务器实现签到功能的仓库进行封禁打击，还是不要使用了吧）等。

## 持续集成与部署 Hexo 博客

在{% post_link hello-hexo-world '搭建自己的 Hexo 博客' %}那篇文章的最后，我们使用的是 [hexo-deployer-git 一键部署到仓库](https://hexo.io/zh-cn/docs/github-pages#%E7%A7%81%E6%9C%89-Repository)的方式，实现手动构建个人博客网页并通过脚本推送部署到自己的 Github Pages.

事实上，利用 Github Actions 就再也不用多此一举：每次提交代码到 Github 后，就可以触发 Github Actions 并自动部署新的博客内容。

### 文档是您最有用的帮手

更确切的说，英文文档是您最有用的帮手！

在此处记一个小插曲，在本博客初次撰写的时候，中文的 Hexo 文档页面仍在使用 Travis CI 实现自动化部署，而英文的 Hexo 文档已经更新到推荐使用 Github Actions 实现自动化部署操作了。

使用 Travis CI 对免费用户有 10000 分钟执行时间的限额，为了以后不再迁移，还是使用 Github Actions 吧！

接下来的内容主要参考了[英文文档](https://hexo.io/docs/github-pages)，在此基础上加上了自己的一些操作与理解。

假设您已经创建了一个 **username.github.io** 仓库，其中 username 是您在 Github 上的用户名。

### 创建存放 Hexo 源的分支

众所周知，Hexo 首先通过 `Hexo generate` 方法构建了博客所有的 HTML, JS 和 CSS 文件，只需要将这些文件上传到 **username.github.io** 仓库，并在仓库设置中修改 `GitHub Pages` 项的相应内容，就可以通过 `username.github.io` 访问到您的博客了。

因此我们可以单独将构建前的所有文件放置在 **username.github.io** 仓库中的一个分支上，每次更新此分支后，自动通过 Github Actions 将构建出的所有文件推送到展示的分支上去。

这里，假设您展示的博客文件存放在 `master` 分支，而 Hexo 源文件存放在新建的 `source` 分支。

### 编写 Github Actions

克隆此仓库到本地，切换到 `source` 分支，在根目录下新建文件夹 `.github/workflows`，在此目录下新建文件如 `main.yml`. 名字并不重要。

您也可以在 Github 的仓库页面上点击 `Actions` 并创建新的工作流 `main.yml`。

编写工作流文件 `main.yml` 如下所示：

```yml
name: Hexo Blog CI & CD

on:
  push:
    branches:
      - source  # 存放 Hexo 源文件的分支

jobs:
  pages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: '12.x'
      - name: Cache NPM dependencies
        uses: actions/cache@v2
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }} # 无需修改
          publish_dir: ./public  # hexo generate 生成的博客文件默认存放在 /public 目录下
          publish_branch: master  # 存放展示的博客文件的分支
```

工作流采用了别人编写好的 [actions-gh-pages@v3](https://github.com/peaceiris/actions-gh-pages)，其中 `GITHUB_TOKEN` 为 Github Actions 在运行中自动生成的，用于验证身份的 Token，无需修改。关于 `GITHUB_TOKEN` 的更多介绍，可以查看[此文档](https://docs.github.com/en/actions/reference/authentication-in-a-workflow)。

提交修改或保存此工作流文件，很快 Github Actions 就会开始自动执行，并将最新的博客文件推送到仓库的 `master` 分支。

最后，等到 Github Pages 也更新完毕后，就可以访问您的博客啦！

### 假如您采用了账户两重验证

Ops, 也许您的邮箱收到了一份新的邮件，遗憾地通知您 Github Actions 执行失败。这时您可以想一想自己是否启用了 Github 账号的双重验证或其它安全访问验证。这都可能导致自动部署失败。

但是别担心，您可以通过[添加 SSH 身份验证](https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-create-ssh-deploy-key)来解决这个问题。

首先，使用 `ssh-keygen -t rsa -C "YOUR USERNAME"` 命令创建一个新的 SSH key 公钥密钥对。

然后在 Github 上的 **Account settings** 中的 **SSH and GPG keys** 设置中保存带有 `.pub` 后缀的公钥，并在当前项目仓库的 `secrets` 中存放不带任何后缀的密钥。

最后修改刚刚的 `main.yml` 文件，添加 `deploy_key` 设置，如下所示：

```yml
name: Hexo Blog CI & CD

on:
  push:
    branches:
      - source

jobs:
  pages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: '12.x'
      - name: Cache NPM dependencies
        uses: actions/cache@v2
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          deploy_key: ${{ secrets.ACCESS_TOKEN }}  # 添加 ACCESS_TOKEN
          publish_dir: ./public
          publish_branch: master
```

其中 `ACCESS_TOKEN` 为新建的 `secret` 的名字，您应当修改为刚刚您创建 `secret` 时指定的名字。

当然，您也可以生成 Github personal access token，本文不再赘述。

最后，提交您的修改，一切都工作得如此完美。
