---
title: Windows 系统编译安装基于 C++ 的 gRPC
date: 2021/4/26
updated: 2021/4/26
categories:
- 后端开发
tags:
- Windows
- C++
- gRPC
---
本博客基于 CMake 实现编译 `gRPC 1.28.1` 版本。

本博客的 Windows 端使用的命令提示符界面为 Powershell。

## 安装编译依赖软件

在 Windows 系统上编译 gRPC 需要首先准备下述软件：

- Visual Studio 2015（或 2017），将使用到 Visual C++ compiler
- Git
- CMake
- nasm
- ninja（可选）

### Visual Studio 2015 (或 2017)

用于编译 gRPC。下简称 VS。

在微软的 [VS 官网](https://visualstudio.microsoft.com/zh-hans/)下载安装即可。

### Git

用于拉取 gRPC 库并下载所需的第三方依赖。

在 [Git 官网](https://git-scm.com/)下载并安装即可。

```powershell
PS C:\Users\lolipop> git --version
git version 2.21.0.windows.1
```

### CMake

用于生成编译 gRPC 的 Makefile 文件。

在 [CMake 官网](https://cmake.org/download/)下载，可以选择下载 `.msi` 文件直接安装。

例如对于 64 位的 Windows 电脑安装 `CMake 3.20.1`，找到：

|Platform|Files|
|---|---|
|Windows x64 Installer: Installer tool has changed. Uninstall CMake 3.4 or lower first!|cmake-3.20.1-windows-x86_64.msi|

下载并运行 `.msi` 文件安装即可。

```powershell
PS C:\Users\lolipop> cmake --version
cmake version 3.20.1
```

### nasm

gRPC 的第三方依赖 `boringssl` 需要此软件。

在 [nasm 官网](https://www.nasm.us/)下载，可以选择下载 `.exe` 文件直接安装。

例如对于 64 位的 Windows 电脑安装 `nasm 2.15.05`，可以进入 `/pub/nasm/releasebuilds/2.15.05/win64` 目录下载 `nasm-2.15.05-installer-x64.exe` 文件并执行安装操作。

nasm 默认安装目录为 `C:\Users\${您的工号}\AppData\Local\bin\NASM`（若非此目录，请在安装界面确认安装的路径），将该目录添加到环境变量中即可。

```powershell
PS C:\Users\lolipop> nasm --version
NASM version 2.15.05 compiled on Aug 28 2020
```

### ninja（可选）

您可以使用 Ninja 来加速编译。

假如您希望使用它，后续的编译操作可参考[官方文档](https://github.com/grpc/grpc/blob/master/BUILDING.md#windows-using-ninja-faster-build)，本博客**不使用** Ninja 加速编译。

## 拉取 gRPC 库

建议在能够连接 Github 的机器环境利用 Git 克隆 gRPC 库并获取第三方依赖，再打包出来给 windows 系统编译使用。

```bash
# 克隆 gRPC 仓库
# 对于特定的分支，例如 gRPC 1.28.1 版本，可以使用此命令：
# git clone https://github.com/grpc/grpc.git -b v1.28.1
git clone https://github.com/grpc/grpc.git
# 获取 gRPC 第三方依赖
cd grpc
git submodule update --init
```

## 编译 gRPC

首先创建文件夹存储编译结果，并执行 `cmake` 命令生成 Makefile 文件：

```powershell
# 在 grpc 目录下创建 .build 目录并进入
md .build
cd .build
# 生成 Makefile 文件
# 其中 Visual Studio 15 2017 为当前的 VS 版本
cmake .. -G "Visual Studio 15 2017"
# 如果希望安装 gRPC，应设置 -DgRPC_INSTALL=ON，如：
# cmake .. -DgRPC_INSTALL=ON -G "Visual Studio 15 2017"
```

[特别的](https://github.com/grpc/grpc/blob/master/BUILDING.md#install-after-build)，如果您希望安装 gRPC，但使用的 CMake 版本低于 3.13，或编译的 gRPC 版本低于 1.27，在执行生成 Makefile 文件的 `cmake` 命令之前，需要自行手动编译安装 gRPC 的依赖库，且在 `cmake` 命令时指定这些库的路径。

> 尽管[不推荐](https://github.com/grpc/grpc/blob/master/BUILDING.md#windows-a-note-on-building-shared-libs-dlls)，在生成 Makefile 文件时您也可以指定 `-DBUILD_SHARED_LIBS=ON` 以编译生成 gRPC C++ 的 DLL 文件。如：`cmake .. -DBUILD_SHARED_LIBS=ON -G "Visual Studio 15 2017"`

建议使用 VS 执行编译操作。

首先，使用**管理员权限**打开 VS，否则在安装 gRPC 时会报错。

接着使用 VS 打开此目录下的 `grpc.sln` 解决方案，找到**解决方案资源管理器**（默认情况下在 VS 的右侧）中的 `ALL_BUILD` 项，右键并选择**生成**按钮，开始执行编译操作。

当然，您也可以使用命令行界面执行 `cmake` 命令来编译 gRPC：

```powershell
# 执行编译
# 编译的结果将存放在 grpc/.build/Release 目录下
cmake --build . --config Release
```

等待编译结束，不妨泡杯咖啡听会儿歌。

## 安装 gRPC

对于使用 VS 执行编译操作，编译结束后，在**解决方案资源管理器**中找到 `INSTALL` 项，右键并选择**生成**按钮，开始执行安装操作。

如果报错，请确保您已使用管理员权限打开 VS。打开后右键并选择**重新生成**按钮。

生成的文件默认存放在 `C:\Program Files (x86)\grpc` 目录。

对于使用命令行界面执行编译操作，将在 `grpc\.build\Release` 目录下生成 `address_sorting.lib`，`grpc.lib`，`gpr.lib`，`grpc++.lib` 等库。

如果设置了 `-DgRPC_INSTALL=ON`，则可以在编译完成后执行 `make install` 命令进行安装。

## 测试 gRPC 编译安装结果

接下来的步骤基于 VS 编译安装 `gRPC 1.28.1` 的结果，测试 Windows 系统下的 gRPC 环境是否安装成功。

移动到 git 克隆的 gRPC 源码目录下的 `grpc\examples\cpp\helloworld` 目录，创建存放编译结果的文件夹 `cmake\build`，进入到该目录，执行下面的命令：

```powershell
# 生成 Makefile 文件
# 其中 C:\Program Files (x86)\grpc 是 gRPC 默认的安装目录
cmake -DCMAKE_PREFIX_PATH='C:\Program Files (x86)\grpc' ../..
```

使用管理员权限打开 VS，并打开当前目录下的 `HelloWorld.sln` 解决方案，右键分别选择解决方案资源管理器中的 `greeter_client.cc` 和 `greeter_server.cc` 并点击生成按钮。

编译完成后，会在 `cmake\build\Debug` 目录下生成我们需要的可执行文件 `greeter_server.exe` 和 `greeter_client.exe`。

使用 Powershell 移动到该目录，启动服务端 `./greeter_server.exe`：

```powershell
PS grpc\examples\cpp\helloworld\cmake\build\Debug> ./greeter_server.exe
Server listening on 0.0.0.0:50051
```

服务端默认监听 50051 端口。

再启动一个 Powershell 移动到该目录，启动客户端 `./greeter_client.exe`：

```powershell
PS grpc\examples\cpp\helloworld\cmake\build\Debug> ./greeter_client.exe
Greeter received: Hello world
```

成功打印出 `Greeter received: Hello world` 字段，测试成功！

作为对照组，您可以关闭掉服务端，再执行客户端，观察打印的结果。

Hello, gRPC world!

## 参考资料

- [编译gRPC(windows)和测试demo](https://blog.csdn.net/xiaoyafang123/article/details/76529917) - 2017.08.01 - 注：博主填的转载，暂未找到原文链接
