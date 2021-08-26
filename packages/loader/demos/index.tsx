import React from 'react';
import PkgsLoader from 'pjtools-pkgs-loader';

class Demo extends React.PureComponent {
  componentDidMount() {
    const loader = new PkgsLoader();

    console.log(loader.import('https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js'));
  }

  render() {
    return <div />;
  }
}

export default Demo;
