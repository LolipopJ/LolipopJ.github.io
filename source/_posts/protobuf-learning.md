---
title: Protobuf 学习笔记
date: 2021/3/29
updated: 2021/3/29
timeliness: true
categories:
  - 技术琐事
tags:
  - gRPC
  - Protobuf
---

实习中学习一下 Protobuf 的功能和语法等，整理为此笔记。主要为翻译官方文档而来。

## 什么是 Protobuf

Protobuf 是 Google 公司研发的一种用于序列化结构数据的机制，全称为 Protocol Buffers，具有语言无关、平台无关以及可拓展的特性。

我们常常把 Protobuf 与 XML (Extensible Markup Language) 相比较，它们二者都被设计来传输和存储结构化数据。相比于 XML，Protobuf 有如下优势与缺点：

- **Protobuf 占用的空间更小**。Protobuf 采用二进制格式存储数据，适合网络传输和高性能场景；而 XML 采用文本格式存储数据，数据冗余度较高。
- **Protobuf 编码和解码更快**。测试 Protobuf 库和 tinyxml2 库执行序列化和反序列化操作（[相关链接](https://zhuanlan.zhihu.com/p/91313277)），Protobuf 序列化速度大约是 XML 的 5 - 9 倍，反序列化速度大约是 XML 的 9 - 12 倍，更加适合高性能场景。
- **Protobuf 不具有可读性**。Protobuf 传输的值为二进制数据，需要专用工具生成和解析；而 XML 自身的标签和文本内容具有一定的可读性。

<details>
<summary>使用 Protobuf，只需要编写 <code>.proto</code> 文件来描述需要传输和存储的结构数据，随后编译器会为之创建一个类，实现结构数据的自动编码和解码。</summary>

With protocol buffers, you write a .proto description of the data structure you wish to store. From that, the protocol buffer compiler creates a class that implements automatic encoding and parsing of the protocol buffer data with an efficient binary format. The generated class provides getters and setters for the fields that make up a protocol buffer and takes care of the details of reading and writing the protocol buffer as a unit.

</details>

<details>
<summary>此外，Protobuf 支持使用特定的方式来拓展格式，使代码能够解析以前格式编码得到的数据。</summary>

Importantly, the protocol buffer format supports the idea of extending the format over time in such a way that the code can still read data encoded with the old format.

</details>

## 定义协议格式

为了创建基于 Protobuf 的应用程序，我们需要首先创建一个 `.proto` 文件并且给出定义：为需要序列化的每个结构数据添加一条 **message** ，然后为 message 的每个字段指定名称和类型。下面是一个来自官网的基于 C++ 语言的例子，可以让您对 `.proto` 文件有一个更加直观的了解：

```proto
syntax = "proto2"; // 协议版本

package tutorial; // 程序包声明

message Person {
  optional string name = 1;
  optional int32 id = 2;
  optional string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    optional string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }

  repeated PhoneNumber phones = 4;
}

message AddressBook {
  repeated Person people = 1;
}
```

在开头，首先指定了协议的版本，`syntax = "proto2";` 表示应使用 proto2 进行编码和解码。同理，如果指定为 `syntax = "proto3";` 则表示应使用 proto3 进行编码和解码。如果不指定协议版本，在默认情况下，编译器会使用 proto2 进行编码和解码。

使用程序包声明 `package tutorial;` 有助于防止不同项目之间的命名发生冲突。在 C++ 中，生成的类将放置在与程序包名称匹配的命名空间中。

接下来就是最重要的 message 定义了。message 是包含一组字段类型的总合。我们将基于 **proto3** 版本对 message 语法进行讲解与描述。

## proto3 基础语法

### [定义消息类型](https://developers.google.com/protocol-buffers/docs/proto3#simple)

下面是一个非常简单的 `.proto` 例子：

```proto
syntax = "proto3";

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}
```

其中第一行需要指定正在使用 `proto3` 语法，否则编译器将假定正在使用 `proto2` 语法。指定语法版本必须在文件的第一个非空、非注释行。

例子定义了一个名为 `SearchRequest` 的 message，存储了三个字段，包括字符串类型的 `query` 和整数类型的 `page_number` 与 `result_per_page`. 三个字段均为标量值类型，所有可用的标量值类型可参考[此链接](https://developers.google.com/protocol-buffers/docs/proto3#scalar)。除了标量值类型，字段还可以使用枚举和其它 message 类型。

每个定义的字段都有一个**唯一**的编号，用来标识二进制格式下的字段。例如 `query` 字段的唯一编号为 `1`. 对字段编号的补充可参考[此链接](https://developers.google.com/protocol-buffers/docs/proto3#assigning_field_numbers)。

### [字段规则](https://developers.google.com/protocol-buffers/docs/proto3#specifying_field_rules)

与 proto2 不同的是，proto3 只包括两种字段规则：

- singular. 一则 message 只能拥有不超过一个该字段。是**默认**的字段规则，不需要特别指定；
- `repeated`. 一则 message 可以拥有任意个该字段。重复值的顺序将被保留。

```proto
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  repeated string query_extras = 4;
}
```

上例中定义了三个 singular 字段 `query`, `page_number` 和 `result_per_page`，以及一个 `repeated` 字段 `query_extras`.

<details>
<summary>
作为补充，proto2 包括三种字段规则：<code>required</code>, <code>optional</code> 和 <code>repeated</code>.
</summary>

- `required`. 一则 message 中必须且只能拥有一个该字段；
- `optional`. 一则 message 中只能拥有不超过一个该字段，相当于 proto3 的 singular.
- `repeated`. 一则 message 可以拥有任意个该字段，相当于 proto3 的 `repeated`.

[相关链接](<(https://developers.google.com/protocol-buffers/docs/proto#specifying_field_rules)>)

</details>

### [保留字段](https://developers.google.com/protocol-buffers/docs/proto3#reserved)

当更新 message 定义需要完全移除一个字段时，则将来的用户在自己对该类型进行更新时可以重用该字段号。为了保证在读取旧版本的 `.proto` 时不引发问题，需要将已删除字段的字段编号（或名称）指定为 `reserved`，这样将来任何用户在更新 message 时尝试使用这些字段号（或名称）时，编译器会报错。

```proto
message Foo {
  reserved 2, 15, 9 to 11;
  reserved "foo", "bar";
}
```

上述内容指定了 2, 9, 10, 11, 15 为保留字段号，指定了 foo, bar 为保留字段名。在以后的编写中不应当被使用。

需要注意的是，不能在一条 `reserved` 语句中同时使用字段号和字段名。

```proto
reserved 2, 15, "foo"; // wrong!
```

### [使用枚举类型](https://developers.google.com/protocol-buffers/docs/proto3#enum)

当只希望某一个字段的取值为预定义值的某一个时，可以使用枚举。

```proto
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  enum Corpus {
    UNIVERSAL = 0;
    WEB = 1;
    IMAGES = 2;
    LOCAL = 3;
    NEWS = 4;
    PRODUCTS = 5;
    VIDEO = 6;
  }
  Corpus corpus = 4;
}
```

上例中我们定义了名为 `Corpus` 的枚举，其中包括 7 种可能的取值。接下来，我们就可以添加使用 `Corpus` 枚举的字段 `corpus`.

为了定义枚举常量的别名，我们可以将相同的值分配给不同的枚举常量名。为此，首先需要将 `allow_alias` 选项设置为 `true`，否则将会报错。

```proto
message MyMessage {
  enum EnumAllowingAlias {
    option allow_alias = true;
    UNKNOWN = 0;
    STARTED = 1;
    RUNNING = 1; // It works.
  }
  EnumAllowingAlias enum_allowing_alias = 1;
}
```

上例中，`STARTED` 和 `RUNNING` 为同一枚举常量的不同别名。

### [使用 Message 类型](https://developers.google.com/protocol-buffers/docs/proto3#other)

为了使消息结构更加清晰，我们可以指定其他 message 类型作为字段类型，实现嵌套。

```proto
message SearchResponse {
  repeated Result results = 1;
}

message Result {
  string url = 1;
  string title = 2;
  repeated string snippets = 3;
}
```

上例中定义了两种不同的 message 类型，`SearchResponse` 和 `Result`. 其中 `SearchResponse` 拥有一个 `results` 字段，其字段类型为 message 类型 `Result`.

### [使用嵌套类型](https://developers.google.com/protocol-buffers/docs/proto3#nested)

也许您不需要复用一些 message 类型，我们也可以将 message 类型放在 message 当中。

```proto
message SearchResponse {
  message Result {
    string url = 1;
    string title = 2;
    repeated string snippets = 3;
  }
  repeated Result results = 1;
}
```

上例与前一小段的例子有相同的效果。

嵌套类型不限定层数，可以根据需要进行深层嵌套。

```proto
message Outer { // Level 0
  message MiddleAA { // Level 1
    message Inner { // Level 2
      int64 ival = 1;
      bool  booly = 2;
    }
  }
  message MiddleBB { // Level 1
    message Inner { // Level 2
      int32 ival = 1;
      bool  booly = 2;
    }
  }
}
```

其中，`MiddleAA` 中的 `Inner` 与 `MiddleBB` 中的 `Inner` 虽然有相同的字段名，但存储的是不同的内容。

### 其它字段类型

- [Any](https://developers.google.com/protocol-buffers/docs/proto3#any).
- [Oneof](https://developers.google.com/protocol-buffers/docs/proto3#oneof).
- [Maps](https://developers.google.com/protocol-buffers/docs/proto3#maps).

## 定义为 RPC 服务

如果想要将 message 类型用于 RPC 系统，可以在 `.proto` 文件中定义 RPC 服务接口，编译器将根据使用的语言生成 RPC 服务接口并打桩。

```proto
service SearchService {
  rpc Search(SearchRequest) returns (SearchResponse);
}
```

上例定义了一个名为 `SearchService` 的 RPC 服务，其中包含了一个 `Search` 方法，其参数为 `SearchRequest` 类型的 message，返回值为 `SearchResponse` 类型的 message.

能够与 Protobuf 最直接对接的 RPC 系统是 gRPC，同样由 Google 公司开发的语言无关、平台无关的开源 RPC 系统。如果使用 gRPC，只需要使用一个特殊的 [gRPC 插件](https://grpc.io/docs/protoc-installation/)，就可以根据 `.proto` 文件里的内容自动生成 RPC 代码。

## 编译 .proto 文件

首先编译并配置好 Protoc，并且安装了 Go 语言插件 protoc-gen-go.

参考官网给出的例子，我分别编写了 Go 和 C++ 版本的 `.proto` 文件：

```protoc
// addressbook-go.proto
syntax = "proto3";
package tutorial;

import "google/protobuf/timestamp.proto";

// go_package 选项定义了软件包的导入路径
// 对于 go 版本，包含 go_package 设置的内容；cpp 版本应注释掉
option go_package = "github.com/protocolbuffers/protobuf/examples/go/tutorialpb";

message Person {
  string name = 1;
  int32 id = 2;
  string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }

  repeated PhoneNumber phones = 4;

  google.protobuf.Timestamp last_updated = 5;
}

message AddressBook {
  repeated Person people = 1;
}
```

使用 `protoc` 命令对编写的 `.protoc` 文件进行编译。

### Go 版本编译

```bash
# 编译 Go 版本的 .protoc 文件
protoc -I=$SRC_DIR --go_out=$DST_DIR $SRC_DIR/addressbook-go.proto
```

编译 Go 版本，会在 `$DST_DIR/github.com/protocolbuffers/protobuf/examples/go/tutorialpb` 目录下生成 `addressbook-go.pb.go` 文件。

示例代码 [`list_people.go`](https://github.com/protocolbuffers/protobuf/blob/master/examples/list_people.go) 展示了如何打印出 AddressBook 中所有的 Person 信息：

```go
func writePerson(w io.Writer, p *pb.Person) {
    fmt.Fprintln(w, "Person ID:", p.Id)
    fmt.Fprintln(w, "  Name:", p.Name)
    if p.Email != "" {
        fmt.Fprintln(w, "  E-mail address:", p.Email)
    }

    for _, pn := range p.Phones {
        switch pn.Type {
        case pb.Person_MOBILE:
            fmt.Fprint(w, "  Mobile phone #: ")
        case pb.Person_HOME:
            fmt.Fprint(w, "  Home phone #: ")
        case pb.Person_WORK:
            fmt.Fprint(w, "  Work phone #: ")
        }
        fmt.Fprintln(w, pn.Number)
    }
}

func listPeople(w io.Writer, book *pb.AddressBook) {
    for _, p := range book.People {
        writePerson(w, p)
    }
}
```

### C++ 版本编译

```bash
# 编译 C++ 版本的 .protoc 文件
protoc -I=$SRC_DIR --cpp_out=$DST_DIR $SRC_DIR/addressbook-cpp.proto
```

编译 C++ 版本，会在 `$DST_DIR` 目录下生成 `addressbook-cpp.pb.cc` 和 `addressbook-cpp.pb.h` 两个文件。

示例代码 [`list_people.cc`](https://github.com/protocolbuffers/protobuf/blob/master/examples/list_people.cc) 展示了如何打印出 AddressBook 中所有的 Person 信息：

```cpp
void ListPeople(const tutorial::AddressBook& address_book) {
  for (int i = 0; i < address_book.people_size(); i++) {
    const tutorial::Person& person = address_book.people(i);

    cout << "Person ID: " << person.id() << endl;
    cout << "  Name: " << person.name() << endl;
    if (person.email() != "") {
      cout << "  E-mail address: " << person.email() << endl;
    }

    for (int j = 0; j < person.phones_size(); j++) {
      const tutorial::Person::PhoneNumber& phone_number = person.phones(j);

      switch (phone_number.type()) {
        case tutorial::Person::MOBILE:
          cout << "  Mobile phone #: ";
          break;
        case tutorial::Person::HOME:
          cout << "  Home phone #: ";
          break;
        case tutorial::Person::WORK:
          cout << "  Work phone #: ";
          break;
        default:
          cout << "  Unknown phone #: ";
          break;
      }
      cout << phone_number.number() << endl;
    }
    if (person.has_last_updated()) {
      cout << "  Updated: " << TimeUtil::ToString(person.last_updated()) << endl;
    }
  }
}
```
