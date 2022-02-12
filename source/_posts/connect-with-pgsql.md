---
title: 连接到 Windows 端的 PostgreSQL 数据库
date: 2022/2/12
updated: 2022/2/12
categories:
- 后端开发
tags:
- PostgreSQL
- Windows
---

假设，您身边有两台电脑，一台打算用来做 PostgreSQL 数据库服务器，一台用来做客户端。服务器上的 PostgreSQL 14 安装在 `C:\Program Files\PostgreSQL\14` 目录下，数据库文件保存在 `C:\Program Files\PostgreSQL\14\data` 目录，欲访问的数据库名为 `db_name`，访问数据库的用户为 `db_user`。

## 配置 `postgresql.conf`

编辑数据库配置文件 `C:\Program Files\PostgreSQL\14\data\postgresql.conf`，设置监听的远程连接地址。将 `listen_addresses` 项的值设置为 `*`，如下所示：

```conf
# - Connection Settings -

listen_addresses = '*'		# what IP address(es) to listen on;
					# comma-separated list of addresses;
					# defaults to 'localhost'; use '*' for all
					# (change requires restart)
```

## 配置 `pg_hba.conf`

编辑数据库客户端认证配置文件 `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`，设置允许连接到数据库的客户端 IP 地址。

该文件的注释处已经给出了各种配置的详细说明。这里，我们将重点放在对允许的远程连接地址的配置上。

`pg_hba.conf` 对 ADDRESS 地址的解析基于 [CIDR 无类别域间路由](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)。

那么，对于 IPv4 地址，有如下五种典型情况：

ADDRESS|说明
---|---
210.41.111.111/32|仅允许 IP 地址为 210.41.111.111 的远程连接请求
210.41.111.0/24|允许 IP 地址为 210.41.111.\* 的远程连接请求
210.41.0.0/16|允许 IP 地址为 210.41.\*.\* 的远程连接请求
210.0.0.0/8|允许 IP 地址为 210.\*.\*.\* 的远程连接请求
0.0.0.0/0|允许所有 IP 地址的远程连接请求

那么，如果我们的客户端的 IP 地址为 `210.41.112.112`，可以添加条目如下：

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_name         db_user         210.41.112.112/32       scram-sha-256
# host    db_name         db_user         210.41.112.0/24         scram-sha-256
# host    db_name         db_user         210.41.0.0/16           scram-sha-256
# host    db_name         db_user         210.0.0.0/8             scram-sha-256
# host    db_name         db_user         0.0.0.0/0               scram-sha-256
```

更小的范围，意味着更高的安全性。

## 重启数据库服务

为了让配置生效，我们需要重启启动 PostgreSQL 数据库。

在 Windows 端，PostgreSQL 作为一个服务运行。按 Windows 键，搜索 `service`，进入服务应用，找到 `postgresql-x64-*` 服务，右键重新启动即可。

![重启 PostgreSQL 数据库](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/2022/02/11/connect-with-pgsql/restart-pgsql.png)

## 连接到数据库

### 同一路由器下

配置 `pg_hba.conf`，允许相同路由器下其它主机的连接请求。例如，允许 IP 地址为 `192.168.0.0` 至 `192.168.255.255` 的连接请求：

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_name         db_user         192.168.0.0/16          scram-sha-256
```

重新启动数据库服务。

假设服务器的内网 IP 地址为 `192.168.1.104`，数据库监听端口为 `5432`。那么，当我们通过客户端连接远程数据库时，主机名应填写 `192.168.1.104`，端口应填写 `5432`，这样，我们就能顺利访问到服务器上的数据库了。

### 远程连接

假如您的用作客户端和服务器的电脑分隔两地，现在想要远程连接服务器上的数据库，该怎么办呢？下面是我常用的办法。

首先，需要获取服务器的公网 IP 地址，可以在[这里](https://www.ip138.com/)查询。这里假设服务器通过路由器与公网连接。

接着，配置路由器的**虚拟服务器**。可以通过如下步骤实现：

1. 将服务器的内网 IP 地址与它的硬件 MAC 地址绑定。别忘了在服务器的网络属性处，关闭随机硬件地址功能。
2. 配置虚拟服务器，映射路由器的外部端口为服务器的数据库端口。

最后，修改 `pg_hba.conf`，根据客户端的公网 IP 地址进行配置。如果客户端的网络环境经常变化，尽管不安全，但也可以考虑设置允许所有 IP 地址进行连接。

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_name         db_user         0.0.0.0/0               scram-sha-256
host    db_name         db_user         ::/0                    scram-sha-256
```

重新启动数据库服务。

例如，路由器的公网 IP 地址为 `210.41.111.111`，服务器的内网 IP 地址为 `192.168.1.104`，虚拟服务器外部端口为 `22212`，数据库监听端口为 `5432`。那么，当我们通过客户端连接远程数据库时，主机名应填写 `210.41.111.111`，端口应填写 `22212`，这样，我们就能顺利访问到服务器上的数据库了。
