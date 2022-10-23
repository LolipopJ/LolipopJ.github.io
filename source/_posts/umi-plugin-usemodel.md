---
title: 为什么我使用 Umi 的 model 简易数据流管理插件
date: 2022/10/23
updated: 2022/10/23
categories:
  - 前端开发
tags:
  - React
  - Umi
---

Umi 是一款企业级的 React 前端应用框架，云巧产业数字组件中心推荐使用基于 Umi 的 Koi 框架统一前端应用研发流程，支撑前端项目从研发、联调到上线、发布的全流程。

本文假设您正在或计划使用 Umi 或 Koi 作为底层框架支撑前端应用的开发，并且对 Umi 有一定的了解。

## 数据治理的原则

React 的核心特征是“数据驱动视图”，用公式表达即 `UI = render(data)`，通过数据变化来驱动视图变化。React 将组件内部自有的数据称作 state（状态），通过管理 state 来实现对组件的管理。

通过 Props 传参，可以在 React 中实现简单的父子、子父和兄弟组件间数据传递。对于跨级组件间的数据传递，React 提供了基于生产者-消费者模式的 Context API 来实现全局通信。

随着应用的膨胀，组件内部的状态变得愈加复杂，数据流管理的成本也越来越高。如果说所有代码的末路都是成为一座难以维护的大山的话，在那之前，我们应当好好想想如何尽可能多地延长代码的寿命，去重新思考我们的 React 项目的代码组织逻辑。

Umi 建议将所有组件降级为“无状态组件”，仅仅依赖 Props 或 Context 进行渲染。这样，在 UI 层面仅关心用户交互和渲染的逻辑，在单独的数据层去关心数据处理的逻辑。以 Umi 项目为例，具体而言就是：

- `src/models` 中的文件管理数据层的逻辑，包含网络请求、数据处理等。
- `src/pages` 中的页面组件与数据层进行交互，并将得到的数据通过 Props 或 Context 传递给通用组件，进行页面渲染。
- `src/components` 中的通用组件仅仅依赖从 Props 或 Context 得到的数据进行渲染，不与数据层发生直接交互。

## 介绍 model 简易数据流插件

Umi 的 model 简易数据流插件就是基于 Context 的封装，使得数据能够在项目全局共享与使用。相比原生的 Context API，model 简易数据流插件更加便于使用。

使用 Context API 时，需要创建上下文对象，并在渲染树顶层包装上下文的 Provider：

```tsx
// src/contexts/userContext.tsx
import React, { createContext, useState } from "react";
export const UserContext = createContext();
export const UserContextProvider = (props) => {
  const [username, setUsername] = useState<string>("");
  return (
    <UserContext.Provider value={{ username }}>
      {props.children}
    </UserContext.Provider>
  );
};

// src/layouts/index.tsx
import React from "react";
import { Outlet } from "umi";
import { UserContextProvider } from "@/contexts/userContext";
export const Layout = () => {
  return (
    <UserContextProvider>
      <Outlet />
    </UserContextProvider>
  );
};
export default Layout;
```

使用简易数据流插件可以略去创建上下文对象和包装 Provider 的过程，仅需要按约定目录导出一个自定义的 `hook` 函数即可：

```ts
// src/models/userModel.ts
import { useState } from "react";
export default function () {
  const [username, setUsername] = useState<string>("");
  return { username };
}
```

在组件使用上下文中存储的数据时，Context API 需要：

```tsx
import React, { useContext } from "react";
import { UserContext } from "@/contexts/userContext";
export const pageElement = () => {
  const { username } = useContext(UserContext);
  return <>{username}</>;
};
export default pageElement;
```

而使用简易数据流插件可以略去引入指定上下文对象的过程，Umi 已经自动为它创建了一个命名空间：

```tsx
import React from "react";
import { useModel } from "umi";
export const pageElement = () => {
  const { username } = useModel("userModel");
  return <>{username}</>;
};
export default pageElement;
```

由于调用了 `useContext` 的组件总会在 `context` 值变化时重新渲染，可能需要使用 `useMemo` 或 `memo` 来优化重渲染开销较大的组件：

```tsx
import React, { useContext, useMemo } from "react";
import { UserContext } from "@/contexts/userContext";
export const pageElement = () => {
  const { username } = useContext(UserContext);
  return useMemo(() => {
    return <ExpensiveTree username={username} />;
  }, [username]);
};
export default pageElement;
```

使用简易数据流插件时同样可以使用 `useMemo` 或 `memo` 来进行优化，但更好的选择是直接利用 `useModel()` 提供的过滤方法，只关心需要的数据：

```tsx
import React from "react";
import { useModel } from "umi";
export const pageElement = () => {
  const { username } = useModel("userModel", (model) => ({
    username: model.username,
  }));
  return <ExpensiveTree username={username} />;
};
export default pageElement;
```

综上所述，Umi 的 model 简易数据流插件实现了对 Context API 的较好封装，能够降本增效，简化代码的编写。对于需要使用 Context 管理数据流的情况，都可以使用 model 简易数据流插件替代。

## 什么时候使用 model 简易数据流插件

近年来，微前端架构的兴起为企业前端应用开发注入了新的活力，随着巨型前端应用拆解成一个个小微型前端应用，页面数据的治理难度也大大降低了。

当您使用 Umi 或 Koi 开发**小微型前端应用**遇到全局状态共享或数据流管理需求时，model 简易数据流插件具有**便利**、**低心智负担**的优势，不妨好好利用它来管理页面数据。

针对更复杂的数据流管理需求（例如数据可预知甚至可回溯等），model 简易数据流插件显得有些捉襟见肘了：它只负责将数据全局化。别担心，开源社区提供了大量专注于做好数据流管理这件事的方案，例如 [Redux](https://github.com/reduxjs/redux) 和 [MobX](https://github.com/mobxjs/mobx) 等；Umi 官方目前也提供了对接 [dva](https://github.com/dvajs/dva) 和 [Valtio](https://github.com/pmndrs/valtio) 数据流管理库的插件，开箱即用。
