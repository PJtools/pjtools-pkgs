/**
 * @文件说明: Web Control控制台日志库
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2021-08-30 15:58:48
 */

import { isArray, isString, isPlainObject, isElement } from 'pjtools-pkgs-utils';
import type { Properties } from 'csstype';

export interface ConsoleLoggerOptions {
  // 是否禁用控制台日志输出（不包括Error错误日志）
  disabled?: boolean;
}

interface LoggerMessageOptions {
  // 输出控制台日志的标题
  title?: string;
  // 输出控制台日志是否以分组形式进行展示
  group?: boolean;
  // 当分组输出控制台日志时，是否默认展开
  expanded?: boolean;
}

export type LoggerMessageOptionsType = 'string' | LoggerMessageOptions;

interface CSSProperties extends Properties<string | number> {}

interface LoggerSpanType {
  // CSS Style样式对象
  styles?: CSSProperties;
  // 所属父级对象
  parent?: LoggerSpanType | null;
  // 包含子级对象
  children?: SpanChildrenType[];
}

interface SpanChildrenType extends LoggerSpanType {
  // 日志类型
  type: 'group' | 'group-end' | 'group-collapsed' | 'style' | 'text' | 'log' | 'element' | 'object';
  // 输出文本内容
  message?: string;
  // 输出Element元素对象
  element?: HTMLElement;
  // 输出数组、Object对象
  object?: object | any[];
}

type WebConsoleType = 'log' | 'info' | 'warn' | 'error' | 'group' | 'groupEnd' | 'groupCollapsed';

type ConsoleMessageType = {
  // Console控制台的类型
  type: WebConsoleType;
  // 输出文本内容
  text: string;
  // 输出内容的参数
  args: any[];
};

// 判断浏览器是否支持控制台日志格式化
const support = (function () {
  function uaMatch(ua: string) {
    ua = ua.toLowerCase();
    const match =
      /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      (ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
      [];
    return {
      browser: match[1] || '',
      version: match[2] || '0',
    };
  }
  const match = uaMatch(navigator.userAgent);

  return {
    isAllow: !(
      match.browser === 'msie' ||
      (match.browser === 'mozilla' && parseInt(match.version, 10) <= 11)
    ),
  };
})();

class ConsoleLogger {
  // 是否禁用控制台日志输出
  private _disabled: boolean = false;

  // 控制台日志对象的根级链式记录对象
  private _root: LoggerSpanType;

  // 控制台日志对象的当前链式记录对象
  private _current: LoggerSpanType;

  /**
   * 构造函数 - ConsoleLogger
   *
   * @param options 实例化参数对象
   */
  constructor(options: ConsoleLoggerOptions = {}) {
    options.disabled && (this._disabled = options.disabled);
    // 初始化日志实例对象
    const logger = this._resetLogger();
    this._root = logger._root;
    this._current = logger._current;
  }

  /** 重置当前输出日志的对象 */
  private _resetLogger() {
    this._root = {
      styles: {},
      parent: null,
      children: [],
    };
    this._current = this._root;
    return this;
  }

  /**
   * 创建一个渲染控制台日志类型的对象
   *
   * @param type Console控制台对象的类型
   */
  private _createMessage(type: WebConsoleType = 'log'): ConsoleMessageType {
    return {
      type,
      text: '',
      args: [],
    };
  }

  /**
   * 修复CSS Style样式属性名
   *
   * @param key 原始样式属性名
   */
  private _fixCssStyleKey(key: string) {
    return key.replace(/-\w/g, function (match) {
      return match.charAt(1).toUpperCase();
    });
  }

  /**
   * 将CSS Style样式属性名转换成驼峰写法
   *
   * @param key 样式属性名
   */
  private _toKebabCaseKey(key: string) {
    return key.replace(/[A-Z]/g, function (match) {
      return '-' + match.toLowerCase();
    });
  }

  /**
   * 将CSS Style样式对象转换成字符串格式
   *
   * @param styles Style样式对象
   */
  private _stylesString(styles: CSSProperties = {}) {
    const cssNumbers = {
      columnCount: true,
      fillOpacity: true,
      flexGrow: true,
      flexShrink: true,
      fontWeight: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      widows: true,
      zIndex: true,
      zoom: true,
    };
    let result: string = '';

    for (let key in styles) {
      let value: string | number = styles[key];
      const fixKey = this._fixCssStyleKey(key);

      if (typeof value === 'number' && !cssNumbers[fixKey]) {
        value = value + 'px';
      }
      result += this._toKebabCaseKey(fixKey) + ':' + value + ';';
    }
    return result;
  }

  /**
   * 追加渲染控制台日志对象的属性数据
   *
   * @param logger 当前实例输出日志数据
   * @param message 渲染控制台对象
   */
  private _addLoggerData(logger: LoggerSpanType, message: ConsoleMessageType): ConsoleMessageType {
    if (support.isAllow) {
      if (message.text.substring(message.text.length - 2) == '%c') {
        message.args[message.args.length - 1] = this._stylesString(logger.styles);
      } else {
        message.text += '%c';
        message.args.push(this._stylesString(logger.styles));
      }
    }
    return message;
  }

  /**
   * 解析渲染控制台日志对象
   *
   * @param logger 当前实例输出日志数据
   * @param messages 渲染控制台对象集合
   * @param type Console控制台对象的类型
   */
  private _handleLoggerMessages(
    children: SpanChildrenType,
    messages: ConsoleMessageType[],
    type: WebConsoleType = 'log',
  ) {
    let message = messages[messages.length - 1];

    switch (children.type) {
      case 'style': {
        this._createLogger(children, messages, type);
        this._addLoggerData(children, message);
        children.parent && this._addLoggerData(children.parent, message);
        break;
      }
      case 'group': {
        messages.push(this._createMessage('group'));
        break;
      }
      case 'group-end': {
        message = this._createMessage('groupEnd');
        message.text = ' ';
        messages.push(message);
        messages.push(this._createMessage(type));
        break;
      }
      case 'group-collapsed': {
        messages.push(this._createMessage('groupCollapsed'));
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
        messages.push(this._createMessage(type));
        break;
      }
    }
  }

  /**
   * 生成渲染控制台日志对象
   *
   * @param logger 当前实例输出日志数据
   * @param messages 渲染控制台对象集合
   * @param type Console控制台对象的类型
   */
  private _createLogger(
    logger: LoggerSpanType,
    messages: ConsoleMessageType[],
    type?: WebConsoleType,
  ) {
    const children = logger.children || [];

    this._addLoggerData(logger, messages[messages.length - 1]);

    for (let i = 0; i < children.length; i++) {
      this._handleLoggerMessages(children[i], messages, type);
    }
  }

  /**
   * 代理执行控制台输出打印
   *
   * @param message 渲染控制台对象
   */
  private _printMessage(message: ConsoleMessageType) {
    Function.prototype.apply.call(
      console[message.type],
      console,
      [message.text].concat(message.args),
    );
  }

  /**
   * 将日志输出打印到控制台
   *
   * @param type Console控制台对象的类型
   */
  public print(type?: WebConsoleType) {
    if (typeof console !== 'undefined') {
      const messages = [this._createMessage(type)];

      this._createLogger(this._root, messages, type);

      for (var i = 0; i < messages.length; i++) {
        let message = messages[i];
        if (message.text && message.text !== '%c' && console[message.type]) {
          this._printMessage(message);
        }
      }
    }

    // 重置实例私有对象
    this._resetLogger();
  }

  /**
   * 开始进行日志输出分组
   *
   * @param expanded 是否渲染分组时自动展开，默认为True（展开）
   */
  public group(expanded: boolean = true) {
    !this._current.children && (this._current.children = []);
    this._current.children.push({
      type: !expanded ? 'group-collapsed' : 'group',
      parent: this._current,
    });
    return this;
  }

  /** 将日志输出分组进行结束 */
  public groupEnd() {
    if (this._current.children) {
      this._current.children.push({
        type: 'group-end',
        parent: this._current,
      });
    }
    return this;
  }

  /**
   * 设置一个CSS样式将用于所附加的日志输出
   *
   * @param styles CSS样式对象
   */
  public style(styles: CSSProperties = {}) {
    !this._current.children && (this._current.children = []);
    const span: SpanChildrenType = {
      type: 'style',
      styles: Object.assign({}, this._current.styles || {}, styles),
      children: [],
      parent: this._current,
    };
    this._current.children.push(span);
    this._current = span;
    return this;
  }

  /** 将日志输出设定CSS样式进行结束 */
  public styleEnd() {
    this._current = this._current.parent || this._current;
    return this;
  }

  /**
   * 将文本内容进行日志输出
   *
   * @param text 待追加的文本内容
   * @param styles 渲染文本内容的样式
   */
  public text(text: string, styles: CSSProperties = {}) {
    !this._current.children && (this._current.children = []);
    this.style(styles);
    this._current.children.push({
      type: 'text',
      message: text,
      parent: this._current,
    });
    return this.styleEnd();
  }

  /** 控制台日志输出换行 */
  public line() {
    !this._current.children && (this._current.children = []);
    this._current.children?.push({
      type: 'log',
      parent: this._current,
    });
    return this;
  }

  /**
   * 将Element元素对象进行控制台日志输出
   *
   * @param element 待输出的Element元素对象
   */
  public element(element: HTMLElement) {
    !this._current.children && (this._current.children = []);
    this._current.children.push({
      type: 'element',
      element,
      parent: this._current,
    });
    return this;
  }

  /**
   * 将数据对象进行控制台日志输出
   *
   * @param obj 待输出的数组或Object对象
   */
  public object(obj: object | any[]) {
    !this._current.children && (this._current.children = []);
    this._current.children.push({
      type: 'object',
      object: obj,
      parent: this._current,
    });
    return this;
  }

  /** 启用渲染控制台输出日志 */
  public enabled() {
    this._disabled = false;
  }

  /** 禁用渲染控制台输出日志（Error类型日志除外） */
  public disabled() {
    this._disabled = true;
  }

  /**
   * 获取转换控制台日志输出的参数选项
   *
   * @param options 日志输出的参数选项
   */
  private _getLoggerOptions(options?: LoggerMessageOptionsType): LoggerMessageOptions {
    const defaultOptions: LoggerMessageOptions = {
      group: false,
      expanded: true,
    };

    // 判断是否未设定输出日志的参数选项对象，则使用默认对象
    if (!options || !(isPlainObject(options) || isString(options))) {
      return defaultOptions;
    }
    return Object.assign(defaultOptions, isString(options) ? { title: options } : options);
  }

  /**
   * 设置待渲染输出日志的标题
   *
   * @param icon 标题图标
   * @param defaultTitle 默认标题
   * @param options 日志输出的参数选项
   * @param color 标题文字颜色
   */
  private _renderLoggerTitle(
    icon: (string | number)[],
    defaultTitle: string,
    options: LoggerMessageOptions,
    color?: string,
  ) {
    const titleStyle: CSSProperties = {
      color: color || '#8c8c8c',
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: 'Arial, "Microsoft YaHei", "黑体", sans-serif',
    };

    let logger = this;
    // 判断是否为分组渲染
    if (options.group) {
      logger.group(options.expanded);
    }
    // 设置标题的图标
    if (icon && icon[0]) {
      logger
        .style({
          paddingLeft: `${(icon[1] as number) || 0}px`,
          paddingRight: `${(icon[2] as number) || 0}px`,
        })
        .text(icon[0] as string)
        .styleEnd();
    }
    // 设置标题的内容
    logger
      .style(titleStyle)
      .text(`${options.title || defaultTitle}： `)
      .styleEnd();

    return logger;
  }

  /**
   * 根据消息类型进行不同数据格式的渲染
   *
   * @param messages 待输出的日志数据对象
   */
  private _setLoggerMessageByType(messages: unknown) {
    const defaultStyle: CSSProperties = {
      fontSize: '12px',
    };
    let logger = this;

    if (messages === null || messages === undefined || messages === '') {
      if (messages === null || messages === undefined) {
        logger
          .style({
            ...defaultStyle,
            color: messages === null ? '#73d13d' : '#5cdbd3',
          })
          .text(messages === null ? 'null' : 'undefined')
          .styleEnd();
      } else {
        logger.text('');
      }
      return logger;
    }

    // 根据待输出日志数据类型进行对应转换
    switch (typeof messages) {
      case 'string': {
        logger
          .style({
            ...defaultStyle,
            color: '#1f1f1f',
          })
          .text(messages)
          .styleEnd();
        break;
      }
      case 'number': {
        logger
          .style({
            ...defaultStyle,
            color: '#40a9ff',
          })
          .text(messages.toString())
          .styleEnd();
        break;
      }
      case 'boolean': {
        logger
          .style({
            ...defaultStyle,
            color: messages ? '#1d39c4' : '#9254de',
          })
          .text(messages.toString())
          .styleEnd();
        break;
      }
      default: {
        if (isElement(messages)) {
          logger.element(messages as HTMLElement);
        } else {
          logger.object(messages as any);
        }
        break;
      }
    }
    return logger;
  }

  /**
   * 设置待渲染输出日志的消息内容
   *
   * @param messages 待输出的日志数据对象
   * @param options 日志输出的参数选项
   */
  private _getLoggerMessages(messages: unknown, options: LoggerMessageOptions) {
    let logger = this;
    // 判断是否为分组渲染
    if (options.group) {
      const msg = !isArray(messages) ? [messages] : messages;
      if (msg.length > 0) {
        logger.line();
        for (let i = 0, len = msg.length; i < len; i++) {
          const message = msg[i];
          logger.text('⚡ ');
          logger = this._setLoggerMessageByType(message);
          logger.line();
        }
      }
    } else {
      logger = this._setLoggerMessageByType(messages);
    }
    return logger;
  }

  /**
   * 控制台通过Log类型进行日志输出
   *
   * @param msg 待输出的日志数据对象
   * @param options 日志输出的参数选项
   */
  public log(msg: unknown, options?: LoggerMessageOptionsType) {
    if (this._disabled) {
      return;
    }
    // 转换设定的日志输出参数选项
    const opts: LoggerMessageOptions = this._getLoggerOptions(options);

    let logger = this._resetLogger();
    // 创建输出日志的标题
    logger = this._renderLoggerTitle(['💭', !opts.group ? 10 : 0, 5], '日志信息', opts);
    // 创建待输出的日志内容
    logger = this._getLoggerMessages(msg, opts);
    // 判断是否分组渲染，则添加结束分组
    opts.group && logger.groupEnd();
    // 渲染打印日志
    logger.print('log');
  }

  /**
   * 控制台通过Info类型进行日志输出
   *
   * @param msg 待输出的日志数据对象
   * @param options 日志输出的参数选项
   */
  public info(msg: unknown, options?: LoggerMessageOptionsType) {
    if (this._disabled) {
      return;
    }
    // 转换设定的日志输出参数选项
    const opts: LoggerMessageOptions = this._getLoggerOptions(options);

    let logger = this._resetLogger();
    // 创建输出日志的标题
    logger = this._renderLoggerTitle(['📢', !opts.group ? 10 : 0, 5], '通知消息', opts);
    // 创建待输出的日志内容
    logger = this._getLoggerMessages(msg, opts);
    // 判断是否分组渲染，则添加结束分组
    opts.group && logger.groupEnd();
    // 渲染打印日志
    logger.print('info');
  }

  /**
   * 控制台通过Warn类型进行警告日志输出
   *
   * @param msg 待输出的日志数据对象
   * @param options 日志输出的参数选项
   */
  public warn(msg: unknown, options?: LoggerMessageOptionsType) {
    if (this._disabled) {
      return;
    }
    // 转换设定的日志输出参数选项
    const opts: LoggerMessageOptions = this._getLoggerOptions(options);

    let logger = this._resetLogger();
    // 创建输出日志的标题
    logger = this._renderLoggerTitle(['😠', 0, 5], '警告信息', opts, '#faad14');
    // 创建待输出的日志内容
    logger = this._getLoggerMessages(msg, opts);
    // 判断是否分组渲染，则添加结束分组
    opts.group && logger.groupEnd();
    // 渲染打印日志
    logger.print('warn');
  }

  /**
   * 控制台通过Error类型进行错误日志输出
   *
   * @param msg 待输出的日志数据对象
   * @param options 日志输出的参数选项
   */
  public error(msg: unknown, options?: LoggerMessageOptionsType) {
    // 转换设定的日志输出参数选项
    const opts: LoggerMessageOptions = this._getLoggerOptions(options);

    let logger = this._resetLogger();
    // 创建输出日志的标题
    logger = this._renderLoggerTitle(['😡', 0, 5], '错误信息', opts, '#f5222d');
    // 创建待输出的日志内容
    logger = this._getLoggerMessages(msg, opts);
    // 判断是否分组渲染，则添加结束分组
    opts.group && logger.groupEnd();
    // 渲染打印日志
    logger.print('error');
  }

  /**
   * 控制台通过Success类型进行成功日志输出
   *
   * @param msg 待输出的日志数据对象
   * @param options 日志输出的参数选项
   */
  public success(msg: unknown, options?: LoggerMessageOptionsType) {
    if (this._disabled) {
      return;
    }
    // 转换设定的日志输出参数选项
    const opts: LoggerMessageOptions = this._getLoggerOptions(options);

    let logger = this._resetLogger();
    // 创建输出日志的标题
    logger = this._renderLoggerTitle(['🍀', !opts.group ? 10 : 0, 5], '成功消息', opts, '#389e0d');
    // 创建待输出的日志内容
    logger = this._getLoggerMessages(msg, opts);
    // 判断是否分组渲染，则添加结束分组
    opts.group && logger.groupEnd();
    // 渲染打印日志
    logger.print('info');
  }

  /**
   * 控制台通过Loading类型进行加载中日志输出
   *
   * @param msg 待输出的日志数据对象
   * @param options 日志输出的参数选项
   */
  public loading(msg: unknown, options?: LoggerMessageOptionsType) {
    if (this._disabled) {
      return;
    }
    // 转换设定的日志输出参数选项
    const opts: LoggerMessageOptions = this._getLoggerOptions(options);

    let logger = this._resetLogger();
    // 创建输出日志的标题
    logger = this._renderLoggerTitle(['⏳', !opts.group ? 12 : 2, 7], '正在加载', opts, '#ff7a45');
    // 创建待输出的日志内容
    logger = this._getLoggerMessages(msg, opts);
    // 判断是否分组渲染，则添加结束分组
    opts.group && logger.groupEnd();
    // 渲染打印日志
    logger.print('info');
  }

  /** 控制台进行空行日志输出 */
  public empty() {
    if (this._disabled) {
      return;
    }

    let logger = this._resetLogger();
    logger.text(' ').print('info');
  }
}

export default ConsoleLogger;
