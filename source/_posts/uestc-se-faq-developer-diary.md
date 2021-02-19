---
title: 电子科技大学 FAQ 网站开发者日志
categories:
- web 全栈
tags:
- web 开发
---
## 你好，成电

Hi，刚刚来到 [UESTC](https://www.uestc.edu.cn/) 的新生，这里是专为你准备的 FAQ 网站！愿你在**软件工程**专业的道路上有一个好的开始，与一段充满收获的旅程。

本项目的灵感来自于 [se-faq](https://github.com/BillChen2K/se-faq).

### 开发者日志

#### 2020-09-08

- 修改的项目的文件目录结构。将前后端剥离开，增加可读性并且方便后续的网站部署工作。

#### 2020-09-04

- 添加了 markdown-it 和 markdown-it-emoji 依赖。同学的提问和回答可以用 markdown 进行。
- 添加了 nodemailer 依赖。提问者在问题有新回答等时应接受到相应邮件。

#### 2020-09-03

- 初始化项目。本项目基于 Vue 语言，后端数据库使用 PostgreSQL.
