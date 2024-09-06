---
title: 纯前端如何实现一个转盘抽奖组件
date: 2024/9/6
updated: 2024/9/7
categories:
  - 前端开发
tags:
  - TypeScript
  - CSS
---

## 为什么

前阵子面试的时候被问到这个问题，觉得挺有意思，于是决定亲手实现一个转盘抽奖组件试试。

翻看别人的实现方案时，发现和自己面试时答得相差很大，悲 😢。但总之，是时候开始弥补自己的 CSS 和动画技能了。

## 是什么

一个转盘抽奖组件主要由三部分组成，写有中奖结果的圆形转盘、指向结果的指针和开始转动的按钮。

如果每个中奖结果的概率相近，我们可以按照真实概率来划分每个奖品所占圆形的扇形比例。但是通常转盘中会设置抽中概率极小的大奖，按照真实比例的话将无法充分展示奖品内容，而且降低用户对转盘抽奖本身的兴趣度。所以本文实现的转盘组件选择**均分的方式**来划分每个奖品所占的扇形比例，符合通用的原则，也从视觉上让用户觉得中奖概率相当。

转盘转动可以有两种方式，一种是指针不动转盘动，一种是转盘不动指针动，都能很好地表达转盘抽奖的过程。对比两种方式，前者的视觉体验会更佳，且指针可以放置在任意位置（在中间往上指或在左侧往右指等等都可以）；后者则相对含蓄一些，用户的视觉负担较低，但指针只能放在中间旋转（我设想了一下在转盘外侧做圆周运动，感觉也有点意思）。因此，本文的实现选择**指针不动转盘动**的方式，从前端开发的角度来说，实现了一种方式，另一种方式也可以简单实现了。

当我们点击开始转动的按钮时，转盘便会开始转动。现实生活中的转盘通常由人手力驱动，转盘的**转速会从零迅速加到最大，然后逐渐变小直至为零**。我们实现的转盘不受这些物理条件的限制，但对现实的充分模拟可以提升转盘抽奖的可信度，本文也将朝着这个方向实现。

当点击按钮时，前端即向后端请求了抽奖的结果，后续转盘的转动也不过是预设好的动画罢了。因此我们可以轻松地计算得到转盘应当旋转的角度，让指针恰恰好停留在奖品所在的扇形区域。这也意味着**转盘旋转的角度可以是一个范围**，指针并不一定指向扇形区域的正中间，这也是对现实实际的一个模拟。

## 怎么做

在深入动画实现之前，让我们先完成 ~~简单的~~ 前置工作，把转盘抽奖组件的三个必要组成部分画出来。

首先是圆形转盘：

```html
<div class="container">
  <div id="turntable" class="turntable"></div>
</div>
```

```scss
.container {
  width: 500px;
  padding: 40px;
  background: #f8fafc;
  display: flex;
  justify-content: center;
}

.turntable {
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 50%;
}
```

```ts
interface Prize {
  label: string;
  probability: number;
  bgColor: string;
}

const prizes: Prize[] = [
  { label: "超级大奖", probability: 0.001, bgColor: "#b91c1c" },
  { label: "特等奖", probability: 0.009, bgColor: "#c2410c" },
  { label: "一等奖", probability: 0.01, bgColor: "#7e22ce" },
  { label: "二等奖", probability: 0.03, bgColor: "#2563eb" },
  { label: "三等奖", probability: 0.15, bgColor: "#15803d" },
  { label: "安慰奖", probability: 0.3, bgColor: "#1e293b" },
  { label: "谢谢参与", probability: 0.5, bgColor: "#3f3f46" },
];

const turntableDom = document.getElementById("turntable");
const proportionPerPrize = Number((100 / prizes.length).toFixed(1));

// #region 划分转盘扇形区域
const turntableConicGradient = prizes.map((prize, index) => {
  const from = (proportionPerPrize * index).toFixed(1);
  const to =
    index === prizes.length - 1
      ? 100
      : (proportionPerPrize * (index + 1)).toFixed(1);
  return `${prize.bgColor} ${from}% ${to}%`;
});
turntableDom.style.background = `conic-gradient(${turntableConicGradient.join(
  ",",
)})`;
// #endregion
```

利用 CSS 函数 `conic-gradient()` 创建颜色渐变，巧妙地实现转盘扇形区域的均分。得到的转盘如下所示：

![turntable-base](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240905/lucky-draw/turntable-base.png)

现在为每个扇形区域添加具体的奖品名称：

```scss
.prize-label {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: baseline;
  font-weight: bold;
  color: white;
  // #region 调整奖品名的位置
  line-height: 100px;
  // #endregion
}
```

```ts
const anglePerPrize = Number((360 / prizes.length).toFixed(1));

// #region 添加奖品名节点
const prizeLabels = document.createDocumentFragment();
prizes.map((prize, index) => {
  const prizeLabel = document.createElement("div");
  prizeLabel.classList.add("prize-label");
  prizeLabel.style.transform = `rotate(${
    -anglePerPrize / 2 + anglePerPrize * (index + 1)
  }deg)`;
  prizeLabel.innerText = prize.label;
  prizeLabels.appendChild(prizeLabel);
});
turntableDom.append(prizeLabels);
// #endregion

// #region 设置转盘初始角度
const turntableBaseRotate = -anglePerPrize / 2;
turntableDom.style.transform = `rotate(${turntableBaseRotate}deg)`;
// #endregion
```

我们手动创建了包含奖品名的节点，通过简单的计算，让它们旋转到自己所属的扇形区域上。我们还为转盘设置了一个初始角度，使得第一个奖品放置在转盘的正上方。效果如下所示：

![turntable-with-prize-labels](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240905/lucky-draw/turntable-with-prize-labels.png)

> 更精致、美观的转盘设计还是建议直接使用做好的转盘图片；纯前端实现的话一方面耗时耗力，另一方面如果请求过多的装饰图片反而会降低访问性能。
>
> ```html
> <img src="path/to/turntable.png" alt="turntable" id="turntable" class="turntable"></img>
> ```

接下来添加指针和开始转动的按钮：

```html
<div class="container">
  <div id="turntable" class="turntable"></div>
  <div class="arrow"></div>
  <div id="lottery-btn" class="lottery-btn">抽奖</div>
</div>
```

```scss
.arrow {
  position: absolute;
  top: 140px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 100px solid #f8fafc;
}

.lottery-btn {
  position: absolute;
  top: 200px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  user-select: none;

  &--disabled {
    color: #999;
    pointer-events: none;
  }
}
```

使用绝对定位将指针和按钮放到合适的位置，渲染得到的转盘如下所示：

![turntable-with-all](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240905/lucky-draw/turntable-with-all.png)

最重要的环节到了，实现转盘抽奖的核心需求：转！

```ts
const animationDuration = 5000;
const rotateLapsBase = 10;
let rotateLaps = 0;

const getRandomNumber = (min: number, max: number, precision: number) => {
  const factor = Math.pow(10, precision);
  const random = Math.random() * (max - min) + min;
  return Math.round(random * factor) / factor;
};

const lotteryBtnDom = document.getElementById("lottery-btn");
lotteryBtnDom.onclick = () => {
  lotteryBtnDom.classList.add("lottery-btn--disabled");

  // #region 获取中奖结果，由后端完成
  let prizeIndex = 0;
  let resultNum = getRandomNumber(0, 1, 3);
  while (resultNum > 0) {
    resultNum -= prizes[prizeIndex].probability;
    if (resultNum > 0) {
      prizeIndex += 1;
    }
  }
  const prize = prizes[prizeIndex];
  // #endregion

  // #region 获取转盘需要旋转的角度
  const turntableRotateDegFrom = Number(
    (anglePerPrize * prizeIndex).toFixed(1),
  );
  const turntableRotateDegTo =
    prizeIndex === prizes.length - 1
      ? 360
      : Number((anglePerPrize * (prizeIndex + 1)).toFixed(1));
  const turntableRotateDegEdgeThreshold = Number(
    (anglePerPrize / 4).toFixed(1),
  ); // 设定旋转到指定扇形区域的距边缘阈值（<= anglePerPrize / 2），防止出现指针指向太靠近边缘的情况
  const turntableRotateDegBase = getRandomNumber(
    turntableRotateDegFrom + turntableRotateDegEdgeThreshold,
    turntableRotateDegTo - turntableRotateDegEdgeThreshold,
    1,
  );
  rotateLaps += rotateLapsBase; // 适配多次旋转的情况
  const turntableRotateDeg = -(rotateLaps * 360 + turntableRotateDegBase);
  // #endregion

  // #region 为转盘设置旋转动画
  turntableDom.style.transform = `rotate(${turntableRotateDeg}deg)`;
  turntableDom.style.transition = `transform ${animationDuration}ms ease-out`;
  // #endregion

  setTimeout(() => {
    alert(`您抽中了：${prize.label}！`);
    lotteryBtnDom.classList.remove("lottery-btn--disabled");
  }, animationDuration + 500);
};
```

计算实际中奖结果所在的扇形区域角度 `turntableRotateDegFrom` 至 `turntableRotateDegTo`，分别加上和减去距离边缘的阈值 `turntableRotateDegEdgeThreshold`，将得到的范围取随机数，即可得到我们最后转盘应旋转的角度 `turntableRotateDegBase`。将应旋转的角度再加上设定好的旋转圈数所对应的角度，取反即可得到动画效果中实际旋转的角度 `turntableRotateDeg`。

点击抽奖按钮，看看现在的效果吧：

![lucky-draw-base-animation](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240905/lucky-draw/lucky-draw-base-animation.gif)

Ops，竟然是谢谢参与，我直觉有黑幕！但是可喜可贺，我们已经基本实现了转盘抽奖组件所需的全部能力。

下面，为了使转盘旋转的效果更贴近现实生活，我们可以为旋转动画设置更符合物理直觉的过渡效果。例如刚刚为 `transform` 设置的动画过渡效果 `transition-timing-function: ease-out;` 相当于 `transition-timing-function: cubic-bezier(0, 0, .58, 1);`，表示动画一开始较快，随着动画的进行逐渐减速。但是转盘从转动减速至停止的过渡时间太短，从视觉上看尤为突兀，要是稍长一些就好了。

通过 [cubic-bezier](https://cubic-bezier.com/)，我们可以快速实现如上所述的作为动画的过渡效果的三次贝塞尔曲线，如：`transition-timing-function: cubic-bezier(.3, .9, .38, 1);`，它减速至停止的过渡时间更长，更加符合物理直觉。效果如下：

![lucky-draw-better-animation](https://cdn.jsdelivr.net/gh/lolipopj/LolipopJ.github.io/20240905/lucky-draw/lucky-draw-better-animation.gif)

完整的 Demo 如下：

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js,result" data-slug-hash="QWXzwWp" data-pen-title="lucky-draw-demo" data-user="LolipopJ" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LolipopJ/pen/QWXzwWp">
  lucky-draw-demo</a> by JasonSung (<a href="https://codepen.io/LolipopJ">@LolipopJ</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
