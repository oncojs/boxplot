import React from 'react';
import { render } from 'react-dom';

import Example from '../../src';

const Demo = () => (
  <div
    style={{
      height: '100vh',
      left: 0,
      position: 'absolute',
      right: 0,
      width: '100vw',
    }}
    >
    <Example
      axisTitle="Age (Years)"
      data={{
        IQR: '15.28',
        Max: '90',
        Mean: '63.66',
        Median: '64.59',
        Min: '19.27',
        q1: '56.50',
        q3: '71.78',
        SD: '11.19',
      }}
      />
  </div>
);

render(<Demo />, document.querySelector('#demo'));
