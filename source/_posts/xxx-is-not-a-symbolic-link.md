---
title: 提示 *** is not a symbolic link 解决方案
date: 2021/3/10
updated: 2021/3/10
categories:
  - 技术琐事
tags:
  - Linux
---

## 问题描述

在 CentOS 环境下执行 `yum update` 和 `ldconfig` 命令时都出现提示警告，节选内容如下所示：

```bash
ldconfig: /OSM/lib/librdmacm.so.1 is not a symbolic link
ldconfig: /OSM/lib/libgrpc++_reflection.so.1 is not a symbolic link
ldconfig: /OSM/lib/libupb.so.9 is not a symbolic link
```

## 错误分析

进入到对应目录下查找可以发现，这里的 `librdmacm.so.1` 与 `librdmacm.so.1.1.17.4` 实际上是相同的动态库文件，而非我们期望的符号链接和动态库文件。

```bash
[root@xxx ~]# cd /OSM/lib
[root@xxx lib]# find librdmacm.so.1* | xargs ls -l
-rwx------. 1 root root 442208 Mar  9 16:13 librdmacm.so.1
-rwx------. 1 root root 442208 Mar  9 16:13 librdmacm.so.1.1.17.4
```

这个错误的产生原因是，`librdmacm.so.1` 在正常情况下应该是一个指向 `librdmacm.so.1.1.17.4` 文件的软链接，但却变成了一个动态库文件。

在一般情况下，这个错误并不会导致严重的问题；但假如目录下有多个不同版本的动态库文件，软链接可能无法正确获取到最新版本，产生隐患。

解决这个问题只需要将 `librdmacm.so.1` 修改为正常的软链接文件，重新链接两个文件就可以了。

## 解决方案

执行 `ln -sf [动态库文件或源文件] [符号链接或目标文件]` 即可，其中 `-s` 指创建软链接，`-f` 指强制执行。例如：

```bash
[root@xxx lib]# ln -sf librdmacm.so.1.1.17.4 librdmacm.so.1
[root@xxx lib]# find librdmacm.so.1* | xargs ls -l
lrwxrwxrwx. 1 root root     21 Mar 10 16:26 librdmacm.so.1 -> librdmacm.so.1.1.17.4
-rwx------. 1 root root 442208 Mar  9 16:13 librdmacm.so.1.1.17.4
```

现在正如我们预期的，`librdmacm.so.1` 正确指向了 `librdmacm.so.1.1.17.4`。

### 更好的方式

假如同时报了很多个类似的提示，应当如何处理呢？

我们知道执行 `ldconfig` 命令时，会自动为关联目录下的所有动态库文件创建对应的软链接。因此我们只需要删除掉这些重复的文件，再执行命令就可以了。

将 `ldconfig` 命令的错误输出重定向到临时文件中，读取内容，组合使用 `cut` 和 `rm` 命令即可实现删除重复文件，接下来删除存储错误信息的临时文件。最后再次执行 `ldconfig` 创建软链接。

```bash
# 标准错误输出到 dupNote 临时文件中
ldconfig 2> dupNote
# 删除重复的动态库（非软链接）文件
cat dupNote | cut -c 11- | rev | cut -c 23- | rev | xargs rm -rf
# 删除刚刚创建的临时文件
rm -rf dupNote
# 创建软链接
ldconfig
```

当然可以合起来变成一条命令使用：

```bash
ldconfig 2> dupNote ; cat dupNote | cut -c 11- | rev | cut -c 23- | rev | xargs rm -rf ; rm -rf dupNote ; ldconfig
```

现在执行 `ldconfig` 不再提示 `*** is not a symbolic link` 错误，问题顺利解决！

## 相关链接

- [/usr/lib/\*\*\* is not a symbolic link 问题解决 - CSDN](https://blog.csdn.net/qq_34213260/article/details/107399507)
- [Linux ln 命令 - 菜鸟教程](https://www.runoob.com/linux/linux-comm-ln.html)
