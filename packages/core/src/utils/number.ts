/**
 * @文件说明: 扩展 Number 类型的数据处理函数
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2022-01-14 17:17:52
 */

import { isNaN, isNumber, toNumber } from 'lodash';

/**
 * 判断待检测值是否为数值（包括：数值与字符型数字）
 *
 * @param value 待检测的值
 */
export const isNumeric = function (value?: unknown): boolean {
  if (isNumber(value) || !isNaN(toNumber(value))) {
    return true;
  }
  return false;
};
