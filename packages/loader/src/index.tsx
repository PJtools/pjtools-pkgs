/**
 * @文件说明: 动态异步模块资源文件加载器
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2021-06-25 12:32:00
 */

// import System from 'systemjs';

class PkgsLoader {
  // 获取当前SystemJS实例对象
  loader: any;

  // 构造函数
  constructor() {
    // this.loader = new System.constructor();
    // this.loader.import('https://unpkg.com/lodash@4.17.10/lodash.js').then((data: any) => {
    //   console.log(this.getAll());
    //   // console.log(data);
    //   // console.log(this.loader.get('https://unpkg.com/lodash@4.17.10/lodash.js'));
    // });
    // console.log(new Map());
  }

  /** 获取已注册的所有模块集合对象 */
  getAll() {
    // const collection = new Map();
    // for (const [id, module] of this.loader.entries()) {
    //   collection.set(id, module);
    //   console.log('dd', this.loader.get(id));
    // }
    // return collection;
  }
}

export default PkgsLoader;
