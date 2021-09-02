/**
 * @文件说明: 判断各种数据类型
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2021-09-01 17:11:54
 */

import {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isPlainObject,
  isElement,
  isNaN,
  toNumber,
} from 'lodash';

/**
 * 验证检测域值是否为数值，包括数值与数值型字符串
 *
 * @param value 待检测的数值
 */
export const isNumeric = function (value: unknown): boolean {
  if (isNumber(value)) {
    return true;
  } else if (!isNaN(toNumber(value))) {
    return true;
  }
  return false;
};

export { isString, isNumber, isBoolean, isArray, isPlainObject, isElement, isNaN };
