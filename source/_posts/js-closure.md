---
title: 漫谈 JavsScript 闭包
date: 2021/5/18
updated: 2021/5/18
categories:
- 技术琐事
tags:
- JavaScript
---
JavaScript 中有一个叫作闭包（Closure）的概念，非常有趣且适用，值得学习并整理为一篇博客。

为了更好理解闭包的作用，不妨看看我的[这篇博客](https://lolipopj.github.io/2021/05/10/js-hoisting/)关于 JS 变量提升（Hoisting）和函数提升现象的阐述。

## 作用域

在 JavaScript 中，**作用域**（Scope）是当前代码执行的上下文，也即是值和表达式在其中可访问到的上下文。

- 如果一个变量或其它表达式不在当前作用域中，就会沿**作用域链**（Scope Chain）往父作用域搜索。如果也仍未找到它的话，那么它就是不可用的。
- 最顶级的父作用域是全局对象。
- 父作用域不能引用子作用域中的变量和定义。

目前，作用域有三种：**全局作用域**和**函数作用域**，以及 ES6 新增的**块级作用域**。

### 作用域与执行上下文

作用域与**执行上下文**（Context）是两个不同的概念。JavaScript 系解释型语言，执行分为解释阶段和执行阶段两个阶段，两个阶段所完成的行为大抵如下：

- 解释阶段：
  1. 词法分析；
  2. 语法分析；
  3. **确定作用域规则**。
- 执行阶段：
  1. **创建执行上下文**；
  2. 执行函数代码；
  3. 垃圾回收。

可以看见，在解释阶段就已经确定了作用域规则，而在执行阶段才创建了执行上下文。因而作用域在定义时就确定，不会发生改变；执行上下文在运行时确定，可以发生改变。

### 全局作用域和函数作用域

最外层函数和在最外层函数外边定义的变量拥有全局作用域，而函数内部定义的其他函数和变量拥有函数作用域。如：

```js
var outVar = 'outVar'
function outFunc() {
    var inVar = 'inVar'
    function inFunc() {
        console.log(outVar, inVar)
    }
    inFunc()
}
console.log(outVar) // outVar
console.log(inVar) // Uncaught ReferenceError: inVar is not defined
outFunc() // outVar inVar
inFunc() // Uncaught ReferenceError: inFunc is not defined
```

在最外层，我们可以正常打印 `outVar` 和调用 `outFunc()` 方法，但是在尝试直接调用 `outFunc()` 方法中所定义的 `inVar` 和 `inFunc()` 方法时，发生报错。此外，在 `inFunc()` 方法中，成功在父作用域找到并打印出了 `outVar` 的值。

所有未定义而直接赋值的变量会自动声明为全局变量，拥有全局作用域。如：

```js
function outFunc() {
    globalInVar = 'globalInVar'
    var invar = 'inVar'
}
// 执行这个函数以赋值
outFunc()
console.log(globalInVar) // globalInVar
console.log(invar) // Uncaught ReferenceError: invar is not defined
```

我们在 `outFunc()` 方法中未使用 `var` 声明而直接给 `globalInVar` 变量进行赋值，它将声明为全局变量，并能在最外层直接打印出来。应当避免此类声明的存在，在 `ESLint` 等代码质量检查工具中，会标注此类错误。

接下来看一段非常经典的代码案例：

```js
function getArr() {
    var arr = []
    for (var i = 0; i < 5; i++) {
        arr.push(function() {
            return i
        })
    }
    return arr
}
var testArr = getArr()
console.log(testArr[2]()) // 5
```

我们将方法传入到数组中，期望调用方法返回的值为当前数组的索引值。在调用 `testArr[2]()` 时，期望得到的返回值为 `2`，但实际返回的值是 `5`，为什么？

这是由于在 `for` 循环中我们使用 `var` 声明的变量 `i` 会发生变量提升，其作用域为 `getArr()` 这个函数作用域。在调用数组中存储的函数时，我们已经完成了循环，此时 `i` 的值变成了 `5`，则无论调用数组的哪个函数都会打印出现在的值 `5`。上面的代码使用简化的方式编写，相当于：

```js
var arr = []
var i // 变量提升，我们在 for 循环中声明的变量在全局可访问
for (i = 0; i < 5; i++) {
    arr.push(function() {
        return i
    })
}
console.log(arr[2]()) // 5
// console.log(i) // 5
```

那么，现在的问题是，要如何在函数内部保存（或记住）一个从外部传入的值，在调用的时候能正确打印出我们想要的结果呢？

ES6 中提出了块级作用域，可以顺利解决这个问题。

### 块级作用域

与声明的变量只能是全局或整个函数块的 `var` 命令不同，`let` 和 `const` 命令声明的变量、语句和表达式作用域可以限制在块级以内。例如：

```js
{
    var varVar = 'varVar'
    let letVar = 'letVar'
}
console.log(varVar) // varVar
console.log(letVar) // Uncaught ReferenceError: letVar is not defined
```

在 ES6 以前，不存在块级作用域，使用 `var` 命令声明的在 `for`, `while` 等内部的变量都会提升为外部作用域的变量。

现在，我们就可以使用块级作用域替换刚刚的函数作用域了：

```js
function getArr() {
    const arr = []
    for (let i = 0; i < 5; i++) { // 使用 let 替换 var
        arr.push(function() {
            return i
        })
    }
    return arr
}
const testArr = getArr()
console.log(testArr[2]()) // 2
```

使用 `let` 命令声明的变量 `i` 在循环中拥有块级作用域，每次循环时每个返回的函数中引用的都是其对应块级作用域的变量。上面的代码使用简化的方式编写，相当于：

```js
const arr = []
for (let i = 0; i < 5; i++) {
    const n = i // 声明的变量仅在 for 循环的块作用域可访问
    arr.push(function() {
        return n
    })
}
console.log(arr[2]()) // 2
// console.log(i) // Uncaught ReferenceError: i is not defined
```

而在 ES6 之前，就需要用到了这篇博文真正的主角——闭包。

## 什么是闭包

由于 JavaScript 的链式作用域（Chain Scope）结构，父对象的所有变量都对子变量可见，反之则不成立。出于某种原因，我们有时候需要得到函数内的局部变量，就需要使用变通的方法实现：

```js
// 子对象的变量对父对象不可见
function outerFunc() {
    var value = 100
    function innerFunc() {
        console.log(value)
    }
}
innerFunc() // Uncaught ReferenceError: innerFunc is not defined

// 变通的方法
function outerFunc() {
    var value = 100
    function innerFunc() {
        console.log(value)
    }
    return innerFunc // 将内部定义的方法返回
}
var visitValue = outerFunc()
visitValue() // 100
```

在一些编程语言中，一个函数的局部变量仅存在于此函数的执行期间。那么一旦 `outerFunc()` 执行完毕，您可能会认为函数内部定义的变量 `value` 将不能够再访问。然而，在 JavaScript 中这段代码能够顺利执行并打印出结果。

这是由于 JavaScript 中的函数会形成**闭包**。

> 一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）。也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域。在 JavaScript 中，每当创建一个函数，闭包就会在函数创建的同时被创建出来。
> A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives you access to an outer function’s scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time.

闭包是由函数以及声明该函数的词法环境组合而成的。该环境包含了这个闭包创建时作用域内的所有局部变量。从本质上来说，闭包可以看作将一个函数的内部和外部连接起来的桥梁。

在上面的代码中，变量 `visitValue` 是执行 `outerFunc()` 时创建的对 `innerFunc` 函数实例的引用，而 `innerFunc` 实例维持了一个对它的词法环境的引用，在这个词法环境中存在着变量 `value`。因此，当我们执行 `visitValue()` 时，变量 `value` 是可用的，最后我们成功在控制台打印出了它的值。

那么，为了解决在前文提出的不存在块级作用域的问题，我们可以像这样编写代码：

```js
function getArr() {
    var arr = []
    for (var i = 0; i < 5; i++) {
        arr.push((function(n) { // n 的作用域为函数作用域
            return function() { // 返回一个函数
                return n // 调用函数返回的值为传入的 n 的值
            }
        })(i)) // 传入当前的 i 值
    }
    return arr
}
var testArr = getArr()
console.log(testArr[2]()) // 2
```

对于上面的 `for` 循环，相当于执行了下述代码：

```js
arr[0] = (function(n) {
    return function() {
        return n
    }
})(0)
arr[1] = (function(n) {
    return function() {
        return n
    }
})(1)
arr[2] = (function(n) {
    return function() {
        return n
    }
})(2)
// 下略

console.log(arr[2]()) // 2
```

这样一来，数组中的每个函数分别处于一个立即执行函数的**函数作用域**中，这个立即执行的函数传入了每次循环时变量 `i` 的值。于是，当我们调用数组中的函数时，将返回**传入时**的 `i` 值，而不是循环结束后的 `i` 值。

> "JavaScript 中闭包无处不在，你只需要能够识别并拥抱它。"
> "最后你恍然大悟：原来在我的代码中已经到处都是闭包了，现在我终于能理解他们了。
> "理解闭包就好像 Neo 第一次见到矩阵一样。"

*You Don't Know Javascript* 中如是写道。

## 如何使用闭包

如果不是某些特定任务需要使用到闭包，那么在函数中创建另一个函数是不明智的。闭包会使得函数中的变量保存在**内存**中，可能造成性能问题。

### 函数防抖和节流

函数防抖和函数节流就是典型的闭包用例，我在[这篇博客](https://lolipopj.github.io/2021/05/07/js-debounce-throttle/)里对它们进行了编写。

### 函数工厂

这是一个函数工厂的示例：

```js
function makeAdder(x) {
    return function(y) {
        return x + y
    }
}

var add5 = makeAdder(5)
var add10 = makeAdder(10)

console.log(add5(2)) // 7
console.log(add10(2)) // 12
```

我们定义了一个函数 `makeAdder(x)`，它接受一个参数 `x`，并返回一个新的函数。返回的这个函数接受参数 `y`，并返回 `x + y` 的值。接着，我们创建了两个新函数 `add5` 和 `add10`，一个将它的参数与 `5` 求和，另一个与 `10` 求和。

`add5` 和 `add10` 都是闭包，它们共享相同的函数定义，但是保存了不同的词法环境。在 `add5` 的词法环境中，`x` 的值为 `5`；而在 `add10` 中，`x` 为 `10`。

### 面向对象编程

我们可以用闭包来模拟**私有**属性和方法，就像面向对象编程语言中类的私有属性和方法的编写一样。以构建 `Rectangle` 矩形类为例：

```js
var Rectangle = function(height, width) {
    var height = height // 私有的高属性
    var width = width // 私有的宽属性
    function calcArea() { // 私有的计算面积方法
        return height * width
    }
    function setHeight(h) { // 私有的设置高方法
        height = h
    }
    function setWidth(w) { // 私有的设置宽方法
        width = w
    }
    return { // 返回一个对象，对象可以访问到闭包的作用域
        get area() {
            return calcArea()
        },
        setHeight: function(h) {
            setHeight(h)
        },
        setWidth: function(w) {
            setWidth(w)
        }
    }
}

var square = Rectangle(5, 5)
console.log(square.area) // 25

square.setHeight(10)
square.setWidth(10)
console.log(square.area) // 100

console.log(square.height) // undefined
```

在上面的代码中，我们使用了闭包来定义公共函数，并令这些公共函数访问到私有函数和变量。这个方式又称模块模式（Module Pattern）。

在 ES6 中，可以用 `class` 语法糖来声明类。上面的代码相当于：

```js
class Rectangle {
    #height
    #width
    // Constructor
    constructor(height, width) {
        this.#height = height
        this.#width = width
    }
    // Getter
    get area() {
        return this.calcArea()
    }
    // Method
    calcArea() {
        return this.#height * this.#width
    }
    setHeight(h) {
        this.#height = h
    }
    setWidth(w) {
        this.#width = w
    }
}

const square = new Rectangle(5, 5) // 使用 new 关键字来创建对象
console.log(square.area) // 25

square.setHeight(10)
square.setWidth(10)
console.log(square.area) // 100

console.log(square.height) // undefined
```

在 `class` 内，私有属性 `height` 和 `width` 需要在前面加上 `#` 并在开头显示声明出来。

当然，相比闭包的方式，使用 `class` 的声明更加直观，值得推广使用。

值得补充的是，假如不需要在对象中使用私有声明，而是使用公用声明，应当避免使用闭包。同样以构建 `PublicRectangle` 矩形类为例：

```js
var PublicRectangle = function(height, width) {
    return { // 将矩形的高和宽作为返回对象的可访问属性
        height: height,
        width: width,
        get area() {
            return this.height * this.width
        },
        setHeight: function(h) {
            this.height = h
        },
        setWidth: function(w) {
            this.width = w
        }
    }
}

var square = PublicRectangle(5, 5)
console.log(square.area) // 25

square.setHeight(10)
square.setWidth(10)
console.log(square.area) // 100

console.log(square.height) // 10
```

上面的代码中我们并没有利用到闭包的好处，反而在每次调用构造器时都重新赋值一遍方法。因此在这里不妨变为添加**原型方法**的方式：

```js
var PublicRectangle = function(height, width) {
    this.height = height
    this.width = width
}
Object.defineProperty(PublicRectangle.prototype, 'area', { // 为 PublicRectangle 原型添加 area 的 getter
    get() {
        return this.height * this.width
    }
})
PublicRectangle.prototype.setHeight = function(h) {
    this.height = h
}
PublicRectangle.prototype.setWidth = function(w) {
    this.width = w
}

var square = new PublicRectangle(5, 5) // 应使用 new 关键字
console.log(square.area) // 25

square.setHeight(10)
square.setWidth(10)
console.log(square.area) // 100

console.log(square.height) // 10
```

## 参考资料

### 技术博客（或问答）

- [闭包以及其ES6下的使用](https://www.jianshu.com/p/ebb4eccb6625), 2020-01-13
- [深入理解 JavaScript 作用域和作用域链](https://blog.fundebug.com/2019/03/15/understand-javascript-scope/), 2019-03-15
- [深入解析ES6中let和闭包](https://juejin.cn/post/6844903747106111501), 2018-12-25
- [如何给js内建对象构造器添加getter和setter](https://segmentfault.com/q/1010000016598692), 2018-10-06
- [学习Javascript闭包（Closure）](http://www.ruanyifeng.com/blog/2009/08/learning_javascript_closures.html), 2009-08-30

### 其它资料

- [闭包 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [类 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
- [You Don't Know Javascript](https://github.com/getify/You-Dont-Know-JS)
