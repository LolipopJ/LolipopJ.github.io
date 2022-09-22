---
title: 定时器 SetTimeout 在后台失效？试试 Web Worker 吧
date: 2022/9/22
updated: 2022/9/22
categories:
  - 前端开发
tags:
  - TypeScript
  - React
  - Web-Worker
  - Umi
  - Webpack
---

业务上有这样一个需求：「若用户不活跃超过 12 个小时，自动退出当前页面，并切换路由到首页」。

想都没想，直接在 `useEffect()` 里用 `setTimeout()` 定个时，12 个小时后触发相应跳转事件：

```tsx
import React, { useEffect } from "react";

const LEAVE_PAGE_COUNTDOWN = 12 * 60 * 60 * 1000; // 12h

/** 离开页面的方法 */
const leavePage = () => {
  // ...离开当前页面的业务代码
};

export default () => {
  useEffect(() => {
    // 初始化时设置定时器
    const timer = setTimeout(() => {
      leavePage();
    }, LEAVE_PAGE_COUNTDOWN);

    return () => {
      // 页面卸载时清除定时器
      if (timer) clearTimeout(timer);
    };
  }, []);
};
```

没想到，今天上班来，切换到没有关闭的标签页，发现还在当前页面，掐指一算怎么也有 12 个小时了，这是怎么一回事儿……？

昨天晚上走的时候还在和前辈探讨页面卸载（`unload`）事件与浏览器后台优化的坑，于是首先就想到了可能是浏览器优化的缘故，导致定时器没有正常执行。以「setTimeout」和「后台失效」为搜索关键词，很快找到了原因和优化解决方案。

## 失效原因

系现代浏览器为了节能与性能优化做的处理。

若页面处于非激活的状态，那么此页面中通过 `setTimeout()` 或 `setInterval()` 创建的定时器可能会**停止工作**或**以较慢的速度工作**。页面的非激活状态包括不限于：切换到其它标签页、最小化窗口和息屏等。在移动端，这样的性能优化尤为常见。

因此会发生另外一种常见的现象：如果浏览器页面里有一个基于 `setInterval()` 实现的计时器，当用户切换页面或回到桌面后，计时器将停止计时或计时频率减慢，导致计时功能异常。

## 基于 SetTimeout / SetInterval 的解决方案

定时器失效带来的最直接影响是：JavaScript 代码不再能够正确获取定时器**计划执行的时间**或**已经执行的次数**。

一个很容易想到的解决方案是，当页面切回前台时，重新校准 SetTimeout 定时器时间。

### 使用 SetTimeout + 监听 visibilitychange 事件

通过监听窗口的 `visibilitychange` 事件（兼容性[见于此](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/visibilitychange_event#browser_compatibility)），可以判断页面是否切换到前台：

```ts
window.addEventListener("visibilitychange", () => {
  switch (document.visibilityState) {
    case "visible":
      // 当前页面被切换到前台（可见或部分可见）
      break;
    case "hidden":
      // 当前页面被切换到后台（不可见）
      break;
    case "prerender":
      // 当前页面被预渲染，且用户不可见
      break;
    case "unloaded":
      // 当前页面被卸载
      break;
  }
});
```

对于这次业务上遇到的 12 小时自动切换路由这一需求，对即时性和定时器的精度要求并不高，且重新校准的逻辑容易编写，可以码出 React 代码如下：

```tsx
import React, { useEffect } from "react";

const LEAVE_PAGE_TIMESTAMP = "__leave_page_timestamp";
const LEAVE_PAGE_COUNTDOWN = 12 * 60 * 60 * 1000;

/** 离开页面的方法 */
const leavePage = () => {
  // ...离开当前页面的业务代码
};

/** 获得倒计时时间 */
const getLeavePageCountdown = (): number => {
  const timestamp = sessionStorage.getItem(LEAVE_PAGE_TIMESTAMP);
  const countdown = timestamp
    ? Number(timestamp) - new Date().getTime()
    : LEAVE_PAGE_COUNTDOWN;
  return countdown > 0 ? countdown : 0;
};

/** 获得离开页面定时器 */
const getLeavePageTimeout = (): NodeJS.Timeout => {
  return setTimeout(() => leavePage(), getLeavePageCountdown());
};

export default () => {
  useEffect(() => {
    // 初始化时设置离开页面的时间
    sessionStorage.setItem(
      LEAVE_PAGE_TIMESTAMP,
      String(new Date().getTime() + LEAVE_PAGE_COUNTDOWN)
    );

    return () => {
      // 页面卸载时清除 SessionStorage
      sessionStorage.removeItem(LEAVE_PAGE_TIMESTAMP);
    };
  }, []);

  useEffect(() => {
    // 初始化时设置定时器
    let timer = getLeavePageTimeout();

    const onWindowVisibilityChange = () => {
      // 重新校准定时器
      if (document.visibilityState === "visible") {
        // 清除已有定时器
        if (timer) clearTimeout(timer);
        // 设置新的定时器
        timer = getLeavePageTimeout();
      }
    };
    // 添加页面可见性变化监听器
    window.addEventListener("visibilitychange", onWindowVisibilityChange);

    return () => {
      // 页面卸载时清除定时器和监听器
      if (timer) clearTimeout(timer);
      window.removeEventListener("visibilitychange", onWindowVisibilityChange);
    };
  }, []);
};
```

上面的代码做了这些事情：

1. 当用户进入到页面时，在 SessionStorage 存储了应当执行业务需求的时间戳。
2. 启动一个定时器，在指定时间以后执行业务需求。
3. 启动一个监听器，当页面可见性发生改变，变为「可见」时，校准定时器：清除已有的定时器，然后启动一个新的定时器，在新的指定时间以后执行业务需求。其中，新的指定时间由存储的时间戳和当前的时间计算得来。

### 使用 SetInterval 轮训

哇噻，有够麻烦。换一种思路，使用轮训的实现方式，基于 SetInterval 不断比较当前的时间戳和应当离开页面的时间戳，若当前的时间戳大于应当离开页面的时间戳，执行离开页面的业务方法就好了。这种实现方式无需费力地重新校准时间，是一个讨巧的选择：

```tsx
import React, { useEffect } from "react";

const LEAVE_PAGE_COUNTDOWN = 12 * 60 * 60 * 1000;

/** 离开页面的方法 */
const leavePage = () => {
  // ...离开当前页面的业务代码
};

export default () => {
  useEffect(() => {
    // 获取执行业务需求的时间戳
    const timestamp = new Date().getTime() + LEAVE_PAGE_COUNTDOWN;

    // 初始化时设置轮询器
    const timer = setInterval(() => {
      const now = new Date().getTime();
      if (now >= timestamp) {
        leavePage();
      }
    }, 1000);

    return () => {
      // 页面卸载时清除轮询器
      if (timer) clearInterval(timer);
    };
  }, []);
};
```

### 似乎都不太优雅

但是，以上的实现都会导致一些体验上的问题：用户从后台切换到该页面时，若超过了 12 个小时，定时器或轮询器一运行，唰的一下子路由发生改变，用户会感到非常奇怪。

虽然加上一些 Notification 告知刚刚发生了啥会减少用户的不适，但终究我们还是会希望浏览器能**完全正常**地运行定时器方法（这是我们不想要被后台优化的功能），而不需要做这些带来额外开销且**不符合直觉**的适配（下一任程序员看到代码就头疼）。

此外，这样的做法并不能满足对**准确度要求高**的定时器需求。

基于以上需求，本文的主角 **Web Worker** 给出了现代、普适的解决方案。

## 生产实践的解决方案：使用 Web Worker

> Web Worker 为 Web 内容在后台线程中运行脚本提供了一种简单的方法。线程可以执行任务而不干扰用户界面……一个 worker 是使用一个构造函数创建的一个对象运行一个命名的 JavaScript 文件：这个文件包含将在工作线程中运行的代码；workers 运行在另一个全局上下文中，不同于当前的 window。
>
> \-\- [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers)

Web Worker 能够为 JavaScript 创建多线程环境，允许将主线程中的任务分配给 Worker 线程处理，主线程和 Worker 线程之间可以进行通信。当遇到计算密集型或高延迟的任务时，常使用 Web Worker 进行性能优化：在 Worker 线程进行复杂的计算操作，进而避免主线程阻塞或卡死。

Worker 线程一旦创建成功，将**始终运行**，不会被主线程上的活动中断。但是，这也意味着 Worker 使用完毕后应当立即关闭，避免造成额外的系统开销。

只需要了解 Web Worker 的基本用法，就能很好地实现本次业务上的需求。将 `setTimeout()` 方法移动到 Worker 中去，只要浏览器不关闭，Worker 将保持运行的状态，在正确的时机向主线程返回离开页面的消息。

### Webpack 的方式

首先编写一个 Web Worker 脚本文件 `leavePage.worker.js`：

```js
let timer;

self.onmessage = (event) => {
  // console.log("Received message from main thread", event.data);

  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    // 向主线程发出消息
    self.postMessage(`Time to leave page ${new Date()}`);
    // event.data 即离开页面的倒计时（ms）
  }, event.data);
};
```

如果您的项目基于 Webpack 4.x，那么需要配置 [`worker-loader`](https://github.com/webpack-contrib/worker-loader) 或 [`worker-plugin`](https://github.com/GoogleChromeLabs/worker-plugin) 等 loader 或插件才能通过 `new Worker(url)` 的方式正常引入 Web Worker。

在 React 代码里读取脚本文件，即可创建 Worker 线程并监听它返回的消息：

```tsx
import React, { useEffect } from "react";

/** 离开页面的方法 */
const leavePage = () => {
  // ...离开当前页面的业务代码
};

export default () => {
  useEffect(() => {
    // 新建 Worker 线程
    // const worker = new Worker("path/to/leavePage.worker.js");

    // 向 Worker 线程发出消息，设定 12h 后返回消息
    worker.postMessage(12 * 60 * 60 * 1000);

    // 监听 Worker 返回的消息
    worker.onmessage = (event) => {
      // 一旦接收到消息，执行离开页面的业务代码
      console.log("Received message from worker thread", event.data);
      leavePage();
      // 一旦完成响应，关闭 Worker 线程
      worker.terminate();
    };

    return () => {
      // 页面卸载时关闭 Worker 线程
      worker.terminate();
    };
  }, []);
};
```

对于 Webpack 5.x 以上的项目，Webpack 已内置了对 Web Worker 的支持，可[查阅文档](https://webpack.js.org/guides/web-workers)使用。

### 动态加载的方式

如果不想在 Webpack 上加 loader 或插件，也可以考虑「动态」地加载脚本文件，这需要一点点小技巧。首先将 Worker 包含的具体内容以字符串的形式导出：

```js
// leavePage.worker.js
const leavePageWorker = `
var timer;
self.onmessage = function (event) {
  // ...
};
`;

export default leavePageWorker;
```

在主线程的代码里导入字符串并创建真正的 Worker 线程：

```ts
import LeavePageWorker from "path/to/leavePage.worker.js";

const loadWebWorker = (code: string): Worker => {
  const blob = new Blob(["(" + code + ")()"]);
  return new Worker(URL.createObjectURL(blob));
};

const leavePageWorker = loadWebWorker(LeavePageWorker);
```

需注意的是，使用动态加载的方式意味着 Worker 的代码将不经 Webpack 而直接调用，所以应当使用兼容性更好的「古早 JavaScript 语法」，例如 `var` `function(){}` 等。

由于浏览器的 Content Security Policy (CSP) 策略，通过此方法创建 Worker 可能会失败，可以参考[此介绍](https://stackoverflow.com/questions/30280370/how-does-content-security-policy-csp-work)进行解决。

### Umi 项目的方式

根据 [Umi 文档](https://v3.umijs.org/config#workerloader)，对于 Umi 3.4.1+ 的项目，可以进行如下配置启用对 Web Worker 的支持：

```ts
// config.ts
export default defineConfig({
  workerLoader: {},
});
```

然而 Umi 文档并没有提 Web Worker 的引入方式，不过查阅 [Umi 源码](https://github.com/umijs/umi/blob/3.x/packages/bundler-webpack/src/getConfig/getConfig.ts#L364-L372)发现：

```ts
if (config.workerLoader) {
  webpackConfig.module
    .rule("worker")
    .test(/.*worker.(ts|js)/) // Web Worker 文件命名规则
    .use("worker-loader")
    .loader(require.resolve("@umijs/deps/compiled/worker-loader"))
    .options(config.workerLoader);
}
```

可知 Umi 基于 `worker-loader`，将 `worker.ts` 或 `worker.js` 结尾的文件当作 Web Worker 处理。那么可以这样编写主线程的代码：

```tsx
import React, { useEffect } from "react";
import LeavePageWorker from "path/to/leavePage.worker.js";

export default () => {
  useEffect(() => {
    // 新建 Worker 线程
    const worker: Worker = new LeavePageWorker();

    // 像之前一样监听 worker 事件即可
    // ...

    return () => {
      // 别忘了使用完后关闭 Worker 线程
      worker.terminate();
    };
  }, []);
};
```

Worker 的编译和运行均在后台执行，这意味着即使出现报错也不会显式提醒您。您可以随时在开发者工具里找到编译得到的 Worker 的代码：

![在开发者工具中查看 Worker 源码](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2022/09/21/js-webworker-settimeout/webworker-source.jpg)

对于 Umi 3.4.1 以前版本的项目，可以通过 [`chainWebpack`](https://v3.umijs.org/config#chainwebpack) 添加 `worker-loader` 或 `worker-plugin` 插件的支持。

Umi 4.x 内置 Webpack 5.x 作为默认 Bundler，因此[查阅文档](https://webpack.js.org/guides/web-workers)使用即可。

### 三方库的方式

如果不介意 Web Worker 编写是否原生（笔者从不介意！），更推荐选用封装了 Web Worker 能力的三方库，例如 [`alewin/useWorker`](https://github.com/alewin/useWorker) 和 [`developit/greenlet`](https://github.com/developit/greenlet/) 等。

它们降低了使用 Web Worker 的心智成本，使得调用 Web Worker 就像编写普通的 `async` 异步函数一样；重要的是，不必再担心引入 Web Worker 时带来的各种各样的奇怪问题（CDN 部署时，可能发生同源问题）。

以 `alewin/useWorker` 为例，可以这样改进前面的代码：

```ts
import React, { useEffect } from "react";
import { useWorker } from "@koale/useworker";

/**
 * 休眠 @timeout 毫秒
 */
const setTimeoutAsync = (timeout: number) => {
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      resolve();
    }, timeout)
  );
};

export default () => {
  const [setTimeoutWorker, { kill: killSetTimeoutWorker }] =
    useWorker(setTimeoutAsync);

  useEffect(() => {
    const runLeavePageWorker = async () => {
      await setTimeoutWorker(12 * 60 * 60 * 1000);
      // ... 在此处执行离开页面的业务代码
    };

    runLeavePageWorker();

    return () => {
      killSetTimeoutWorker();
    };
  }, []);
};
```

## 参考文章

- [Web Worker 使用教程 - 阮一峰](https://www.ruanyifeng.com/blog/2018/07/web-worker.html)
- [记一次定时器问题的优雅解决](https://juejin.cn/post/6855583384375132174)
- [web worker onmessage - Uncaught SyntaxError: Unexpected token <](https://stackoverflow.com/questions/49171791/web-worker-onmessage-uncaught-syntaxerror-unexpected-token)
- [Combination of async function + await + setTimeout](https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout)
