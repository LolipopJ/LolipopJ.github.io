---
title: Linux 系统编译安装基于 C++ 的 gRPC
date: 2021/4/22
updated: 2021/5/11
categories:
- 后端开发
tags:
- Linux
- C++
- gRPC
- Docker
---
本文适用于 C++ 版本 gRPC 的离线编译安装，但对于[下载 gRPC](#下载-grpc) 步骤强烈建议使用 git 进行。

如果在能直接连接外网的机器上编译，可直接按照 [gRPC 官网文档](https://github.com/grpc/grpc)的指引快速执行编译操作。

## 安装基本依赖

确保机器上包括这些基本依赖：`autoconf`, `libtool`, `pkg-config` 与 C++ 编译环境。

```bash
# 检查是否有 autoconf
which autoconf

# 如果没有，则安装
# CentOS
yum install autoconf
# Ubuntu
apt-get install autoconf
```

gRPC 的编译需要 `gcc` 版本在 `4.9` 及以上。假如版本低于此，应当在 Docker 容器中安装较新版本的 GCC 再执行编译操作。

我使用 `gcc 4.9.4` 成功编译 `gRPC 1.28.x`，另外[有人测试](https://github.com/grpc/grpc/issues/24932#issuecomment-754344093)在 `4.9.2`, `5.3.1` 以及 `7.3.1` 版本编译成功；而我使用撰写此文时使用最新版本 `10.3.0` 编译报错，请读者加以选择。

更新 GCC 的方法可以参考我的[这一篇博客](https://lolipopj.github.io/2021/04/19/linux-docker-gcc-update)。

```bash
# 查看 gcc 版本
gcc -v
```

如果机器上没有 `gcc` 或 `g++` 等，可以安装 `Development Tools` 或 `build-essential` 软件包。

```bash
# CentOS
yum groupinstall "Development Tools"
# Ubuntu
apt-get install -y build-essential
```

## 安装 CMake

> `make` 是 gRPC 以前使用的构建命令，但是官方文档不再建议使用它。应使用 `bazel` 或 `cmake` 代替。此处我们选择使用 `cmake` 执行编译。

执行下述命令，如果没有找到命令则需要安装 CMake。目前编译 gRPC 需要的 CMake 最低版本为 `3.5.1`，建议使用的 CMake 版本为 `3.13` 及以上。

```bash
# 查看当前 CMake 版本
cmake --version
```

在 [CMake 官网](https://cmake.org/download/)下载需要版本的 CMake 源码或二进制文件。

例如下载适用于 x86_64 的 Linux 系统的二进制文件，可以选择下载 `cmake-3.20.1-linux-x86_64.tar.gz`，其中 `3.20.1` 为版本号。

解压，可以将 `/path/to/cmake-3.20.1-linux-x86_64/bin/` 目录下的二进制文件复制粘贴到 `/usr/bin/` 目录下；或是为它们创建软链接，创建软链接应使用绝对路径。

```bash
# 解压
tar -zxvf cmake-3.20.1-linux-x86_64.tar.gz
# 为二进制文件创建软链接
sudo ln -sf /path/to/cmake-3.20.1-linux-x86_64/bin/* /usr/bin/
# 再次执行，确保安装成功
cmake --version
```

查看版本号时如果提示 `CMake Error: Could not find CMAKE_ROOT !!!`，可能是原本调用的 CMake 二进制文件存放在其它目录下。例如，原来的 CMake 二进制文件存放在 `/usr/local/bin/` 目录下，而调用命令时系统又优先从该目录搜索命令。因此应在创建软链接时应执行：

```bash
# 创建 cmake 二进制文件软链接
sudo ln -sf /path/to/cmake-3.20.1-linux-x86_64/bin/* /usr/local/bin/
```

对于其它路径，可以通过 `find / -name "cmake"` 来寻找。

## 下载 gRPC

建议在能够直接访问外网的环境利用 git 克隆 gRPC 库并获取第三方依赖，再打包出来给其它环境编译使用。

手动下载 gRPC 及第三方依赖耗时耗力，还有可能像我一样“赔了夫人又折兵”依然编译不了。

```bash
# 克隆 gRPC 仓库
git clone https://github.com/grpc/grpc.git
cd grpc
# 获取 gRPC 第三方依赖
git submodule update --init
```

## 编译安装 gRPC

官方文档[建议](https://grpc.io/docs/languages/cpp/quickstart/#build-and-install-grpc-protocol-buffers-and-abseil)用户选择本地路径安装 gRPC，因为全局安装后想要卸载 gRPC 会十分复杂。因此，在编译安装之前，可以首先选择一个用户本地的路径。

```bash
# 安装到 $HOME/.local 中
export MY_INSTALL_DIR=$HOME/.local
# 确保目录存在
mkdir -p $MY_INSTALL_DIR
# 添加该路径下的 bin 目录到环境变量
export PATH="$PATH:$MY_INSTALL_DIR/bin"
```

在 gRPC 根目录下执行[下述操作](https://github.com/grpc/grpc/blob/master/BUILDING.md#building-with-cmake)：

```bash
# 创建存放编译 gRPC 结果的目录
mkdir -p cmake/build
# 进入到该目录
pushd cmake/build
# 生成编译 gRPC 的 Makefile 文件
# 其中 DCMAKE_INSTALL_PREFIX 指定了 gRPC 的安装路径
cmake -DgRPC_INSTALL=ON \
    -DgRPC_BUILD_TESTS=OFF \
    -DCMAKE_INSTALL_PREFIX=$MY_INSTALL_DIR \
    ../..
# 执行编译
# ${JOBS_NUM} 为同时执行的线程数，应替换为数字，下同
make -j ${JOBS_NUM}
# 安装 gRPC
make install
```

如果想要编译动态库 `.so` 文件，可以在上一步执行 `cmake` 命令时设置 `-DBUILD_SHARED_LIBS=ON`，如：

```bash
# 生成编译 gRPC 的 Makefile 文件
cmake -DBUILD_SHARED_LIBS=ON ../..
```

假如编译失败，可以参考笔者遇到的[错误和解决方案](#可能遇见的错误)。

C++ 版本的 gRPC 还依赖于 Abseil C++ 库，因此需要单独编译安装它：

```bash
# 回到 gRPC 根目录
popd
# 创建存放 Abseil C++ 编译结果的目录
mkdir -p third_party/abseil-cpp/cmake/build
# 进入到编译目录
pushd third_party/abseil-cpp/cmake/build
# 生成编译 abseil-cpp 的 Makefile 文件
cmake -DCMAKE_INSTALL_PREFIX=$MY_INSTALL_DIR \
    -DCMAKE_POSITION_INDEPENDENT_CODE=TRUE \
    ../..
# 执行编译
make -j ${JOBS_NUM}
# 安装 Abseil C++
make install
```

哈！大功告成。最后我们来测试一下 gRPC 是否安装成功。

## 测试编译安装 gRPC 成功

首先编译 gRPC 提供的示例：

```bash
# 回到 gRPC 根目录
popd
# 进入 example 目录
cd examples/cpp/helloworld
# 创建存放 example 编译结果的目录
mkdir -p cmake/build
# 进入到编译目录
pushd cmake/build
# 生成编译 example 的 Makefile 文件
# 其中 DCMAKE_PREFIX_PATH 指定我们使用的 gRPC 路径，即 gRPC 的安装路径
cmake -DCMAKE_PREFIX_PATH=$MY_INSTALL_DIR ../..
# 执行编译
make -j ${JOBS_NUM}
```

这样，在当前目录就会生成编译好的二进制文件。试试看吧！

在当前终端启用 gRPC 示例的服务端，它会默认监听当前主机的 `50051` 端口：

```bash
./greeter_server

# 显示内容如下
Server listening on 0.0.0.0:50051
```

打开一个新终端，进入到此目录，运行客户端，就可以看到访问的结果啦：

```bash
./greeter_client

# 显示内容如下
Greeter received: Hello world
```

假如退出了服务端，再运行客户端，则会打印：

```bash
# 关闭服务端，然后执行
./greeter_client

# 显示内容如下
14: failed to connect to all addresses
Greeter received: RPC failed
```

开始愉快地编写 gRPC 程序吧！

## 可能遇见的错误

### 编译 gRPC 执行 make 后提示 error

```bash
error: no matching function for call to ‘StrFormat(const char [22], const char*, char [64], int32_t&, long int&, const char*&, int&)’
```

提示报错没有找到 `StrFormat` 函数，请确保 `gcc` 版本在 `4.9` 及以上，可以执行 `gcc -v` 命令查看当前版本。

建议[更新](http://3ms.huawei.com/km/blogs/details/10193429)到 `gcc 4.9.4` 版本，笔者在该版本下顺利编译 gRPC。
