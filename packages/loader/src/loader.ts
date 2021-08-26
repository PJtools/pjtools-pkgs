/**
 * @文件说明: 构建动态模块加载器对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2021-07-21 16:49:27
 */

import System from 'systemjs';
import { isPlainObject, assign, forIn, replace } from 'lodash';
import { isUrl, isBase64Url } from 'pjtools-pkgs-utils';
import type { StringObject } from 'pjtools-pkgs-utils';

export type PkgsLoaderConfig = {
  // 基础前缀URL链接地址
  baseURL?: string;
  // 地址转换映射源
  scopes?: StringObject;
};

// 定义默认的动态加载器的参数选项
const DEFAULT_LOADER_CONFIG = {
  baseURL: '/',
  scopes: {},
};

class Loader {
  // 定义Loader加载器的配置对象
  private _config: PkgsLoaderConfig;

  // 定义System实例化对象
  private _system: any;

  /**
   * 构造函数
   *
   * @param config 配置参数选项对象
   */
  constructor(config?: PkgsLoaderConfig) {
    this._config = assign({}, DEFAULT_LOADER_CONFIG, config || {});
    // 构建局部System实例对象
    this._system = new System.constructor();
  }

  // 获取当前映射源数据对象
  get scopes() {
    return this._config && this._config.scopes && isPlainObject(this._config.scopes)
      ? this._config.scopes
      : {};
  }

  /**
   * 设置Loader加载器的地址映射源
   *
   * @param scopes 待定义的地址映射源对象
   */
  setScopes(scopes: StringObject) {
    this._config.scopes = assign(this._config.scopes || {}, scopes);
  }

  /**
   * 转换动态默认地址为实际链接路径
   *
   * @param url 待转换的Url地址
   */
  resolve(url: string): string {
    if (!url) {
      return '';
    }
    // 判断是否为Http链接地址，则直接返回
    if (isUrl(url) || isBase64Url(url)) {
      return url;
    }

    const baseUrl = this._config.baseURL || '';
    let _url: string = url;
    // 替换反斜杠地址
    _url.indexOf('\\') !== -1 && (_url = _url.replace(/\\/g, '/'));
    // 替换转换映射源
    const scopes = this.scopes;
    forIn(scopes, (value: string, key: string) => {
      _url = replace(_url, key, value);
    });
    // 获取转换后路径
    _url = this._system.resolve(_url, baseUrl);

    return _url;
  }

  import(url: string) {
    const path = this.resolve(url);
    const system = this._system;
    // 包装统一Promise对象管理
    const promise = new Promise((resolve, reject) => {
      system
        .import(path)
        .then((data: any) => {
          resolve(data);
        })
        .catch((error: unknown) => {
          reject(error);
        });
    });
    return promise;
  }
}

export default Loader;
