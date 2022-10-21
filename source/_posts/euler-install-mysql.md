---
title: 在 Euler 系统上离线安装 MySQL 5.7
date: 2021/6/4
updated: 2021/7/29
categories:
  - 后端开发
tags:
  - Linux
  - MySQL
---

## 查看系统 OS 及架构

以 Euler 系统为例，在终端上输入命令查看，可以通过 `rpm -qa | grep euleros-release` 命令找到 rpm 包，再通过 `rpm -qi ${包名}` 查看系统 OS 及架构信息：

```bash
[root@lolipop ~]# rpm -qa | grep euleros-release
euleros-release-2.0SP5-13.eulerosv2r7.x86_64
[root@lolipop ~]# rpm -qi euleros-release-2.0SP5-13.eulerosv2r7.x86_64
Name        : euleros-release
Version     : 2.0SP5
Release     : 13.eulerosv2r7
Architecture: x86_64
......
```

当然，也可以使用通用的 `uname -a` 命令。

当前系统为 Euler 2.0 \(SP5\)，处理器架构为 x86_64。

## 下载 MySQL

Euler 2.0 系统基于 CentOS 7 开发，而 CentOS 7 由 Red Hat Enterprise Linux 依照开放源代码规定发布的源代码所编译而成。因此在[此页面](https://downloads.mysql.com/archives/community/)下载 MySQL 的时候，其中的 Operating System 项应选择 `Red Hat Enterprise Linux / Oracle Linux`，OS Version 应选择 `Red Hat Enterprise Linux 7 / Oracle Linux 7 (x86, 64-bit)`。接下来，选择下载 `RPM Bundle` 即可。

例如，在浏览器访问 `https://downloads.mysql.com/archives/get/p/23/file/mysql-5.7.33-1.el7.x86_64.rpm-bundle.tar`，将自动开始下载 MySQL 5.7.33 适用于 Oracle Linux 7 的 x86_64 版本。

## 安装 MySQL

将下载好的档案包传输到 Linux 主机上或 Docker 容器里，解压之：

```bash
tar -xvf mysql-5.7.33-1.el7.x86_64.rpm-bundle.tar
```

按顺序安装这些 rpm 包：

```bash
rpm -ivh mysql-community-common-5.7.33-1.el7.x86_64.rpm
rpm -ivh mysql-community-libs-5.7.33-1.el7.x86_64.rpm
rpm -ivh mysql-community-client-5.7.33-1.el7.x86_64.rpm
rpm -ivh mysql-community-server-5.7.33-1.el7.x86_64.rpm
```

其它的包并非必须，而是开发时可能会用到的，暂时忽略即可。

## 初始化 MySQL

初始化 MySQL 数据库：

```bash
mysqld -I
```

该命令会初始化默认数据库并创建一个有随机密码的超级用户，密码会打印到 MySQL 的日志中。

如果初始化时出现 `Fatal error: Please read "Security" section of the manual to find out how to run mysqld as root!` 报错，可以强制使用 root 权限执行：

```bash
mysqld -I --user=root
```

接下来，为目录移除可读权限，这是因为 MySQL 为了安全考虑，会忽略到权限过高的文件：

```bash
chown -R mysql:mysql /var/lib/mysql
```

## 启动 MySQL 服务

配置完成后，就可以启动 MySQL 服务了：

```bash
service mysqld start
```

确保启动成功，您可以通过这个命令查看 MySQL 服务的状态：

```bash
service mysqld status
```

## 登录 MySQL

在之前的初始化过程中，我们生成了一个超级用户和它的随机登录密码。可以通过下面的命令查看这个随机密码：

```bash
grep -n 'password' /var/log/mysqld.log
```

例如，打印结果如下：

```bash
Storage:~ # grep -n 'password' /var/log/mysqld.log
7:2021-06-02T07:50:39.284449Z 1 [Note] A temporary password is generated for root@localhost: IN2Scm=ERki9
```

则默认的随机密码为：`IN2Scm=ERki9`，您应当保管好此密码不要泄露，或是修改为新的密码。

使用这个密码，我们就可以登录到 MySQL 中去了：

```bash
Storage:~ # mysql -uroot -pIN2Scm=ERki9
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
Server version: 5.7.33 MySQL Community Server (GPL)

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

此时已经可以正常执行 MySQL 数据库操作了。

假如需要修改密码，可以执行下面的语句：

```sql
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '${新的密码}';
```

> 注意，新的密码默认情况下需要符合长度，且必须包括数字，小写或大写字母，以及特殊字符。
> 尽管不推荐，您也可以设置密码复杂度属性，这样密码只需要满足长度要求即可使用：`SET GLOBAL validate_password_policy=0;`

## 授权 MySQL 远程连接

登录到 MySQL 中，执行下面的命令：

```sql
mysql> GRANT all privileges ON *.* TO 'root'@'%' IDENTIFIED BY '${您的密码}';
```

现在便可以使用其它设备远程连接 MySQL 数据库了。
