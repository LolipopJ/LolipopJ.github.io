---
title: Webpack 读取本地 Markdown 文件并进行预处理
date: 2021/2/23
updated: 2021/6/26
categories:
  - 前端开发
tags:
  - Markdown
  - JavaScript
  - Node
  - Webpack
---

在开发 NetUnion 的官网页面时，有这样一个需求：读取本地目录下的新闻和博客文件，并在前端渲染，其中文件均为 Markdown 格式。

与全栈开发直接调用后端数据库不同的是，没有数据表字段来记录文件的不同属性，例如文件的题目、作者、撰写日期等，因此这些属性需要记录在 .md 文件当中。

这样的撰写方式是不是很熟悉？没错，不就是我正在写的 Hexo 博客中 .md 文件的编写格式嘛！

## 自动导入本地的 .md 文件

当然，首先要读取某个目录下已经撰写好的 .md 文件，才能对内容进行预处理。

但如果每撰写好一个新的新闻或博客文件，就得在代码中 `require` 出来，太过于麻烦且不现实，因此就需要**自动导入**的方法。

Webpack 提供了 `require.context()` 方法可以完美解决导入目录下所有文件的问题，该方法可以导入指定目录（也可以包括子目录）下指定格式的所有文件。关于此方法的更多细节可以在 Webpack 官方文档中[了解](https://webpack.js.org/guides/dependency-management/#requirecontext)。

撰写代码自动读取 `@/docs/blog/` 及其子目录下的所有 .md 文件如下所示，其中 `blogFiles(key)` 为文件存储的具体内容：

```js
const blogFiles = require.context("@/docs/blog/", true, /\.md$/);
blogFiles.keys().forEach((key) => {
  console.log(blogFiles(key));
});
```

## 对 .md 文件进行预处理

参考 Hexo 博客的撰写格式，可以规定 NetUnion 官网的新闻和博客撰写格式如下：

```md
---
title: ${title}
date: ${date}
author: ${author}
---

${main-text}
```

即用两个 `---` 框住**属性内容**，在第二个 `---` 下面为**正文内容**。

那么首先，可以用 `split()` 方法根据 `---` 及换行符将文章划分为长度不少于 3 （因为在正文中可能出现 `---`）的数组 arr。其中 arr[0] 为空，arr[1] 存储有属性内容，arr[2] 及之后存储正文内容。

```js
// content 为传入的 .md 文件内容
const contentArray = content.split(/---+\r?\n/g);
```

对属性内容的处理同样可以先使用 `split()` 方法按换行符拆分为数组。

```js
const contentInfo = contentArray[1];
const contentInfoArray = contentInfo.split(/\r?\n/g);
```

值得一提的是，在上面两次按换行符分割时，我都使用了 `/\r?\n/g` 正则表达式。其含义是匹配 0 个或 1 个 `\r` 及 1 个 `\n`，直到结束。因为在 `CRLF` 行尾序列的文件中，换行符由 `\r\n` 表示；而在 `LF` 行尾序列中，换行符由 `\n` 表示。这样就确保了在 Windows 和 Unix 两种不同的系统上撰写的文件，其解析不会受行尾序列所影响。

接下来就可以提取属性对象了。这里使用 `trim()` 方法来删除属性名和属性值前后可能出现的多余空格。

```js
const contentInfoItem = {};
for (let i = 0; i < contentInfoArray.length - 1; i++) {
  const contentInfoParamArray = contentInfoArray[i].split(":");
  let contentInfoParamValue = "";
  for (let n = 1; n < contentInfoParamArray.length; n++) {
    contentInfoParamValue += contentInfoParamArray[n] + ":";
  }
  contentInfoItem[contentInfoParamArray[0].trim()] = contentInfoParamValue
    .slice(0, -1)
    .trim();
}
```

对正文内容的处理就相当简单了，只需要把 arr[2] 及之后存储的内容用 `---\n` 连接起来就可以了。

```js
let contentText = contentArray[2];
if (contentArray.length > 3) {
  for (let i = 3; i < contentArray.length; i++) {
    contentText += "---\n";
    contentText += contentArray[i];
  }
}
```

将属性对象与正文内容合并为一个新的对象，解析就完成了！

```js
const result = {
  ...contentInfoItem,
  content: contentText,
};
```

如果愿意，还可以在最后对格式进行一定规范，例如可以对 date 属性进行处理：

```js
// 格式为 YYYY-MM-DD
if (result.date != null) {
  const dateArray = result.date.split("-");
  const dateYear = dateArray[0];
  let dateMonth = dateArray[1];
  let dateDay = dateArray[2];
  if (dateMonth.length == 1) {
    dateMonth = "0" + dateMonth;
  }
  if (dateDay.length == 1) {
    dateDay = "0" + dateDay;
  }
  result.date = dateYear + "-" + dateMonth + "-" + dateDay;
}
```

## 解析 .md 为 HTML

将结果中的正文内容交给给任意 .md 解析器就可以了，例如 [markdown-it](https://github.com/markdown-it/markdown-it)。

```js
const md = require("markdown-it")({
  linkify: false, // 一些设置，并不重要，下同
  breaks: false,
  typographer: true,
});
const htmlContent = md.render(result.content);
```

完整的解析文件[在这里](https://github.com/uestclug/nu-official/blob/frontend/src/utils/mdParser.js)。
