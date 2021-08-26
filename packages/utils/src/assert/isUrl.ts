/**
 * @文件说明: 判断是否为链接地址
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2021-07-21 18:01:54
 */

import { startsWith } from 'lodash';

/**
 * 判断是否为链接地址
 *
 * @param path 待验证的地址字符串
 */
export const isUrl = function (path: string): boolean {
  // 判断是否以Http(s)字符开头
  if (!path || !(startsWith(path, 'http://') || startsWith(path, 'https://'))) {
    return false;
  }
  try {
    const url = new URL(path);
    return !!url;
  } catch (error) {
    return false;
  }
};

/**
 * 判断是否为Base64格式的链接地址
 *
 * @param url 待验证的地址字符串
 */
export const isBase64Url = function (url: string): boolean {
  if (!url) {
    return false;
  }
  return /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/.test(
    url,
  );
};
