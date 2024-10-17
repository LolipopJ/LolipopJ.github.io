---
title: 从同步 QQ 空间说说到前端呈现，我都做了些啥
date: 2024/10/17
updated: 2024/10/17
categories:
  - 全栈开发
tags:
  - React
  - TypeScript
  - Node
  - ffmpeg
---

最近在捣腾我的 Timeline 时间线项目，希望将我在不同平台上的发言和活跃记录同步过来，在独立的站点上按照创建时间倒序呈现。

过去，我尝试把这个想法放到 Telegram 上实现，把发言和记录同步到我的频道上。但是格式转换的繁杂以及自由度上的限制让我大费周章，加之增量开设的同步内容会以消息的方式一条一条添加到末尾，无法按时间排序，最终我放弃了这个方案。

言归正传，在项目开发的过程中，我遇到的一个相对复杂的场景即 QQ 空间说说的同步。本文事无巨细地记录下我在处理 QQ 空间说说同步的过程中，做了哪些工作，希望为有相应需求的厚米们带来一些灵感。

## 同步 QQ 空间说说

### 同步方案的探索与确定

非常自然而然的，笔者设想使用 Puppeteer 模拟用户操作，打开 QQ 空间网页端，输入账号和密码，进入到个人主页，根据 DOM 结构爬取得到说说的信息。同样非常自然而然的，在切换登录模式（从二维码登录到账号密码登录）步骤就卡着了，模拟点击切换登录模式按钮无效。笔者并非爬虫专家，没有此类问题的对抗经验，在搜索无果后无奈放弃。再想到后续可能还要处理登录安全验证，或处理别的防爬手段，判断 Puppeteer 的方案其实并不合适 QQ 空间说说的同步。

于是想到接口的方案，模拟登录请求，并把返回的 Cookies 塞给获取说说信息的请求。查看网络请求可知，H5 端的 QQ 空间使用 `https://h5.qzone.qq.com/webapp/json/mqzone_feeds/getActiveFeeds` 接口拉取说说信息，然而同时也发现请求路径里包含了两个不存在于 Cookies 的参数：`qzonetoken` 和 `g_tk`，它是通过某种特殊算法在前端生成的！

既然是前端生成的，那么算法一定有迹可循，求助于搜索引擎果然找到了 `g_tk` 的生成算法。

在搜索的过程中，还发现大家一般通过 `https://user.qzone.qq.com/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6` 接口拉取说说说信息；另外在 Github 上找到了一个高星标的 Python 实现 [GetQzonehistory](https://github.com/LibraHp/GetQzonehistory)，可以基于它改巴改巴实现 Node.js 版本。

至此，同步方案得到了确定（毕竟实现好的 GetQzonehistory 珠玉在前），我们将通过接口的方式拉取说说信息。

### 登录方案的确定与实现

现在开始实现 QQ 空间登录的功能，翻看 GetQzonehistory 源码，发现其采用了扫码登录的实现方式，这应当是有所考量的，可以绕过登录安全验证等棘手的问题，当然也存在无法自动化同步任务的问题。

考虑到发空间说说并不是一个高频行为，在想要同步时手动扫码是可接受的，遂沿用了**扫码登录**的实现。整体流程如下：

1. 用户端：访问获取登录二维码页面。
2. 服务端：请求 `https://ssl.ptlogin2.qq.com/ptqrshow` 接口获取登录二维码，从响应的 Cookies 里获取 `qrsig`。将登录二维码返回给用户。
3. 服务端：轮询请求 `https://ssl.ptlogin2.qq.com/ptqrlogin` 得到扫码结果，请求的路径参数 `ptqrtoken` 基于上一步得到的 `qrsig` 生成，生成算法如下：

   ```ts
   const getPtqrToken = (qrSig: string) => {
     let ptqrToken = 0;

     for (let i = 0; i < qrSig.length; i += 1) {
       ptqrToken += (ptqrToken << 5) + qrSig.charCodeAt(i);
     }

     return 2147483647 & ptqrToken;
   };
   ```

4. 用户端：使用手机扫码并确认登录。
5. 服务端：轮询响应包含 `登录成功` 字段，获取响应体里 `ptsigx` 和响应 Cookies 里键 `uin` 的值。
6. 服务端：将上一步得到的 `ptsigx` 和 `uin` 作为请求 `https://ptlogin2.qzone.qq.com/check_sig` 的路径参数。请求成功，响应为 302 状态码，将响应的 Cookies 保存到本地，此即为所需的用户登录态 Cookies。

### 同步方案的实现

登录态 Cookies 已解决，同步的具体实现也就轻而易举了。流程如下：

1. 读取保存在本地的用户登录态 Cookies，获取 `p_skey` 键对应的值，基于它生成 `g_tk`，生成算法如下：

   ```ts
   const getGTk = (pSkey: string) => {
     let gTk = 5381;

     for (let i = 0; i < pSkey.length; i += 1) {
       gTk += (gTk << 5) + pSkey.charCodeAt(i);
     }

     return gTk & 2147483647;
   };
   ```

2. 请求 `https://user.qzone.qq.com/proxy/domain/taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6` 接口，将 `g_tk` 作为路径参数。此外由 `pos` 指定查询偏移量，`num` 指定查询条数。
3. 从响应里提取说说的具体信息，通过 `JSON.parse()` 方法转换为 JSON 格式做进一步处理。其格式定义简略表示如下：

   ```ts
   interface QZoneInfo {
     code: number;
     logininfo: {
       /** 用户名 */
       name: string;
       /** QQ 号 */
       uin: number;
     };
     /** 说说列表 */
     msglist: QZoneTalk[];
     /** 说说总数 */
     total: number;
   }

   interface QZoneTalk {
     /** 评论列表 */
     commentlist?: QZoneTalkComment[];
     /** 说说内容 */
     content: string;
     /** 创建时间(s) */
     created_time: number;
     /** 上次修改时间(s)。默认值为 0 */
     lastmodify: number;
     /** 定位信息 */
     lbs: {
       name: string;
       pos_x: string;
       pos_y: string;
     };
     name: string;
     /** 说说图片附件（仅有图片或同时包含图片和视频时，使用该字段） */
     pic?: QZoneTalkPic[];
     /** 是否私密 */
     secret: 0 | 1;
     /** 说说 ID */
     tid: string;
     uin: number;
     /** 说说视频附件（仅有视频时，使用该字段） */
     video?: QZoneTalkVideo[];
   }
   ```

4. 根据自身需要处理得到的说说结果，完成同步的需求。

## 说说视频播放优化

笔者心满意足地浏览着呈现在时间线项目里的 QQ 空间说说，兴趣盎然地点击了一个以前上传的视频，视频却在笔者焦虑地等待十多秒后才开始播放。这下子笔者知道又有新的问题要解决了 —— 怎么实现视频的边下载边播放？

求助于搜索引擎，得知 `.mp4` 格式的视频文件本来是可以边下载边播放的。如果不能边下载边播放，则说明描述它的**视频格式信息元数据**被放置到了视频文件的中间或末尾。一个简单且常用的处理方案是使用 [`qt-faststart`](https://github.com/danielgtaylor/qtfaststart) 工具，将这些元数据移动到视频文件的头部。

笔者在导出说说后，发现同时包含有 `.mp4` 和 `.m3u8`（播放列表文件，需要把里面包含的视频片段文件下载到本地，不然无法正常播放）两种格式的文件。经过复杂且折腾的思想斗争后，笔者决定使用 [`ffmpeg`](https://ffmpeg.org) 工具，将所有 `.mp4` 格式的视频文件转换为 `.m3u8` 格式，完成格式上的统一与边下载边播放的需求。

> 与传统的视频格式不同，M3U8 视频格式将整个视频分成**多个小片段**进行传输，这些小片段可以根据网络情况自动调节其质量和大小。这种方式使得 M3U8 视频格式非常适合在网络环境不稳定或带宽不足的情况下播放视频。

### 服务端转换视频文件为 `.m3u8` 格式

服务端安装使用 `ffmpeg` 所需的依赖：

```bash
yarn add fluent-ffmpeg ffmpeg-static
```

其中 `ffmpeg-static` 在安装时会自动下载一个编译好的 `ffmpeg` 二进制文件到本地，供 `fluent-ffmpeg` 使用：

```ts
import pathToFfmpeg from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";

Ffmpeg.setFfmpegPath(pathToFfmpeg);
```

将 `.mp4` 文件转换为 `.m3u8` 格式，可编写如下代码：

```ts
const convertVideoToM3u8 = (videoFilePath: string, outputFilePath: string) => {
  Ffmpeg(videoFilePath)
    .outputFormat("hls")
    .outputOptions(["-hls_list_size 0", "-hls_allow_cache 1"])
    .output(outputFilePath)
    .run();
};
```

其中 `outputOptions()` 的完整参数列表定义可以[在这里](https://ffmpeg.org/ffmpeg-formats.html#hls-2)找到。`-hls_list_size` 配置保留的视频片段数量，此处的视频格式转换并非直播场景，因此需要设为 `0`；`-hls_allow_cache` 即是否允许客户端缓视频片段，设为允许；另外 `-hls_time` 可以配置每个视频片段的长度，默认值为 `2`（秒），此处保持默认。

转换后的结果如下图所示：

![m3u8-results](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20241016/sync-qzone-talks/m3u8-results.png)

特别的，如果机器的运行内存不足够批量处理多个视频文件，建议封装一个串行执行 Promise 任务的方法（最近一次面试遇到的题目，居然即刻在自己的项目里用上👍🏼），依次执行转换任务，避免内存溢出导致的程序异常跳出。可参考笔者的实现：

```ts
const createPromiseQueue = () => {
  const queue: (() => Promise<void>)[] = [];
  let isProcessing = false;

  const processQueue = async () => {
    if (isProcessing) return;
    isProcessing = true;

    while (queue.length > 0) {
      const task = queue.shift();
      try {
        await task?.(); // 执行任务
      } catch (error) {
        console.error("Queue task failed:", error);
      }
    }

    isProcessing = false; // 处理完成
  };

  return (promiseFunction: () => Promise<void>) => {
    queue.push(promiseFunction);
    processQueue();
  };
};

const addToConvertQueue = createPromiseQueue();

const convertVideoToM3u8 = (videoFilePath: string, outputFilePath: string) => {
  addToConvertQueue(
    () =>
      new Promise((resolve, reject) => {
        Ffmpeg(videoFilePath)
          .outputFormat("hls")
          .outputOptions(["-hls_list_size 0", "-hls_allow_cache 1"])
          .output(outputFilePath)
          .on("end", () => {
            resolve();
          })
          .on("error", (error) => {
            reject(error);
          })
          .run();
      }),
  );
};
```

### 客户端播放 `.m3u8` 格式视频支持

浏览器自带的 `<video>` 标签并不原生支持播放 `.m3u8` 格式的视频，这里笔者引入了 [`video.js`](https://videojs.com/) 库实现播放功能。基于官方提供的[代码片段](https://videojs.com/guides/react/)，改巴改巴实现为自己的：

```tsx
import { useEffect, useRef } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";

export interface VideoPlayerProps {
  id: string;
  options: {
    sources: { src: string; type?: string }[];
    controls?: boolean;
    poster?: string;
    preload?: "auto" | "metadata" | "none";
    [key: string]: unknown;
  };
  className?: string;
  onReady?: (player: Player) => void;
}

/** https://videojs.com/guides/react/ */
export const VideoPlayer = (props: VideoPlayerProps) => {
  const { id, options, className = "", onReady } = props;

  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-default-skin", "vjs-big-play-centered");
      videoElement.dataset.setup = '{"fluid": true}';
      videoRef.current.appendChild(videoElement);

      // @ts-expect-error: playerRef is writable
      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log(`Video player for ${id} is ready.`);
        onReady?.(player);
      }));
    }
  }, [id, onReady, options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        // @ts-expect-error: playerRef is writable
        playerRef.current = null;
        videojs.log(`Video player for ${id} is disposed.`);
      }
    };
  }, [id, playerRef]);

  // 离开视野后自动暂停播放
  useEffect(() => {
    const video = videoRef.current;
    const player = playerRef.current;

    if (video && player) {
      const pauseObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
          player.pause();
        }
      });
      pauseObserver.observe(video);
      return () => {
        pauseObserver.unobserve(video);
      };
    }
  }, [videoRef, playerRef]);

  return <div data-vjs-player ref={videoRef} className={className} />;
};

export default VideoPlayer;
```

一切就绪，再次点击视频，缓冲条如预期般一节节加载，实现了视频的边下载边播放，可喜可贺可喜可贺！

### 客户端构建体积（首屏速度）优化

如果您已经具备了一定的前端开发经验，就会对打包进项目的三方库非常敏感：打包未经（或无法）按需引入优化的三方库，意味着将三方库的全部代码塞到项目中，将导致项目的构建后体积大幅增长。在上一节中，笔者为了兼容 `.m3u8` 格式视频的播放，引入了广泛用于视频网站的 `video.js` 库，构建播放说说视频的组件。而它就是无法按需引入的三方库，打包后的代码体积因而大幅增长：

```plaintext
Route (app)                              Size     First Load JS
┌ ○ /                                    217 kB          338 kB
└ ○ /_not-found                          873 B          88.1 kB
+ First Load JS shared by all            87.3 kB
  ├ chunks/364-54e0b660da1a9f95.js       31.7 kB
  ├ chunks/618f8807-5ab9f851e4f8eeba.js  53.6 kB
  └ other shared chunks (total)          1.96 kB
```

并非每一个站长都会配置包含视频的时间线源（例如本文的 QQ 空间），首屏加载的时间线内容也并非一定包含视频内容，如果一股脑地将 `video.js` 打包在首屏 JS 代码内，势必无法带来最好的访问体验。

幸运的是，`next.js` 已经内置了动态引入组件的方法 `dynamic()`，如果要动态引入使用到 `video.js` 库的 `<VideoPlayer>` 组件，只需要编写如下代码：

```tsx
import dynamic from "next/dynamic";
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"));
```

如是优化后，首屏加载的 JS 体积自 `338 kB` 降至 `142 kB`。等到用户遇到包含视频的时间线内容时，才会加载与视频播放相关的 JS 资源，实现了对访问体验的优化。

```plaintext
Route (app)                              Size     First Load JS
┌ ○ /                                    20.4 kB         142 kB
└ ○ /_not-found                          873 B          88.2 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/364-54e0b660da1a9f95.js       31.7 kB
  ├ chunks/618f8807-5ab9f851e4f8eeba.js  53.6 kB
  └ other shared chunks (total)          2.06 kB
```
