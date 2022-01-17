import { readdirSync } from 'fs';
import { join } from 'path';

// utils must build before core
// runtime must build before renderer-react
// components dependencies order: utils -> logger
const headPkgs: string[] = ['core', 'logger'];

const tailPkgs = readdirSync(join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.' && !headPkgs.includes(pkg),
);

const type = process.env.BUILD_TYPE;

let config = {};

if (type === 'lib') {
  config = {
    cjs: { type: 'babel', lazy: true },
    esm: false,
    pkgs: [...headPkgs, ...tailPkgs],
  };
}

if (type === 'es') {
  config = {
    cjs: false,
    esm: {
      type: 'babel',
    },
    pkgs: [...headPkgs, ...tailPkgs],
    extraBabelPlugins: [[require('./scripts/replaceLib')]],
  };
}

export default config;
