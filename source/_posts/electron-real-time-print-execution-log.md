---
title: Electron 执行后台程序并在渲染器实时打印运行日志
date: 2024/8/5
updated: 2024/8/5
categories:
  - 前端开发
tags:
  - Node
  - Electron
  - TypeScript
  - React
---

开发图像查重工具时遇到了这样一个问题：在查重之前，用户需要先对图像文件进行索引操作，后台将调用可执行文件并为每张图像生成特征值。索引操作所需的时间与图像的数量及大小呈正相关，笔者为大约 50000 张图片（约 170GB）生成特征值，需要花费将近 90 分钟的时间。在这种情况下，如果渲染器什么也不展示，卡在那里，用户难免会非常焦虑 —— 后台是否还在运行，我是不是卡死了？

那么需求也就明了了，正如本文的标题所述，我们需要**将后台运行的日志实时推送到渲染器**，这样用户便能看到索引操作的进度，安下心来。

## 技术背景

众所周知，一个 Electron 应用分为了 Renderer 渲染器和 Main 主进程两端。渲染器负责对客侧的展示，正如我们访问的所有网页一样，是 HTML、CSS、JavaScript 的集合，无法调用 Node 或是访问宿主机文件等。而主进程则具备有服务端应用的性质，能够调用 Node 或是与宿主机交互等。

综上所述，为了实现我们的目标，在背后依次要实现这些事情：

1. 渲染器接收用户索引操作的请求，将请求发送至主进程。
2. 主进程接收到请求，调用可执行文件开始生成图像特征值。
3. 主进程将产生的日志信息实时推送给渲染器。
4. 渲染器接收到日志信息，并向用户展示。

## 需求实现

根据刚才的分析，对[进程间通信（Inter-Process Communication，IPC）](https://www.electronjs.org/zh/docs/latest/tutorial/ipc)能力的使用将会是实现需求的关键。

实现的具体方案遵循 Electron 推荐的安全设置即上下文隔离。下面的内容假设您对[预加载器](https://www.electronjs.org/zh/docs/latest/tutorial/process-model#preload-%E8%84%9A%E6%9C%AC)有一定的了解。

### 渲染器将请求发送至主进程

渲染器发送请求至主进程是**渲染器到主进程的单向通信**，具体的实现分成三个步骤：

1. 主进程通过 `ipcMain.on()` 监听请求。

   ```ts
   // main/background.ts
   import { ipcMain } from "electron";

   export enum Events {
     UPDATE_INDEX = "events:updateIndex",
   }

   ipcMain.on(Events.UPDATE_INDEX, (_, args) => {
     // todo: execute binary
   });
   ```

2. 预加载器向渲染器暴露 `ipcRenderer.send()` 方法。

   ```ts
   // main/preload.ts
   import { ipcRenderer, contextBridge } from "electron";

   const ipc = {
     send: (channel: string, ...args: unknown[]) => {
       ipcRenderer.send(channel, ...args);
     },
     // 由于 Electron 的安全机制，您不能直接暴露 `ipcRenderer` 以及上面的方法
     // 错误的例子：
     // send: ipcRenderer.send,
   };

   contextBridge.exposeInMainWorld("ipc", ipc);

   export type IPC = typeof ipc;
   ```

   让 TypeScript 更好地为您工作，别忘了将类型 `IPC` 暴露给 `Window` 对象：

   ```ts
   // renderer/preload.d.ts
   import type { IPC } from "path/to/main/preload";

   declare global {
     interface Window {
       ipc: IPC;
     }
   }
   ```

3. 渲染器实现调用预加载器暴露的方法。

   ```tsx
   // renderer/path/to/component-trigger.tsx
   import { Events } from "path/to/main/background";

   export default () => {
     const onUpdateIndex = () => {
       window.ipc.send(Events.UPDATE_INDEX);
     };

     return <>{/* component details */}</>;
   };
   ```

   再在合适的地方编写触发逻辑，即可将请求发送至主进程。

### 主进程调用可执行文件

接着，让我们来完善主进程的逻辑：在接收到请求后，去调用本地的可执行文件。

在 Node 环境中，我们可以找老朋友 `child_process` 帮忙。`child_process.exec()` 会等待执行结束后将结果一并返回，不满足我们的需要；`child_process.spawn()` 采用事件监听机制，可以应对实时输出日志的情景，满足我们的需要。

基于 `child_process.spawn()` 编写代码如下：

```ts
// main/background.ts
import { spawn } from "child_process";

const runSpawn = (cmd: string, args: string[]) => {
  const process = spawn(cmd, args);

  process.stdout.on("data", (data) => {
    // todo: on receive stdout data
  });

  process.stderr.on("data", (data) => {
    // todo: on receive stderr data
  });

  process.on("close", (code) => {
    // todo: on receive close signal
  });
};

ipcMain.on(Events.UPDATE_INDEX, (_, args) => {
  runSpawn("path/to/binary", ["--update-index", "--rest-args"]);
});
```

### 主进程实时推送日志信息给渲染器

当事件监听器触发时，向渲染器发送日志信息，这是**主进程到渲染器的单向通信**，具体的实现同样分成三个步骤：

1. 主进程通过 `browserWindow.webContents.send()` 发送信息。

   完善前面的 `runSpawn()` 方法：

   ```ts
   // main/background.ts
   import iconv from "iconv-lite";

   export enum SpawnEvents {
     SPAWN_STARTED = "spawn:started",
     SPAWN_STDOUT = "spawn:stdout",
     SPAWN_STDERR = "spawn:stderr",
     SPAWN_FINISHED = "spawn:finished",
   }

   // Compatible with default command line encoding `cp936` on Windows platform
   const iconvDecoding = process.platform === "win32" ? "cp936" : "utf-8";

   const runSpawn = (cmd: string, args: string[]) => {
     const process = spawn(cmd, args);
     browserWindow.webContents.send(SpawnEvents.SPAWN_STARTED);

     process.stdout.on("data", (data) => {
       browserWindow.webContents.send(
         SpawnEvents.SPAWN_STDOUT,
         iconv.decode(Buffer.from(data, "binary"), iconvDecoding),
       );
     });

     process.stderr.on("data", (data) => {
       browserWindow.webContents.send(
         SpawnEvents.SPAWN_STDERR,
         iconv.decode(Buffer.from(data, "binary"), iconvDecoding),
       );
     });

     process.on("close", (code) => {
       browserWindow.webContents.send(SpawnEvents.SPAWN_FINISHED, code ?? 0);
     });
   };
   ```

   特别的，在 Windows 端，由于命令行工具默认采用 `cp936` 编码，在输出中文时会出现乱码的现象。因此，在上面的实现中，笔者使用了 `iconv-lite` 对标准输出、标准错误进行了重新解码。

2. 预加载器向渲染器暴露 `ipcRenderer.on()` 方法。

   ```ts
   // main/preload.ts
   import { type IpcRendererEvent } from "electron";

   const ipc = {
     on: (channel: string, func: (...args: unknown[]) => void) => {
       const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
         func(...args);
       ipcRenderer.on(channel, subscription);

       return () => {
         ipcRenderer.removeListener(channel, subscription);
       };
     },
   };
   ```

   其返回值是清除监听器的方法，可以配合 `React.useEffect()` 使用。

3. 渲染器实现调用预加载器暴露的方法。

   ```tsx
   // renderer/path/to/component-listener.tsx
   import { useEffect, useState } from "react";
   import { SpawnEvents } from "path/to/main/background";

   export default () => {
     const [loading, setLoading] = useState<boolean>(false);
     const [stdout, setStdout] = useState<string>("");
     const [stderr, setStderr] = useState<string>("");

     useEffect(() => {
       const cleanupSpawnStarted = window.ipc.on(
         SpawnEvents.SPAWN_STARTED,
         () => {
           setLoading(true);
         },
       );
       const cleanupSpawnStdout = window.ipc.on(
         SpawnEvents.SPAWN_STDOUT,
         (data: string) => {
           setStdout(data);
         },
       );
       const cleanupSpawnStderr = window.ipc.on(
         SpawnEvents.SPAWN_STDERR,
         (data: string) => {
           // setStderr(data);
           setStderr((prev) => {
             return (data + "\n" + prev).substring(0, 2000);
           });
         },
       );
       const cleanupSpawnFinished = window.ipc.on(
         SpawnEvents.SPAWN_FINISHED,
         (code: number) => {
           setLoading(false);
         },
       );

       return () => {
         cleanupSpawnStarted();
         cleanupSpawnStdout();
         cleanupSpawnStderr();
         cleanupSpawnFinished();
       };
     }, []);

     return <>{/* component details */}</>;
   };
   ```

   一般来说，可执行文件会将日志信息重定向至 `stderr` 标准错误，运行的最终结果重定向至 `stdout` 标准输出。在本文中，我们需要展示的是 `stderr` 的内容。

   如果渲染器还需要对 `stdout` 的结果进行下一步处理，同样可以在对应的组件中添加监听器：`window.ipc.on(SpawnEvents.SPAWN_STDOUT, (data: string) => {})`。

### 渲染器展示接收到的日志信息

现在，所有的链路都已经打通，查收编写代码努力的结晶吧！

![实时展示日志信息](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240804/electron-real-time-print-execution-log/real-time-execution-log.gif)
