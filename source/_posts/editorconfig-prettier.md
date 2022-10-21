---
title: 使用 EditorConfig 和 Prettier 优雅地配置 VSCode 代码格式化
date: 2021/8/7
updated: 2021/8/8
categories:
  - 技术琐事
tags:
  - Node
  - EditorConfig
  - Prettier
  - VSCode
---

笔者想要给自己翻译的设计模式教程添加**多编程语言**支持。最初，只选择了 JavaScript 作为示例语言，看到 Github 上有大量其它语言的实现，便想要加上这些语言，集成为一个大一统的中文翻译项目。

部署的网页基于 VuePress，最简单的方式就是将源文档复制几份，然后逐段粘贴为别人的代码即可。偶然发现有 VuePress 本身提供了一个导入代码段的功能，可以引入本地文件中的代码段。几乎没有多想，便决定使用这个功能，这样可以将代码段放入不同的文件中，很大程度上方便了后续的管理和拓展。

现在，一个项目里出现了多种不同的编程语言的代码，不考虑它们的代码质量问题（如果还考虑代码质量问题，可以参考笔者的{% post_link nodejs-eslint-prettier '这一篇博客' %}），只在乎它们的**格式规范**。那么，如何优雅地在 VSCode 上格式化这些代码呢？

## 编写时 EditorConfig

[EditorConfig](https://editorconfig.org/) 有助于为跨各种编辑器或 IDE 而处理同一项目的多个开发人员保持一致的编码风格。

VSCode 并没有内置对 EditorConfig 的支持，需要在插件市场中手动下载[其插件](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)。

EditorConfig 会读取工作区中的 `.editorconfig` 文件中的设置，然后尝试覆盖当前工作区的配置。因此，我们只需要在工作区新建一个名叫 `.editorconfig` 的文件，填入我们需要的设置就可以了。

目前，VSCode 中的 EditorConfig 支持如下设置属性：

- `root`：需要在项目的根目录指定为 `true`。否则 EditorConfig 将接着向上级目录查找是否有其它 `.editorconfig` 文件。
- `indent_style`：缩进风格，可选值为 `tab` 和 `space`。
- `indent_size`：缩进长度，一般使用 `2` 和 `4`。
- `tab_width`：TAB 宽度，默认值为 `indent_size`，通常无需单独指定。
- `end_of_line` (on save)：行尾序列，可选值为 `lf`, `cr` 和 `crlf`。一般使用 `lf`，因为现代 IDE 一般都能识别行尾序列并自动转换，而在部署项目时的 Linux 端就没那么“聪明”了。
- `insert_final_newline` (on save)：文尾空行，可选值为 `true` 和 `false`。当设置为 `true` 时，保证文件保存后会在最末尾有空行，反之则没有空行。
- `trim_trailing_whitespace` (on save)：移除行尾空白字符，可选值为 `true` 和 `false`。当设置为 `true` 时，自动移除每一行的换行符前的所有空白字符，反之则不移除。

另外 `charset` 字符集属性在 Backlog 阶段，一般使用 `utf-8` 即可。此外还可以选择 `latin1`, `utf-8-bom`, `utf-16be` 或 `utf-16le`。

更详细的配置说明可以参考[此网站](https://editorconfig-specification.readthedocs.io/)。

于是，我们可以在项目的根目录创建 `.editorconfig` 文件编写 EditorConfig 配置。下面是一个常用的配置：

```editorconfig
root = true

# 通配所有文件
[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
insert_final_newline = true
trim_trailing_whitespace = true
```

## 上库前 Prettier

EditorConfig 的功能是在编写时自动规范格式，统一缩进等**简单的**代码和文件风格。为了进一步确保代码风格符合编码规范，还应当在上库前使用 Prettier 修复代码格式。

首先自然是将 Prettier 安装为项目开发依赖：

```bash
yarn add --dev prettier
```

然后在 `package.json` 中添加 Prettier 脚本：

```json
{
  "scripts": {
    "prettier": "prettier --ignore-path .gitignore --write **/* --ignore-unknown"
  }
}
```

现在，执行 `yarn prettier` 将按照 Prettier 预置的规则自动格式化所有支持的后缀格式的文件了。

通过在项目根目录创建 `.prettierrc.json` 文件，可以进一步配置 Prettier 格式化[规则](https://prettier.io/docs/en/options.html)。例如（注意，JSON 文件中不应该添加注释）：

```json
{
  "semi": true, // 句末是否添加分号
  "singleQuote": true // 是否使用单引号（而非双引号）
}
```

接下来，考虑到我们的项目中会包含 PHP 以及 Java 等语言的代码，要让 Prettier 处理它们的格式，该怎么做呢？

在默认情况下，Prettier 并不支持 PHP 或 Java 代码的格式化，这就需要我们单独添加支持其它编程语言的 [Prettier 插件](https://prettier.io/docs/en/plugins.html)作为项目的依赖。其中，以 `@prettier` 开头的插件为官方维护插件，例如 [`@prettier/plugin-php`](https://github.com/prettier/plugin-php)；其它命名插件为社区开发插件，例如 [`prettier-plugin-java`](https://github.com/jhipster/prettier-java)。

```bash
yarn add --dev @prettier/plugin-php prettier-plugin-java
```

Prettier 将自动加载与它在同一 `node_modules` 文件夹中的 Prettier 插件，并自动识别新增的代码后缀（如 `.php` 和 `.java`）。因此在最后，只需要再执行一遍 `yarn prettier`，就可以实现格式化项目中的 PHP 及 Java 代码了。

如果只想修复某些后缀的代码，例如 Java 代码的格式，也可以单独执行 `prettier --write "**/*.java"`。
