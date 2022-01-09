---
title: 从零开始使用 Telegram Bot
date: 2022/1/9
updated: 2022/1/9
categories:
- 后端开发
tags:
- Telegram
- Bot
- Node
- Koa
---
本文旨在基于 Koa 从零开始搭建一个简单的 Telegram Bot 应用，帮助笔者更好地将爱传递给 Telegram！

本文假设您已对 Node.js 和 Koa 有一定的了解。

## 初始化 Koa 项目

[Koa](https://koajs.com/) 是为 Node.js 设计的下一代 Web 框架，其幕后开发者主要来自知名的 Express 团队。

尽管使用 [koa-generator](https://github.com/i5ting/koa-generator) 来初始化 Koa 项目是一个不错的选择，但笔者还是喜欢从头开始的感觉。

那么首先，新建文件夹并进入，使用 `npm init` 初始化 `package.json`。

安装必要的依赖：

```bash
npm install koa koa-router koa-bodyparser dotenv
```

安装开发依赖：

```bash
npm install -D nodemon
```

安装服务器部署时使用的依赖：

```bash
npm install pm2
```

为了简便，这里笔者使用了别人进行封装后的 Telegram Bot API 库 [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)：

```bash
npm install node-telegram-bot-api
```

规划项目目录结构大致如下：

```plaintext
.
├── .env
├── app.js
├── bot.js
├── package.json
├── bin
│   └── www.js
└── routes
│   └── index.js
└── serve
    └── index.js
```

其中，`.env` 为环境配置文件，包括 Telegram Bot Token 在内的信息在此处配置；`bin/www.js` 为项目启动时执行的文件，这意味着在配置脚本命令时，应当使用 `nodemon bin/www` 及 `pm2 start bin/www`；`routes` 目录为路由目录，用来存放可调用的接口；最后，`serve` 目录为服务目录，存放一些定时执行的任务。

## 连接到 Telegram Bot

### 创建新的 Bot

首先，通过在 Telegram 上与 [BotFather](https://core.telegram.org/bots#6-botfather) 交互，创建一个新的 Telegram Bot。

![create a new bot](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2022/01/08/start-telegram-bot/create-bot.png)

记录下当中的 **HTTP API** 的值即 Telegram Bot Token，作为项目的环境变量保存，切勿上传到远程代码仓库中。

```js
const token = process.env.TELEGRAM_BOT_TOKEN
```

### 与 Bot 建立连接

我们的项目可能无法直接访问到 Telegram 的服务器，可以使用 [**SOCKS5 代理**](https://github.com/mattcg/socks5-https-client)解决这个问题：

```js
const TelegramBot = require('node-telegram-bot-api')
const proxySocks5Agent = require('socks5-https-client/lib/Agent')

requestOptions = {
  agentClass: proxySocks5Agent,
  agentOptions: {
    socksHost: process.env.PROXY_SOCKS5_HOST,
    socksPort: process.env.PROXY_SOCKS5_PORT,
    socksUsername: process.env.PROXY_SOCKS5_USERNAME,
    socksPassword: process.env.PROXY_SOCKS5_PASSWORD,
  },
}

const bot = new TelegramBot(token, {
  polling: true,
  request: requestOptions,
})
```

如何 SOCKS5 工作不正常（[这是](https://github.com/yagop/node-telegram-bot-api/issues/696#issuecomment-613023532)一个可能的原因），也可以尝试使用 **HTTP 代理**：

```js
const TelegramBot = require('node-telegram-bot-api')

requestOptions = {
  proxy: process.env.PROXY_HTTP,
}

const bot = new TelegramBot(token, {
  polling: true,
  request: requestOptions,
})
```

对 Bot 进行测试，添加如下代码：

```js
bot.onText(/\/start/, (msg) => {
  // console.log(msg)
  bot.sendMessage(msg.chat.id, 'Hi, this is Telly Bot!')
})
```

打开 Telegram，对 Bot 发送 `/start`，看看是否会得到 `Hi, this is Telly Bot!` 的回应。

### 使用网络钩子与 Bot 交互

Telegram Bot 可以通过轮询（polling）和网络钩子（webhook）两种不同的方式来获取用户发送的消息，在前面的代码中，我们使用的是轮询的方式。

轮询的方式无需额外的配置，更适合本地快速进行开发测试；而网络钩子的方式更适合项目部署。那么，一个健全的 Telegram Bot 应当使用**网络钩子**的方式来实现。

为了接收用户对 Telegram Bot 发送的消息，在网络钩子的方式中，我们需要一个 **HTTPS 协议的公网地址**，除了直接使用自己的服务器，还可以怎么办呢？别急，有 [ngrok](https://ngrok.com/) 为我们排忧解难：它是一款反向代理工具，可以将本地的地址映射到公网上去。

![ngrok](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2022/01/08/start-telegram-bot/ngrok.png)

如上图所示，当 ngrok 运行时，Telegram Bot 发向 `https://a75b-182-141-75-13.ngrok.io` 的请求，将转发给运行在本地 `http://localhost:4000` 上的程序。

这样，只需要同时运行我们的项目和 ngrok，我们就可以正常地接收到信息并进行处理了。修改连接 Bot 的代码如下：

```js
const bot = new TelegramBot(token, {
  request: requestOptions,
})

bot.setWebHook(`${process.env.WEBHOOK_HOST}/bot${token}`)

globalThis.bot = bot
```

现在，Telegram 上收到的消息会立即发送给我们的服务器。最后，在服务器需要处理接收到的 POST 类型请求 `/bot${TELEGRAM_BOT_TOKEN}`，告知 Telegram 我们已经收到新的消息了。可以将在 `routes/index.js` 中添加代码如下：

```js
router.post(`bot${token}`, (ctx) => {
  globalThis.bot.processUpdate(ctx.request.body)
  ctx.status = 200
})
```

需要补充的是，通过上面代码中 Bot 的 [`processUpdate`](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md#telegrambotprocessupdateupdate) 方法，可以对接收到的消息进行相应的处理，触发正确的事件并执行回调方法。

现在，我们的机器人将不再笨拙地轮询 Telegram 服务器，查看是否有未处理的消息，而是静静等待 Telegram 服务器发送过来的请求。

### Bot 起始脚手架

万事俱备，接下来就是根据自己的需求进行开发的时间了。

[这里](https://github.com/LolipopJ/telly-bot/tree/acbe0b122eb164dd3a44d95ed216877cbb9b0464)是笔者简单配置好的项目代码，可以作为 Start-up 供君参考。

## 参考文章

- [开发一个 Telegram Bot](https://www.wandouip.com/t5i13823/)
