---
title: 使用腾讯位置服务进行 Web 前端定位
date: 2021/3/16
updated: 2021/3/16
timeliness: true
categories:
  - 前端开发
tags:
  - JavaScript
  - Node
  - Vue-2
  - Nuxt
---

正在开发的 Web 项目需要获取使用者的位置信息，而使用者主要通过移动端访问此 Web 服务。位置信息需要精确到区。在腾讯位置服务的[定位解决方案](https://lbs.qq.com/location/#anchor)里想要搜索可用的 JavaScript 库，只看到了服务端的 IP 定位和移动端的几个 SDK 包，甚异之。

终于在不起眼的地方找到了[前端定位组件](https://lbs.qq.com/webApi/component/componentGuide/componentGeolocation)，适用于浏览器进行定位操作。

本文基于 Nuxt.js 实现前端定位功能。

## 它能做什么

组件旨在优化纯 [HTML5 Geolocation](https://w3c.github.io/geolocation-api) 定位能力弱，定位成功率不高的问题，提供简单、易用的接口帮助业务层获取用户当前的位置信息（需用户授权），以降低开发成本，提升定位精准度。

除了常规的经纬度坐标以外，它返回的结果里还包含了 `city` 和 `district` 项，非常方面。

```js
{
  "module": "geolocation",
  "type": "h5_watch",
  "adcode": "", //行政区 ID，六位数字, 前两位是省，中间是市，后面两位是区，比如深圳市 ID 为 440300
  "nation": "美国",
  "province": "",
  "city": "加利福尼亚州",
  "district": "洛杉矶县",
  "addr": "",
  "lat": 34.035244, //火星坐标 (gcj02)，腾讯、Google、高德等地图通用
  "lng": -118.252207,
  "accuracy": 1441 //误差范围，以米为单位
}
```

可惜相关页面的最后一次更新最近可能是在 `2016-02-23`，文档撰写简陋不堪，只能在项目中慢慢试错使用。

## 引入前端定位组件库

首先需要在腾讯位置服务的控制台添加应用，获得应用的 `key`。

这里选择使用前端定位组件的**调用方式三**。

在 HTML 文件的中引入脚本，对应 Nuxt.js 应用中的 `nuxt.config.js`：

```js
// nuxt.config.js
export default {
  head: {
    script: [
      {
        type: "text/javascript",
        // 引入腾讯地图前端定位组件
        // YOUR-APP-KEY 即腾讯位置服务应用的 key
        // YOUR-APP-NAME 即腾讯位置服务应用的名称
        src: "https://apis.map.qq.com/tools/geolocation/min?key=YOUR-APP-KEY&referer=YOUR-APP-NAME",
      },
    ],
  },
};
```

如果获取脚本失败，请关闭浏览器中拦截广告的插件等。

此外，由于用户的位置信息属于敏感信息，因此需要使用 `HTTPS` 的网页发送请求；如果在本机开发，请使用 `localhost:port` 的形式开发和访问。

## 实现 Web 前端定位

编写代码如下：

```js
const geolocation = new qq.maps.Geolocation();

geolocation.getLocation(
  (position) => {
    // 成功获取位置信息
    console.log(position);
    // 将位置信息序列化存储在 localStorage 中
    const currentLocation = {
      city: position.city,
      district: position.district,
    };
    localStorage.currentLocation = JSON.stringify(currentLocation);
  },
  (error) => {
    // 获取位置信息失败
    console.log(error);
  }
);
```

执行代码，得到结果如下（其中 `*` 为我手动打码）：

```js
{
  "module": "geolocation",
  "type": "h5",
  "adcode": "510117",
  "nation": "中国",
  "province": "四川省",
  "city": "成都市",
  "district": "郫都区",
  "addr": "***",
  "lat": 30.75****,
  "lng": 103.92****,
  "accuracy": 113
}
```

定位成功精确到当前我所处的区和地址，满足项目开发要求。

其它相关方法和说明敬请参考[官方文档](https://lbs.qq.com/webApi/component/componentGuide/componentGeolocation)的“暗示”。
