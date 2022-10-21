---
title: JavaScript 变量提升和函数提升
date: 2021/5/11
updated: 2021/5/13
categories:
- 技术琐事
tags:
- JavaScript
---
JavaScript 中有一个叫作闭包（Closure）的概念，非常有趣且适用，值得学习并整理为一篇博客。

不过在学习闭包之前，为了更好理解它的作用，容我先从 JS 的变量提升（Hoisting）现象慢慢道来。

## JS 变量提升和函数提升

在 ES6 规范出现之前，声明变量只有 `var`, `function` 以及隐式声明三种方式。

按照一般编程的正常思维，我们会选择使用“先声明，后调用”的方式去使用变量，例如：

```js
var a = 3
console.log(a) // 3
```

上述代码使用 `var` 声明了一个变量并向控制台输出这个变量，顺利打印出其值 `3`。但假如反过来，我们“先调用，后声明”，会发生什么呢？

```js
console.log(a) // undefined
var a = 3
console.log(a) // 3
console.log(b) // Uncaught ReferenceError: b is not defined
```

在声明变量 `a` 之前打印变量，控制台输出的结果是 `undefined`，而不是预期中的报错 `Uncaught ReferenceError: a is not defined`。这就是**变量提升**。

而对于函数的声明与使用，也出现的相似的情况：

```js
sayHello() // Hello there!
function sayHello() {
    console.log('Hello there!')
}
```

在执行声明函数语句之前，我们已经可以调用函数方法并正确输出。这便是**函数提升**。

在 JS 中奇怪的一点是，我们可以在声明变量（使用 `var`）和声明函数之前使用它们，就好像变量和函数的声明被提升到了代码的顶部一样：

```js
console.log(a) // undefined
var a = 3
console.log(a) // 3

// 好像等于下面的代码
var a
console.log(a) // undefined
a = 3
console.log(a) // 3
```

实际上，JS 并不会移动代码，变量提升和函数提升并不是真正意义上的“提升”，而是解释执行 JS 代码过程所带来的“特性”。

以现在最主流的 `V8` 引擎为例，其解释执行 JS 代码的过程大致分为生成抽象语法树（AST），生成字节码和生成机器码三个阶段。

在生成抽象语法树阶段，又分为了词法分析和语法分析两个阶段。其中，在词法分析阶段，JS 会检测到当前**作用域**使用到的所有变量和函数声明，并将这些变量和函数声明添加到一个名为**词法环境**（Lexical Environment）的内存空间当中。

在词法分析阶段，对于变量声明和函数声明，词法环境的处理是不一样的：

- 对于变量声明如 `var a = 3`，会为变量分配内存并初始化为 `undefined`，赋值语句在生成机器码阶段真正执行代码的时候才进行。
- 对于函数声明如 `function sayHello() { console.log('Hello there!') }`，会在内存里创建函数对象，并且直接初始化为该函数对象。

因此，对于变量声明，在真正执行到赋值语句之前，我们就已经可以使用此变量，但是初值为 `undefined`；而对于函数声明，在执行到函数声明之前，函数对象就已经存在在内存当中，并可以直接调用了。

应当注意的是，函数声明的处理优先级要高于变量声明（意味着函数会“提升”到更靠前的位置），那么则不难理解，下面的代码中函数和变量重名时，会发生什么：

```js
console.log(foo) // function foo() {}
foo = 3
console.log(foo) // 3
function foo() {}

// 相当于下面的代码
var foo
foo = function() {}
console.log(foo) // function foo() {}
foo = 3
console.log(foo) // 3
```

最后，还需要理解的是，变量提升和函数提升，都是将声明“提升”到当前**作用域**的顶端：

```js
var foo = 5

function hoist() {
    console.log(foo) // function foo() {}
    foo = 3
    console.log(foo) // 3
    function foo() {}
}

hoist()
console.log(foo) // 5

// 相当于下面的代码
var hoist
var foo

hoist = function() {
    var foo
    foo = function() {}
    console.log(foo) // function foo() {}
    foo = 3
    console.log(foo) // 3
}
foo = 5

hoist()
console.log(foo) // 5
```

`hoist` 方法中的 `console.log(foo)` 优先从当前作用域中寻找变量 `foo`，如果找不到才在父级作用域寻找。

## 匿名函数声明

基于变量声明和函数声明之间的区别，在实际应用中，使用**匿名函数**的方式执行声明更不容易产生奇怪的 Bug：

```js
sayHi() // Uncaught TypeError: sayHi is not a function
console.log(sayHi) // undefined
var sayHi = function() {
    console.log('Hi there!')
}
sayHi() // Hi there!
```

使用匿名函数声明时，`sayHi` 声明发生变量提升，但赋值为 `undefined`，因此执行 `sayHi()` 时会报错 `Uncaught TypeError: sayHi is not a function`。随后执行完赋值语句后，才成为一个可以执行的函数变量。

## 防止变量提升

在 ES6 中，提供了两个新的命令可以用于声明变量，它们是 `let` 和 `const`。使用 `let` 声明的变量可以修改，而使用 `const` 声明的变量将不可更改。使用 `const` 声明必须指定初始值。

包括 `var`, `let` 和 `const` 在内的一切声明都会被“提升”，不同的是：

- `var` 命令在变量的定义被执行之前就初始化变量，并拥有一个默认的 `undefined` 值。
- `let` 与 `const` 命令会形成**暂时性死区**，在变量的定义被执行之前都**不会初始化变量**，避免在声明语句之前的不正确调用。如果定义时没有给定值的话，`let` 声明的变量会赋值为 `undefined`，而 `const` 声明的变量会报错。

关于暂时性死区的概念，请应允我援引阮一峰老师在 [ES6 入门书](https://es6.ruanyifeng.com/#docs/let)中的话：

> ES6 明确规定，如果区块中存在 `let` 和 `const` 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。
> 总之，在代码块内，使用 `let` 命令声明变量之前，该变量都是不可用的。这在语法上，称为“暂时性死区”（temporal dead zone，简称 TDZ）。

下面是一个使用 `const` 声明函数的例子：

```js
test() // Uncaught ReferenceError: Cannot access 'test' before initialization
console.log(test) // Uncaught ReferenceError: Cannot access 'test' before initialization
const test = function() {
    console.log('test')
}
test() // test
```

在这里，我们使用了 `const` 命令声明函数，只要一进入当前作用域，所要使用的 `test` 变量就已经存在了，但是不可获取，如果获取则会抛出特别的错误 `Uncaught ReferenceError: Cannot access 'test' before initialization`（一般情况下，获取未声明的变量抛出的错误为 `Uncaught ReferenceError: test is not defined`）。只有等到声明变量的那一行代码出现，才可以获取和使用该变量。当然，使用 `let` 命令也有同样的效果。

*[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html#features-use-const-and-let)* 建议使用 ES6 规范的 `const` 和 `let` 命令声明变量，舍弃容易造成错误的 `var` 命令。

无论如何，养成“先声明，再赋值”的良好编程习惯非常重要。

## 为什么要变量提升和函数提升

布兰登·艾克（Brendan Eich）是 JavaScript 的主要创造者与架构师，关于“为什么要变量提升”这个问题，他给出了这样的回答：

> Q: So what is one of the main (if not the main) reasons of variables "hoisting"? / 那么，变量“提升”的主要（或者并非主要）的原因之一是什么呢？
> Brendan Eich: An "abstraction leak" from the first JS VM. Compiler indexes vars to stack slots, binds names to slots on entry. / 这源于第一批 JS 虚拟机的“抽象泄漏”问题。编译器在入口处将变量索引到了堆栈插槽，并把变量名绑定给了插槽。

**抽象泄漏**是一个计算机术语，指“本应隐藏实现细节的抽象化不可避免地暴露出底层细节与局限性”。这是一个非常有意思的概念，以 TCP 协议举例：

> 当我说 TCP 协议可以保证消息一定能够到达，事实上并非如此。如果你的宠物蛇把网线给咬坏了，那即便是 TCP 协议也无法传输数据；如果你和网络管理员闹了矛盾，他将你的网口接到了一台负载很高的交换机上，那即便你的数据包可以传输，速度也会奇慢无比。
> 这就是我所说的“抽象泄漏”。TCP 协议试图提供一个完整的抽象，将底层不可靠的数据传输包装起来，但是，底层的传输有时也会发生问题，即便是 TCP 协议也无法解决，这时你会发现，它也不是万能的。TCP 协议就是“抽象泄漏定律”的示例之一，其实，几乎所有的抽象都是泄漏的。

言归正传，正是由于第一批 JS 虚拟机编译器上代码的设计失误，导致了变量在声明之前就被赋予了 `undefined` 的初始值，产生了变量提升。可能又由于这个失误产生的影响（无论好坏）过于广泛，因此在现在的 JS 编译器中仍保留了变量提升的“特性”。

至于“为什么要函数提升”，有人提出可能是为了解决函数相互递归调用的问题，布兰登·艾克给予了肯定并补充道：

> Brendan Eich: Yes, function declaration hoisting is for mutual recursion & generally to avoid painful bottom-up ML-like order. / 是的，函数提升是为了解决函数相互递归调用的问题，并在总体上避免了像 ML 语言那样痛苦地自下而上调用的问题。

**函数相互递归调用**，可以理解为 A 函数内会调用到 B 函数，而 B 函数也会调用到 A 函数。ML 语言是 20 世纪 70 年代早期开发出来的通用的函数式编程语言。

举一个经典的例子：

```js
// 判断 n 是否为偶数
function isEven(n) {
    if (n === 0) {
        return true;
    }
    return isOdd(n - 1);
}

console.log(isEven(4)); // true

// 判断 n 是否为奇数
function isOdd(n) {
    if (n === 0) {
        return false;
    }
    return isEven(n - 1);
}
```

如果没有函数提升，那么在调用 `isEven` 方法时，`isOdd` 方法还未声明，那么在 `isEven` 方法内部就无法调用 `isOdd` 方法。通过函数提升，`isEven` 和 `isOdd` 方法都相当于在当前作用域的顶部进行了声明，函数之间的相互递归调用也就可以实现了。

最后，布兰登·艾克还对变量提升和函数提升做了总结：

> Brendan Eich: A bit more history: `var` hoisting was an implementation artifact. `function` hoisting was better motivated. / 更多的历史：变量提升源于工具实现。函数提升则是一种更好的改进。

言下之意，变量提升是在最初一批 JS 虚拟机设计实现上的纰漏，而函数提升是设计好的针对函数相互递归调用等问题的改进。

作为针对变量提升的改进，ES6 中提出了最好使用 `let` 和 `const` 命令来声明变量，避免变量提升现象的发生。

## 参考资料

对变量提升和函数提升的进一步学习探讨可以参考这篇博文[《我知道你懂 hoisting，可是你了解到多深？》](https://blog.techbridge.cc/2018/11/10/javascript-hoisting/)，非常之棒！

### 技术博客

- [JavaScript 中的 Var，Let 和 Const 有什么区别](https://chinese.freecodecamp.org/news/javascript-var-let-and-const), 2020-12-08
- [从本质上理解JavaScript中的变量提升](https://juejin.cn/post/6844903895341219854), 2019-07-23
- [JS：深入理解JavaScript-词法环境](https://limeii.github.io/2019/05/js-lexical-environment/), 2019-05-06
- [变量声明系列之ES5(变量提升)](https://blog.csdn.net/weixin_38080573/article/details/79372448), 2018-02-25
- [JavaScript: 变量提升和函数提升](https://www.cnblogs.com/liuhe688/p/5891273.html), 2016-10-18
- [抽象泄漏定律](http://shzhangji.com/cnblogs/2013/12/17/the-law-of-leaky-abstractions/), 2013-12-17, 英文[原文链接](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/)

### 其它资料

- [Hoisting（变量提升）- MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Hoisting)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [let 和 const 命令 - 《ECMAScript 6 入门》](https://es6.ruanyifeng.com)
- [Leaky abstraction - Wikipedia](https://en.wikipedia.org/wiki/Leaky_abstraction)
- [ML (programming language) - Wikipedia](https://en.wikipedia.org/wiki/ML_(programming_language))

## 最后关于抽象泄漏的补充

艾林·约耳·斯波尔斯基（Avram Joel Spolsky）是程序员必备的问答网站 Stack Overflow 的创始人之一，于 2002 年 11 月 11 日在博文 [*The Law of Leaky Abstractions*](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/) 中对抽象泄漏定律做了非常详尽的描述，其中一些看法实在燃烧起了我的阅读之魂，遂记录在这里：

> ......
> One reason the law of leaky abstractions is problematic is that it means that abstractions do not really simplify our lives as much as they were meant to. When I’m training someone to be a C++ programmer, it would be nice if I never had to teach them about char*’s and pointer arithmetic. It would be nice if I could go straight to STL strings. But one day they’ll write the code “foo” + “bar”, and truly bizarre things will happen, and then I’ll have to stop and teach them all about char*’s anyway. Or one day they’ll be trying to call a Windows API function that is documented as having an OUT LPTSTR argument and they won’t be able to understand how to call it until they learn about char*’s, and pointers, and Unicode, and wchar_t’s, and the TCHAR header files, and all that stuff that leaks up.
> 抽象泄漏引发的麻烦之一是，它并没有完全简化我们的工作。当我指导别人学习 C++ 时，我当然希望可以跳过 char \* 和指针运算，直接讲解 STL 字符串类库的使用。但是，当某一天他写出了 “foo” + “bar” 这样的代码，并询问我为什么编译错误时，我还是需要告诉他 char \* 的存在。或者说，当他需要调用一个 Windows API，需要指定 OUT LPTSTR 参数，这时他就必须学习 char \*、指针、Unicode、wchar_t、TCHAR 头文件等一系列知识，这些都是抽象泄漏。
> ......
> In teaching someone about ASP.NET programming, it would be nice if I could just teach them that they can double-click on things and then write code that runs on the server when the user clicks on those things. Indeed ASP.NET abstracts away the difference between writing the HTML code to handle clicking on a hyperlink (\<a>) and the code to handle clicking on a button. Problem: the ASP.NET designers needed to hide the fact that in HTML, there’s no way to submit a form from a hyperlink. They do this by generating a few lines of JavaScript and attaching an onclick handler to the hyperlink. The abstraction leaks, though. If the end-user has JavaScript disabled, the ASP.NET application doesn’t work correctly, and if the programmer doesn’t understand what ASP.NET was abstracting away, they simply won’t have any clue what is wrong.
> 在指导 ASP.NET 编程时，我希望可以直接告诉大家双击页面上的控件，在弹出的代码框中输入点击响应事件。的确，ASP.NET 将处理点击的 HTML 代码抽象掉了，但问题在于，ASP.NET 的设计者需要动用 JS 来模拟表单的提交，因为 HTML 中的 \<a> 标签是没有这一功能的。这样一来，如果终端用户将 JS 禁止了，这个程序将无法运行。初学者会不知所措，直至他了解 ASP.NET 的运作方式，了解它究竟将什么样的工作封装起来了，才能进一步排查。
> The law of leaky abstractions means that whenever somebody comes up with a wizzy new code-generation tool that is supposed to make us all ever-so-efficient, you hear a lot of people saying “learn how to do it manually first, then use the wizzy tool to save time.” Code generation tools which pretend to abstract out something, like all abstractions, leak, and the only way to deal with the leaks competently is to learn about how the abstractions work and what they are abstracting. So the abstractions save us time working, but they don’t save us time learning.
> 由于抽象定律的存在，每当有人说自己发现了一款新的代码生成工具，能够大大提高我们的编程效率时，你会听很多人说“先学习手工编写，再去用工具生成”。代码生成工具是一种抽象，同样也会泄漏，唯一的解决方法是学习它的实现原理，即它抽象了什么。所以说抽象只是用于提高我们的工作效率的，而不会节省我们的学习时间。
> And all this means that paradoxically, even as we have higher and higher level programming tools with better and better abstractions, becoming a proficient programmer is getting harder and harder.
> 这就形成了一个悖论：当我们拥有越来越高级的开发工具，越来越好的“抽象”，要成为一个高水平的程序员反而越来越困难了。
> ......
> Ten years ago, we might have imagined that new programming paradigms would have made programming easier by now. Indeed, the abstractions we’ve created over the years do allow us to deal with new orders of complexity in software development that we didn’t have to deal with ten or fifteen years ago, like GUI programming and network programming. And while these great tools, like modern OO forms-based languages, let us get a lot of work done incredibly quickly, suddenly one day we need to figure out a problem where the abstraction leaked, and it takes 2 weeks. And when you need to hire a programmer to do mostly VB programming, it’s not good enough to hire a VB programmer, because they will get completely stuck in tar every time the VB abstraction leaks.
> 十年前，我们会想象未来能够出现各种新式的编程范型，简化我们的工作。的确，这些年我们创造的各类抽象使得开发复杂的大型软件变得比十五年前要简单得多，就像 GUI 和网络编程。现代的面向对象编程语言让我们的工作变得高效快速。但突然有一天，这种抽象泄漏出一个问题，解决它需要耗费两星期。如果你需要招录一个 VB 程序员，那不是一个好主意，因为当他碰到 VB 语言泄漏的问题时，他会变得寸步难行。
> The Law of Leaky Abstractions is dragging us down.
> 抽象泄漏定律正在阻碍我们前进。

注：中文翻译来自[此博客](http://shzhangji.com/cnblogs/2013/12/17/the-law-of-leaky-abstractions/)。
