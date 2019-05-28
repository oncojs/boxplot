import styled from 'styled-components';

export default styled.figure`
  display: block;
  height: 100%;
  margin: 0;
  position: relative;
  width: 100%;

  .tick text {
    fill: #999;
    font-size: 0.7rem;
    text-anchor: middle;
  }

  .tick:first-of-type text {
    text-anchor: start;
  }

  .tick:last-of-type text {
    text-anchor: end;
  }

  .axisTitle {
    fill: #333;
    font-size: 1.1rem;
  }
`;
