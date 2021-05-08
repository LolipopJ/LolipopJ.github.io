---
title: Linux 容器更新或降级 GCC 版本
date: 2021/4/20
updated: 2021/4/20
categories:
- 后端开发
tags:
- Linux
- GCC
- Docker
---
如果软件源可用，可以使用 CentOS 的 yum 包管理器或 Ubuntu 的 apt 包管理器等一键安装 GCC，例如：

```bash
yum -y install gcc
yum -y install gcc-c++

# 或是一键安装开发工具软件包，包括 gcc, g++ 等
yum groupinstall "Development Tools"
```

本文适用于系统中**包含有**其它版本的 GCC 编译器情况下，手动更新或降级 GCC 编译器。编译 GCC 的过程十分耗时，如果能使用包管理器尽量还是使用包管理器吧。

NOTE: 如果仅使用 GCC 进行编译操作或不确定当前系统能否兼容新版本的 GCC，建议在 **Docker 容器环境**中执行编译和安装操作，并在容器中使用 GCC 编译器进行编译源码。

```bash
# 查看当前系统中 GCC 的版本
gcc -v
```

## 下载 GCC 并解压

在 [GCC 官网](https://gcc.gnu.org/mirrors.html)选择下载 GCC 的镜像站点，选择进入 `release/` 目录，选择需要的 GCC 版本下载即可。

本文以安装 `GCC 10.3.0` 为例，进入 `release/gcc-10.3.0/` 目录，选择 `gcc-10.3.0.tar.gz` 进行下载。

将压缩包传入 Docker 容器环境，并解压到容器的 `/usr/local/` 目录下。

```bash
tar -xf gcc-10.3.0.tar.gz -C /usr/local/
```

## 下载 GCC 依赖包

执行以下命令，下载 GCC 编译所需的依赖包：

```bash
cd /usr/local/gcc-10.3.0
# 执行脚本下载依赖包
./contrib/download_prerequisites
```

对于较老版本的 GCC（例如 `4.9.4` 版本），执行脚本时可能会无法连接服务器，可以更换代理进行下载：

```bash
# 编辑 contrib/download_prerequisites 文件
vim ./contrib/download_prerequisites
```

将文件中 `ftp://gcc.gnu.org/pub/gcc/infrastructure` 字段更换为 `http://www.mirrorservice.org/sites/sourceware.org/pub/gcc/infrastructure`，然后再在根目录执行 `./contrib/download_prerequisites` 命令下载依赖包即可。

对于较新版本的 GCC（例如 `10.3.0` 版本），依赖包包括 `gmp`, `mpfr`, `mpc` 以及 `isl`。提示如下，表示依赖下载成功：

```bash
2021-04-19 15:32:27 URL:http://gcc.gnu.org/pub/gcc/infrastructure/gmp-6.1.0.tar.bz2 [2383840/2383840] -> "./gmp-6.1.0.tar.bz2" [1]
2021-04-19 15:32:30 URL:http://gcc.gnu.org/pub/gcc/infrastructure/mpfr-3.1.4.tar.bz2 [1279284/1279284] -> "./mpfr-3.1.4.tar.bz2" [1]
2021-04-19 15:32:34 URL:http://gcc.gnu.org/pub/gcc/infrastructure/mpc-1.0.3.tar.gz [669925/669925] -> "./mpc-1.0.3.tar.gz" [1]
2021-04-19 15:32:38 URL:http://gcc.gnu.org/pub/gcc/infrastructure/isl-0.18.tar.bz2 [1658291/1658291] -> "./isl-0.18.tar.bz2" [1]
gmp-6.1.0.tar.bz2: OK
mpfr-3.1.4.tar.bz2: OK
mpc-1.0.3.tar.gz: OK
isl-0.18.tar.bz2: OK
All prerequisites downloaded successfully.
```

## 编译 GCC

回到上一级目录即 `/usr/local`，手动创建一个目录，存放编译 GCC 源码生成的文件：

```bash
cd /usr/local
mkdir gcc-build-10.3.0
cd gcc-build-10.3.0
```

现在我们在 `/usr/local/` 路径下创建了一个名为 `gcc-build-10.3.0` 的目录，并进入到此目录中。

GCC 编译器支持多种编程语言的编译，但我们一般使用它来编译 C 和 C++ 语言程序的源码。因此在编译 GCC 之前可以配置只启用 C 和 C++ 语言支持。这一步为**可选**操作：

```bash
/usr/local/gcc-10.3.0/configure --enable-checking=release --enable-languages=c,c++ --disable-multilib
```

如果不需要禁用多语言编译支持，则直接运行 `configure` 即可：

```bash
/usr/local/gcc-10.3.0/configure
```

执行完成后，会在当前路径创建 `Makefile` 文件，执行 `make` 命令编译 GCC 源程序即可。

编译过程会占用很大的空间，请确保当前目录的空间足够使用。

考虑到单作业执行编译操作十分之慢（参考文档的作者在他的机器上花费了 6 小时才完成编译），可以设置 `-j` 选项执行[并行作业](https://stackoverflow.com/questions/414714/compiling-with-g-using-multiple-cores)，选项后边的数字建议为 CPU 内核数量的 1.5 倍甚至 2 倍。如下述命令同时启用 8 个作业并行编译 GCC：

```bash
make -j 8
```

现在，忘记这边的事情，去做一些其它的事儿吧！

---

Tue Apr 20 9:52 CST 2021 - Tue Apr 20 12:33:29 CST 2021.

好久不见！我的机器在 8 个作业并行编译的情况下，大约花费了 2.5 小时完成了编译。

现在执行下述命令安装 GCC 即可：

```bash
make install
```

此时直接执行 `gcc -v` 仍会显示以前安装的版本，在**重启系统**之后就会显示为当前安装的版本。

```bash
# 重启容器环境
docker restart ${CONTAINER}

# 检查安装是否成功
gcc -v

# 显示如下内容表示安装成功
Using built-in specs.
COLLECT_GCC=gcc
COLLECT_LTO_WRAPPER=/usr/local/libexec/gcc/x86_64-pc-linux-gnu/10.3.0/lto-wrapper
Target: x86_64-pc-linux-gnu
Configured with: /usr/local/gcc-10.3.0/configure --enable-checking=release --enable-languages=c,c++ --disable-multilib
Thread model: posix
Supported LTO compression algorithms: zlib
gcc version 10.3.0 (GCC)
```

## 文末碎碎念

我没有在 Docker 容器环境里执行 `make install` 操作，接着直接重启了当前主机，导致主机出现问题没法登陆。

一般建议编译和安装操作都在 Docker 容器环境里进行，不要直接操作宿主机环境！

## 参考文档

- [GCC编译器下载和安装教程（针对Linux发行版）](http://c.biancheng.net/view/7933.html)
