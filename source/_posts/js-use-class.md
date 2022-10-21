---
title: 漫谈 JavaScript 类（Class）的使用
date: 2021/5/20
updated: 2021/5/20
categories:
- 技术琐事
tags:
- JavaScript
- ES6
---
类（Class）是用于创建对象的模板，他们用代码封装数据以处理该数据，是面向对象编程方法的重要特性之一。JavaScript 中的 `class` 语法在 ES6 中引入，其底层实现基于原型（Prototype），系原型继承的语法糖（Syntactic Sugar）。

本博文将探讨 JavaScript 中**如何使用类**的相关知识，文章组织架构和内容基于 MDN 上关于类的[章节](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)。

## 定义类

类可以被看作一种“特殊的函数”，和函数的定义方法一样，类的定义方法有两种：**类声明**和**类表达式**。

第一种方法是，直接使用 `class` 关键字声明类，即**类声明**的方法。

```js
class User {
    //
}
```

但是，与函数声明不同的是，使用类声明的方式**不会提升**。这意味着必须先声明类，再使用它。

```js
const u = new User() // Uncaught ReferenceError: User is not defined

class User {
    //
}
```

另一种方法是，将 `class` 声明的类赋值给变量，即**类表达式**的方法。类表达式可以命名或匿名，其中，命名类表达式的名称（类的 `name` 属性）是该类体的局部名称。

```js
// 匿名类
let User = class {
    //
}
console.log(User.name) // User

// 命名类
let User = class Admin {
    //
}
console.log(User.name) // Admin
```

同样，使用类表达式的方式也**不会提升**。

定义类之后，就可以使用 `new` 关键字实例化类了。

```js
const u = new User()
```

## 构造函数

`constructor()` 方法或**构造函数**，是用于创建和初始化一个由 `class` 创建的对象的特殊方法，一个类只能拥有一个 `constructor()` 方法。

如果一个类中有构造函数，那么执行 `new` 创建实例时，将调用这个构造函数。

```js
class User {
    constructor(name, gender) { // 构造函数
        this.name = name
        this.gender = gender
    }
}

const u = new User('Ming', 'Male') // 初始化对象
console.log(u.name, u.gender) // Ming Male

const u2 = new User('Xiao') // 初始化赋值参数少于构造函数参数时
console.log(u2.name, u2.gender) // Xiao undefined
```

对于 `new` 创建实例时的每个参数，将依次赋值给构造函数。多余的参数将被忽略。

特别的，`constructor()` 方法中可以使用 `super` 关键字调用父类的 `constructor()` 方法。

```js
class User {
    constructor(name, gender) { // User 类的构造函数
        this.name = name
        this.gender = gender
    }
}

class Admin extends User { // 使用 extends 创建 User 的子类 Admin
    constructor(name, gender, openId) { // Admin 类的构造函数
        super(name, gender) // 调用父类 User 的构造函数
        this.openId = openId
    }
}

const a = new Admin('Ming', 'Male', 'xxx489')
console.log(a.name, a.gender, a.openId) // Ming Male xxx489
```

## 原型方法

在类体中可以声明函数方法。从底层实现来看，这些方法将会在对象的原型链上定义出来，故称作**原型方法**。

```js
class Rectangle {
    // Field declarations
    log = [] // 日志属性
    // Constructor
    constructor(height, width) {
        this.height = height
        this.width = width
    }
    // Getter
    get area() { // 获取当前的面积
        return this.calcArea()
    }
    // Setter
    set height(h) { // 修改 height 属性时添加日志
        this._height = h // 如果为 this.height = h 会循环调用这个 Setter，发生堆栈溢出
        this.log.push(`set height: ${h}`)
    }
    set width(w) { // 修改 width 属性时添加日志
        this._width = w
        this.log.push(`set width: ${w}`)
    }
    // Method
    calcArea() { // 计算当前的面积
        return this._height * this._width
    }
}

const rec = new Rectangle(5, 10)
console.log(rec.log) // ["set height: 5", "set width: 10"]
console.log(rec.area) // 50

rec.height = 10
rec.width = 20
console.log(rec.log) // ["set height: 5", "set width: 10", "set height: 10", "set width: 20"]
console.log(rec.area) // 200
```

上面的类中定义计算当前面积的方法 `calcArea()` 时，使用了 ES6 引入的[更简短的定义语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)，这种语法与 Setter 和 Getter 的语法相似，它直接将方法名赋值给了函数。

此外，由于 Setter 的特性，当我们在构造函数执行赋值操作，以及之后修改实例的属性时，将调用 Setter 的方法（即 Hook 函数）。因此在上面代码中的 `rec` 实例中，并不存在 `height` 和 `width` 属性，取而代之的是 `_height` 和 `_width` 属性。

## 静态方法和属性

在类的方法前面添加关键字 `static` 可以定义**静态方法**或**静态属性**，它们可以通过类直接调用，但不能通过类的实例调用。静态方法和静态属性常用于为一个使用类的应用程序创建工具函数。

```js
class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static className = 'Point' // 定义 Point 类的静态属性

    static distance(a, b) { // 定义 Point 类的静态方法
        const dx = a.x - b.x
        const dy = a.y - b.y
        return Math.hypot(dx, dy) // Math.hypot() 返回所有参数的平方和的平方根，在此处用于求两点之间的距离
    }
}

const p1 = new Point(5, 5)
const p2 = new Point(10,10)

console.log(p1.className) // undefined
console.log(p1.distance) // undefined

console.log(Point.className) // Point
console.log(Point.distance(p1, p2)) // 7.0710678118654755
```

上面的代码中，当我们使用实例访问静态方法和属性时，会显示 `undefined`。而当我们使用类来访问时，则能正常调用了。

## 原型方法和静态方法中的 `this`

当调用静态或原型方法时没有指定 `this` 的值，那么方法内的 `this` 值将被置为 `undefined`。这是因为 `class` 内部的代码总是在**严格模式**下执行。

```js
class MyClass {
    getThis() {
        return this
    }
    static getStaticThis() {
        return this
    }
}

const obj = new MyClass()
const getObjThis = obj.getThis
console.log(obj.getThis()) // obj 实例对象（指定了 this 的初值，在这里相当于 console.log(obj)）
console.log(getObjThis()) // undefined（没有指定 this 的初值）

const getClassStaticThis = MyClass.getStaticThis
console.log(MyClass.getStaticThis()) // MyClass 类（指定了 this 的初值，在这里相当于 console.log(MyClass)）
console.log(getClassStaticThis()) // undefined（没有指定 this 的初值）
```

作为对比，将上面的代码使用传统的基于函数的语法实现，在**非严格模式**下，若 `this` 的初值没有指定，则会被置为全局对象。

```js
function MyClass() {}
MyClass.prototype.getThis = function() {
    return this
}
MyClass.getStaticThis = function() { // 相当于静态方法
    return this
}

const obj = new MyClass()
const getObjThis = obj.getThis
console.log(obj.getThis()) // obj 实例对象（指定了 this 的初值，在这里相当于 console.log(obj)）
console.log(getObjThis()) // global object（没有指定 this 的初值）

const getClassStaticThis = MyClass.getStaticThis
console.log(MyClass.getStaticThis()) // MyClass 函数（指定了 this 的初值，在这里相当于 console.log(MyClass)）
console.log(getClassStaticThis()) // global object（没有指定 this 的初值）
```

## 生成器方法

生成器函数使用 `function*` 语法定义，例如 `function* anyGenerator() {}`。而在类中，使用了更简短的定义语法，应将符号 `*` 放在方法名的前面，例如 `*anyGenerator() {}`。

```js
class Polygon { // 定义五角形类
    constructor(...sides) { // 将传入的参数变成一个数组并执行构造方法
        this.sides = sides
    }
    // Method
    *getSides() { // 定义生成器方法
        for (const side of this.sides) {
            yield side
        }
    }
}

const pentagon = new Polygon(1,2,3,4,5)
console.log([...pentagon.getSides()]) // [1,2,3,4,5]
```

关于生成器的更多介绍可参考[此页面](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)。

## 箭头函数定义方法

类中还有另外一种常见的定义方法的方式：使用**箭头函数**。

```js
class Rectangle {
    //
    calcArea = () => { // 使用箭头函数定义原型方法
        return this.height * this.width
    }
}
```

特别的，箭头函数不会创建自己的 `this`，而是从自己的作用域链的上一层继承 `this`；子类继承父类的箭头函数定义的方法时，会出现属性遮蔽（Property Shadowing）的现象。对于后者，编写代码如下：

```js
class Father {
    sayHello = () => {
        console.log('I am your father.')
    }
}

class Chird extends Father {
    sayHello() {
        super.sayHello()
        console.log('I am a chird.')
    }
}

const c = new Chird()
c.sayHello() // I am your father.
```

上面的代码并没有像我们预想的那样，依次打印出 `I am your father.` 和 `I am a chird.`，而是只打印出了 `I am your father.`。

简单解释原因的话就是，箭头函数会挂到**实例的属性**上，而普通函数则是定义在**原型链**上。在 `Chird` 类中定义的 `sayHello()` 方法放到了原型链上，而从自己的父类 `Father` 继承的 `sayHello()` 方法挂载到了属性上。因此，当我们调用实例上的 `sayHello()` 方法时，优先从实例的属性上查找是否存在该方法（是的，在这里我们已经找到它了），如果存在则直接调用，如果不存在再在原型链上查找。

详细内容可以参考[这篇博客](https://github.com/dwqs/blog/issues/67#issue-327371697)。

在类中，对于直接使用 `=` 的声明，从本质上而言就是 [Field Declarations](https://github.com/tc39/proposal-class-fields#field-declarations) 的语法，相当于**直接声明了一个实例的属性**。在接下来的[字段声明](#字段声明)小节中，也使用到了这个语法。

## 字段声明

> 在目前（2021 年 5 月），公共和私有字段声明仍是 JavaScript 标准委员会 TC39 提出的[实验性功能（第 3 阶段）](https://github.com/tc39/proposal-class-fields)。浏览器中的支持是有限的，但是可以通过 Babel 等系统构建后使用此功能。

### 公有字段声明

在类中可以声明公有字段，使得类定义具有自我记录性，且这些字段将始终存在。字段的声明可以设置初始值。

```js
class Point {
    x // 公有字段 x
    y = 0 // 公有字段 y，初始值为 0
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    get position() {
        return [this.x, this.y]
    }
}

console.log(new Point(5, 10).position) // [5, 10]
```

### 私有字段声明

在声明的字段前面加上 `#` 表明为私有字段。私有字段同样可以设置初始值。

```js
class Point {
    #x // 私有字段 x
    #y = 0 // 私有字段 y，初始值为 0
    constructor(x, y) {
        this.#x = x
        this.#y = y
    }
    get position() {
        return [this.#x, this.#y]
    }
}

console.log(new Point(10, 5).position) // [10, 5]
```

与公有字段不同的是：

- 不能从类外部引用私有字段。或私有字段在类外部不可见。
- 私有字段仅能在字段声明中预先定义。
- 在实例创建之后，不能再通过赋值来创建私有字段。

```js
class Point {
    name = 'point'
    #x
    #y = 0
    // #z // 假如不在这里显式声明 #z
    constructor(x, y, z) {
        this.#x = x
        this.#y = y
        // this.#z = z // Uncaught SyntaxError: Private field '#z' must be declared in an enclosing class
    }
    get position() {
        return [this.#x, this.#y]
    }
    get position3D() {
        // return [this.#x, this.#y, this.#z] // Uncaught SyntaxError: Private field '#z' must be declared in an enclosing class
    }
}

const p = new Point(10, 5, 15)
p.name = 'point3D' // 实例可以通过赋值修改公有字段
console.log(p.name) // point3D
p.#x = 20 // 实例不可通过赋值修改私有字段，Uncaught SyntaxError: Private field '#x' must be declared in an enclosing class
console.log(p.#x) // 实例不可在外部访问私有字段，Uncaught SyntaxError: Private field '#x' must be declared in an enclosing class
```

在上面的代码中，我们尝试在类中不显式声明私有字段 `#z` 的情况下，访问 `#z`，结果会抛出 `SyntaxError`。此外，我们尝试在实例中直接对私有字段 `#x` 进行赋值和获取操作，也会抛出 `SyntaxError`。

## 使用 `extends` 拓展子类

`extends` 可以用来创建子类，父类可以是自己定义的普通类，也可以是内建对象。对于后者，以继承内建的 `Date` 对象为例：

```js
class MyDate extends Date {
    constructor() {
        super()
    }

    getFormattedDate() { // 定义子类的方法，该方法可以获取格式化后的日期
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return this.getDate() + ' - ' + months[this.getMonth()] + ' - ' + this.getFullYear()
    }
}

console.log(new MyDate().getFormattedDate()) // 20 - May - 2021
```

类不过是一种语法糖，因此我们也可以用 `extends` 来继承传统的基于函数的“类”：

```js
function Animal (name) { // 定义 Animal “类”
    this.name = name
}
Animal.prototype.speak = function () {
    console.log(this.name + ' makes a noise.')
}

class Dog extends Animal { // 使用 extends 拓展 Animal “类”
    speak() {
        super.speak()
        console.log(this.name + ' barks.')
    }
}

const d = new Dog('Mitzie')
d.speak()
// Mitzie makes a noise.
// Mitzie barks.
```

对于**不可构造**的常规对象，要实现继承的话，可以使用 `Object.setPrototypeOf()` 方法，它可以设置一个指定对象的原型到另一个对象：

```js
const Animal = { // 定义 Animal 对象
    speak() {
        console.log(this.name + ' makes a noise.')
    }
}

class Dog {
    constructor(name) {
        this.name = name
    }
    speak() {
        super.speak()
        console.log(this.name + ' barks.')
    }
}

Object.setPrototypeOf(Dog.prototype, Animal) // 如果不这样做，在调用 speak 时会返回 TypeError

const d = new Dog('Mitzie')
d.speak()
// Mitzie makes a noise.
// Mitzie barks.
```

出于性能考量，应避免使用 `Object.setPrototypeOf()` 方法来实现继承，在[这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)了解它的更多。

## 使用 `super` 调用超类

使用 `super` 关键字可以调用对象的父对象上的函数。

```js
class Cat {
    constructor(name) {
        this.name = name
    }
    speak() {
        console.log(`${this.name}: meo~~!`)
    }
}

class Lion extends Cat {
    speak() {
        super.speak() // 调用 Cat 对象的 speak 方法
        console.log(`${this.name}: roars!!!`)
    }
}

const l = new Lion('Li')
l.speak()
// Li: meo~~!
// Li: roars!!!
```

假如我们将上面代码中 `Lion` 类里的 `speak()` 方法删去，那么打印的结果是 `Li: meo~~!`。如果认真学到这里的话，原因想必也已经了然于胸：子类继承了父类的属性和方法。那么当子类定义了与父类相同名字的方法时，根据原型链上的调用规则，会调用子类定义的方法。这就是为什么我们需要 `super` 关键字的原因之一，方法名相同的情况下，在子类方法中我们仍可以调用父类的方法。

在**构造函数**中，`super()` 需要在使用 `this` 前调用：

```js
class Rectangle {
    constructor(height, width) {
        this._name = 'Rectangle'
        this._height = height
        this._width = width
    }
    get name() {
        return `Hi, I am a ${this._name}.`
    }
    get area() {
        return this._height * this._width
    }
}

class Square extends Rectangle {
    constructor(length) {
        // this._height = length // Must call super constructor in derived class before accessing 'this' or returning from derived constructor
        super(length, length) // 调用 Rectangle 的构造函数，length 分别作 height 和 width
        this._name = 'Square' // 修改 name 属性为 Square
    }
}

const s = new Square(15)
console.log(s.name) // Hi, I am a Square.
console.log(s.area) // 225
```

`super` 也可以用来调用父类的静态方法：

```js
class Rectangle {
    constructor(height, width) {
        this._height = height
        this._width = width
    }
    static help() { // 父类的静态方法
        return 'I have 4 sides.'
    }
}

class Square extends Rectangle {
    constructor(length) {
        super(length, length)
    }
    static help() { // 子类的静态方法，使用 super 调用父类的 help 方法
        return super.help() + ' They are all equal.'
    }
}

console.log(Square.help()) // I have 4 sides. They are all equal.

// 假如只去除子类 help 方法前面的 static 关键字
// console.log(new Square(10).help()) // Uncaught TypeError: (intermediate value).help is not a function

// 假如只去除父类 help 方法前面的 static 关键字
// console.log(Square.help()) // Uncaught TypeError: (intermediate value).help is not a function
```

在上面的代码中，`Square` 中的静态方法 `help()` 调用了父类的静态方法。静态方法中的 `super` 只能调用父类的静态方法，假如我们去除子类或父类方法前面的 `static` 关键字，会发生报错。

在本章节的例子中，似乎子类方法中的 `super` 都调用了父类中与之同名的方法，但实际上并没有这个限制，在编写的时候可以根据实际的需求自行调整命名或调用其它父类方法。

在[箭头函数的使用](#箭头函数定义方法)章节的例子中，既然箭头函数定义的方法挂载到了实例的属性上，那么还能用 `super` 来调用吗？答案是否定的。JavaScript 没能在父对象的原型链上找到这个方法，于是什么也没有发生。

更多补充可以查阅 MDN 上[关于 `super` 的介绍](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super)。

## 使用 `Symbol.species` 覆盖构造函数

`Symbol.species` 访问器属性允许子类覆盖对象的默认构造函数。

读着很拗口，那就看两个实际的例子。当使用 `map()` 这样的方法会返回默认的构造函数，我们可能想在对拓展的数组类 `MyArray` 执行操作时返回 `Array` 对象，那么可以这样编写代码：

```js
class MyArray extends Array {
    static get [Symbol.species]() { // 设置 getter，当获取 MyArray 类的构造函数时，返回 Array 类的构造函数
        return Array
    }
}

const a = new MyArray(1, 2, 3)
const mapped = a.map(x => x * x)
console.log(mapped instanceof MyArray); // false
console.log(mapped instanceof Array); // true
```

又例如，我们拓展 `Promise` 类为 `TimeoutPromise` 类，但我们不希望某一个超时的 Promise 请求影响整个 Promise 链，就可以使用 `Symbol.species` 来告诉 `TimeoutPromise` 类返回一个 `Promise` 对象，方便我们执行异常处理操作：

```js
class TimeoutPromise extends Promise {
    static get [Symbol.species]() {
        return Promise
    }
}
```

`Symbol.species` 允许自定义返回的类，不一定是子类继承实现的类。

`Symbol.species` 帮助我们在处理子类实例时，能够有一套标准的操作流程，方便了开发，在某些场景十分实用。

## 使用 Mix-ins 实现多重继承

在 ECMAScript 中，一个类只能有一个单超类，因此想通过工具类的方法实现多重继承行为是不可能的。为了实现多重继承，我们可以使用 Mixin 的方法。

什么是 Mixin？简单来说，Mixin 也是一个类，包括了一些方法，这些方法可以被其它类使用。但在其它类中使用这些方法**不需要继承** Mixin。举一个简单的例子：

```js
let sayHiMixin = { // Mixin
    // Methods that useful
    sayHi() {
        alert(`Hello, ${this.name}`)
    },
    sayBye() {
        alert(`Bye, ${this.name}`)
    }
}

class User { // Class
    constructor(name) {
        this.name = name
    }
}

Object.assign(User.prototype, sayHiMixin) // 将 Mixin 中的方法复制到 Class 类中

new User('Dude').sayHi() // Hello, Dude!
```

我们又知道，创建类的[两种声明方式](#定义类)是等价的：

```js
class Mixin1 {
    //
}

// 等价于
const Mixin2 = class {
    //
}
```

其中，第二种方式，或者说使用类表达式声明类的方式，允许我们**动态生成自定义的类**。根据这个特性，我们就可以编写 Mixin 代码来实现多重继承了：

```js
class Animal { // 共同工具类
    //
}
class CatMixin = (superClass) => class extends superClass { // 猫猫工具类
    //
}
class DogMixin = (superClass) => class extends superClass { // 狗狗工具类
    //
}

class MyMixin extends CatMixin(DogMixin(Animal)) { // 实现多重继承
    //
}
```

在上面的代码中，我们首先定义了一个通用的工具类 `Animal`，其它 Mixin 类可能会用到这个工具类。接着我们定义了猫猫和狗狗使用的工具类 `CatMixin` 与 `DogMixin` 的创建规则，它们将传入的参数作为自己的父类，并创建一个新的类。最后，我们定义了想要的 `MyMixin` 类，它继承了 `CatMixin(DogMixin(Animal))` 类。从实现的角度来看，**相当于**执行了下面的操作：

```js
class DogMixin extends Animal {
    //
}
class CatMixin extends DogMixin { // 这显然是不合理的，猫猫工具类怎么能继承狗狗工具类
    //
}

class MyMixin extends CatMixin {
    //
}
```

实际上，我们并没有让 `CatMixin` 类去继承 `DogMixin` 类，而是使用了 Mixin 的思想，让 `MyMixin` 继承了我们基于类表达式创建的一个新的类，实现了多重继承。

## 参考资料

本博文仅且记录了 JavaScript 中类在语法上的知识和使用，和少量的实现原理。关于底层的具体实现，就放到以后再深入探讨学习吧。

### 技术博文

- [JavaScript或ES6如何实现多继承总结【Mixin混合继承模式】](https://cloud.tencent.com/developer/article/1700017), 2020-09-18
- [ES6 Class Methods 定义方式的差异](https://github.com/dwqs/blog/issues/67), 2018-06-25
- [[学习es6]setter/getter探究](https://segmentfault.com/a/1190000007356931), 2016-11-02
- [Metaprogramming in ES6: Symbols and why they're awesome](https://www.keithcirkel.co.uk/metaprogramming-in-es6-symbols/#symbolspecies), 2015-06-18

### 其它资料

主要参考了 MDN 上关于类和相关内容的[描述](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)。

- [Mixins - JAVASCRIPT.INFO](https://javascript.info/mixins)
