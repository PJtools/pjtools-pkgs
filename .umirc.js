import { readdirSync } from 'fs';
import chalk from 'chalk';
import { join } from 'path';

const headPkgList = [];
// utils must build before core
// runtime must build before renderer-react
const pkgList = readdirSync(join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.' && !headPkgList.includes(pkg),
);

const alias = pkgList.reduce((pre, pkg) => {
  pre[`pjtools-pkgs-${pkg}`] = join(__dirname, 'packages', pkg, 'src');
  return {
    ...pre,
  };
}, {});

console.log(`🌼 alias list \n${chalk.blue(Object.keys(alias).join('\n'))}`);

const tailPkgList = pkgList
  .map((path) => [join('packages', path, 'src'), join('packages', path, 'src', 'components')])
  .reduce((acc, val) => acc.concat(val), []);

const isProduction = process.env.NODE_ENV === 'production';

const isDeploy = process.env.SITE_DEPLOY === 'TRUE';

export default {
  title: 'PJTOOLS PKGS',
  mode: 'site',
  logo: 'https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg',
  devServer: {
    port: 8200,
  },
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ],
  ],
  metas: [
    {
      property: 'og:site_name',
      content: 'PJTOOLS PKGS',
    },
    {
      name: 'keywords',
      content: 'react,pjtools,pjtools pkgs',
    },
    {
      name: 'description',
      content: '🏆 让开发更简单。',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style"',
      content: 'black-translucent',
    },
  ],
  alias: process.env === 'development' ? alias : {},
  resolve: {
    includes: [...tailPkgList, 'docs'],
  },
  locales: [['zh-CN', '中文']],
  navs: {
    'zh-CN': [
      null,
      {
        title: 'GitHub',
        path: 'https://github.com/PJtools/pjtools-pkgs',
      },
    ],
  },
  analytics: false,
  hash: true,
  ssr: isDeploy ? {} : undefined,
  exportStatic: {},
  targets: {
    chrome: 80,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
  theme: {
    '@s-site-menu-width': '258px',
  },
  ignoreMomentLocale: true,
  headScripts: [
    { src: 'https://gw.alipayobjects.com/os/antfincdn/fdj3WlJd5c/darkreader.js' },
    { src: '/libs/bluebird/bluebird.min.js' },
    { src: '/libs/systemjs/system.min.js' },
    { src: '/libs/systemjs/extras/amd.min.js' },
  ],
  links: [],
  externals: {
    darkreader: 'window.DarkReader',
    systemjs: 'window.System',
  },
  menus: {
    '/components': [
      {
        title: '架构设计',
        children: ['components.md'],
      },
      {
        title: '工具',
        children: ['pkgs/logger.md'],
      },
    ],
  },
  mfsu: {},
  fastRefresh: {},
};
