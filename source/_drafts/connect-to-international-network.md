# 连接至国际因特网

> 本文档最后更新于 **2024-07-08**。

这是一个简单的连接国际因特网攻略**模板**，供「这是群组名」群组内部使用。

现有很多稳定可靠的代理软件，选择自己喜欢的即可。本文给出一些参考的选择。

## 此 JMS 方案

Just My Socks - Just My Socks LA 1000

- 季付金额：$27.38 USD
- 每月流量：1000 GB

合租支持小范围的分享；如果可能，建议拉上更多的人加入分摊网费（最高 10 人）。

由于带宽和每月流量并非无限，如果已分享给很多人，可以联系我重置服务器端口或密码等信息。

如果服务方案或配置信息有任何更新，我会及时更新此文档并重新发布。

## 代理软件

支持 `aes-256-gcm` 或 `v2ray` 协议的代理软件皆可。下面是我的选择：

### Windows

安装 [v2rayN](https://github.com/2dust/v2rayN)，下载并解压后运行。

### Android

安装 [v2rayNG](https://github.com/2dust/v2rayNG)。

### IOS

在 App Store 搜索支持 `v2ray` 或 `aes-256-gcm` 协议的代理软件。由于国区限制，此类软件大多已下架，建议使用美区账号。

### 其它系统

在 Github 搜索支持 `v2ray` 或 `aes-256-gcm` 协议的代理软件。

## 代理软件配置

在下面的两种配置方案中任选其一即可。我**更推荐**通过订阅连接到代理服务器的方案。

### 通过订阅连接到代理服务器

复制以下 URL 地址，在代理软件中添加订阅：

```plaintext
https://jmssub.net/members/getsub.php?service=[SERVICE_ID]&id=[SERVICE_TOKEN]
```

通过软件更新订阅即可获取最新的代理配置信息。

使用订阅的方式会绕过 DNS 直接获取服务器的 IP 地址，代理连接成功率将显著提高。但由于 JMS 的服务器 IP 地址会不断变化，因此当连接不上服务器时，请及时**更新订阅**。

### 通过 DNS 连接到代理服务器

复制下面的内容，在支持协议的软件中使用粘贴板导入功能即可。

`aes-256-gcm` 协议的服务器：

```plaintext
ss://[SERVICE_SECRET]@[SERVICE_ADDRESS]:[SERVICE_PORT]#[SERVICE_NOTES]%40[SERVICE_ADDRESS]%3A[SERVICE_PORT]
ss://[SERVICE_SECRET]@[SERVICE_ADDRESS]:[SERVICE_PORT]#[SERVICE_NOTES]%40[SERVICE_ADDRESS]%3A[SERVICE_PORT]
```

`v2ray` 协议的服务器：

```plaintext
vmess://[SERVICE_SECRET]
vmess://[SERVICE_SECRET]
vmess://[SERVICE_SECRET]
```

`v2ray` 协议的下载服务器：

JMS 建议使用该服务器进行文件下载操作，将使用相当于其他服务器 1/10 的流量。

```plaintext
vmess://[SERVICE_SECRET]
```

## 实用帮助

假如您使用 Shadowsocks 作为代理软件，您会发现系统代理有 `全局模式` 和 `Pac 模式` 两种模式。

- `全局模式` 指所有网页，包括桌面应用都设置由代理访问。
- `Pac 模式` 指 `pac.txt` 文件里预设的网页由代理访问，其余网页和桌面应用由本地网络访问。

通常来说日常使用时启用 `Pac 模式` 即可，但也可能会出现以下几种情况：

- 网页没有记录在 `pac.txt` 中的但是需要代理才能访问。可以参考 `pac.txt` 的格式手动修改内容。
- 桌面应用需要代理才能访问。暂时启用 `全局模式`。

而如果使用 v2rayN 作为代理软件，只需要在 `路由` 中设置为预设的 `绕过大陆` 模式，则可以包括桌面应用在内，对各类流量自动代理。
