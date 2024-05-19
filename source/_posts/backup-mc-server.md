---
title: 基于原生 Node 备份软路由上的 Minecraft 服务器存档，并通过 Alist 上传到云端
date: 2024/5/11
updated: 2024/5/19
categories:
  - 后端开发
tags:
  - Minecraft
  - Linux
  - Node
  - JavaScript
  - OpenWRT
  - Alist
---

笔者最近在 OpenWRT 软路由上部署了一个 Minecraft 服务器，出于对数据安全的焦虑，于是折腾了一下存档备份的相关事宜，记录为此文。

在 CurseForge 等模组站上已有方便好用的 Minecraft 服务器存档备份插件，除非您喜欢折腾或高自由度的定制，不用像笔者这样编写一整个脚本。

完整的脚本[可见此](https://github.com/LolipopJ/LolipopJ.github.io/blob/master/static/scripts/backup-mc-server.js)。

## 编写备份脚本

### 前置准备

为了脚本编写方便，约定应该在 Minecraft 服务器的根目录执行脚本。校验当前脚本的执行目录：

```js
const cwd = process.cwd();
if (!fs.existsSync(path.resolve(cwd, "eula.txt"))) {
  throw new Error(
    "You should execute this script at root dir of MineCraft server where `eula.txt` exists.",
  );
}
```

支持指定备份文件存储的目录 `BACKUP_DIR`，同时 `checkupDir()` 确保目录存在：

```js
const BACKUP_DIR = "backups";

const checkupDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const backupDir = path.resolve(cwd, BACKUP_DIR);
checkupDir(backupDir);
```

### 生成备份文件

支持指定备份文件的列表，除了最重要的 `world/` 以外，还可以备份 `server.properties`、`world_nether/` 和 `world_the_end/` 等文件或目录。

```js
const BACKUP_FILES = [
  "banned-ips.json",
  "banned-players.json",
  "config",
  "ops.json",
  "server.properties",
  "whitelist.json",
  "world",
  "world_nether",
  "world_the_end",
];

const resolvedBackupFiles = BACKUP_FILES.filter((file) => {
  if (fs.existsSync(path.resolve(cwd, file))) {
    return true;
  }
  return false;
});
```

原生 Node 并没有提供打包压缩的方法，为了避免引入其它的依赖，考虑使用系统自带的 `tar` 命令实现。为此，需要使用到 Node 的 `child_process`：

```js
const child_process = require("child_process");
const util = require("util");
const spawn = util.promisify(child_process.spawn);
```

现在，可以通过 `spawn()` 来执行系统上的命令了。可编写文件备份方法如下：

```js
const backupFilename = genFilename(); // 省略文件名生成方法...
await spawn(`tar -czvf ${backupFilename} ${resolvedBackupFiles.join(" ")}`);
```

到此为止，已经能够将所需的 Minecraft 服务器存档文件打包压缩，备份到系统本地了。

### 移除历史备份文件

即使每天执行一次备份任务，长久累积也将占用大量的空间，更何况一个备份的大小已然几百 MB 起步。因此需考虑本地保留的备份文件数量，及时移除历史的备份文件。

首先需要获取备份目录下已有的备份文件信息：

```js
const filenames = fs.readdirSync(backupDir);
const backupFileList = filenames.map((filename) =>
  fs.statSync(path.resolve(backupDir, filename)),
);
```

支持指定保存的备份文件数量，得到需要移除的文件列表：

```js
const BACKUP_MAX_NUM = 7; // 保留最新的 N 个备份文件，此处为 7 个

const backupFiles = backupFileList
  .filter((file) => file.isFile())
  .sort((a, b) => {
    return b.mtimeMs - a.mtimeMs;
  });
const oldBackupFiles = backupFiles.slice(BACKUP_MAX_NUM);
```

移除这些文件即可：

```js
const oldBackupFilenames = oldBackupFiles.map((file) => file.name);
oldBackupFilenames.forEach((filename) => {
  fs.rmSync(path.resolve(backupDir, filename));
});
```

这样在每次执行脚本时，都会自动清理掉本地多余的备份文件，保证文件系统容量健康。

## 设置定时任务

基于 `crontab` 实现定时任务调度，使用 `crontab -e` 命令编写任务列表：

```bash
0 4 * * * cd /path/to/mc-server && node /path/to/backup-mc-server.js
```

笔者发现定时任务实际执行时间是正午 12 点，而非预期的凌晨 4 点，推测系服务器使用的 UTC 时区导致。

尽管配置了 OpenWRT 的时区为 `Asia/Shanghai`，但仍然不生效：

```bash
$ date -R
Wed, 15 May 2024 07:00:00 +0000
```

笔者通过安装 `zoneinfo-asia` 解决了问题：

```bash
$ opkg update
$ opkg install zoneinfo-asia
Installing zoneinfo-asia (2023c-2) to root...
Downloading https://mirrors.vsean.net/openwrt/releases/23.05.2/packages/x86_64/packages/zoneinfo-asia_2023c-2_x86_64.ipk
Installing zoneinfo-core (2023c-2) to root...
Downloading https://mirrors.vsean.net/openwrt/releases/23.05.2/packages/x86_64/packages/zoneinfo-core_2023c-2_x86_64.ipk
Configuring zoneinfo-core.
Configuring zoneinfo-asia.
$ /etc/init.d/system restart
$ date -R
Wed, 15 May 2024 15:00:00 +0800
```

这样，在北京时间凌晨 4 点，系统将自动调用备份脚本。如果彼时仍有用户在游玩，脚本可能会运行失败，可以在执行脚本之前关闭 Minecraft 服务器，完成后重新启动。

## （可选）通过 Alist 上传到云端

> 为了这盘醋，包了这顿饺子。

万一硬盘挂了呢？笔者认为保存在软路由本地丝毫没有安全感，于是决定在备份后即时上传到云端。

笔者已经在软路由上安装并配置好了 Alist，连接到了自己的 OneDrive。下面将进一步实现上传备份文件到 OneDrive 或任何其他的云盘。

### 获取 Alist token

调用 Alist 接口时需要传入 token，因此首先需要获取 token：

```js
const ALIST_ADDRESS = "YOUR_ALIST_ADDRESS";
const ALIST_USERNAME = "YOUR_ALIST_USERNAME";
const ALIST_PASSWORD = "YOUR_ALIST_PASSWORD";

const headers = new Headers();
headers.append("Content-Type", "application/json");

const raw = JSON.stringify({
  username: ALIST_USERNAME,
  password: ALIST_PASSWORD,
});

const requestOptions = {
  method: "POST",
  headers,
  body: raw,
  redirect: "follow",
};

const res = await fetch(`${ALIST_ADDRESS}/api/auth/login`, requestOptions);
const resText = await res.text();
const resObj = JSON.parse(resText);

const alistToken = resObj.data.token;
```

### 上传备份文件到云盘

现在，编写 Alist 上传文件的方法：

```js
const ALIST_BACKUP_DIR = "/path/to/mc-backups";

const backupFile = fs.statSync(backupFilename);
const backupFileBasename = path.basename(backupFilename);
const alistFilePath = path.resolve(ALIST_BACKUP_DIR, backupFileBasename);

const headers = new Headers();
headers.append("Authorization", alistToken);
headers.append("As-Task", "true");
headers.append("Content-Length", `${backupFile.size}`);
headers.append("File-Path", encodeURIComponent(alistFilePath));

const fileStream = fs.createReadStream(backupFilename);
const requestOptions = {
  method: "PUT",
  headers,
  body: fileStream,
  redirect: "follow",
  duplex: "half",
};

await fetch(`${ALIST_ADDRESS}/api/fs/put`, requestOptions);
```

通过 `headers.append("As-Task", "true");` 将文件上传设为任务，避免阻塞其它命令的执行。在 Alist 管理后台可以看到上传的进度：

![upload-to-alist](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2024/05/10/backup-mc-server/upload-to-alist.png)

到这一步，执行备份脚本时，将自动把新生成的备份文件上传到云盘。

### 移除云盘历史备份文件

同样，云盘的空间也不是无限的，我们采取与移除本地历史备份文件相同的策略。

首先获取云盘上已有的备份文件列表：

```js
const headers = new Headers();
headers.append("Authorization", alistToken);
headers.append("Content-Type", "application/json");

const raw = JSON.stringify({
  path: ALIST_BACKUP_DIR,
});

const requestOptions = {
  method: "POST",
  headers: headers,
  body: raw,
  redirect: "follow",
};

const res = await fetch(`${ALIST_ADDRESS}/api/fs/list`, requestOptions);
const resText = await res.text();
const resObj = JSON.parse(resText);

const backupDirFileList = resObj.data.content || [];
```

获取需要移除的备份文件列表：

```js
const backupFiles = backupDirFileList
  .filter((file) => !file.is_dir)
  .sort((a, b) => {
    if (a.modified > b.modified) {
      return -1;
    } else if (a.modified < b.modified) {
      return 1;
    } else {
      return 0;
    }
  });

// 由于新的备份文件正在上传中，因此应当保留最新的 BACKUP_MAX_NUM - 1 个备份文件
const oldBackupFiles = backupFiles.slice(BACKUP_MAX_NUM - 1);
const oldBackupFilenames = oldBackupFiles.map((file) => file.name);
```

最后，移除这些文件即可：

```js
const headers = new Headers();
headers.append("Authorization", alistToken);
headers.append("Content-Type", "application/json");

const raw = JSON.stringify({
  names: oldBackupFilenames,
  dir: ALIST_BACKUP_DIR,
});

const requestOptions = {
  method: "POST",
  headers: headers,
  body: raw,
  redirect: "follow",
};

await fetch(`${ALIST_ADDRESS}/api/fs/remove`, requestOptions);
```

这样在每次执行脚本时，云盘的系统容量健康也得到了保障。

## 结尾

稍微润色优化一下备份脚本，执行的输出结果如下：

```bash
$ node /path/to/backup-mc-server.js
Create dir `/path/to/mc-server/backups` successfully.
Creating backup file `/path/to/mc-server/backups/backup-mcserver-2024-05-11-11-10-51.tar.gz` ...
Create backup file `/path/to/mc-server/backups/backup-mcserver-2024-05-11-11-10-51.tar.gz` successfully.
Log in alist successfully.
Start upload task successfully: local file `/path/to/mc-server/backups/backup-mcserver-2024-05-11-11-10-51.tar.gz` ==> alist `/path/to/alist/backups/backup-mcserver-2024-05-11-11-10-51.tar.gz`.

===========================
Backup file is generated: true
Old backup files are removed: true
Task that upload backup file to alist is started: true
Old backup files in alist are removed: true
===========================
```

啊，满满的安心感！收工。
