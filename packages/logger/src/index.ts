/**
 * @文件说明: Web Control控制台日志库
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2021-08-30 15:58:48
 */

import {
  isNil,
  isString,
  isNumber,
  isPlainObject,
  isArray,
  isElement,
  assign,
  forIn,
  forEach,
  toString,
} from 'lodash';
import { getBrowserResult } from 'pjtools-pkgs-core';
import type { CSSProperties } from 'pjtools-pkgs-core';
import type {
  LoggerMessageType,
  LoggerOptionsType,
  ILoggerOptions,
  WebConsoleType,
  WebConsoleMessageType,
  ILoggerSpan,
  ILoggerSpanType,
} from './typings';

// TypeScript类型
export * from './typings';

export interface ConsoleLoggerOptions {
  // 是否禁用控制台日志输出（不包括Error错误日志）
  disabled?: boolean;
}

class ConsoleLogger {
  // 是否禁用Web控制台的日志打印
  private disabled: boolean = false;

  // 待输出控制台的整体打印日志对象
  private rootSpan: ILoggerSpan;

  // 待输出控制台的当前打印日志对象
  private currentSpan: ILoggerSpan;

  /**
   * 构造函数 - ConsoleLogger
   *
   * @param options 参数选项对象
   */
  constructor(options: ConsoleLoggerOptions = {}) {
    // 赋值是否允许Web输出控制台打印日志
    if (options && options.disabled === true) {
      this.disabled = options.disabled;
    }
    // 初始化待输出控制台打印日志对象
    const logger = this.resetLoggerSpan();
    this.rootSpan = logger.rootSpan;
    this.currentSpan = logger.currentSpan;
  }

  // 判断是否当前浏览器支持
  get isSupport(): boolean {
    const { browser } = getBrowserResult();
    return !(
      browser &&
      (browser.name === 'IE' ||
        (browser.name === 'Firefox' && browser.version && parseInt(browser.version, 10) <= 11))
    );
  }

  // 清空并重置待输出控制台的日志记录
  private resetLoggerSpan() {
    const loggerSpan: ILoggerSpan = {
      styles: {},
      parent: undefined,
      children: [],
    };
    this.rootSpan = loggerSpan;
    this.currentSpan = loggerSpan;
    return this;
  }

  // 转换获取控制台日志输出的参数选项对象
  private getConsoleOptions(options?: LoggerOptionsType): ILoggerOptions {
    const defaultOptions: ILoggerOptions = { group: false, expanded: true };

    if (!isNil(options) && (isString(options) || isPlainObject(options))) {
      const opts: ILoggerOptions = isString(options) ? { title: options } : { ...options };
      return assign({}, defaultOptions, opts);
    } else {
      return defaultOptions;
    }
  }

  // 设置待渲染输出日志的标题
  private renderLoggerTitle({
    title,
    color = '#8C8C8C',
    group = false,
    expanded = true,
    prefix,
    padding = { left: 0, right: 0 },
  }: {
    // 标题文本
    title: string;
    // 标题的文本颜色
    color?: string;
    // 是否以分组进行输出打印
    group?: boolean;
    // 是否默认展开分组输出打印
    expanded?: boolean;
    // 标题的前缀内容
    prefix?: string;
    // 标题的前缀内容内间距
    padding?: {
      left: number;
      right: number;
    };
  }) {
    const titleStyle: CSSProperties = {
      color,
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: 'Arial, "Microsoft YaHei", "黑体", sans-serif',
    };

    // 判断是否为分组渲染控制台日志
    group && this.group(expanded);

    // 设置控制台日志的前缀标题图标
    if (prefix) {
      this.style({
        paddingLeft: `${padding.left || 0}px`,
        paddingRight: `${padding.right || 0}px`,
      })
        .text(prefix)
        .styleEnd();
    }

    // 设置标题的内容
    this.style(titleStyle).text(`${title}: `).styleEnd();
    return this;
  }

  // 根据消息类型进行不同数据格式的渲染
  private setLoggerMessageByType(messages: LoggerMessageType) {
    const defaultStyle: CSSProperties = {
      fontSize: '12px',
    };

    if (!messages || isNil(messages)) {
      if (isNil(messages)) {
        this.style({
          ...defaultStyle,
          color: messages === null ? '#73d13d' : '#5cdbd3',
        })
          .text(messages === null ? 'null' : 'undefined')
          .styleEnd();
      } else {
        this.text('');
      }
      return this;
    }

    // 根据待输出日志数据类型进行对应转换
    switch (typeof messages) {
      case 'string': {
        this.style({
          ...defaultStyle,
          color: '#1f1f1f',
        })
          .text(messages)
          .styleEnd();
        break;
      }
      case 'number': {
        this.style({
          ...defaultStyle,
          color: '#40a9ff',
        })
          .text(toString(messages))
          .styleEnd();
        break;
      }
      case 'boolean': {
        this.style({
          ...defaultStyle,
          color: messages ? '#1d39c4' : '#9254de',
        })
          .text(toString(messages))
          .styleEnd();
        break;
      }
      default: {
        if (isElement(messages)) {
          this.element(messages as any);
        } else {
          this.object(messages as any);
        }
        break;
      }
    }
    return this;
  }

  // 设置待渲染输出日志的消息内容
  private getLoggerMessages(messages: LoggerMessageType, options: ILoggerOptions) {
    // 判断是否为分组渲染
    if (options.group) {
      const loggerMessages = !isArray(messages) ? [messages] : messages;
      if (loggerMessages.length > 0) {
        this.line();
        forEach(loggerMessages, (message) => {
          this.text('⚡ ');
          this.setLoggerMessageByType(message);
          this.line();
        });
      }
    } else {
      this.setLoggerMessageByType(messages);
    }
    return this;
  }

  // 创建一个待输出控制台日志的消息对象
  private createNewMessage(type?: WebConsoleType): WebConsoleMessageType {
    return {
      type: type || 'log',
      text: '',
      args: [],
    };
  }

  // 修复CSS Style样式属性名
  private fixCssStyleKey(key: string): string {
    return key.replace(/-\w/g, function (match) {
      return match.charAt(1).toUpperCase();
    });
  }

  // 将CSS Style样式属性名转换成驼峰写法
  private toKebabCaseKey(key: string): string {
    return key.replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase();
    });
  }

  // 将CSS Style样式对象转换成字符串
  private getLoggerMessageStyle(styles: CSSProperties = {}) {
    // 定义CSS样式的值仅仅只为数值的属性
    const numStyleNames: string[] = [
      'columnCount',
      'fillOpacity',
      'flexGrow',
      'flexShrink',
      'fontWeight',
      'lineHeight',
      'opacity',
      'order',
      'orphans',
      'widows',
      'zIndex',
      'zoom',
    ];

    let result: string = '';
    forIn(styles, (value, key: string) => {
      const fixKey = this.fixCssStyleKey(key);
      let fixValue: string = `${value}`;
      if (isNumber(value) && numStyleNames.indexOf(fixKey) === -1) {
        fixValue = `${value}px`;
      }
      result += `${this.toKebabCaseKey(fixKey)}:${fixValue};`;
    });
    return result;
  }

  // 设置指定消息的待输出控制台日志对象的属性
  private setLoggerMessageArgs(
    logger: ILoggerSpan,
    message: WebConsoleMessageType,
  ): WebConsoleMessageType {
    if (this.isSupport) {
      if (message.text.substring(message.text.length - 2) === '%c') {
        message.args[message.args.length - 1] = this.getLoggerMessageStyle(logger.styles);
      } else {
        message.text += '%c';
        message.args.push(this.getLoggerMessageStyle(logger.styles));
      }
    }
    return message;
  }

  // 解析渲染待输出控制台打印日志对象
  private handleLoggerMessages(
    children: ILoggerSpanType,
    messages: WebConsoleMessageType[],
    type?: WebConsoleType,
  ) {
    let message = messages[messages.length - 1];
    switch (children.type) {
      case 'style': {
        this.createNewLoggerSpan(children, messages, type);
        this.setLoggerMessageArgs(children, message);
        if (children.parent) {
          this.setLoggerMessageArgs(children.parent, message);
        }
        break;
      }
      case 'group': {
        messages.push(this.createNewMessage('group'));
        break;
      }
      case 'group-end': {
        message = this.createNewMessage('groupEnd');
        message.text = ' ';
        messages.push(message);
        messages.push(this.createNewMessage(type));
        break;
      }
      case 'group-collapsed': {
        messages.push(this.createNewMessage('groupCollapsed'));
        break;
      }
      case 'text': {
        message.text += children.message;
        break;
      }
      case 'element': {
        message.text += '%o';
        message.args.push(children.element);
        break;
      }
      case 'object': {
        message.text += '%O';
        message.args.push(children.object);
        break;
      }
      case 'log':
      default: {
        messages.push(this.createNewMessage(type));
        break;
      }
    }
  }

  // 创建一个待输出控制台打印日志记录对象
  private createNewLoggerSpan(
    logger: ILoggerSpan,
    messages: WebConsoleMessageType[],
    type?: WebConsoleType,
  ) {
    messages[messages.length - 1] = this.setLoggerMessageArgs(
      logger,
      messages[messages.length - 1],
    );

    forEach(logger.children || [], (item) => {
      this.handleLoggerMessages(item, messages, type);
    });
  }

  // 代理执行输出控制台打印日志对象
  private printMessage(message: WebConsoleMessageType) {
    Function.prototype.apply.call(
      console[message.type],
      console,
      [message.text].concat(message.args),
    );
  }

  // 打印待输出的控制台日志
  private print(type?: WebConsoleType) {
    if (typeof console !== 'undefined') {
      const messages = [this.createNewMessage(type)];
      this.createNewLoggerSpan(this.rootSpan, messages, type);

      forEach(messages, (message) => {
        if (message.text && message.text !== '%c' && console[message.type]) {
          this.printMessage(message);
        }
      });
    }
    // 清空待输出控制台打印日志对象
    this.resetLoggerSpan();
  }

  // 待输出的控制台日志消息开始分组
  private group(expanded: boolean = true) {
    if (!this.currentSpan || !this.currentSpan.children) {
      this.currentSpan.children = [];
    }
    this.currentSpan.children.push({
      type: !expanded ? 'group-collapsed' : 'group',
      parent: this.currentSpan,
    });
    return this;
  }

  // 待输出的控制台日志消息分组结束
  private groupEnd() {
    if (this.currentSpan.children) {
      this.currentSpan.children.push({
        type: 'group-end',
        parent: this.currentSpan,
      });
    }
    return this;
  }

  // 设置一个CSS样式将用于所附加的输出控制台日志消息
  private style(styles: CSSProperties = {}) {
    if (!this.currentSpan || !this.currentSpan.children) {
      this.currentSpan.children = [];
    }
    const span: ILoggerSpanType = {
      type: 'style',
      styles: assign({}, this.currentSpan.styles || {}, styles),
      children: [],
      parent: this.currentSpan,
    };
    this.currentSpan.children.push(span);
    this.currentSpan = span;
    return this;
  }

  // 待输出的控制台日志消息分组结束设定CSS样式附加结束
  private styleEnd() {
    this.currentSpan = this.currentSpan.parent || this.currentSpan;
    return this;
  }

  // 以文本方式输出控制台日志消息
  private text(text: string, styles: CSSProperties = {}) {
    if (!this.currentSpan || !this.currentSpan.children) {
      this.currentSpan.children = [];
    }
    this.style(styles);
    this.currentSpan.children.push({
      type: 'text',
      message: text,
      parent: this.currentSpan,
    });
    return this.styleEnd();
  }

  // 以Element元素方式输出控制台日志消息
  private element(element: HTMLElement) {
    if (!this.currentSpan || !this.currentSpan.children) {
      this.currentSpan.children = [];
    }
    this.currentSpan.children.push({
      type: 'element',
      element,
      parent: this.currentSpan,
    });
    return this;
  }

  // 以任意对象方式输出控制台日志消息
  private object(obj: unknown) {
    if (!this.currentSpan || !this.currentSpan.children) {
      this.currentSpan.children = [];
    }
    this.currentSpan.children.push({
      type: 'object',
      object: obj,
      parent: this.currentSpan,
    });
    return this;
  }

  // 以空白换行输出控制台日志消息
  private line() {
    if (!this.currentSpan || !this.currentSpan.children) {
      this.currentSpan.children = [];
    }
    this.currentSpan.children.push({
      type: 'log',
      parent: this.currentSpan,
    });
    return this;
  }

  // 设置通用输出控制台的日志消息打印
  private setCommonLoggerMessages(
    {
      type,
      title,
      prefix,
      color,
      padding,
    }: {
      type: WebConsoleType;
      // 默认标题
      title: string;
      // 标题的前缀
      prefix?: string;
      // 标题的颜色
      color?: string;
      // 标题的前缀内容内间距
      padding?: {
        left: number;
        right: number;
      };
    },
    message: LoggerMessageType,
    options?: LoggerOptionsType,
  ) {
    if (!message || !this.isEnabled()) {
      return;
    }
    const opts = this.getConsoleOptions(options);
    let logger = this.resetLoggerSpan();

    // 创建输出日志的标题
    logger = this.renderLoggerTitle({
      title: opts.title || title,
      group: opts.group,
      expanded: opts.expanded,
      color,
      prefix: prefix,
      padding: padding || {
        left: opts.group ? 0 : 10,
        right: 5,
      },
    });
    // 创建待输出的日志内容
    logger = this.getLoggerMessages(message, opts);
    // 判断是否分组渲染，则添加结束分组
    opts.group && logger.groupEnd();
    // 打印待输出控制台日志
    logger.print(type);
  }

  // 判断是否启用输出控制台打印日志
  public isEnabled(): boolean {
    return !this.disabled;
  }

  /**
   * Console输出控制台进行LOG类型日志打印
   *
   * @param message 待输出日志信息
   * @param options 打印日志的参数选项对象
   */
  public log(message: LoggerMessageType, options?: LoggerOptionsType) {
    this.setCommonLoggerMessages(
      {
        type: 'log',
        title: '日志信息',
        prefix: '💭',
      },
      message,
      options,
    );
  }

  /**
   * Console输出控制台进行INFO类型日志打印
   *
   * @param message 待输出日志信息
   * @param options 打印日志的参数选项对象
   */
  public info(message: LoggerMessageType, options?: LoggerOptionsType) {
    this.setCommonLoggerMessages(
      {
        type: 'info',
        title: '通知消息',
        prefix: '📢',
      },
      message,
      options,
    );
  }

  /**
   * Console输出控制台进行DEBUG类型日志打印
   *
   * @param message 待输出日志信息
   * @param options 打印日志的参数选项对象
   */
  public debug(message: LoggerMessageType, options?: LoggerOptionsType) {
    this.setCommonLoggerMessages(
      {
        type: 'debug',
        title: '调试信息',
        prefix: '🐞',
      },
      message,
      options,
    );
  }

  /**
   * Console输出控制台进行SUCCESS类型日志打印
   *
   * @param message 待输出日志信息
   * @param options 打印日志的参数选项对象
   */
  public success(message: LoggerMessageType, options?: LoggerOptionsType) {
    this.setCommonLoggerMessages(
      {
        type: 'info',
        title: '成功消息',
        prefix: '🍀',
        color: '#389e0d',
      },
      message,
      options,
    );
  }

  /**
   * Console输出控制台进行WARN类型日志打印
   *
   * @param message 待输出日志信息
   * @param options 打印日志的参数选项对象
   */
  public warn(message: LoggerMessageType, options?: LoggerOptionsType) {
    this.setCommonLoggerMessages(
      {
        type: 'warn',
        title: '警告信息',
        prefix: '😠',
        color: '#faad14',
        padding: {
          left: 0,
          right: 5,
        },
      },
      message,
      options,
    );
  }

  /**
   * Console输出控制台进行ERROR类型日志打印
   *
   * @param message 待输出日志信息
   * @param options 打印日志的参数选项对象
   */
  public error(message: LoggerMessageType, options?: LoggerOptionsType) {
    this.setCommonLoggerMessages(
      {
        type: 'error',
        title: '错误信息',
        prefix: '😈',
        color: '#f5222d',
        padding: {
          left: 0,
          right: 5,
        },
      },
      message,
      options,
    );
  }

  /**
   * Console输出控制台进行LOADING类型日志打印
   *
   * @param message 待输出日志信息
   * @param options 打印日志的参数选项对象
   */
  public loading(message: LoggerMessageType, options?: LoggerOptionsType) {
    this.setCommonLoggerMessages(
      {
        type: 'info',
        title: '正在加载',
        prefix: '⏳',
        color: '#ff7a45',
        padding: {
          left: options && (options as ILoggerOptions).group ? 2 : 12,
          right: 7,
        },
      },
      message,
      options,
    );
  }

  // Console输出控制台进行EMPTY类型日志打印
  public empty() {
    if (!this.isEnabled()) {
      return;
    }
    this.resetLoggerSpan();
    this.text(' ').print('info');
  }
}

export default ConsoleLogger;
