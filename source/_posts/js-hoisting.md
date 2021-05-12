---
title: JavsScript 变量提升和函数提升
date: 2021/5/11
updated: 2021/5/12
categories:
- 技术琐事
tags:
- JavaScript
---
JavaScript 中有一个叫作闭包（Closure）的概念，非常有趣且适用，值得学习并整理为一篇博客。

不过在学习闭包之前，为了更好理解它的作用，容我先从 JS 的提升（Hoisting）现象慢慢道来。

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

应当注意的是，函数声明的处理优先级要高于变量声明，那么则不难理解，下面的代码中函数和变量重名时，会发生什么：

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
- `let` 与 `const` 命令会形成**暂时性死区**，在变量的定义被执行之前都不会初始化变量，避免在声明语句之前的不正确调用。如果定义时没有给定值的话，`let` 声明的变量会赋值为 `undefined`，而 `const` 声明的变量会报错。

关于暂时性死区的概念，请应允我援引阮一峰老师在 [ES6 入门书]((https://es6.ruanyifeng.com/#docs/let))中的话：

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

## 参考资料

### 技术博客

- [JavaScript 中的 Var，Let 和 Const 有什么区别](https://chinese.freecodecamp.org/news/javascript-var-let-and-const), 2020-12-08
- [从本质上理解JavaScript中的变量提升](https://juejin.cn/post/6844903895341219854), 2019-07-23
- [JS：深入理解JavaScript-词法环境](https://limeii.github.io/2019/05/js-lexical-environment/), 2019-05-06
- [变量声明系列之ES5(变量提升)](https://blog.csdn.net/weixin_38080573/article/details/79372448), 2018-02-25

### 其它资料

- [Hoisting（变量提升）- MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Hoisting)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [let 和 const 命令 - 《ECMAScript 6 入门》](https://es6.ruanyifeng.com)
