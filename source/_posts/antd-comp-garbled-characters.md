---
title: 遇到 AntD 组件中文乱码问题，可以试试这么解决
date: 2023/10/9
updated: 2023/10/9
categories:
  - 前端开发
tags:
  - React
  - TypeScript
  - Ant-Design
---

项目中使用了 AntD 4.x 的 `<DatePicker />` 组件，开发环境显示正常，生产环境显示乱码，如下图所示：

![error](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20231008/antd-comp-garbled-characters/error.png)

## 问题原因

`<DatePicker />` 组件底层的国际化既由 AntD 提供的 `<ConfigProvider />` 控制（如上图的“年”，显示正常），又由 Moment 控制（如上图的“月”，显示乱码）。

经查询，当我们以 ISO8859-1 方式读取 UTF-8 编码的中文时，会出现如“ç”±æœˆè¦�å¥½å¥½å­¦ä¹ å¤©å¤©å�‘ä¸Š”这样的符号型乱码，正如上图所示。

因此产生问题的关键在于，**为何浏览器没有正确地以 UTF-8 格式读取 Moment 提供的中文语言包文本。**

经排查，发现在访问生产环境时，服务端返回的 HTML 文档设置了编码为 ISO8859-1：

![response-content-type](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20231008/antd-comp-garbled-characters/response-content-type.png)

一切便水落石出。

## 如何解决

最好的解决方案是联系服务端同学，修改 `Content-Type=text/html;charset=UTF-8`。

在这个项目中，使用了 CDN 的方式引入 Moment，因此可以采用的一个临时解决方案为强制指定编码，例如：

```html
<script
  src="https://gw.alipayobjects.com/os/lib/??moment/2.29.1/moment.js,moment/2.29.1/locale/zh-cn.js"
  charset="utf-8"
></script>
```
