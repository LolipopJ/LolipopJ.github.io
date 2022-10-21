---
title: 在浏览器中输入 URL 到显示网页，背后发生了什么
date: 2021/7/8
updated: 2021/7/23
categories:
  - 学习琐事
tags:
  - 计算机网络
  - 网络安全
  - 密码学
---

最近学习前端基础知识的时候，看到了这个问题和[一个回答](https://www.zhihu.com/question/34873227/answer/518086565)，非常生动有趣。遂抱着梳理的想法，将整个过程描述出来。

现在，假设您打开了浏览器，想要访问我的个人博客，您会在地址栏输入 `lolipopj.github.io` 这个 URL 然后敲下回车键。

从敲下回车键到最终顺利在浏览器显示我博客的主页，这个过程的背后发生了什么呢？

## 检查 URL 格式

别急，在正式驶入互联网的快车道之前，浏览器会首先检查输入的 URL 的格式是否正确。

例如，假如您输入的是 `lolipop j.github.io`，或是 `lolipopj.gith$ub.io`，浏览器将会判断它们为非 URL。在这种情况下，浏览器通常会将我们错误输入的 URL 作为搜索引擎的输入关键字，最终跳转到搜索结果界面。

### 什么是 URL

- [「标识互联网上的内容」](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web)，MDN

HTTP 请求的内容非常宽泛，统称为“资源”。“资源”可以是一份文档，一张图片，或所有您可以想象到的格式。而这样的每个“资源”，都由一个**统一资源定位符 URL** 标识。

通俗地讲，URL 可以叫作“网络地址”或“链接”，它是对指定计算机网络上某位置的**网络资源**的引用，以及检索它的机制。一个典型的 URL 可以采用 `http://www.example.com/index.html` 形式表示，它表明了使用的协议（http），访问的主机名（www.example.com）以及文件名（index.html）。

此外，URL 也可以用于文件传输（FTP），发送邮件（SMTP）和数据库访问（JDBC）等。

URL 是**统一资源标志符 URI** 的子集，由于早期 RFC 文档撰写的[一些混乱](https://danielmiessler.com/study/difference-between-uri-url/)，在实际使用中可能会发生混用的情况。在以 HTTP 为上下文的语境中，大多数情况使用 URL 即可。

### URL 格式

- [「URL」](https://en.wikipedia.org/wiki/URL)，Wikipedia

URL 符合通用 URI 语法，格式如下：

```plaintext
URI = scheme:[//authority]path[?query][#fragment]
```

其中，`authority` 部分可以划分为三个子模块：

```plaintext
authority = [userinfo@]host[:port]
```

URI 具体包括如下部分：

- **非空的** `scheme` 标识，后面跟着一个 `:`。由字母开头，后跟字母、数字、`+`、`.` 或连字符 `-` 的任意组合，规范建议使用小写格式。常见的例子有 `http:`，`https:` 和 `ftp:` 等。
- 可选的以 `//` 开头的 `authority` 权限组件，包括：
  - 可选的 `userinfo` 用户信息，可能包括用户名和用户密码，两者使用 `:` 分开。在后面跟着 `@`。出于安全考虑，应用程序不应当将用户密码部分用明文表示。
  - **非空的** `host` 主机，由注册名称（例如主机名）或 IP 地址组成。对于后者，如果是 IPv4 地址，需要使用十进制表示法；如果是 IPv6 地址，需要包括在方括号 `[]` 中。
  - 可选的以 `:` 开头的 `port` 端口号。
- **非空的** `path` 路径，由一系列 `/` 分隔的路径段组成。路径将类似或完全映射到文件系统中。此外，如果存在 `authority` 权限组件，则必须为空或以 `/` 开头；如果不存在，则不能以空路径段开头，因为这样实际上就是以 `//` 开头，将被解释为 `authority` 权限组件。
- 可选的以 `?` 开头的 `query` 查询。语法没有明确要求，通常采用键值对的形式。
- 可选的以 `#` 开头的 `fragment` 片段。用于提供对次要资源的指向，例如在 HTML 文档中，将指向包含对应 `id` 属性的元素。

## 补齐 URL

前面我们在使用 URL 时，并没有添加它的前缀例如 `https://`。那么我们具体使用的是 HTTP 协议还是 HTTPS 协议呢？

针对这种情况，浏览器有自己的预案，即默认使用 HTTP 协议。假如您是**第一次**访问我的博客（更严谨地说是第一次访问 `github.io` 域名下的网站），除非在输入的最开始就使用了 `https://lolipopj.github.io` 这个 URL，否则均会被默认补齐为 `http://lolipopj.github.io`。对于启用了 [HSTS 保护](#什么是-hsts为什么我们需要它)的网站，从第二次的访问开始，浏览器将根据第一次访问时得到的响应结果，自动补齐协议。

随着 HSTS 的推广使用，现代浏览器中还内置了一个列表 [Preload List](#hsts-的-preload-list-机制)，记录常用网站所使用的协议。对于这些网站，输入的 URL 将自动在前面补上记录的协议，再由浏览器发送请求。因此在实际情况中，第一次访问时，我们输入的 URL 就会被补齐为 `https://lolipopj.github.io`。

### HTTP 严格传输安全 HSTS

以下内容主要参考此文章：

- [「HSTS 详解」](https://zhuanlan.zhihu.com/p/25537440)，2017-03-03

### 什么是 HSTS，为什么我们需要它

在过去，假如服务器使用的是 HTTPS 协议，当我们默认使用 `http://lolipopj.github.io` 发起请求时，也会在服务器端通过 301 重定向到 `https://lolipopj.github.io`。在这个过程中，浏览器首先使用了 HTTP 协议发起请求，得到重定向的响应后，浏览器会重新发起基于 HTTPS 协议的请求并最终与服务器建立通信。

这是一个存在风险的操作，因为在建立 HTTPS 通信之前，我们有一次明文的 HTTP 请求以及重定向操作。HTTP 主要有如下不足：

- 通信使用明文（不加密），内容可能会被窃听；
- 不验证通信方的身份，因此有可能遭遇伪装；
- 无法证明报文的完整性，所以有可能已遭篡改等。

中间人可以劫持 HTTP 请求并篡改响应，阻止建立 HTTPS 连接，跳转到钓鱼网站等。

可以想见，对于使用 HTTPS 协议的服务器，如果能从第一次开始就直接以 HTTPS 协议建立连接，跳过 HTTP + 301 重定向的步骤，便可以避免这个潜在风险了。那么，浏览器该如何知道对于哪些网站应该使用 HTTP 协议，哪些网站应该建立 HTTPS 请求呢？

这就不得不提到 **HSTS**（HTTP Strict-Transport-Security，即 HTTP 严格传输安全）了，它是一个 Web 安全策略机制。其最核心的实现，是一个 HTTP 响应头，正是它让浏览器得知，接下来的一段时间（通常设置为 1 年），对这个域名的访问都应基于 HTTPS 协议。

例如，当浏览器通过 HTTP/HTTPS 协议访问某网站，返回的响应头可能包括一项：

```plaintext
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

浏览器就知道，在接下来的 31536000 秒（即 1 年）内，对该域名，以及子域名（includeSubDomains）的后续通信应该强制使用 HTTPS 进行，直到过了有效期（max-age）为止。每次相应都将刷新 HSTS 有效期；如果过了有效期，只要进行一次新的通信，又会开启一年的 HSTS 有效期。

### HSTS 加强浏览器连接保护

在 HSTS 出现以前，当浏览器发现当前网站的证书出现错误，或浏览器与服务器之间的通信不安全，或无法建立 HTTPS 连接时，浏览器会告警用户，但又允许用户继续不安全的访问。

从理论上来说，当出现此类告警时，用户应该提高警惕，终止后续的操作。然后现实是，绝大多数用户即使遇到这样的告警，也仍会继续访问。

HSTS 的出现使得事情出现了转机。对于启用了 HSTS 保护的网站，如果浏览器发现连接不安全，它将仅仅告警用户，**不再**提供继续访问的选择，进而避免后续的安全问题。

### HSTS 的 Preload List 机制

很容易发现，在第一次通过 URL 访问网站时（或浏览器没有当前网站的 HSTS 信息时），仍会默认使用明文的 HTTP 协议进行请求，然后重定向切换到 HTTPS，并刷新浏览器中的 HSTS 信息。这样，用户还是有受到中间人攻击的风险。

针对这种情况，HSTS 的应对方法是：在浏览器中内置一个列表，即 Preload List，在这个列表中的域名，无论何种情况，浏览器将**只使用** HTTPS 发起连接。

这个列表由 Google Chromium 维护。

### 加入到 HSTS Preload List

为了加入到此列表，您的站点必须满足以下需求：

1. 提供有效的证书。
2. 如果监听了 80 端口，则需要在同一主机上从 HTTP 重定向到 HTTPS。
3. 为所有子域名提供 HTTPS 服务。
4. 在根域名的 HTTP 响应头中添加 HSTS header。

您可以在 [HSTS Preload List 官网](https://hstspreload.org/)提交申请，或是了解更多相关内容。

## 通过 DNS 获取 IP 地址

TCP/IP 是能够在多个不同网络间实现信息传输的**协议簇**，它不仅仅指的是 TCP 和 IP 两个协议，而是指一个由 HTTP、HTTPS、FTP、SMTP、TCP、UDP 和 IP 等协议构成的协议簇。TCP/IP 定义了电子设备如何连入因特网，以及数据如何在它们之间传输的标准。

在 TCP/IP 概念层模型中，计算机网络体系结构自上而下分成了应用层、传输层、网络层和链路层。其中，HTTP 协议属于应用层。当客户端发出 HTTP 请求后，报文接下来将来到传输层和网络层进行处理。

浏览器会随机选用一个大于 1023（且 <= 65535）的端口号，作为当前页面通讯使用的端口，以及传输层的 TCP 协议头的 Source Port 部分，这很容易实现。

但问题是，运输层的 IP 协议需要**目标网站的 IP 地址**才能工作，而现在浏览器只有 `https://lolipopj.github.io` 这个 URL 链接，它完全无法理解。

因此，浏览器将首先联系**域名系统 DNS**（Domain Name System），一个将域名和 IP 地址相互映射的分布式数据库。我们可以通过 DNS 来查询一串 URL 链接所对应的 IP 地址。

DNS 由客户端和服务端两部分组成，其中，客户端发起查询请求，例如查询域名的 IP 地址，服务端则负责回答域名的真正 IP 地址。那么现在，DNS 客户端发起查询 `github.io` 域名 IP 地址的请求，可能经过如下步骤：

1. 首先检查本机的 DNS 缓存，没有该域名的 IP 地址信息！
2. 再查看本地硬盘中的 Host 文件，也没有！
3. 请求本地域名服务器或公共域名服务器记录的信息。这里也没有！
4. 此时，本地域名服务器或公共域名服务器会将查询请求发送给**根域名服务器**（Root name server）。根域名服务器会根据请求的 URL，将其对应的**顶级域名服务器**（Top-level domain server）的地址返回给本地域名服务器或公共域名服务器。例如，这里我们查询网址的顶级域名是 `.io`，则将此域名对应的顶级域名服务器的 IP 地址返回回来。
5. 接着，本地域名服务器或公共域名服务器会将查询请求发送给刚刚得到的顶级域名服务器。顶级域名服务器将返回管理 `github.io` 的**权威域名服务器**的 IP 地址，例如 `185.199.110.153`。继续请求此权威域名服务器，如果得知 `lolipopj.github.io` 为此域名下的 A 记录，那么此 IP 地址即为所求。
6. 查询的 IP 地址结果将缓存到本机以及本地域名服务器或公共域名服务器，用户下次查询时可以直接使用。

通常情况下，大型网站都会返回 CNAME 记录，传递给[全局流量管理 GTM 服务](#全局流量管理-gtm)，递归解析器将执行全新的 DNS 查找。通过 GTM 服务的负载均衡机制等，可以帮助用户找到最适合自己的访问的服务器 IP 地址；此外，大多数网站会做 CDN 缓存，GTM 服务也可以帮助用户找到最适合自己的 CDN 缓存服务器。

但无论如何，老天爷，浏览器可算是知道我博客的 IP 地址了。

### 递归解析器

也称为 “DNS 解析器”。

递归解析器是 DNS 查询中的第一站。递归解析器作为客户端与 DNS 域名服务器的中间人。从 Web 客户端收到 DNS 查询后，递归解析器将使用缓存的数据进行响应，或者将向根域名服务器发送请求，接着向顶级域名服务器发送另一个请求，然后向权威域名服务器发送最后一个请求。收到来自包含已请求 IP 地址的权威域名服务器的响应后，递归解析器将向客户端发送响应。

大多数用户使用他们的 ISP 提供的递归解析器，即本地域名服务器。但也可以指定公共域名服务器作为递归解析器，如 Google 的 `8.8.8.8` 或 Cloudflare 的 `1.1.1.1` 等。

### 根域名服务器

- [「根域名的知识」](https://www.ruanyifeng.com/blog/2018/05/root-domain.html)，2018-05-09

根域名服务器中记录了各个顶级域名服务器的 IP 地址信息。

由于早期的 DNS 查询结果是一个 512 字节的 UDP 数据包，这个包最多容纳 13 个服务器的地址，因此规定全世界有 13 台根域名服务器，编号从 `a.root-servers.net` 到 `m.root-servers.net`。

为了保证根域名服务器的可用性，每台服务器又有多个节点。根据[此网站](https://root-servers.org/)的统计，截止 2021 年 07 月 12 日，全球一共有 1403 台根域名服务器实例。

当需要通过根域名服务器查询顶级域名服务器时，进行请求的 DNS 服务器会向这 13 台服务器**同时**发出请求，哪一个返回的信息先到达，则使用哪一个查询得到的结果。

### 顶级域名服务器

也称为 “TLD 域名服务器”。

顶级域名服务器负责管理在该顶级域名下注册的所有二级域名。或者说，顶级域名服务器中记录了属于它的各个权威域名服务器的 IP 地址。

### 权威域名服务器

权威域名服务器是保存 DNS 名称记录（包括 A、AAAA 和 CNAME）的服务器。

权威域名服务器包含特定于其服务域名的信息。它可为递归解析器提供在 DNS A 记录中找到的服务器的 IP 地址；或者如果该域具有 CNAME 记录，它将为递归解析器提供一个别名域，这时递归解析器将必须执行全新 DNS 查找，以便从权威域名服务器获取记录（通常为包含 IP 地址的 A 记录）。

### DNS 支持 TCP 和 UDP 协议

- [「为什么 DNS 使用 UDP 协议」](https://draveness.me/whys-the-design-dns-udp-tcp/)

> 实际上，DNS 不仅使用了 UDP 协议，也使用了 TCP 协议，不过在具体介绍今天的问题之前，我们还是要对 DNS 协议进行简单的介绍：DNS 查询的类型不止包含 A 记录、CNAME 记录等常见查询，还包含 AXFR 类型的特殊查询，这种特殊查询主要用于 **DNS 区域传输**，它的作用就是在多个命名服务器之间快速迁移记录，由于查询返回的响应比较大，所以会使用 TCP 协议来传输数据包。
> ……
> 我们可以简单总结一下 DNS 的发展史，1987 年的 RFC1034 和 RFC1035 定义了最初版本的 DNS 协议，刚被设计出来的 DNS 就会同时使用 UDP 和 TCP 协议，对于绝大多数的 DNS 查询来说都会使用 UDP 数据报进行传输，TCP 协议只会在区域传输的场景中使用，其中 UDP 数据包只会传输最大 512 字节的数据，多余的会被截断；两年后发布的 RFC1123 预测了 DNS 记录中存储的数据会越来越多，同时也第一次显式的指出了**发现 UDP 包被截断时应该通过 TCP 协议重试**。
> 过了将近 20 年的时间，由于互联网的发展，人们发现 IPv4 已经不够分配了，所以**引入了更长的 IPv6**，DNS 也在 2003 年发布的 RFC3596 中进行了协议上的支持；随后发布的 RFC5011 和 RFC6376 增加了在鉴权和安全方面的支持，但是也带来了巨大的 DNS 记录，UDP 数据包被截断变得非常常见。
> RFC6891 提供的 DNS 扩展机制能够帮助我们在一定程度上解决大数据包被截断的问题，减少了使用 TCP 协议进行重试的需要，但是由于**最大传输单元的限制**，这并不能解决所有问题。
> DNS 出现之后的 30 多年，RFC7766 才终于提出了使用 TCP 协议作为主要协议来解决 UDP 无法解决的问题，TCP 协议也不再只是一种重试时使用的机制，随后出现的 DNS over TLS 和 DNS over HTTP 也都是对 DNS 协议的一种补充。

### 全局流量管理 GTM

- [「全局流量管理产品原理」](https://help.aliyun.com/document_detail/189591.html?spm=a2c4g.11186623.6.640.3198229dgDSHXU)，2020-12-11，阿里云

> 全局流量管理（GTM）支持用户就近接入、高并发负载均衡、健康检查与故障切换，可以帮助企业在短时间内构建同城多活与异地灾备的容灾架构。
> GTM 属于 DNS 级别的服务，使用 DNS 向向用户返回特定的服务地址，然后客户端用户直接连接到服务地址。

当递归解析器接收到响应的 CNAME 结果后，会再执行一遍 DNS 查找过程，得到 GTM 服务器的 IP 地址。递归解析器向 GTM 服务器发送请求，GTM 收到请求后，会根据运行机制和预配置策略向递归解析器响应最终应用服务的 IP 地址。

递归解析器将最后一次查询得到的 IP 地址作为访问 URL 的最终地址，返回给浏览器，同时缓存到本地。浏览器使用此 IP 地址直接向应用服务器发起网络连接，开始进行业务通信。

## 通过 ARP 获取 MAC 地址

- [「地址解析协议」](https://zh.wikipedia.org/wiki/%E5%9C%B0%E5%9D%80%E8%A7%A3%E6%9E%90%E5%8D%8F%E8%AE%AE)，Wikipedia
- [「图解 ARP 协议（四）代理 ARP：善意的欺骗」](https://blog.51cto.com/chenxinjie/1961255)，2017-09-01

经过传输层和网络层封装后的包含有 HTTP 报文的数据包，现在来到了链路层。在这里，还将为它加上 MAC 头部。

> 在**以太网协议**（在点对点协议 PPP 中，知道 IP 地址就可以进行通信；本文的讨论基于以太网协议）中规定，同一局域网中的一台主机要和另一台主机进行直接通信，必须要知道目标主机的 MAC 地址……另外，当发送主机和目的主机不在同一个局域网中时，即便知道对方的 MAC 地址，两者也不能直接通信，必须经过**路由转发**才可以。

如何将已知的目标主机的 IP 地址，转换为数据链路传输需要的 MAC 地址？在 IPv4 中，这通过地址解析协议 ARP（Address Resolution Protocol）实现；在 IPv6 中，使用邻居发现协议 NDP（Neighbor Discovery Protocol）代替 ARP。

以 ARP 协议为例，它通过 ARP 请求和 ARP 响应报文确定 MAC 地址。ARP 请求报文是一种广播报文，**局域网内**的所有主机都可以收到。当某一个主机发现请求报文中的 IP 地址为自己的 IP 地址，就会发送 ARP 响应报文给发出请求报文的主机。

大多数情况下，我们需要与不在同一个局域网的主机通信，但由于每个网段都是独立的广播域，没法直接向互联网上的其它主机发送广播报文，该怎么办？网关设备就在这里大显身手了。

当主机**已设置网关**时，主机设置的网关设备将接收到 ARP 请求报文，以路由器为例：路由器发现 ARP 请求报文中的 IP 地址不属于当前局域网，就把自己的 MAC 地址响应给请求主机。后续请求主机直接使用这个 MAC 地址，将数据包传输给路由器。而数据包通过路由器的**路由转发**功能，最终顺利抵达互联网上对应 IP 地址的主机。

当主机**未设置网关**时，可以使用 **代理 ARP**（ARP Proxy）机制。局域网内的所有网关设备将接收到 ARP 请求报文，还是以路由器为例：路由器发现 ARP 请求报文中的 IP 地址不属于当前局域网，而是属于自己**已知的**另一个网段上的某台主机，就将自己作为代理，把自己的 MAC 地址响应给请求主机。后续请求主机直接使用这个 MAC 地址，通过路由器代理，就可以访问到局域网外的目标主机了。与 ARP 相比，代理 ARP 有如下局限：

- 代理 ARP 需要有目标网关的信息；
- 代理 ARP 每次访问新的外网地址时，都需要发送一次 ARP 请求；
- 代理 ARP 受限于沿途网络设备。例如部分路由器可能不支持此功能，而支持此功能的路由器在默认情况下一般没有启用代理 ARP。

在跨网段通信中，无论使用 ARP 还是代理 ARP，发出 ARP 请求的主机总会收到网关的 MAC 地址作为响应。

因此，在实际网络中，无论是局域网内通信，还是跨网段通信，绝大多数情况下还是使用的是 ARP，而非代理 ARP。代理 ARP 是对 ARP 的补充，是 ARP 的拓展使用。

言归正传，假如我们使用的是 IPv4 网络，通过 ARP 协议，我们将收到主机设置的网关设备的 MAC 地址，这样我们就顺利地为数据包添加了 MAC 头部。现在，完整的数据包就可以从主机传输到网关设备上，再驶入互联网的快车道，最终抵达服务器了。

### RARP 和 IARP

- [「图解 ARP 协议（六）RARP 与 IARP：被遗忘的兄弟协议」](https://zhuanlan.zhihu.com/p/29081692)，2017-09-05

RARP 即反向 ARP（Reverse ARP），功能与 ARP 恰巧相反，用来实现 MAC 地址到 IP 地址的映射。

一个简单的例子是，当一台主机刚刚接入网络，这时它还没有局域网分配的内网 IP 地址。通过 RARP，它可以向局域网发送广播，广播包含自己的 MAC 地址，如果局域网内有 RARP 服务器且**记录有此 MAC 地址的映射 IP 地址**，那么它将接收到 RARP 响应，于是主机就拥有了自己的 IP 地址。

RARP 有这些特性：

- RARP 服务器必须提前绑定 MAC 地址和 IP 地址。如果没有提前绑定，则服务器不会发回响应；
- RARP 服务器只能给请求的主机分配 IP 地址，不包括网关、DNS 等其它信息。

在后来，有了启动协议 BOOTP，又有了现在最常用的[动态主机设置协议 DHCP](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)。

> RARP 是一种逝去的地址分配技术，是 BOOTP 和 DHCP 的鼻祖，目前我们的电脑基本不会用到这个协议，只有部分无盘工作站等情况需要用到。

IARP 即逆向 ARP（Inverse ARP），在帧中继网络（广域网）中实现 DLCI 到 IP 地址的映射。在帧中继网络中，它的功能**类似于**以太网中 MAC 地址到 IP 地址的映射。

随着广域网技术的更迭，帧中继技术正慢慢被被其它技术所替代。因此 IARP 作为帧中继技术中的一环，在现实中的使用也愈来愈少。

## 使用 TLS 与服务器建立安全的 TCP 连接

在发送包含 HTTP 报文的数据包之前，客户端还要先通过三次握手与服务器建立 TCP 连接，这是为了保证数据传输的**可靠性**。在前面，我们已经得到了服务器的 MAC 地址，因此包含建立 TCP 连接请求报文的数据包可以顺利发送到服务器。

1. TCP 第一次握手，客户端主动向服务器发送 TCP 请求报文。设置其首部：`SYN = 1, seq = x`。其中，x 和下面步骤中的 y 为随机值。
2. TCP 第二次握手，服务器监听请求，当接收到客户端的请求报文时，若同意连接请求，则发回确认报文。设置其首部：`SYN = 1, ACK = 1, ack = x + 1, seq = y`。
3. TCP 第三次握手，客户端收到确认报文，通知上层应用（即我们的浏览器）连接已建立，并向服务器发送确认报文。设置其首部：`ACK = 1, ack = y + 1`。服务器接收到确认报文后，也通知其上层应用连接已建立。

由于前面我们提到的 HSTS 机制，我们的 HTTP 请求将基于 HTTPS 协议。严格来说，HTTPS 并非应用层的一种新协议，它只是将 HTTP 协议的**通信接口**部分使用**传输层安全性协议 TLS**（Transport Layer Security）代替罢了。通常，HTTP 直接与 TCP 通信。当使用 TLS 时，HTTP 先与 TLS 通信，再由 TLS 与 TCP 通信。

在这种情况下，为了保证数据传输的**安全性**，客户端还要与服务器协商 TLS 协议参数，这个过程通常称为 TLS 握手。在 TLS 1.0, 1.1 及 1.2 版本中，握手有四次；而在 TLS 1.3 版本中，握手只需要三次。TLS 握手是在 TCP 连接建立之后进行的。

以 [TLS 1.3 协议](https://datatracker.ietf.org/doc/html/rfc8446)为例，握手过程如下所示：

```plaintext
       Client                                           Server

Key  ^ ClientHello
Exch | + key_share*
     | + signature_algorithms*
     | + psk_key_exchange_modes*
     v + pre_shared_key*       -------->
                                                  ServerHello  ^ Key
                                                 + key_share*  | Exch
                                            + pre_shared_key*  v
                                        {EncryptedExtensions}  ^  Server
                                        {CertificateRequest*}  v  Params
                                               {Certificate*}  ^
                                         {CertificateVerify*}  | Auth
                                                   {Finished}  v
                               <--------  [Application Data*]
     ^ {Certificate*}
Auth | {CertificateVerify*}
     v {Finished}              -------->
       [Application Data]      <------->  [Application Data]

              +  Indicates noteworthy extensions sent in the
                 previously noted message.

              *  Indicates optional or situation-dependent
                 messages/extensions that are not always sent.

              {} Indicates messages protected using keys
                 derived from a [sender]_handshake_traffic_secret.

              [] Indicates messages protected using keys
                 derived from [sender]_application_traffic_secret_N.
```

这样，我们的客户端和服务器建立了基于 TLS 1.3 的安全 TCP 连接，是时候传输数据了！

### TLS 与 SSL

- [「传输层安全性协议」](https://zh.wikipedia.org/wiki/%E5%82%B3%E8%BC%B8%E5%B1%A4%E5%AE%89%E5%85%A8%E6%80%A7%E5%8D%94%E5%AE%9A)，Wikipedia

在日常使用中，我们经常会说 SSL 或 TLS/SSL，那么 TLS 和 SSL 之间有什么关系呢？

原来，**安全套接层 SSL**（Secure Sockets Layer） 是 TLS 的前身。TLS 基于 SSL 3.0 协议，是 SSL 协议标准化后的协议名。由于 SSL 3.0 设计中的缺陷，在 2015 年 6 月，[RFC 7568](https://datatracker.ietf.org/doc/html/rfc7568) 宣布弃用 SSL 3.0。

目前最新的 TLS 1.3 协议在 2018 年 8 月发表的 [RFC 8446](https://datatracker.ietf.org/doc/html/rfc8446) 中定义。而较老的 TLS 1.0 和 TLS 1.1 也已于 2021 年 3 月，在 [RFC 8996](https://datatracker.ietf.org/doc/html/rfc8996) 中宣告被弃用。

结论是，理论上我们现在用的加密协议大抵都是 TLS，在讨论中直接使用 TLS 即可。

### TLS 1.3 的进步

- [「A Detailed Look at RFC 8446 (a.k.a. TLS 1.3)」](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)，2018-08-11

TLS 已经存在相当多的问题：例如代码缺乏测试，稳健性较低；存在许多设计缺陷，出现很多漏洞等。

在近些年来，互联网上一直存在一个主要趋势，即全面启用 HTTPS。这可以保护用户的安全，但会导致连接速度变慢。自 TLS 标准化以来，在发送加密数据之前，客户端到服务器的握手请求会进行两次往返（或者会话恢复连接时进行一次往返）。与单独的 HTTP 相比，HTTPS 中 TLS 握手的额外成本可能带来潜在的问题，并对以性能为中心的应用产生负面影响。在 [TLS 1.2 协议](https://datatracker.ietf.org/doc/html/rfc5246)中，握手过程如下所示：

```plaintext
Client                                                Server

ClientHello                   -------->
                                                 ServerHello
                                                Certificate*
                                          ServerKeyExchange*
                                         CertificateRequest*
                              <--------      ServerHelloDone
Certificate*
ClientKeyExchange
CertificateVerify*
[ChangeCipherSpec]
Finished                      -------->
                                          [ChangeCipherSpec]
                              <--------             Finished
Application Data              <------->     Application Data

* Indicates optional or situation-dependent messages that are not
always sent.
```

IETF 对 TLS 1.2 的过时设计和两次往返开销不满意，着手定义新版本的 TLS，即 TLS 1.3，旨在解决如下的主要问题：

- 减少握手延迟；
- 加密更多的握手信息；
- 提高对跨协议攻击的恢复能力；
- 删除遗留的功能。

在过去的二十年里，对密码学的研究帮助人们学到更多关于如何编写**更安全的加密协议**的知识。TLS 1.3 的设计目标之一就是删除潜在的危险元素，纠正过去的错误设计。例如：

- **移除 RSA 密钥交换模式**，仅保留 Diffie-Hellman（下简称 DH）密钥协议。RSA 模式存在两个严重的问题，一是它不是前向加密（forward secret），意味着如果有人记录下加密的会话，如果在某天获取到服务器的私钥，就可以对会话进行破解。二是存在难以修复的漏洞，可以参见 [ROBOT 攻击](https://robotattack.org/)。删除 RSA 模式，只保留 DH 密钥协议，带来了一些性能优势，我们在后面进行讨论。
- **提供更少的可选项**。在密码学中，提供太多的选项可能导致更多的错误。这个原则在选择 DH 密钥协议的参数时尤为明显。该协议的安全性取决于选择的 DH 参数值，它一方面要为较大的值，另一方面需要具有某些[正确的数学属性](https://arstechnica.com/information-technology/2016/01/high-severity-bug-in-openssl-allows-attackers-to-decrypt-https-traffic/)。在以前版本的 TLS 中，DH 参数由参与者决定；而在 TLS 1.3 版本中，则将参数限制为已知安全的值，减少用户的可选项。

更多关于安全性的改进可以访问该小节开头的[参考博客](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)。下面我们来看看 TLS 1.3 在**性能表现上的优势**。

在 DH 密钥协议中，客户端和服务器都从创建公钥-私钥对开始，然后交换各自的公钥，并根据自己的私钥和对方的公钥生成最终的密钥。最终的密钥自始至终都不会通过网络传输，DH 算法通过数学定律保证双方算出的结果一致。接下来，客户端和服务器就可以使用这个密钥对数据进行加密和解密。

TLS 1.3 使用这样一个更简单的密钥协商模式和一组更少的密钥协商选项，这意味着每个连接都将使用基于 DH 的密钥协议，服务器支持的 DH 参数更容易被猜到。有限的选择使得客户端可以在第一条消息中就发送自己的公钥，而无需等待服务器确认支持的类型。

在服务器不支持客户端使用协商选项的罕见情况下，服务器可以发送 `HelloRetryRequest` 的消息，让客户端知道自己支持哪些协商选项组。

作为小结：

> TLS 1.3 is a modern security protocol built with modern tools like formal analysis that retains its backwards compatibility. It has been tested widely and iterated upon using real world deployment data. It’s a cleaner, faster, and more secure protocol ready to become the de facto two-party encryption protocol online.
> It is one the best recent examples of how it is possible to take 20 years of deployed legacy code and change it on the fly, resulting in a better internet for everyone. TLS 1.3 has been debated and analyzed for the last three years \(2015 - 2018) and it’s now ready for prime time.

### 对称密钥加密，非对称密钥加密与混合加密

简单来说，在**对称密钥加密**中，对数据的加密和解密都使用同一个密钥。相较于非对称密钥加密，它的速度更快；但是由于密钥在传输过程中容易被获取，因此其安全性较低。

在**非对称密钥加密**（或公开密钥加密）中，使用一对密钥进行加密和解密，分别为公开密钥和私有密钥。公开密钥所有人都可以获得，客户端使用公开密钥对数据进行加密，服务器使用私有密钥对数据进行解密。同样，服务器对响应的数据使用私有密钥加密，客户端则可以通过公开密钥进行解密。相较于对称密钥加密，只要保管好私有密钥，就能保证客户端传输的消息不被破解，因此它的安全性更高；由于算法和过程更为繁琐，因此其速度较慢。

HTTPS 采用的是**混合加密**机制——在 TLS 1.3 以前，客户端首先使用服务器提供的公钥，加密一个随机值，然后将它传输给服务器。服务器使用私钥解密，获得随机值，然后使用与客户端相同的密钥生成算法，基于这个随机值和之前握手中创建的另外两个随机值，生成与客户端相同的密钥，之后客户端和服务器就可以使用这把对称密钥进行通信了。在 TLS 1.3 中，基于 DH 密钥协议，不再赘述。这样，客户端和服务器之间的通信就兼顾了对称密钥加密的高效性和非对称密钥加密的安全性。

## 欢迎访问我的博客

现在，浏览器知道了已经与远方的服务器建立好了安全可靠的传输通道，于是将 HTTP 请求信息打包好，传输到服务器上的 443 端口。服务器使用密钥解密获得其中的信息，发现是请求我博客的 HTTP 报文，遂转发给相应的 HTTP 服务。最终将我们所需的 HTML, CSS, JS 以及相关的静态文件发送给浏览器，浏览器再把它们渲染出来。

Oh, Welcome to visit my blog！

## 参考文章

除了正文中特别罗列出来的网站文章，还包括：

- [「在浏览器地址栏输入一个 URL 后回车，背后会进行哪些技术步骤？」](https://www.zhihu.com/question/34873227/answer/518086565)，2020-03-28
- [「上古面试题——浏览器地址栏输入后回车会发生什么」](https://segmentfault.com/a/1190000021000934)，2019-11-14
- [「搞懂这 9 步，DNS 访问原理就明明白白了」](https://segmentfault.com/a/1190000039650564)，2021-03-17
- [「DNS 查询机制」](https://segmentfault.com/a/1190000039406281)，2021-03-13
- [「DNS 服务器有哪些不同类型？」](https://www.cloudflare.com/zh-cn/learning/dns/dns-server-types/)，Cloudflare
- [「36 张图详解 ARP ：网络世界没有我，你哪也别想去」](https://zhuanlan.zhihu.com/p/379015679)，2021-06-08
- [「图解 HTTP」](https://www.ituring.com.cn/book/1229)，\[日]上野宣 著，于均良 译
- [「详解 TCP 三次握手以及 TLS/SSL 握手」](https://ocdman.github.io/2018/11/02/%E8%AF%A6%E8%A7%A3TCP%E4%B8%89%E6%AC%A1%E6%8F%A1%E6%89%8B%E4%BB%A5%E5%8F%8ATLS-SSL%E6%8F%A1%E6%89%8B/)，2018-11-02
- [「HTTPS 详解二：SSL / TLS 工作原理和详细握手过程」](https://segmentfault.com/a/1190000021559557)，2020-01-19
