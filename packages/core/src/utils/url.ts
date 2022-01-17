/**
 * @文件说明: 扩展 Url 类型的数据处理函数
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2022-01-14 17:37:51
 */

import { startsWith, isNil, toString } from 'lodash';

/**
 * 判断待检测值是否为Base64格式的链接地址
 *
 * @param url 待检测的值
 */
export const isBase64Url = function (value?: unknown): boolean {
  if (!isNil(value)) {
    try {
      const url: string = toString(value);
      return /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i.test(
        url,
      );
    } catch (error) {
      return false;
    }
  }
  return false;
};

/**
 * 判断待检测值是否为HTTP支持的链接地址
 *
 * @param value 待检测的值
 */
export const isHttpUrl = function (value?: unknown): boolean {
  if (!isNil(value)) {
    try {
      const url: string = toString(value);
      // 判断是否以Http(s)字符开头
      if (!!new URL(url) && (startsWith(url, 'http://') || startsWith(url, 'https://'))) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
  return false;
};
