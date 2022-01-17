---
title: PkgsLogger - 控制台日志输出
order: 0
legacy: /logger
group:
  path: /
nav:
  title: 组件
  path: /components
---

## 代码演示

```tsx
/** Title: 控制台日志 desc: 使用`F12`在浏览器控制台中进行查看渲染结果. */

import React, { useRef, useEffect } from 'react';
import Logger from 'pjtools-pkgs-logger';

export default () => {
  const instance = useRef<Logger>(new Logger());
  const logger = instance.current;

  useEffect(() => {
    // 普通日志数据输出打印
    logger.log('这是一条打印日志。');
    logger.debug('这是一条调试日志。');
    logger.info('这是一条通知公告。');
    logger.success('这是一条成功消息。');
    logger.warn('这是一条警告信息。');
    logger.error('这是一条错误信息。');
    logger.loading('数据正在加载中...');

    // 输出空白换行
    logger.empty();

    // 多条日志数据输出打印
    logger.log(['1、这是一条打印日志。', '2、这是一条打印日志。'], { group: true });
    logger.debug(['1、这是一条调试日志。', '2、这是一条调试日志。'], { group: true });
    logger.info(['1、这是一条通知公告。', '2、这是一条通知公告。'], { group: true });
    logger.success(['1、这是一条成功消息。', '2、这是一条成功消息。'], { group: true });
    logger.warn(['1、这是一条警告信息。', '2、这是一条警告信息。'], { group: true });
    logger.error(['1、这是一条错误信息。', '2、这是一条错误信息。'], { group: true });
    logger.loading(['1、数据正在加载中...', '2、数据正在加载中...'], { group: true });
  }, []);

  return <></>;
};
```

## API

通过实例方式 `new Logger(options?)` 构建控制台日志输出对象。

### Options 默认参数

其中：`options` 参数选项包含属性如下：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 控制台日志输出时是否禁用打印（<b>注意</b>：`error`类型日志消息不受此控制）。主要作用于开发环境与生成环境区分配置时使用。 | `boolean` | false |

### Methods 方法

#### logger.log(message: LoggerMessageType, options?: LoggerOptionsType)

说明： 控制台输出`LOG`类型日志。

| 参数    | 说明                             | 类型                | 默认值 |
| ------- | -------------------------------- | ------------------- | ------ |
| message | 控制台日志待打印的消息对象       | `LoggerMessageType` | -      |
| options | `可选项`，日志打印的参数选项对象 | `LoggerOptionsType` | -      |

`options` 参数选项包含属性如下：

| 参数     | 说明                                                        | 类型      | 默认值 |
| -------- | ----------------------------------------------------------- | --------- | ------ |
| title    | `可选项`，日志的自定义标题                                  | `string`  | -      |
| group    | `可选项`，控制台日志打印时是否以 Group 分组形式渲染         | `boolean` | false  |
| expanded | `可选项`，当开启 Group 分组形式打印日志时，是否默认展开分组 | `boolean` | true   |

> 特殊说明：`options`类型可以直接采用`string`字符型进行赋值，如检测是一个字符串时，则会自动赋值给`title`参数选项。

#### logger.info(message: LoggerMessageType, options?: LoggerOptionsType)

说明： 控制台输出`INFO`类型日志。

#### logger.debug(message: LoggerMessageType, options?: LoggerOptionsType)

说明： 控制台输出`DEBUG`类型日志。

#### logger.warn(message: LoggerMessageType, options?: LoggerOptionsType)

说明： 控制台输出`WARN`类型日志。

#### logger.error(message: LoggerMessageType, options?: LoggerOptionsType)

说明： 控制台输出`ERROR`类型日志。

#### logger.success(message: LoggerMessageType, options?: LoggerOptionsType)

说明： 控制台输出`SUCCESS`类型日志。

#### logger.empty()

说明： 控制台输出打印`空白行`。
