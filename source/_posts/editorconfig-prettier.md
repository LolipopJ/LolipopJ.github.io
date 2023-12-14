---
title: 使用 EditorConfig 和 Prettier 优雅地配置 VSCode 代码格式化
date: 2021/8/7
updated: 2023/12/14
categories:
  - 技术琐事
tags:
  - Node
  - EditorConfig
  - Prettier
  - VSCode
---

## 编写代码时使用 EditorConfig

EditorConfig 能够帮助跨各种 IDE 开发同一项目的不同开发人员保持一致的编码风格。

VSCode 没有内置对 EditorConfig 的支持，需要在插件市场中手动下载[插件](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)。

EditorConfig 会自动读取工作区中的 `.editorconfig` 文件，更详细的配置说明可以参考[官方介绍](https://editorconfig-specification.readthedocs.io/)。下面是笔者常用的配置：

```editorconfig
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
insert_final_newline = true
trim_trailing_whitespace = true
```

## 推送仓库前使用 Prettier

为了进一步确保代码风格符合编码规范，可以在上库前使用 Prettier 修复代码格式。

将 Prettier 安装为项目开发依赖：

```bash
yarn add -D prettier
```

在 `package.json` 中添加 Prettier 运行脚本：

```json
{
  "scripts": {
    "prettier": "prettier --ignore-path .gitignore --write **/* --ignore-unknown"
  }
}
```

现在，执行 `yarn prettier` 命令，工具将按照 Prettier 预置的规则自动格式化所有支持的后缀格式的文件了。

在项目根目录创建 `.prettierrc.json` 文件，可以进一步配置 Prettier 格式化规则，可参考[官方文档](https://prettier.io/docs/en/options.html)。例如：

```json
{
  // JSON 文件中不应添加注释，需去除
  "semi": true, // 句末是否添加分号
  "singleQuote": true // 是否使用单引号
}
```

假如我们的项目中会包含 PHP 以及 Java 等语言的代码，要让 Prettier 处理它们的格式，该怎么做呢？

在默认情况下，Prettier 并不支持 PHP 或 Java 代码的格式化，这就需要我们单独添加支持其它编程语言的 [Prettier 插件](https://prettier.io/docs/en/plugins.html)作为项目的依赖。其中，以 `@prettier` 开头的插件为官方维护插件，例如 [`@prettier/plugin-php`](https://github.com/prettier/plugin-php)；其它命名插件为社区开发插件，例如 [`prettier-plugin-java`](https://github.com/jhipster/prettier-java)。

```bash
yarn add --dev @prettier/plugin-php prettier-plugin-java
```

Prettier 将自动加载与它在同一 `node_modules` 文件夹中的 Prettier 插件，并自动识别新增的代码后缀（如 `.php` 和 `.java`）。因此在最后，只需要再执行一遍 `yarn prettier`，就可以实现格式化项目中的 PHP 及 Java 代码了。
