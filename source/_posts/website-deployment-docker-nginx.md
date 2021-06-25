---
title: 使用基于 Docker 的 Nginx 部署静态网页项目
date: 2021/6/25
updated: 2021/6/25
categories:
- 技术琐事
tags:
- Nginx
- Docker
- Linux
---
现在，我已经安装了 Docker，并拉取了 Nginx 的镜像。除此之外，我也购买了域名，完成了备案，并且为域名配置了 SSL。一切准备就绪，那么我该怎么将我的静态网页项目在 Linux 主机上通过 Nginx 部署，最终实现域名访问呢？

本文以部署我的个人博客页面为例，介绍如何使用基于 Docker 的 Nginx 部署静态网页项目。

## 准备静态网页项目

为了更方便管理网页项目，可以在主机根目录下新建一个目录，例如 `www`：

```bash
sudo -i # 切换为管理员用户
cd /
mkdir www
```

现在，我已经有了一个完整的静态网页项目——我的[个人博客](https://github.com/LolipopJ/LolipopJ.github.io)。首先通过 `git` 命令将它克隆下来：

```bash
cd /www
git clone https://github.com/LolipopJ/LolipopJ.github.io.git -b master
```

## 准备 SSL 证书

我使用了腾讯云执行了备案操作，并申请了免费的 SSL 证书。参考[腾讯云官方文档](https://cloud.tencent.com/document/product/400/35244)，下面执行安装 SSL 证书操作。

将下载的证书文件传入 Linux 主机中并解压。以 SSL 证书文件压缩包 `blog.towind.fun.zip` 为例：

```bash
# 将文件解压到当前目录下的 blog.towind.fun 目录中
unzip blog.towind.fun.zip -d blog.towind.fun
```

可以将 `blog.towind.fun/Nginx` 目录下的文件放置到 `/www/cert` 目录下：

```bash
mkdir /www/cert
cp blog.towind.fun/Nginx/* /www/cert
```

接下来需要做的，就是将 `/www/LolipopJ.github.io` 目录下的文件交给 Nginx 解析。

## 创建 Nginx 容器

从 Nginx 1.19 版本开始，允许在配置中自定义环境变量，只需要编写一个 `docker-compose.yml` 文件。`docker-compose` 是用来将 Docker 自动化的命令，如果还没有，需要先安装它：

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

可以用 `docker-compose --version` 命令测试安装的结果。

在默认情况下，Nginx 会寻找容器的 `/usr/share/nginx/html` 目录下的网页文件，因此我们需要把网页文件放到这个目录下去。最简单的方式是通过挂载 volume 使得容器可以访问到我们的 `/www/LolipopJ.github.io` 目录。

在 `/www/LolipopJ.github.io` 目录下创建 `docker-compose.yml`，编辑如下：

```yml
version: "1.0"
services:
  blog:
    image: nginx:1.21.0
    container_name: blog-nginx
    restart: always
    volumes:
      - ./:/usr/share/nginx/html
      - ./templates:/etc/nginx/templates
      - /www/cert:/etc/nginx/cert
    ports:
      - 80:80
      - 443:443
    environment:
      - NGINX_HOST=blog.towind.fun
      - NGINX_HOST_SSL_CRT=cert/1_blog.towind.fun_bundle.crt
      - NGINX_HOST_SSL_KEY=cert/2_blog.towind.fun.key
```

由于 `nginx.conf` 读取文件时，默认以 `/etc/nginx` 为起始目录，因此当把 `/www/cert` 目录挂载到 `/etc/nginx/cert` 目录时，应当设置环境变量 `NGINX_HOST_SSL_CRT` 为 `cert/1_www.example.com_bundle.crt`。

在默认情况下，执行此文件后，将会读取 `templates`（对应容器中的 `/etc/nginx/templates`）目录下的模板文件，并将结果输出到容器中 `/etc/nginx/conf.d` 目录下。因此，可以在 `/www/LolipopJ.github.io` 目录下创建 `templates` 目录，并编写 `templates/default.conf.template` 文件如下：

```sh
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  server_name ${NGINX_HOST};
  ssl_certificate ${NGINX_HOST_SSL_CRT};
  ssl_certificate_key ${NGINX_HOST_SSL_KEY};

  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
  }

  error_page 404 /404.html;

  error_page 500 502 503 504 /50x.html;
  location = /50x.html {
    root /usr/share/nginx/html;
  }
}
# 将 http 请求转为 https 请求
server {
  listen 80;
  listen [::]:80 ssl;
  server_name ${NGINX_HOST};
  return 301 https://$host$request_uri; 
}
```

现在，在 `/www/LolipopJ.github.io` 目录下有我们编写好的 `docker-compose.yml` 和 `templates/default.conf.template` 文件；另外，为部署 https 服务所需的 ssl 证书文件在 `/www/cert` 目录下。那么最后只需要在 `/www/LolipopJ.github.io` 目录执行下面的命令即可：

```bash
docker-compose up -d
```

其中，`-d` 表示在后台运行容器。执行后，将拉起 Nginx 容器，并在容器中生成对应的 `/etc/nginx/conf.d/default.conf` 文件，供 `/etc/nginx/nginx.conf` 读取。

## 从浏览器访问

嘿！一切就绪，从浏览器访问我的博客吧！网址是：[https://blog.towind.fun](https://blog.towind.fun/)

当我的个人博客有更新时，可以通过 `git` 命令来拉取，然后重新执行 `docker-compose up -d` 即可：

```bash
cd /www/LolipopJ.github.io
git pull
docker-compose up -d
```

## 参考文档

- [How To Use the Official NGINX Docker Image](https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/)
