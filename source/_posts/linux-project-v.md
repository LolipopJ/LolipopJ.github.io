---
title: 在 Linux 系统下启用 Project-V
date: 2021/6/9
updated: 2021/6/9
categories:
  - 后端开发
tags:
  - Linux
---

## 下载 Release

在 Project-V 的 [Github Releases](https://github.com/v2fly/v2ray-core/releases) 页面下载最新的二进制包。

本文以通用于 x86_64 机器的 `v2ray-linux-64.zip` 为例。下载完成后传入 Linux 主机即可。

## 安装 Project-V

执行 `unzip` 命令：

```bash
unzip v2ray-linux-64.zip
```

文件将全部解压到当前目录。

## 创建软链接

执行 `ln` 命令：

```bash
ln -s /path/to/v2ray /usr/local/bin
```

这里的 `v2ray` 是压缩包里已编译好的二进制可执行文件。

## 配置 Project-V

编辑与 `v2ray` 相同目录下的 `config.json` 文件，配置如下：

```json
{
  // 前略
  // List of inbound proxy configurations.
  "inbounds": [
    {
      // Port to listen on. You may need root access if the value is less than 1024.
      "port": 1080, // 本机监听的端口，应为不加双引号的数字

      // IP address to listen on. Change to "0.0.0.0" to listen on all network interfaces.
      "listen": "127.0.0.1",

      // Tag of the inbound proxy. May be used for routing.
      "tag": "socks-inbound",

      // Protocol name of inbound proxy.
      "protocol": "socks",

      // Settings of the protocol. Varies based on protocol.
      "settings": {
        "auth": "noauth",
        "udp": false,
        "ip": "127.0.0.1"
      },

      // Enable sniffing on TCP connection.
      "sniffing": {
        "enabled": true,
        // Target domain will be overriden to the one carried by the connection, if the connection is HTTP or HTTPS.
        "destOverride": ["http", "tls"]
      }
    }
  ],
  // List of outbound proxy configurations.
  "outbounds": [
    {
      // Protocol name of the outbound proxy.
      "protocol": "vmess", // 使用的代理协议

      // Settings of the protocol. Varies based on protocol.
      "settings": {
        "vnext": [
          {
            "address": "V2RAY_SERVER_ADDRESS", // 代理的服务器地址
            "port": 16823, // 代理服务器的端口，应为不加双引号的数字
            "users": [
              {
                "id": "V2RAY_UUID", // 代理服务器的 UUID
                "alterId": 64 // 代理服务器的 Alter Id，应为不加双引号的数字
              }
            ]
          },
          {
            // 添加更多的 VMESS 协议代理服务器
          }
        ]
      },

      // Tag of the outbound. May be used for routing.
      "tag": "vmess_serve"
    }
  ]
  // 后略
}
```

对于新手，只需要掌握 `inbounds` 和 `outbounds` 的配置方式即可。

对于进阶使用，可以参考[官方文档](https://www.v2fly.org/)，或者更适合新手的[“白话文”文档](https://guide.v2fly.org/)。

## 启用 Project-V

保存修改后，在后台运行 `v2ray`：

```bash
v2ray &
```

如果参考前面的默认配置，则它将监听在 `127.0.0.1:1080` 端口。

假如您想加速 `git` 克隆速度，则可以配置它的 `http(s).proxy`：

```bash
git config --global http.proxy socks5://127.0.0.1:1080
git config --global https.proxy socks5://127.0.0.1:1080
```

现在，使用 `git clone` 命令享受飞一般的速度吧。
