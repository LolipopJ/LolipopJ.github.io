---
title: 更换持续集成工具，从 Travis 到 Github Actions
date: 2021/7/10
updated: 2021/7/14
categories:
  - 技术琐事
tags:
  - Travis
  - Github-actions
---

我真傻，真的，单单受文档的推荐就选择了 Travis 作为部分项目的持续集成工具，没有料到它早已于 2020 年 12 月更换了免费政策，不再为开源项目提供免费的用于持续集成使用的 Credits 了。当赠送的 10000 个点数用完，就需要付费才能进行构建了。

当然，作为经济驱动的公司，近些天来又受 Github Actions 等其它持续集成工具打压了盈利空间，抛弃开源用户选择转型做起了商人事业也并非不可理解。感谢它曾为开发者提供的便利，不过作为一个佛系开发者，终于还是需要转投到别的免费工具上去了——Gihub Actions。

## 编写新的 workflow.yml

那么首先，我们就需要将为 Travis 编写的命名为 `.travis.yml` 的配置文件，翻译成 Github Actions 能识别的 workflow.yml 配置文件。

以[献给中文读者的设计模式教程](https://github.com/LolipopJ/design-patterns-for-humans-zh)这个项目为例，原有的 `.travis.yml` 内容如下：

```yml
language: node_js
node_js:
  - lts/*
branches:
  only:
    - main
install:
  - cd vuepress
  - yarn install
script:
  - yarn build
deploy:
  provider: pages
  skip_cleanup: true
  local_dir: vuepress/docs/.vuepress/dist
  github_token: $CI_DEPLOY_TOKEN
  keep_history: true
  on:
    branch: main
```

当检测到 main 分支代码更新后，启动持续集成工具。克隆项目，进入到项目的 `vuepress` 目录下执行安装依赖和生成静态文件操作，最后将 `/vuepress/docs/.vuepress/dist` 目录下的静态文件，上传到 `gh-pages` 分支，交给 Github 部署。

使用 Github Actions 实现上面的过程，首先在项目根目录创建 `.github/workflows` 文件夹，在文件夹内创建 workflow 配置文件，例如 `deploy.yml`，编写内容如下：

```yml
name: Vuepress Deployment

on:
  push:
    branches:
      - main

jobs:
  pages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js 14.x
        uses: actions/setup-node@v1
        with:
          node-version: "14.x"
      - name: Cache NPM dependencies
        uses: actions/cache@v2
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: |
          cd vuepress
          npm install
      - name: Build
        run: |
          cd vuepress
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          deploy_key: ${{ secrets.ACCESS_TOKEN }}
          publish_dir: vuepress/docs/.vuepress/dist
          publish_branch: gh-pages
```

## 创建 SSH Deploy Key

这一步是为了给 Github Actions 远程服务器访问我的 Github 账号提供凭证。如果没有设置 Github 账户双重验证或其它安全验证，可以移除上面脚本中的 `deploy_key` 属性然后跳过这一步。但是假如以后设置了安全验证，回来改又会很麻烦，不如一步到位了吧 🤗。

您也可以生成 Personal access token 作为替代，不过前面的脚本中的 `deploy_key` 应该修改为 `personal_token`。

启动命令行工具，创建 SSH 部署密钥：

```bash
# 进入到当前用户的 .ssh 目录下
cd ~/.ssh
# 创建 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "$(git config user.email)" -f design-patterns-for-humans-zh-gh-pages
```

其中，`design-patterns-for-humans-zh-gh-pages.pub` 为公钥，应上传到 [Github 账户 SSH keys 设置](https://github.com/settings/keys)中；不带后缀的为私钥，应作为 [Github 项目仓库的 Secret](https://github.com/LolipopJ/design-patterns-for-humans-zh/settings/secrets/actions)，根据前面的配置，这里命名为 `ACCESS_TOKEN`。

## 最后一步

最后，移除 Github 仓库中用于 Travis 的删除原有部署密钥，例如 `CI_DEPLOY_TOKEN`，删除项目中的 `.travis.yml` 文件，提交代码到 Github 即可。

![CI 部署成功](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20210709/switch-travis-to-github-workflow/deploy-finished.png)
