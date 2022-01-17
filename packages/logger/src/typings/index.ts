/**
 * @文件说明: 定义 Logger TypeScript 类型
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2022-01-17 10:09:46
 */

import type { CSSProperties } from 'pjtools-pkgs-core';

// Web输出控制台的打印类型
export type WebConsoleType =
  | 'debug'
  | 'log'
  | 'info'
  | 'warn'
  | 'error'
  | 'group'
  | 'groupEnd'
  | 'groupCollapsed';

// Web输出控制台的打印消息对象类型
export type WebConsoleMessageType = {
  // Console控制台的类型
  type: WebConsoleType;
  // 待输出打印的内容
  text: string;
  // 待输出打印的参数
  args: any[];
};

// 输出控制台的参数选项对象
export interface ILoggerOptions {
  // 输出控制台日志的标题
  title?: string;
  // 输出控制台日志是否以分组形式进行展示
  group?: boolean;
  // 当分组输出控制台日志时，是否默认展开
  expanded?: boolean;
}

// 输出控制台的参数选项对象类型
export type LoggerOptionsType = string | ILoggerOptions;

// 输出控制台的打印消息类型
export type LoggerMessageType = string | string[];

// 输出控制台的实例日志对象
export interface ILoggerSpan {
  // CSS Style样式对象
  styles?: CSSProperties;
  // 所属父级对象
  parent?: ILoggerSpan;
  // 包含子级对象
  children?: ILoggerSpanType[];
}

// 输出控制台的实例日志对象
export interface ILoggerSpanType extends ILoggerSpan {
  // 日志类型
  type: 'group' | 'group-end' | 'group-collapsed' | 'style' | 'text' | 'log' | 'element' | 'object';
  // 输出打印的文本
  message?: string;
  // 输出打印的Element元素
  element?: HTMLElement;
  // 输出打印的对象
  object?: unknown;
}
