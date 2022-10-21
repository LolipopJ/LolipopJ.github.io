---
title: 在 Nuxt.js 中引入高德地图并实现定位及逆地理编码
date: 2021/3/17
updated: 2021/3/18
timeliness: true
categories:
  - 前端开发
tags:
  - JavaScript
  - Node
  - Vue-2
  - Nuxt
  - Promise
---

迷途知反！腾讯地图的 JS API 文档实在过于简陋，且库很久没有更新，转身投入高德地图的怀抱，享受 this moment 的美好！

## 高德地图与腾讯地图定位功能区别

高德地图将定位功能和逆地理编码功能分开为两个操作，而腾讯地图将二者合并。

这意味着使用高德地图实现逆地理编码，首先需要执行定位操作，再将得到的结果传给逆地理编码插件获得最后的结果。

此外，高德地图的逆地理编码无法解析中国以外的地理坐标，只能解析中国境内省市区等地理坐标。

## 引入高德地图 JS API 库

这里我们通过顺序同步加载的方式引入第三方库。

编辑 `nuxt.config.js` 中 `head` 项以引入 JS API 库。

```js
// nuxt.config.js
script: [
  {
    type: 'text/javascript',
    // 引入高德地图 JavaScript API：https://developer.amap.com/api/jsapi-v2/guide/abc/load
    // YOUR-APP-KEY 即高德位置服务应用的 key
    // AMap.Geolocation 为定位插件
    // AMap.Geocoder 为逆地理编码插件
    src:
      'https://webapi.amap.com/maps?v=2.0&key=YOUR-APP-KEY&plugin=AMap.Geolocation,AMap.Geocoder',
  },
],
```

如果获取脚本失败，请关闭浏览器中拦截广告的插件等。

此外要注意：

- 为避免地图数据协议和前端资源不匹配导致页面运行报错，只允许在线加载 JS API，禁止进行本地转存、与其它代码混合打包等用法。——[JS API 的加载](https://developer.amap.com/api/javascript-api/guide/abc/load)
- 由于 Chrome、IOS10 等已不再支持非安全域的浏览器定位请求，为保证定位成功率和精度，请尽快升级您的站点到 HTTPS。——[AMap.Geolocation 插件](https://developer.amap.com/api/javascript-api/reference/location)

## 高德地图定位功能实现

现在已经引入了需要的库及插件 `AMap.Geolocation`，首先要构建一个浏览器定位实例 `geolocation`：

```js
// 仅进行定位，不与地图交互
const geolocation = new AMap.Geolocation({
  timeout: 10000, // 超过 10 秒后停止定位
  noIpLocate: 1, // 禁止移动端使用 IP 定位
  useNative: true, // 使用安卓定位 sdk 用来进行定位
});
```

更多的构造选项可参考 [AMap.Geolocation 插件官方文档](https://developer.amap.com/api/javascript-api/reference/location)。

对于定位方法 `getCurrentPosition(callback:function(status,result){})`，可以用 callback 的方式或事件监听的方式实现取得返回值。以 callback 的方式为例，可编写：

```js
geolocation.getCurrentPosition((status, result) => {
  if (status === "complete") {
    // 定位成功
    console.log(result);
  } else {
    // 定位失败
    console.log(result.message);
  }
});
```

为了封装函数，无法在回调函数里添加 `return` 进行返回，因此选择使用 `Promise` 的方法：

```js
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition((status, positionResult) => {
      if (status === "complete") {
        // 定位成功
        resolve({
          status: 1,
          msg: "获取地理位置成功",
          result: positionResult,
        });
      } else {
        // 定位失败
        reject(new Error(`获取地理位置失败：${positionResult.message}`));
      }
    });
  });
}
```

接下来只需要进行标准的 `then()` 或 `catch()` 处理就可以了：

```js
getCurrentPosition()
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
```

## 高德地图逆地理编码功能实现

[高德地图逆地理编码](https://developer.amap.com/api/javascript-api/reference/lnglat-to-address)由 `AMap.Geocoder` 插件实现，我们也已经引入。

因此只需要将上一步得到的地理经纬度坐标信息作为参数传入即可：

```js
function getCurrentAddress() {
  return new Promise((resolve, reject) => {
    // 调用定位方法
    getCurrentPosition()
      .then((positionResult) => {
        // 定位成功
        // 获得经纬度坐标数组，元素顺序不可变
        const lnglat = [
          positionResult.result.position.lng,
          positionResult.result.position.lat,
        ];
        // 构造地理编码或逆地理编码功能实例
        const geocoder = new AMap.Geocoder();
        // 获得逆编码信息
        geocoder.getAddress(lnglat, (addressStatus, addressResult) => {
          if (addressStatus === "complete" && addressResult.regeocode) {
            // 获取成功
            resolve({
              status: 1,
              msg: "获取地理位置和地区信息成功",
              result: { positionResult: positionResult.result, addressResult },
            });
          } else {
            // 获取失败
            resolve({
              status: 2,
              msg: "获取地理位置成功，但获取地区信息失败",
              result: { positionResult: positionResult.result },
            });
          }
        });
      })
      .catch((err) => {
        // 定位失败
        reject(err);
      });
  });
}
```

调用方式同上所述，不再赘述。可以添加对 `status` 的判断验证结果并进行相应处理。

## 完整源码

编写封装的基于 Nuxt.js + Promise 实现高德地图定位及逆地理编码的代码如下所示：

```js
// plugins/amapGeolocation.js
import Vue from "vue";

const geolocation = new AMap.Geolocation({
  timeout: 10000, // 超过 10 秒后停止定位
  noIpLocate: 1, // 禁止移动端使用 IP 定位
  useNative: true, // 使用安卓定位 sdk 用来进行定位
});

/**
 * 获取当前的经纬度坐标
 * https://developer.amap.com/api/javascript-api/reference/location
 */
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition((status, positionResult) => {
      if (status === "complete") {
        // 定位成功
        resolve({
          status: 1,
          msg: "获取地理位置成功",
          result: positionResult,
        });
      } else {
        // 定位失败
        reject(new Error(`获取地理位置失败：${positionResult.message}`));
      }
    });
  });
}

/**
 * 获取当前地理坐标的逆编码结果
 * https://developer.amap.com/api/javascript-api/reference/lnglat-to-address
 */
function getCurrentAddress() {
  return new Promise((resolve, reject) => {
    getCurrentPosition()
      .then((positionResult) => {
        const lnglat = [
          positionResult.result.position.lng,
          positionResult.result.position.lat,
        ];
        const geocoder = new AMap.Geocoder();
        geocoder.getAddress(lnglat, (addressStatus, addressResult) => {
          if (addressStatus === "complete" && addressResult.regeocode) {
            // 逆编码成功
            resolve({
              status: 1,
              msg: "获取地理位置和地区信息成功",
              result: { positionResult: positionResult.result, addressResult },
            });
          } else {
            // 逆编码失败
            resolve({
              status: 2,
              msg: "获取地理位置成功，但获取地区信息失败",
              result: { positionResult: positionResult.result },
            });
          }
        });
      })
      .catch((err) => {
        // 定位失败
        reject(err);
      });
  });
}

const amapGeolocation = {
  install(Vue) {
    Vue.prototype.$Geolocation = {
      getCurrentPosition,
      getCurrentAddress,
    };
  },
};

Vue.use(amapGeolocation);
```

将此文件作为插件引入 Nuxt.js 后，可以在 Vue 文件中通过如下代码轻松调用：

```js
// .vue
// 仅获取地理坐标
this.$Geolocation
  .getCurrentPosition()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });

// 获取地理坐标及所在地址
this.$Geolocation
  .getCurrentAddress()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
```

## 相关链接

- {% post_link tencent-map-api-get-current-location '使用腾讯位置服务进行 Web 前端定位' %}
