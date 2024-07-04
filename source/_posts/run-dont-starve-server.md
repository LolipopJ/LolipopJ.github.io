---
title: 基于 SteamCMD 部署一个给朋友使用的饥荒联机版服务器
date: 2024/7/2
updated: 2024/7/4
categories:
  - 技术琐事
tags:
  - Linux
  - SteamCMD
  - Game-Server
  - Don't-Starve
---

本文重现了笔者在自己的 CentOS 7 (64-bit) 系统中部署饥荒联机版服务器的全过程，供君参考。

笔者主要参考了如下两个部署教程：

- [Guides/Don’t Starve Together Dedicated Servers](https://dontstarve.fandom.com/wiki/Guides/Don%E2%80%99t_Starve_Together_Dedicated_Servers)
- [How to setup dedicated server with cave on Linux](https://steamcommunity.com/sharedfiles/filedetails/?id=590565473)

## 安装 `steamcmd`

安装的步骤可以直接参考 SteamCMD 的[官方文档](https://developer.valvesoftware.com/wiki/SteamCMD)（[中文版](https://developer.valvesoftware.com/w/index.php?title=SteamCMD:zh-cn&uselang=zh)）。

需要注意的是，SteamCMD 仅提供 32 位二进制文件。如果您的系统仅能运行 64 位进程（例如 OpenWRT 系统），将**不能**正常使用。

为了安全考虑，`steamcmd` 官方建议创建新的系统用户运行，而不是拥有最高命令权限的 `root` 用户。因此，首先创建一个名为 `steam` 的用户：

```bash
# 创建 steam 用户
sudo useradd -m steam
# 修改 steam 用户登录密码
sudo passwd steam
```

对于 64 位系统，需要安装如下的必要依赖以运行 `steamcmd`：

```bash
yum -y install glibc.i686 libstdc++.i686
```

切换至 `steam` 用户：

```bash
su - steam
```

安装 `steamcmd`：

```bash
cd ~
curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -
```

运行 `steamcmd`：

```bash
/home/steam/steamcmd.sh
```

耐心等待更新文件下载、安装完毕……

## 安装饥荒联机版

安装饥荒联机版运行的必要依赖：

```bash
yum -y install libcurl.i686
ln -s /usr/lib/libcurl.so.4 /usr/lib/libcurl-gnutls.so.4
```

设置饥荒联机版安装目录：

```bash
Steam> force_install_dir /home/steam/steamapps/DST
```

匿名登录到 `steamcmd`：

```bash
Steam> login anonymous
```

安装饥荒联机版：

```bash
Steam> app_update 343050 validate
```

测试饥荒联机版的运行：

```bash
# 移动到饥荒联机版可执行文件目录
cd /home/steam/steamapps/DST/bin
./dontstarve_dedicated_server_nullrenderer
```

如果没有其它的报错，那么打印内容大致如下：

```plaintext
$ ./dontstarve_dedicated_server_nullrenderer
./dontstarve_dedicated_server_nullrenderer: /lib/libcurl-gnutls.so.4: no version information available (required by ./dontstarve_dedicated_server_nullrenderer)
[00:00:00]: PersistRootStorage is now /home/steam/.klei//DoNotStarveTogether/Cluster_1/Master/
[00:00:00]: Starting Up
[00:00:00]: Version: 617969
[00:00:00]: Current time: Tue Jul  2 18:22:40 2024

[00:00:00]: System Name: Linux
[00:00:00]: Host Name: iZ2vc17uca9zl48iicx7ojZ
[00:00:00]: Release(Kernel) Version: 3.10.0-1160.108.1.el7.x86_64
[00:00:00]: Kernel Build Timestamp: #1 SMP Thu Jan 25 16:17:31 UTC 2024
[00:00:00]: Machine Arch: x86_64
[00:00:00]: Don't Starve Together: 617969 LINUX
[00:00:00]: Build Date: 9567
[00:00:00]: Mode: 32-bit
...
```

此时，会自动创建存档目录 `/home/steam/.klei/DoNotStarveTogether/Cluster_1`，如果后续不再需要可直接删除。

## 添加饥荒联机版服务器管理脚本

`screen` 命令可以用来创建独立的命令行窗口执行进程，方便对进程的管理，例如追踪运行的日志信息。笔者选用它来管理饥荒联机版服务器的进程。

```bash
yum install -y screen
```

首先创建存放脚本的文件夹：

```bash
mkdir /home/steam/scripts
```

下面开始编写管理服务器过程中最常用的两个脚本。

### 自动更新脚本

创建自动更新饥荒联机版的脚本 `/home/steam/scripts/update_dst.sh`，编写内容如下：

```sh
#!/bin/sh

# 更新饥荒联机版
cd /home/steam
./steamcmd.sh +@ShutdownOnFailedCommand 1 +@NoPromptForPassword 1 +force_install_dir /home/steam/steamapps/DST +login anonymous +app_update 343050 validate +quit

# 更新已安装的模组
cd /home/steam/steamapps/DST/bin
./dontstarve_dedicated_server_nullrenderer -cluster CustomSaveName -only_update_server_mods
```

其中 `CustomSaveName` 为您的存档目录名称，可自定义修改。如不配置将默认使用 `Cluster_1`。

添加脚本的执行权限，后略：

```bash
chmod +x /home/steam/scripts/update_dst.sh
```

### 启动（重启）服务器脚本

创建启动（重启）饥荒联机版服务器的脚本 `/home/steam/scripts/start_dst.sh`，编写内容如下：

```sh
#!/bin/sh

# 保存服务器数据并退出
screen -S dst_master -X stuff $'c_shutdown()\n'
screen -S dst_caves -X stuff $'c_shutdown()\n'

# 更新饥荒联机版
/home/steam/scripts/update_dst.sh

cd /home/steam/steamapps/DST/bin
# 启动地上世界服务器
screen -dmS dst_master ./dontstarve_dedicated_server_nullrenderer -cluster CustomSaveName -console -shard Master
# 启动洞穴世界服务器
screen -dmS dst_caves ./dontstarve_dedicated_server_nullrenderer -cluster CustomSaveName -console -shard Caves
```

脚本将自动保存服务器数据（如果不使用 `c_shutdown()` 而直接关闭 Screen 的话，将丢失度过黑夜前未保存的所有数据），检查并安装饥荒联机版更新包，最后重新启动服务器。

服务器启动后，执行命令 `screen -r dst_master` 或 `screen -r dst_caves` 查看日志，您会发现打印有如下内容：

```plaintext
[00:00:05]: [200] Account Failed (6): "E_INVALID_TOKEN"
[00:00:05]: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[00:00:05]: !!!! Your Server Will Not Start !!!!
[00:00:05]: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[00:00:05]: No auth token could be found.
[00:00:05]: Please visit https://accounts.klei.com/account/game/servers?game=DontStarveTogether
[00:00:05]: to generate server configuration files
```

这意味着我们最后还需要配置 Auth Token 等信息，使得服务器能正确地注册并被联机用户发现。

## 正式启动饥荒联机版服务器

访问 <https://accounts.klei.com/account/game/servers?game=DontStarveTogether>，创建一个饥荒联机版服务器并获取 Auth Token：

![创建服务器](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240701/run-dont-starve-server/add-new-server.png)

填写基本的配置信息：

![配置服务器](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240701/run-dont-starve-server/configure-server.png)

下载设置并上传到主机，将解压后的文件放置到存档目录：

```bash
unzip DST_Lolipop.zip
mv MyDediServer /home/steam/.klei/DoNotStarveTogether/CustomSaveName

# 如果使用了 root 用户解压，别忘了修改文件夹所有权
# chown -R steam /home/steam/.klei/DoNotStarveTogether/CustomSaveName
```

最后的最后，执行前面编写的启动脚本：

```bash
/home/steam/scripts/start_dst.sh
```

在游戏大厅里搜索服务器，开始愉快地玩耍吧！

![搜索服务器](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240701/run-dont-starve-server/search-server.png)

## 饥荒联机版服务器运维

### 添加模组

在饥荒联机版服务器添加并启用模组，需配置两部分内容。

第一部分是告诉服务器要下载哪些模组。编辑 `/home/steam/steamapps/DST/mods/dedicated_server_mods_setup.lua`，使用指令 `ServerModSetup()` 或 `ServerModCollectionSetup()` 添加需要下载的模组，例如：

```lua
-- /home/steam/steamapps/DST/mods/dedicated_server_mods_setup.lua
ServerModSetup("345692228")
ServerModCollectionSetup("379114180")
```

通过上面的配置，服务器将自动下载 Steam 创意工坊上的模组 [#345692228](https://steamcommunity.com/sharedfiles/filedetails/?id=345692228)，以及模组集合 [#379114180](https://steamcommunity.com/sharedfiles/filedetails/?id=379114180) 中的所有模组。

第二部分是告诉服务器要启用哪些模组。有两种配置方式，选择其一即可：

1. `/home/steam/.klei/DoNotStarveTogether/CustomSaveName/Caves/modoverrides.lua` 用于管理洞穴世界模组的启用与配置；`/home/steam/.klei/DoNotStarveTogether/CustomSaveName/Master/modoverrides.lua` 用于管理地上世界模组的启用与配置。
2. `/home/steam/steamapps/DST/mods/modsettings.lua` 用于管理模组的启用。需留意的是：1）本方式通常用于模组的开发调试；2）不能对模组进行详细设置，模组将始终使用默认配置；3）使用部分模组时可能会报错，此时请切换为第一种配置方法。

笔者选用第一种配置方法，新建文件 `modoverrides.lua`，编写内容如下：

```lua
-- modoverrides.lua
return {
    ["workshop-345692228"] = { enabled = true },
    ["workshop-379114180"] = { enabled = true }
}
```

添加可执行权限并拷贝到对应目录：

```bash
chmod +x modoverrides.lua
cp modoverrides.lua /home/steam/.klei/DoNotStarveTogether/CustomSaveName/Caves/
cp modoverrides.lua /home/steam/.klei/DoNotStarveTogether/CustomSaveName/Master/
```

重启服务器即可。

![服务器模组](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240701/run-dont-starve-server/server-with-mods.png)

### 进一步配置服务器

之前步骤中下载的基本配置已足够支持正常游玩。如果还想要更深度的定制，可以参考[此文档](https://steamcommunity.com/sharedfiles/filedetails/?id=1616647350)，按需修改以下三个文件：

- `/home/steam/.klei/DoNotStarveTogether/CustomSaveName/cluster.ini`
- `/home/steam/.klei/DoNotStarveTogether/CustomSaveName/Caves/server.ini`
- `/home/steam/.klei/DoNotStarveTogether/CustomSaveName/Master/server.ini`

### 定时重启并更新服务器

基于 Crontab 实现，编辑计划任务 `crontab -e`：

```plaintext
0 6 * * * /home/steam/scripts/start_dst.sh
```

上面的配置表示，在每天凌晨 6 点整，自动重启并更新饥荒联机版服务器。
