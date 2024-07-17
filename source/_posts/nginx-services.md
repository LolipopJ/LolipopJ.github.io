---
title: 使用 Nginx 治理我的服务
date: 2024/5/13
updated: 2024/7/17
categories:
  - 技术琐事
tags:
  - Nginx
  - Linux
---

这些天在阿里云的 ECS 服务器上捣鼓自己的东西，通过 Nginx 转发请求，允许以域名的方式访问到笔者开设的不同站点、服务。

笔者撰写本篇文章，晒晒在服务器上都做了哪些工作，也希望能为您提供一些启发。

## 安装最新版本的 Nginx

笔者使用的服务器为 CentOS 7 系统，默认的 yum 源中包含的 Nginx 版本为 `1.20.1`（2021-05-21）。

更新 yum 源，添加 Nginx 的官方源：

```bash
rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
```

确认 Nginx 官方源拉取成功：

```bash
$ yum repolist
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * centos-sclo-rh: mirrors.ustc.edu.cn
 * centos-sclo-sclo: mirrors.ustc.edu.cn
nginx                                                                        | 2.9 kB  00:00:00
nginx/x86_64/primary_db                                                      |  91 kB  00:00:00
repo id                            repo name                                                  status
nginx/x86_64                       nginx repo                                                   338
```

重新安装 Nginx：

```bash
yum install nginx
```

查看当前的 Nginx 版本：

```bash
$ nginx -v
nginx version: nginx/1.26.0
```

## 提供静态内容服务

> Web 服务器的一个重要任务是提供文件（比如图片或者静态 HTML 页面）服务。

### 静态站点服务

#### 部署静态站点

要对外提供静态站点非常简单，只需要将站点的静态资源放置在服务器上，再通过 Nginx 暴露出去。

一个简单的例子是：

```conf
# /etc/nginx/nginx.conf
http {
  server {
    listen 443 ssl;
    http2 on;

    ssl_certificate /etc/letsencrypt/live/towind.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/towind.fun/privkey.pem;

    server_name towind.fun www.towind.fun blog.towind.fun;
    root /var/www/towind.fun/blog;
  }
}
```

通过上面的配置，笔者只需要将自己博客的静态资源放置在 `/var/www/towind.fun/blog` 目录，就可以通过 <https://towind.fun> 等域名访问到啦。

当然，笔者不希望有这么多个域名显示完全一样的东西，我们可以配置域名跳转，将请求重定向到一个域名上：

```conf
# /etc/nginx/nginx.conf
http {
  server {
    # ...https configurations
    server_name towind.fun www.towind.fun;
    rewrite ^/(.*)$ https://blog.towind.fun/$1 permanent;
  }
}
```

现在，访问 <https://towind.fun> 和 <https://www.towind.fun> 时，浏览器将自动 301 重定向到 <https://blog.towind.fun>。

此外，笔者为了更好的 SEO，缩短了链接的级数，即从 `/YYYY/MM/DD/blog-title` -> `/YYYYMMDD/blog-title`。那么就需要将过去被搜索引擎收录的链接，重定向到新的链接，避免用户访问到 404 页面。可以编写配置如下：

```conf
# /etc/nginx/nginx.conf
http {
  server {
    # ...https configurations
    server_name blog.towind.fun;
    rewrite "^/(\d{4})/(\d{2})/(\d{2})/(.+)$" /$1$2$3/$4 permanent;
  }
}
```

通过简单的正则匹配即可实现链接重定向。

#### 抽取通用配置

Nginx 配置中存在大量重复的内容，我们可以将这些内容提取出来，单独放置在某个目录下，通过 `include` 指令引入。

例如对于 HTTPS 配置，可以提取为：

```conf
# /etc/nginx/conf.shared.d/https.conf
listen 443 ssl;
http2 on;

ssl_certificate /etc/letsencrypt/live/towind.fun/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/towind.fun/privkey.pem;
```

在需要的 `server` 块中引入：

```conf
# /etc/nginx/nginx.conf
http {
  server {
    include /etc/nginx/conf.shared.d/https.conf;
    server_name blog.towind.fun;
  }
}
```

又如希望用户在访问 `http://` 时自动跳转到 `https://`，可以提取为：

```conf
# /etc/nginx/conf.shared.d/http.conf
listen 80;
return 301 https://$http_host$request_uri;
```

像这样抽取出不同服务里重复的配置，能够有效地降低后续的维护成本。

#### 静态站点持续部署

由于静态站点的源码均托管在 Github 上，当新的代码提交后，希望能够自动更新服务器上的静态资源内容。笔者通过 `crontab` 配置定时任务来实现这个需求：

```cron
0 0,12,18 * * * /path/to/update-blog.sh >> /path/to/update-blog.log 2>&1
```

上面的配置表示：在每天的 0, 12, 18 点整自动执行更新博客的脚本 `/path/to/update-blog.sh`，执行的标准输出和错误输出重定向到指定日志文件 `/path/to/update-blog.log`。

至于更新脚本的实现则颇为简单，如果构建后的静态文件已经存放到了 Github 仓库的某个分支，那么只需要到本地的目录执行 `git pull` 命令即可。例如：

```bash
# /path/to/update-blog.sh
cd /var/www/towind.fun/blog
git pull
```

如果没有存放构建后的静态文件，或构建后的静态文件无法直接使用（例如 `bashPath` 不同），那么额外执行一次构建命令即可。例如：

```bash
# /path/to/update-example.sh
cd /path/to/example
git pull
npm run build
```

考虑到我们不会在服务器上编写代码并推送，可以使用 HTTPS 协议的远程地址，而不用经过 SSH 验证：

```bash
cd /path/to/example
# Change from git@github.com:username/example.git
git remote set-url origin https://github.com/username/example.git
```

### 静态站点访问性能优化

针对静态站点的访问性能优化，笔者主要配置了 Nginx 中**压缩**和**缓存**两部分内容，另外关闭了负优化的 Cloudflare CDN。

#### Gzip 压缩

配置 Nginx 启用 `gzip` 压缩，能够**显著减少**发送给客户端的静态文件体积。配置内容如下：

```conf
# /etc/nginx/nginx.conf
http {
  # 启用 gzip 压缩功能
  gzip on;
  # 压缩文件的最小大小为 10KB
  gzip_min_length 10K;
  # 压缩等级为 6。等级越低压缩速度越快，文件压缩比越小；反之速度越慢，压缩比越大
  gzip_comp_level 6;
  # 压缩的 MIME 类型
  gzip_types text/plain text/css application/json text/javascript application/javascript application/x-javascript text/xml application/xml application/xml+rss;
}
```

对于原来 1151KB 的脚本文件：

```bash
$ ll --block-size=k | grep main.js
-rw-r--r-- 1 root root 1151K main.js
```

压缩后发送给客户端只有 442KB 大小，减少了大约 62% 的体积：

![assets-gzip](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240512/nginx-services/assets-gzip.png)

在启用 `gzip` 压缩之前，笔者从访问自己的博客到文章内容显示出来，要等待大约 5 秒钟的时间。说实话，若不是自己家的站点，早已不耐烦地 `ctrl + w` 关闭了。如今只需大约 2 秒钟的时间，给访问体验带来了质的提升。

实际观察 Github Pages 的网络响应就会发现，返回给客户端的脚本或样式等文件也都经过了压缩（`br` 编码），可惜笔者到现在才知道去配置，知识积累的重要性不言而喻。

#### Cache-Control 缓存

配置 Nginx 启用 `Cache-Control` 缓存，由客户端控制是否使用本地已缓存的文件。配置内容如下：

```conf
# /etc/nginx/conf.shared.d/cache.conf
# 协商缓存验证 .html 文件
location ~* .(html)$ {
  add_header Cache-Control "no-cache";
}
# 缓存 .css, .js 文件，缓存过期时间为 1 天，缓存过期时确保获取到最新文件
location ~* .(css|js)$ {
  add_header Cache-Control "public, must-revalidate, max-age=86400";
}
# 缓存图片、视频等文件，缓存过期时间为 1 年，不得对文件进行转换
location ~* .(png|jpg|jpeg|gif|ico|svg|mp4|ogg|ogv|webm|htc|xml|woff|gz|zip|7z)$ {
  add_header Cache-Control "public, no-transform, max-age=31536000";
}
```

#### CDN 服务

笔者使用 Cloudflare 作为 DNS 解析服务器，但考虑到站点面向的用户主要来自中国，且访问量不会很大，因此关闭了 Cloudflare 提供的 DNS 代理服务。

![cloudflare-cdn-speed-down-for-me](https://i.imgur.com/9H8utju.png)

### 静态文件服务

笔者也对外提供的静态文件下载的服务，配置形如：

```conf
# /etc/nginx/conf.d/download.conf
server {
  include /etc/nginx/conf.shared.d/http.conf;
  server_name download.towind.fun;
}

server {
  include /etc/nginx/conf.shared.d/https.conf;
  server_name download.towind.fun;
  root /var/www/towind.fun/download;
  # 允许浏览静态文件目录
  autoindex on;
  # 显示静态文件大小
  autoindex_exact_size on;
  # 显示文件时间为服务器时间
  autoindex_localtime on;
  # 设置字符集为 utf-8，避免中文乱码
  charset utf-8;
}
```

上面的配置表明：笔者将对外提供下载的静态文件放置在服务器的 `/var/www/towind.fun/download` 目录下；当访问 <https://download.towind.fun> 时，就可以看见所有可下载的静态文件。

## 提供代理服务器

> Nginx 的一个常见用途是作为一个代理服务器，作用是接收请求并转发给被代理的服务器，从中取得响应，并将其发送回客户端。

### 访问内网服务

笔者将一些服务部署在了没有公网 IP 地址的内网服务器上，为了能通过域名访问到这些服务，首先使用了 frp 进行内网穿透：将拥有公网 IP 地址的服务器（公网服务器）作为 frp 服务端，将内网服务器作为 frp 客户端即可。

配置 Nginx，将特定域名的请求转发到对应的 frp 服务端端口：

```conf
# /etc/nginx/conf.d/xxx.conf
server {
  include /etc/nginx/conf.shared.d/https.conf;
  server_name xxx.towind.fun;
  location = / {
    proxy_pass http://127.0.0.1:15244;
  }
}
```

上面的配置表示：当通过 `https://xxx.towind.fun` 访问公网服务器时，请求将转发至本地的 15244 端口，再经由 frp 访问到内网服务器上对应的服务。

### 内网服务访问性能优化

Nginx 提供了服务端的 Proxy 缓存功能，如果从内网服务器返回的响应头上包含缓存控制的信息，Nginx 将自动缓存资源到公网服务器，而无需每次都去请求内网服务器。

核心的配置内容如下：

```conf
# /etc/nginx/nginx.conf
http {
  proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=defaultcache:10m max_size=1g;

  server {
    proxy_cache defaultcache;
    # （非必要）响应头添加自定义的 Nginx-Proxy-Cache 字段，如果值为 HIT 则表示命中了公网服务器本地的缓存
    add_header Nginx-Proxy-Cache $upstream_cache_status;
  }
}
```

上面的配置表示：

- 缓存文件保存在 `/var/cache/nginx` 目录。
- 缓存文件使用 2 级目录存储，第一级目录包含最多 16^1 个文件夹，第二级目录包含最多 16^2 个文件夹。即总共最多包含 16^1 \* 16^2 = 4096 个文件夹。
- 在共享内存中设置了一块别名为 `defaultcache`，大小为 10MB 的存储区域，用于存储 key 字符串。有助于 Nginx 快速判断请求是否命中本地的缓存。
- 缓存文件占用的最大空间为 1GB。达到配额时，Nginx 会自动删除掉使用频率最低的缓存文件。

这样可以有效降低内网服务器（源服务器）的负担。

一个命中 Proxy 缓存的例子如下：

![assets-gzip](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240512/nginx-services/proxy-cache-hit.png)
