---
title: 函数防抖和节流，以及在 Vue 中的运用
date: 2021/5/8
updated: 2021/5/8
categories:
- 前端开发
tags:
- JavaScript
- Vue-2
- Nuxt.js
---
在前端性能优化中存在一个老生常谈的问题：如何优化**高频率执行**的 JS 代码？例如：

1. 我们为浏览器滚动 scroll 绑定了监听事件，当滚动到某位置之下后，会在浏览器右下方显示一个点击后能快速回到页面顶部的浮动按钮；而滚动回该位置之上时，浮动按钮消失。现在我们发现，用户每次使用滚轮滑动页面，都会触发很多次该事件，判断当前在该位置之上还是之下，这在一定程度上降低了前端的性能。
2. 我们为网页添加了搜索功能，当用户输入搜索关键字后，会自动显示出搜索的结果。但是，用户每次更改输入都立即调用后端进行了搜索，彼时用户可能尚未输入完关键字，亦或是关键字输入错误需要修改。这样搜索出来的结果并非用户希望看到的，同时还降低了前端性能，浪费了大量的服务器资源。

针对上述列举的问题，我们应该怎么做，才能在优化前端性能的同时不至于影响到用户的体验，便是本文探讨的内容。

## 函数节流

函数节流（Throttle），指在触发事件后的一定时间内绑定的函数只能执行一次。

函数节流的实现思路比较简单，例如使用 `setTimeout` 方法实现：由于 `setTimeout` 方法的返回值是一个正整数，表示定时器的编号，所以可以利用闭包的方法维护一个定时器编号。每次触发事件时都通过定时器编号判断当前是否有尚未到期的定时器，如果有则结束，如果没有则启用一个定时器。定时器到期后调用绑定的需要节流的函数，并设置定时器编号为空，表示可以启用一个新的定时器。代码如下：

```js
/**
 * 函数节流
 * 连续触发事件但是在 wait 毫秒中只执行一次函数
 * @param {Function} func 执行的函数
 * @param {Number} wait 函数节流等待的时间，单位为 ms
 * @returns 节流执行的函数
 */
function throttle1(func, wait) {
  let timer // 维护的定时器编号
  return function () { // 返回节流执行的函数，可以绑定给事件
    const args = arguments // 执行函数的参数
    if (!timer) { // 当定时器不存在或已到期时
      timer = setTimeout(() => { // 启用一个新的定时器
        timer = undefined // 到期后设置定时器编号为空
        func.apply(this, args) // 到期后执行函数
      }, wait) // 定时器等待 wait 毫秒后执行
    }
  }
}
```

`setTimeout` 的方法，可以在触发事件后的 wait 毫秒自动后执行需要节流的函数。

需要特别留意的是上述代码有这样一个细节：`setTimeout(() => { func.apply(this, args) }, wait)`。

我们使用了箭头函数，使得 `setTimeout` 中方法内 `this` 的作用于指向绑定此节流函数的对象，而非全局 `window` 对象。

此外，如果不使用 `apply()` 方法而是直接调用函数的话，节流执行函数内的 `this` 对象仍指向的是全局的 `window` 对象，而非我们期望的绑定此节流函数的对象，因此应使用 `apply()` 传入 `this` 上下文对象。

对于实现传入上下文对象，`call()` 方法的作用和 `apply()` 相同，只是前者需要将传入的参数列举出来，而后者需要将传入的参数放在一个数组中。由于我们使用 `const args = arguments` 获取了函数传入的参数，而 `args` 为一个数组，因此选择使用 `apply()` 的方法。

假如不使用箭头函数，应该在 `setTimeout` 方法前获取 `this` 上下文对象，再调用 `apply()` 方法，如：

```js
/**
 * 函数节流非箭头函数版本
 * 连续触发事件但是在 wait 毫秒中只执行一次函数
 * @param {Function} func 执行的函数
 * @param {Number} wait 函数节流等待的时间，单位为 ms
 * @returns 节流执行的函数
 */
function throttle2(func, wait) {
  let timer
  return function () {
    const args = arguments
    const that = this // 获取作用域上下文
    if (!timer) {
      timer = setTimeout(function () { // 使用 function () {} 的方式
        timer = undefined
        func.apply(that, args) // 使用绑定的上下文对象
      }, wait)
    }
  }
}
```

如果不喜欢 `setTimeout` 方法，也可以使用时间戳的方法实现函数节流：利用闭包的方法维护一个时间戳，每次触发事件时通过当前的时间戳和维护的时间戳之间的差值获取间隔的时间。若间隔时间大于预设的等待时间，则执行函数，并设置维护的时间戳为当前的时间戳。

```js
/**
 * 函数节流时间戳版本
 * 连续触发事件但是在 wait 毫秒中只执行一次函数
 * @param {Function} func 执行的函数
 * @param {Number} wait 函数节流等待的时间，单位为 ms
 * @returns 节流执行的函数
 */
function throttle3(func, wait) {
  let previous = new Date()
  return function () {
    const args = arguments
    const now = new Date() // 获取当前的时间
    if (now - previous > wait) { // Date 对象在计算时会隐式转换为时间戳，当间隔时间大于等待时间时
      previous = now // 设置维护的时间为当前的时间
      func.apply(this, args) // 执行函数
    }
  }
}
```

时间戳的方法不会在等待时间后自动执行需要节流的函数，而是在下一次触发事件后才执行。应根据具体需求在 `setTimeout` 和时间戳的方法之间进行选择。

特别的，我们可以设置当触发事件后立即执行需要节流的函数，再等待一定时间后才能再次执行此函数。基于 `setTimeout` 的方法，改良代码如下：

```js
/**
 * 函数节流 setTimeout 改良版本
 * 连续触发事件但是在 wait 毫秒中只执行一次函数
 * @param {Function} func 执行的函数
 * @param {Number} wait 函数节流等待的时间，单位为 ms
 * @param {Boolean} immediate 触发后立即执行函数
 * @returns 节流执行的函数
 */
function throttle4(func, wait, immediate = false) {
  let timer
  return function () {
    const args = arguments
    if (!timer) {
      if (immediate) { // 设置立即执行函数
        timer = setTimeout(() => { // 启用一个新的定时器
          timer = undefined // 到期后设置定时器编号为空
        }, wait) // 定时器等待 wait 毫秒后执行
        func.apply(this, args) // 立即执行函数
      } else {
        timer = setTimeout(() => {
          timer = undefined
          func.apply(this, args)
        }, wait)
      }
    }
  }
}
```

## 函数防抖

函数防抖（Debounce），指在触发事件后的一定时间内绑定的函数只能执行一次，如果在这段时间内又触发了事件，则会重新计算时间。

从定义上来看，函数防抖像是函数节流的“强化版”：函数节流保证在一定时间内只执行一次事件绑定的函数，而函数防抖确保了事件在**一定时间内稳定不变**后才执行绑定的函数。

函数防抖的实现思路更加简单：同样适用闭包的方法维护一个定时器编号，每次触发事件时都通过此编号取消之前的定时器，并启用一个新的定时器。定时器到期后执行需要防抖的函数，并设置定时器编号为空。

特别的，我们也可以设置当触发事件后立即执行需要防抖的函数。首次触发时，维护的定时器编号为空，表示可以立即执行函数。此时启用一个定时器，对其编号进行维护，定时器到期后设置编号为空。当存在定时器编号时，表示仍在等待时间内，不会执行函数，此时我们清除前一个定时器，并启用一个新的定时器；当不存在定时器编号时，执行函数，并启用新的定时器。

代码如下：

```js
/**
 * 函数防抖
 * 触发事件后在 wait 毫秒内函数只执行一次；如果在 wait 毫秒内又触发了事件，则会重新计算函数执行时间
 * @param {Function} func 需要防抖的函数
 * @param {Number} wait 防抖的等待时间，单位为 ms
 * @param {Boolean} immediate 触发事件后立即执行函数
 * @returns 防抖执行的函数
 */
function debounce(func, wait, immediate = false) {
  let timer
  return function () {
    const args = arguments

    timer && clearTimeout(timer) // 如果定时器编号不为空，则清除定时器。此处只是清除定时器，并未清除定时器编号

    if (immediate) { // 设置立即执行函数
      !timer && func.apply(this, args) // 如果定时器编号不为空，即在等待时间内，不执行函数；若为空，则执行函数
      timer = setTimeout(() => { // 启用新的定时器
        timer = undefined // 定时器到期后清空定时器编号
      }, wait) // 定时器等待 wait 毫秒后执行
    } else { // 不立即执行函数
      timer = setTimeout(() => {  // 启用新的定时器
        func.apply(this, args) // 定时器到期后执行函数
      }, wait) // 定时器等待 wait 毫秒后执行
    }
  }
}
```

## 在 Nuxt.js 中引入函数节流和防抖

在项目的 `plugins` 目录下创建一个新的文件，例如 `main.js`。将函数节流和防抖添加为 Vue 的实例方法。如：

```js
// plugins/main.js
import Vue from 'vue'

function throttle() {
  //
}

function debounce() {
  //
}

const main = {
  install(Vue) {
    // 注册到 Vue.prototype.$Main 中
    Vue.prototype.$Main = {
      throttle,
      debounce,
    }
  },
}

Vue.use(main)
```

接下来在 `nuxt.config.js` 中引入：

```js
export default {
  plugins: [
    '~/plugins/main.js',
  ],
}
```

就可以在组件中通过 `this.$Main.throttle()` 调用函数了。其中 `this` 指向了全局的 Vue 对象。

## 简单的使用示例

### 浏览器滚动事件

对于本博客开头提出的第一种情况，我们可以使用函数节流的方案优化前端性能。

为什么不用函数防抖？假如用户一直在滚动浏览器，那么直到用户停止滚动前，都不会执行函数判断当前滚动位置。而使用函数节流，无论用户是否一直在滚动浏览器，都会在一定时间后再次执行函数判断当前滚动位置。

基于 Vuetify UI 组件库编写 Vue 代码如下：

```vue
<template>
  <v-fab-transition>
    <!-- 当窗口滚动值大于 300 时显示按钮 -->
    <v-btn
      v-show="scrollVal > 300"
      fixed
      fab
      dark
      bottom
      right
      color="white"
      elevation="2"
      class="mb-12"
      @click="backToTop"
    >
      <v-icon color="primary">mdi-arrow-up</v-icon>
    </v-btn>
  </v-fab-transition>
</template>

<script>
export default {
  data: () => ({
    // 当前的窗口滚动值
    scrollVal: 0,
  }),
  mounted() {
    // 每 500 毫秒获取当前的 scrollVal 值
    const throttleOnScroll = this.$Main.throttle(this.onScroll, 500)
    // 为 window 添加滚动事件
    window.addEventListener('scroll', throttleOnScroll)
  },
  methods: {
    // 获取 window.pageYOffset 值并赋值给 scrollVal
    onScroll() {
      this.scrollVal = window.pageYOffset
    },
    // 回到顶端
    backToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    },
  },
}
</script>
```

`window.pageYOffset` 是 `window.scrollY` 的别名，前者的浏览器兼容性较好，调用时将返回文档在垂直方向已滚动的像素值。

`onScroll()` 方法可以获取当前文档在垂直方向已滚动的像素值并赋值给 `scrollVal`，而浮动按钮根据此值判断是否显示。上述代码设定当该值大于 300 时显示浮动按钮。

上述代码将 `onScroll()` 方法封装成了一个等待时间为 500 毫秒的节流函数 `throttleOnScroll()`，并将该节流函数绑定给浏览器滚动事件。

当用户滚动浏览器时，每隔 500 毫秒会获取当前已滚动的像素值，浮动按钮再根据此值判断是否显示，性能优化完成！

## Easy ride

不想自己手撸函数节流和防抖？

那就用封装好的吧：[Lodash](https://lodash.com/)，你值得拥有。

## 参考资料

- [终于搞懂：防抖和节流](https://juejin.cn/post/6914591853882900488), 2021-01-06
- [彻底弄懂函数防抖和函数节流](https://segmentfault.com/a/1190000018445196), 2019-03-09
- [什么是防抖和节流？有什么区别？如何实现](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/5), 2019-01-23
- [浅析函数防抖与函数节流](https://www.jianshu.com/p/f9f6b637fd6c), 2018-08-12
