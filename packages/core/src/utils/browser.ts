/**
 * @文件说明: 定义 Browser 浏览器工具函数
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2022-01-17 10:15:45
 */

import UAParser from 'ua-parser-js';
import type { IBrowserResult } from '../typings';

/** 获取当前浏览器的UA的标识、版本、设备等信息 */
export const getBrowserResult = function (): IBrowserResult {
  const instance = new UAParser();
  return instance && instance.getResult();
};
