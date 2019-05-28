import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { renderBoxPlot } from './boxplot';
// import StyledSvgWrapper from './styles';

class BoxPlotWrapper extends React.Component {
  state = {
    svgWrapper: null,
  }

  setDimensions = (width, height) => this.setState({
    height,
    isVertical: width < height,
    width,
  });

  componentDidUpdate = ({
    axisTitle,
    data,
    setTooltip,
  }, {
    isVertical: prevVertical,
  }) => {
    const {
      height,
      isVertical,
      svgWrapper,
      width,
    } = this.state;

    if (width && height && (
      prevVertical !== isVertical
    )) {
      renderBoxPlot({
        axisTitle,
        container: svgWrapper,
        data: Object.keys(data).reduce((acc, key) => Object.assign(
          acc,
          [
            'Max',
            'Median',
            'Min',
            'IQR',
            'q1',
            'q3',
          ].includes(key) && { [key.toLowerCase()]: data[key] },
        ), {}),
        height,
        setTooltip,
        width,
      });
    }
  }

  setSvgWrapper = r => {
    const { svgWrapper } = this.state;
    r && !svgWrapper && this.setState({ svgWrapper: r });
  }

  render = () => (
    // <StyledSvgWrapper
    <figure
      ref={this.setSvgWrapper}
      style={{
        display: 'block',
        height: '100%',
        margin: '0',
        position: 'relative',
        width: '100%',
      }}
      >
      <ReactResizeDetector
        handleHeight
        handleWidth
        nodeType="svg"
        onResize={this.setDimensions}
        />
    </figure>
    // </StyledSvgWrapper>
  );
}

export default BoxPlotWrapper;
