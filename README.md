# Lolipop's Studio - Hexo

我的个人博客，由 [Hexo](https://hexo.io/) 强力驱动，使用了 [Archer](https://github.com/fi3ework/hexo-theme-archer) 主题。

## 安装依赖

当然，先要安装 `Node.js`。

建议安装 `yarn` 包管理器: `npm install -g yarn`。

```bash
yarn install
```

## 预览博客

默认监听于 `http://localhost:4000`。

```bash
yarn server
```

## 打包与部署

生成静态文件。

```bash
# 生成静态文件
yarn build
```

部署到 Github。

```bash
# （可选）部署，也可以设置 CI
# hexo clean && hexo deploy
hexo clean ; hexo deploy
```
