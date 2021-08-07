---
title: Node.js 项目配置 ESLint 和 Prettier 检查并规范代码质量与格式
date: 2021/3/3
updated: 2021/3/16
categories:
- 技术琐事
tags:
- Node.js
- ESLint
- Prettier
- Nuxt
- VSCode
---
哪位代码人不希望自己的代码总有统一优美的风格，不会因为合作开发项目而杂乱呢？

在最开始写项目代码的时候我就用起了 ESLint 和 Prettier，再装一堆预设的配置，便跑了起来。令人沮丧的是，用 ESLint 修复了代码**质量**问题，还是会在编译器里看到红色波浪线，提醒还有些代码**风格**需要修复。直到这一次，我才忽然意识到 ESLint 和 Prettier 其实分工了不同领域，协同使用体验极好。

本文基于 Nuxt.js + VSCode 阐述如何配置并实现 ESLint + Prettier 检查并规范代码质量与格式。

## ESLint 与 Prettier

ESLint 是一个开源的 JavaScript 代码检查工具，Prettier 是一款代码格式工具。它们的功能侧重如下所示：

- ESLint：主要负责代码**质量**的校验，其次包含代码**风格**的检验。
- Prettier：主要负责代码**风格**的校验。

ESLint 认为代码风格并没有那么重要，因此并未完全解决代码风格问题。

> Rules are "agenda free" - ESLint does not promote any particular coding style.

而 Prettier 则认为自己是固执己见的代码格式化工具。

> An opinionated code formatter.

尚且不论二者孰是孰非，作为开发者，一句“我全都要”就可以解决这个争论，同时让自己项目的代码享受美妙的质量校验与风格修复体验。

## 安装依赖和编译器插件

```bash
yarn add --dev eslint prettier prettier-eslint prettier-eslint-cli
```

在 VSCode 扩展商店查找并安装：

- ESLint
- Prettier
- Prettier ESLint

### 其它的相关依赖

#### eslint-config-prettier

[eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) 可以关闭所有不必要或者可能与 Prettier 产生冲突的规则

```bash
yarn add --dev eslint-config-prettier
```

只需要将它放在 "extends" 项的最后即可；当然，位置取决于您的具体项目格式化需求。

```js
// .eslintrc.js
module.exports = {
  "extends": [
    "您使用的其它拓展",
    "prettier"
  ]
}
```

## 配置规则与脚本

修改目录下的 `.eslintrc.js` 文件如下所示：

```js
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
  ],
  plugins: ['prettier'],
  rules: {},
}
```

添加 `yarn` 脚本如下所示：

```json
// package.json
"scripts": {
  "lint": "eslint --ext \".js,.ts,.vue\" --ignore-path .gitignore .",
  "format": "prettier-eslint --write %INIT_CWD%/**/*.{js,ts,vue}"
},
```

## 现在就格式化代码吧

根据之前的配置，可以在项目根目录下执行 bash 脚本：

```bash
# 只修复代码质量问题
yarn lint
# 修复代码质量问题和代码风格
yarn format
```

此外，对于 VSCode 还可以配置：

- 设置**格式化文档的方式**默认为 `Prettier ESLint`。这样使用快捷键 `Shift + Alt + F` 可以自动格式化文档。
- 设置**保存时自动格式化文档**，如下所示。这样执行 `Ctrl + S` 保存时会自动格式化文档。

  ```json
  // settings.json
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  ```

## 参考资料

- [ESLint+Prettier代码规范实践](https://www.jianshu.com/p/dd07cca0a48e) - Bernie维 - 2019.06.04
- [搞懂 ESLint 和 Prettier](https://zhuanlan.zhihu.com/p/80574300) - 乃乎 - 2019.08.31
- [Error: 'basePath' should be an absolute path](https://github.com/prettier/prettier-eslint-cli/issues/208#issuecomment-673631308) - mathiaswillburger - 2020.08.14
