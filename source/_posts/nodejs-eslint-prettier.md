---
title: Nuxt 项目配置 ESLint 和 Prettier 检查并规范代码质量与格式
date: 2021/3/3
updated: 2021/8/7
categories:
  - 技术琐事
tags:
  - Node
  - Nuxt
  - ESLint
  - Prettier
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

首先，自然是安装 ESLint 和 Prettier 作为项目依赖。

```bash
yarn add --dev eslint prettier
```

在 VSCode 扩展商店查找并安装：

- ESLint
- Prettier

在过去，我们可能会使用 `prettier-eslint` 作为项目依赖，通过它依次执行 `prettier` 然后是 `eslint --fix`，实现修复代码格式和质量问题。但是：

> It's the recommended practice to let Prettier handle formatting and ESLint for non-formatting issues, `prettier-eslint` is not in the same direction as that practice, hence `prettier-eslint` is not recommended anymore. You can use `eslint-plugin-prettier` and `eslint-config-prettier` together.

最佳实践是让 Prettier 处理代码格式问题，让 ESLint 处理代码质量问题。

这可以通过以下两个库实现：

- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)：ESLint 插件，包括了 ESLint 需要检查的一些额外代码格式规则。在幕后，它使用到了 Prettier，相当于将 Prettier 作为 ESLint 的一部分运行。
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)：ESLint 配置，可以关闭所有不必要或者可能与 Prettier 产生冲突的代码格式规则。

二者相辅相成，eslint-config-prettier 可以关闭 ESLint 中与 Prettier 相冲突的代码格式规则，这样我们就将代码格式化的问题全都交给我们的 Prettier 处理。

```bash
yarn add --dev eslint-plugin-prettier eslint-config-prettier
```

修改 `.eslintrc.js` 中配置，将 `plugin:prettier/recommended` 和 `prettier` 放到拓展的最后两项，如下所示：

```js
// .eslintrc.js
module.exports = {
  extends: [
    "您使用的其它 ESLint 拓展",
    "plugin:prettier/recommended",
    "prettier",
  ],
};
```

## 配置 Prettier

参考 Prettier 的官方[配置文档](https://prettier.io/docs/en/options.html)，自由地配置项目代码的风格吧！

只需要在项目目录创建 `.prettierrc.json` 文件，填写配置即可。例如（注意，JSON 文件中不应该添加注释）：

```json
{
  "semi": false, // 句末是否添加分号
  "singleQuote": true // 是否使用单引号（而非双引号）
}
```

由于 Prettier 是以插件的形式添加到 ESLint 中，因此您需要在修改后重新启动 VSCode 工作区。

## 现在就格式化代码吧

修改 `package.json` 文件，添加脚本：

```json
// package.json
{
  "scripts": {
    "lint": "eslint --ignore-path .gitignore --ext .ts,.js,.vue .",
    "lint:fix": "yarn lint --fix",
    "lint:prettier": "prettier --ignore-path .gitignore --write **/* --ignore-unknown"
  }
}
```

这里笔者使用了比较偷懒的方法，调用了 Prettier 一键修复**所有可修复**的代码风格问题，而不限于我们指定的 `.ts` 文件等。既然在前面我们已经配置好了 ESLint 和 Prettier 之间的关系，所以在这里单独通过 Prettier 修复后，VSCode 中并不会显示可恶的红色波浪线。

根据上面的配置，可以在项目根目录下执行如下脚本：

```bash
# 只检查 .ts, .js, .vue 文件的代码质量问题
yarn lint
# 检查并修复 .ts, .js, .vue 文件的代码质量问题
yarn lint:fix
# 修复所有可修复的代码风格问题
yarn lint:prettier
```

此外，VSCode 还可以设置**保存时自动修复代码问题**，如下所示。这样执行 `Ctrl + S` 保存时会自动格式化代码文件。

```json
// settings.json
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
},
```

## 参考资料

- [What's the difference between prettier-eslint, eslint-plugin-prettier and eslint-config-prettier?](https://stackoverflow.com/questions/44690308/whats-the-difference-between-prettier-eslint-eslint-plugin-prettier-and-eslint) - stackoverflow
- [Error: 'basePath' should be an absolute path](https://github.com/prettier/prettier-eslint-cli/issues/208#issuecomment-673631308) - mathiaswillburger - 2020.08.14
- [搞懂 ESLint 和 Prettier](https://zhuanlan.zhihu.com/p/80574300) - 乃乎 - 2019.08.31
- [ESLint+Prettier 代码规范实践](https://www.jianshu.com/p/dd07cca0a48e) - Bernie 维 - 2019.06.04
