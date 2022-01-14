---
title: 这位客官，要来一张我珍藏许久的图片吗
date: 2022/1/13
updated: 2022/1/13
categories:
  - 后端开发
tags:
  - Telegram
  - Bot
  - Node
  - Koa
---

笔者自高中到现在，游走于 Pixiv 若干载，不慎收藏了许多名家雅作。

独乐乐不如众乐乐！笔者想做一个 web 页面来随机访问我的收藏，不过在此之前，可以先实现服务端上的内容。再之后做网页时，不过是简单的读取数据库罢了！

最初，笔者以为得将我的库存全部放到服务器上项目中去，然后随机访问其中的图片实现功能，但这样做很难得同步，遂搁置。不过，笔者在最近发现有一个 [Pixiv 图片代理网站](https://pixiv.re/) 可以快速下载到图片，大喜，于是开始了这个小工程。

![请求需包含 Referer](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2022/01/12/random-get-me-a-picture/pixiv-cat.png)

实现此功能分为两个阶段：一，为本地的图片生成数据库索引条目。二，开发 Telegram Bot 接口，随机从数据库索引中获取一张图片转发给聊天。

## 为本地的 Pixiv 图片建立索引

### 初始化数据库 Pixiv 图片索引信息

如果使用 Pixiv 图片代理的方法，只需要将 Artwork 的基本信息上传给我们的数据库即可。

根据[官方文档](https://core.telegram.org/bots/api#sending-files)，当发送图片文件时，Telegram API 对图片的大小有限制：直接使用 HTTP URL 的方式不超过 5 MB，服务器上传图片的方式不超过 10 MB（以[文件的格式](https://core.telegram.org/bots/api#senddocument)发送时，不超过 50 MB，本文不采用文件的格式发送）。因此，在设计数据库时，还需要考虑图片的大小。

设计 Sequenlize 数据库模型 `ServicePixivCollection.js` 如下：

```js
const { DataTypes } = require("sequelize");

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Pixiv artwork ID. Example: 95400283 for for 95400283_p${picIndex}.${picType}
  picId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Artwork index. Example: 1 for ${pixivId}_p1.${picType}
  picIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Artwork suffix type. Example: jpg for ${pixivId}_p${picIndex}.jpg
  picType: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Artwork size, MB
  picSize: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Artwork save date
  picCreatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
};
```

如采用最小实现，也可以将上面的 `picId`, `picIndex` 和 `picType` 合并为一个数据项，例如 `picName`，直接保存图片的名字。笔者考虑到后续可能会增添新的功能，于是将它们单独拎出来储存。

处理不同路径下的图片时，可能需要保存执行的情况。例如 A 目录在当前时间点进行维护，获取了所有的图片，下次读取 A 目录时，应当从上次维护的时间开始获取最新的图片。现在新加了 B 目录，如果从上次维护 A 的时间点开始读取图片的话，在时间点之前的图片将无法上传。因此，针对不同文件夹的维护，可以分别建立一个单独的数据项。

设计数据库模型 `ServiceProcess.js` 如下：

```js
const { DataTypes } = require("sequelize");

module.exports = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  serviceId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  serviceName: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  serviceConfig: {
    type: DataTypes.TEXT,
  },
  serviceSharedData: {
    type: DataTypes.TEXT,
  },
  lastExecAt: {
    type: DataTypes.DATE,
  },
  haveExecTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
};
```

为 Sequelize 添加该模型，向 `sequelize.js` 添加如下代码：

```js
const servicePixivCollectionModel = require("path/to/ServicePixivCollection");
const serviceProcessModel = require("path/to/ServiceProcess");

sequelize.define("ServicePixivCollection", servicePixivCollectionModel);
sequelize.define("ServiceProcess", serviceProcessModel);
```

配置扫描图片的间隔时间和本地图片路径，编写 `config.js` 如下:

```js
module.exports = {
  pixiv: {
    randomGetFromCollection: {
      duration: 3600,
      path: ["C:\\path\\to\\collection"],
    },
  },
};
```

扫描指定目录的图片文件，图片文件名称应满足从 Pixiv 下载图片的名称格式。例如：`95400283_p0.jpg`，`95400283` 为数据库中的 `picId`，`_p0` 的 `0` 为 `picIndex`，`.jpg` 中的 `jpg` 为 `picType`。编写生成图片索引的代码 `pixiv.js` 如下：

```js
const { readdir, stat } = require("fs/promises");
const path = require("path");

const config = require("path/to/config").pixiv;

const Sequelize = require("path/to/sequelize");

const generateCollectionIndex = async function () {
  const serviceName = "Generate Collection Index";
  const bToMB = 1024 * 1024;

  // File size with decimal places
  const fileSizeReservedDecimalPlace = 3;
  const fileSizeReservedDecimalNum = 10 ** fileSizeReservedDecimalPlace;

  const sequelize = await Sequelize();
  const ServicePixivCollection = sequelize.models.ServicePixivCollection;
  const ServiceProcess = sequelize.models.ServiceProcess;

  let collectionPaths = config.generateCollectionIndex.path;
  if (!Array.isArray(collectionPaths)) {
    collectionPaths = [collectionPaths];
  }

  // Get filenames in collection paths
  let allFiles = [];
  for (const collectionPath of collectionPaths) {
    let files = [];
    files = files.concat(await readdir(collectionPath));

    // Only keep files with Pixiv naming style
    const reg = /^\d+_p\d+.(jpg|png|gif)$/;
    files = files.filter((filename) => {
      return reg.test(filename);
    });

    // Get file stat and resolve file info
    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const filePath = path.join(collectionPath, filename);

      const picIdSplitArr = filename.split("_p");
      const picId = Number(picIdSplitArr[0]);

      const picIndexSplitArr = picIdSplitArr[1].split(".");
      const picIndex = Number(picIndexSplitArr[0]);

      const picType = picIndexSplitArr[1];

      const picStat = await stat(filePath);
      const picSize =
        Math.floor((picStat.size / bToMB) * fileSizeReservedDecimalNum) /
        fileSizeReservedDecimalNum; // MB
      const picCreatedAt = picStat.mtimeMs; // ms

      files[i] = {
        picName: filename,
        picId,
        picIndex,
        picType,
        picSize,
        picCreatedAt,
      };
    }

    // Only keep files that recently saved
    const serviceProcess = await ServiceProcess.findOne({
      where: { serviceName, serviceConfig: collectionPath },
    });
    if (serviceProcess) {
      // Only update or create Pixiv artwork that saved after last time this service is done
      let lastUpdateIndexTime = serviceProcess.dataValues.lastExecAt;
      if (lastUpdateIndexTime) {
        lastUpdateIndexTime = new Date(lastUpdateIndexTime).getTime();
        files = files.filter((pic) => {
          return pic.picCreatedAt > lastUpdateIndexTime;
        });
      }
    } else {
      await ServiceProcess.create({
        serviceName,
        serviceConfig: collectionPath,
      });
    }

    allFiles = allFiles.concat(files);
  }

  const updateIndexAt = new Date().toISOString();

  // Update or create pic index
  for (const picFile of allFiles) {
    // 注意：此处的 updateOrCreate() 为笔者自定义的方法
    // 其作用为：当存在 item 时，更新 item；不存在时，创建 item
    await sequelize.updateOrCreate(
      ServicePixivCollection,
      {
        picId: picFile.picId,
        picIndex: picFile.picIndex,
      },
      picFile
    );
  }

  // Update service process record
  ServiceProcess.update(
    {
      lastExecAt: updateIndexAt,
    },
    {
      where: { serviceName },
    }
  );
  ServiceProcess.increment("haveExecTime", { where: { serviceName } });
};

module.exports = {
  generateCollectionIndex,
};
```

设置定时扫描图片，基于 `toad-scheduler` 库编写服务代码如下：

```js
const {
  ToadScheduler,
  SimpleIntervalJob,
  AsyncTask,
} = require("toad-scheduler");

const pixivTask = require("path/to/pixiv");
const config = require("path/to/config").pixiv;

const initService = async function () {
  const taskGenerateCollectionIndex = new AsyncTask(
    "Generate Pixiv Collection Index",
    async () => {
      await pixivTask.generateCollectionIndex();
    },
    (error) => {
      console.error(error);
    }
  );
  const jobGenerateCollectionIndex = new SimpleIntervalJob(
    {
      seconds: config.generateCollectionIndex.duration,
      runImmediately: true,
    },
    taskGenerateCollectionIndex
  );

  const scheduler = new ToadScheduler();
  scheduler.addSimpleIntervalJob(jobGenerateCollectionIndex);
};

module.exports = initService;
```

程序启动时，运行 `initService()` 即可。服务器将自动读取指定目录下的 Pixiv 图片文件，并在数据库中建立索引。[下一步](#随机获取数据库中的一个-pixiv-图片访问地址)，我们将随机从数据库中读取一张作品的信息。

### 思路：爬取 Pixiv 图片的源文件地址

如果使用亲自获取图片并转发的方法，除了前面需要初始化数据库的图片索引信息外，还需要构建 Axios 请求，爬取网页源代码，从中读取 Artwork 的下载链接等信息，再上传到数据库。

例如，对于下载 [`95400283_p0.jpg`](https://www.pixiv.net/artworks/95400283)，最少需要获取其源文件链接 `https://i.pximg.net/img-original/img/2022/01/09/07/27/17/95400283_p0.jpg` 中的 `/2022/01/09/07/27/17` 部分，并上传到数据库中。

更多的，在爬取源代码时，可以记录下图片的作者信息，图片是否可以在工作时安全观看（登录后才能爬取此类内容，可能需要在请求时添加个人账户信息）等，对日后处理展示内容大有裨益。

处理网页源代码时，可以使用 [cheerio](https://github.com/cheeriojs/cheerio) 库增加效率。

## 为 Telegram Bot 添加随机获取 Pixiv 图片的接口

### 随机获取数据库中的一个 Pixiv 图片访问地址

编写 `randomGetPixivCollection.js` 代码如下：

```js
const Sequelize = require("path/to/sequelize");

const randomGetPixivCollection = async function () {
  try {
    const sequelize = await Sequelize();
    const ServicePixivCollection = sequelize.models.ServicePixivCollection;

    // Gain the total number of Pixiv artworks
    const artworksCount = await ServicePixivCollection.count();

    // Generate a random value
    const randomArtworkId = Math.floor(Math.random() * artworksCount) + 1;

    // Get random artwork
    const artwork = await ServicePixivCollection.findOne({
      where: { id: randomArtworkId },
    });

    // Resolve artwork object
    const data = artwork.dataValues;

    const picId = data.picId;
    const picIndex = data.picIndex;
    const picType = data.picType;

    data.picName = `${picId}_p${picIndex}.${picType}`;
    data.picNameMD = `${picId}\\_p${picIndex}\\.${picType}`;
    data.picUrl = `https://www.pixiv.net/artworks/${picId}`;

    let picProxyUrlParam;
    if (picIndex > 0) {
      picProxyUrlParam = `${picId}-${picIndex + 1}.${picType}`;
    } else {
      picProxyUrlParam = `${picId}.${picType}`;
    }
    data.picProxyUrl = `https://pixiv.cat/${picProxyUrlParam}`;

    return {
      ok: true,
      data,
      error: undefined,
    };
  } catch (error) {
    return {
      ok: false,
      data: undefined,
      error,
    };
  }
};

module.exports = randomGetPixivCollection;
```

根据 Pixiv.cat 网站的使用说明，对单张图片的 Pixiv 作品，应访问 `https://pixiv.cat/${picId}.${picType}`。而对于多张图片的 Pixiv 作品（漫画），应访问 `https://pixiv.cat/${picId}-${picIndex + 1}.${picType}`。

可能会影响体验，需要改进的地方是：当作品名为 `${picId}_p0.${picType}` 时，我们不知道该作品是否为单张图片，还是漫画作品，无法正确判断应该访问的 URL 链接。[在后面](#直接使用-pixiv-图片代理)，我们将针对此情况做处理。

### 添加 Telegram Bot 命令

接下来为 Bot 添加指令，以调用随机获取图片的接口。同样，这里给出使用 Pixiv 图片代理的具体实现，以及亲自获取图片并转发的可能思路。

#### 直接使用 Pixiv 图片代理

注意，使用这种方式上传的图片**不超过 5 MB**。

编写 Bot 的配置如下：

```js
bot.onText(/\/random_pixiv/, async (msg) => {
  const chatId = msg.chat.id;

  const res = await randomGetPixivCollection();
  if (res.ok === true) {
    // Send placeholder message
    const placeholderMessage = await bot.sendMessage(
      chatId,
      `Geeeeting a random Pixiv artwork ...`
    );

    const data = res.data;

    const caption = `Pixiv Artwork: ${data.picNameMD}\n[source](${data.picUrl}) \\| powered by [pixiv\\.cat](https://pixiv.cat/)`;

    if (data.picSize >= 5) {
      // Artwork size is not smaller than 5 MB, send caption message
      await bot.sendMessage(chatId, caption, {
        parse_mode: "MarkdownV2",
        disable_web_page_preview: false,
      });
    } else {
      // Artwork size is smaller than 5 MB, send photo message
      const sendPhotoOptions = {
        caption,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      };
      try {
        await bot.sendPhoto(chatId, data.picProxyUrl, sendPhotoOptions);
      } catch (err) {
        try {
          // Comic mode artwork with index=0 may send failed
          // Use comic mode url instead
          const picProxyUrl = `https://pixiv.cat/${data.picId}-1.${data.picType}`;
          await bot.sendPhoto(chatId, picProxyUrl, sendPhotoOptions);
        } catch (err) {
          // If failed again, send caption message
          await bot.sendMessage(chatId, caption, {
            parse_mode: "MarkdownV2",
            disable_web_page_preview: false,
          });
        }
      }
    }

    // Remove placeholder message
    bot.deleteMessage(chatId, placeholderMessage.message_id);
  } else {
    bot.sendMessage(
      chatId,
      "Get random pixiv artwork failed. You may try to call it again later!"
    );
  }
});
```

在上面这段代码中，当以 `bot.sendPhoto()` 的方法尝试发送 5 MB 以下的图片失败时，首先重新构建请求 URL 为 `https://pixiv.cat/${data.picId}-1.${data.picType}`，再次进行发送。如果还是失败（可能图片被作者删除），则发送简单的链接文本。由此，解决了前面提到的无法判断作品是否为漫画作品的问题。

与 Telegram 上的机器人对话，发送命令 `\random_pixiv`，结果如下：

![Bot service](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2022/01/12/random-get-me-a-picture/bot-service.png)

#### 思路：获取 Pixiv 图片并转发

注意，使用这种方式上传的图片**不超过 10 MB**。

我们无法直接在 `bot.sendPhoto()` 方法中使用 Pixiv 源站图片的获取链接，这是因为 Pixiv 设置了反爬虫机制，只接收请求头的 Referer 包含 `https://www.pixiv.net/` 的请求。

![请求需包含 Referer](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2022/01/12/random-get-me-a-picture/pixiv-request-referer.png)

因此，我们需要在自己的服务器上构造 Axios 请求，设置 Referer 请求头，然后发送请求向 Pixiv 服务器获取图片，再将图片转为 `multipart/form-data` 格式发送给 Telegram 会话。

## 为 Koa 添加随机获取 Pixiv 图片的接口

Koa 应用程序本身也提供了路由功能，在这里可以很轻松地将获取随机 Pixiv 图片的服务对接到 Koa 上去。

编写路由文件如下：

```js
const router = require("koa-router")();

const randomGetPixivCollection = require("path/to/randomGetPixivCollection");

router.get("/random", async function (ctx) {
  const res = await randomGetPixivCollection();
  if (res.ok === true) {
    ctx.redirect(res.data.picProxyUrl);
  } else {
    ctx.body = "Get random Pixiv artwork failed.";
  }
});

module.exports = router;
```

然而，这里并没有解决前面提到的漫画作品问题，留待用户在跳转后自行操作。

## 参考文章

- [爬取 pixiv 每日推荐](https://blog.csdn.net/weixin_45826022/article/details/109406389)
