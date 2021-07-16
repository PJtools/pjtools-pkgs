---
title: 简介
order: 1
group:
  path: /
nav:
  title: 文档
  order: 1
  path: /docs
---

![banner](https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg)

### 脚手架概览

当我们 clone 完项目之后会看到如下的目录结构。

```bash
- .dumi              * dumi 的相关配置，主要是主题等
- .github            * github 的 action 和相关的 issue 配置
- docs               * 存放公用的文档
- packages           * 我们维护的包, 如果你想贡献代码，这里是你最需要关注的
- README.md          * 展示在 github 主页的代码
- tests              * 编写测试用例的地方
- public             * 部署官网所用的静态文件
- scripts            * 开发或者部署所用的脚本
- .prettierrc.js     * prettier 的相关配置
- .eslintrc.js       * eslint 的配置
- .fatherrc.ts       * 编译脚手架的配置
- .umirc.js          * dumi 的核心配置
- webpack.config.js  * 编译 umd 包的配置文件
- jest.config.js     * 测试环境的配置
- lerna.json         * 多包的配置
- package.json       * 项目的配置
- tsconfig.json      * typescript 的配置
- yarn.lock          * 依赖 lock 文件
```

`coverage` 和 `.umi` 这两个文件夹比较特殊，`coverage` 是测试覆盖率文件，在跑完测试覆盖率后才会出现，`.umi` 是运行时的一些临时文件，在执行 `npm run start` 时生成。

### 源码概览

在 packages 文件夹中包含了我们所有的组件，每个组件一般都有一个 `src`，`package.json` 和 `README.md`。`package.json` 和 `README.md` 可以在新建文件夹后通过执行 `npm run bootstrap` 来生成。

`src` 中就是我们真正的源码，我们约定 `src` 下会有 demos 文件夹里面会存储所有的 demo，并且 `${包名}.md` 的文件用于介绍这个组件，同时引入 demo 和 API 文档。

> 我们使用了 dumi 的语法，要求全部使用外置组件，用 code 引入，调试起来会更加方便。

### 风格指南

我们使用自动化代码格式化软件 [`Prettier`](https://prettier.io/)。 对代码做出更改后，运行 `npm run prettier`。当然我们更推荐 prettier 的插件，随时格式化代码。

> 我们的 CI 会检查代码是否被 prettier，在提交代码前最好执行一下 `npm run prettier`。

之后，`linter` 会捕获代码中可能出现的多数问题。 你可以运行 `npm run lint` 来检查代码风格状态。

不过，`linter` 也有不能搞定的一些风格。如果有些东西不确定，请查看 [Airbnb’s Style Guide](https://github.com/airbnb/javascript) 来指导自己。
