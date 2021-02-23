---
title: 一键安装并配置 MTProto Proxy 代理 Telegram
date: 2021/2/21
updated: 2021/2/23
categories:
- 技术琐事
tags:
- Telegram
- MTProto
---
## Telegram 和 MTProto 是什么

Telegram，中文名称为“电报”，或简称“tg”，是一款跨平台即时通讯软件，客户端完全开源。我觉得重要的有如下 Features：

- 私密性高。不再使用的账号最长保留年限为 1 年，随时销毁聊天记录和一切账号资料。
- 安全性。端对端加密，不受审查。
- 完全免费。不限制上传文件（视频会有压缩），甚至可以拿来当备用网盘使用。不过已经确认会在将来布局群组广告，“钞能力”还是抵不过越来越多涌入的各国用户。

当然，在被屏蔽的地域需要翻墙使用。

MTProto 是一种协议，旨在帮助移动设备上的应用程序访问服务器的 Api 接口。

## 我们要做什么

我们想要搭建一个 Proxy，提供给移动端使用，可以快捷地访问到 tg 服务器。

移动端与电脑端不同的是，电脑端通常代理软件常开，随时可以通过 web 访问到 tg 服务器，而移动端则为了省电需要，仅在使用时才手动启用代理，稍显麻烦。

实际上电脑端的 tg 客户端也需要手动设置代理全局才能访问，那么有一个 Proxy 可以省很多事儿。

## 嗨，这里是一键脚本

在 Github 上有为实现以上功能编写的基于 Python 的 Proxy: [mtprotoproxy](https://github.com/alexbers/mtprotoproxy)。号称：

> The proxy performance should be enough to comfortably serve about 4000 simultaneous users on the VDS instance with 1 CPU core and 1024MB RAM.
> 代理服务器的性能应该足以在使用 1 个 CPU 核心和 1024 MB 内存的 VDS 实例上同时为大约 4000 个用户提供舒适的服务。

当然也有用其它语言写的 Proxy，不过最妙的还属一键安装配置脚本：[MTProtoProxyInstaller](https://github.com/HirbodBehnam/MTProtoProxyInstaller)。不用脑子！

那么，按照作者给出的指引走就可以了。

### 购买一台自由访问 tg 的服务器

阿里云和腾讯云提供的轻量级应用服务器就很不错！选择香港地区即可，每月有 1 TB 的流量。

需要注意的是，此一键脚本仅支持如下 Linux 系统：

- Centos 7/8
- Ubuntu 16 或更新版本
- Debian 8/9

### 选择代理版本

首先明确自己要使用哪个版本的代理，官方的，基于 Python 语言的，亦或是基于 Go 语言的。

作者建议在如下情况使用基于 Python 语言的代理：

- 服务器 CPU 只有一个内核，或者只想在一个内核上运行代理。
- 服务器比较低端。
- 为一小群人提供服务，比如家庭或小公司。
- 想要限制用户的连接。
- 还将在服务器上运行其它应用程序或服务，例如 OpenVPN，Shadowsocks，Nginx 等。

否则使用官方代理。

这里我选择使用**基于 Python 语言**的代理，故下文将基于此版本阐述，若想使用其它版本可以自行查阅作者的[教程文档](https://github.com/HirbodBehnam/MTProtoProxyInstaller#official-script)。

### 部署一键脚本

执行如下命令进行安装：

```bash
curl -o MTProtoProxyInstall.sh -L https://git.io/fjo34 && bash MTProtoProxyInstall.sh
```

根据提示进行配置，觉得不妥还可以重新执行上述命令重装代理服务。

假如只添加了一个代理服务器，在安装完成后会出现如下文本：

```text
Ok it must be done. I created a service to run or stop the proxy.
Use "systemctl start mtprotoproxy" or "systemctl stop mtprotoproxy" to start or stop it

Use these links to connect to your proxy:
${username}: tg://proxy?server=${ip}&port=${port}&secret=${secret}
```

其中 \${username} 为之前输入的用户名（并不重要，只是标识），\${ip} 是服务器的公网 IP 或域名，\${port} 是设置的访问代理的端口，\${secret} 是设置或自动生成的密钥。

这里作者提示可以用 `systemctl start mtprotoproxy` 来启动代理服务了，作为补充，`systemctl` 是 `Systemd` 进程管理命令，而 `Systemd` 是一种 Linux 的系统工具，用来启动守护进程（即一直在后台运行的进程，daemon）。这说明当前 `mtprotoproxy` 已经是可以启动的服务了，在后续的过程中只需要对此服务进行管理就可以了。

那么接下来就执行该命令来启动服务：

```bash
systemctl start mtprotoproxy # 启动代理服务
```

复制之前的链接 `tg://proxy?server=${ip}&port=${port}&secret=${secret}` 到剪切板，在手机端的 Telegram 上通过 `设置 - 数据和存储 - 代理设置 - 添加代理 - 从剪贴板导入` 即可完成设置。建议把这个链接记下来并保存。

### Ops，一点小麻烦

呃，似乎连接了半天也 ping 不通，这可如何是好，哪一步做错了吗？

可以先查阅一下日志信息，执行如下命令：

```bash
systemctl status mtprotoproxy -l # 查看代理服务日志信息
```

查询到如下结果：

```text
● mtprotoproxy.service - MTProto Proxy Service
     Loaded: loaded (/etc/systemd/system/mtprotoproxy.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2021-02-21 15:12:39 CST; 43s ago
   Main PID: 39895 (python3.8)
      Tasks: 5 (limit: 1111)
     Memory: 23.7M
     CGroup: /system.slice/mtprotoproxy.service
             └─39895 /usr/bin/python3.8 /opt/mtprotoproxy/mtprotoproxy.py

Feb 21 15:13:18 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:18 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:19 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:19 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:19 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:19 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:20 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:20 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:23 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
Feb 21 15:13:23 ******** python3.8[39895]: Unable to connect to ****:***:****:****::a *
```

幸运的是，在该仓库下的 Issues 里我找到了遇见相同问题的人（[#34](https://github.com/HirbodBehnam/MTProtoProxyInstaller/issues/34)）。

原来在最新版本的 Python 代理软件中，默认使用 IPv6，进而导致 MTProto 无法正常连接。作者提出可以在设置文件中手动设置禁用优先 IPv6 连接。操作如下：

```bash
cd /opt/mtprotoproxy # 默认安装目录
vi config.py # 编辑配置文件
```

在文件中添加一行配置信息 `PREFER_IPV6 = False` 即可。

由于服务没有热重载机制，因此在最后需要重启服务：

```bash
systemctl restart mtprotoproxy # 重启代理服务
```

### 一切搞定

现在已经可以正常访问 tg 客户端啦！假如愿意，可以将刚刚得到的链接分享给好友，enjoy tg world!

或许你会愿意再次打印一下日志信息，结果如下所示：

```text
● mtprotoproxy.service - MTProto Proxy Service
     Loaded: loaded (/etc/systemd/system/mtprotoproxy.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2021-02-21 15:17:25 CST; 4s ago
   Main PID: 39940 (python3.8)
      Tasks: 5 (limit: 1111)
     Memory: 17.8M
     CGroup: /system.slice/mtprotoproxy.service
             └─39940 /usr/bin/python3.8 /opt/mtprotoproxy/mtprotoproxy.py

Feb 21 15:17:25 ******** systemd[1]: Started MTProto Proxy Service.
Feb 21 15:17:25 ******** python3.8[39940]: *: tg://proxy?server=*&port=*&secret=*>
Feb 21 15:17:25 ******** python3.8[39940]: *: tg://proxy?server=*&port=*&secret=*>
Feb 21 15:17:25 ******** python3.8[39940]: Found uvloop, using it for optimal performance
Feb 21 15:17:25 ******** python3.8[39940]: Got cert from the MASK_HOST www.cloudflare.com, its length is 1828
```

除了前文已出现过的命令，别忘了此代理服务还可以暂停，依旧是作为服务进行管理就可以了：

```bash
systemctl stop mtprotoproxy # 暂停代理服务
```
