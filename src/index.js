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
    data: prevData,
    setTooltip,
  }, {
    isVertical: prevVertical,
  }) => {
    const {
      color,
      data: newData,
    } = this.props;
    const {
      height,
      isVertical,
      svgWrapper,
      width,
    } = this.state;

    ((width && height && (prevVertical === isVertical)) &&
    (JSON.stringify(prevData) === JSON.stringify(newData))
    ) || renderBoxPlot({
      axisTitle,
      color,
      container: svgWrapper,
      data: Object.keys(newData).reduce((acc, key) => Object.assign(
        acc,
        [
          'Max',
          'Mean',
          'Median',
          'Min',
          'IQR',
          'q1',
          'q3',
        ].includes(key) && { [key.toLowerCase()]: newData[key] },
      ), {}),
      height,
      setTooltip,
      width,
    });
  };

  setSvgWrapper = r => {
    const { svgWrapper } = this.state;
    r && !svgWrapper && this.setState({ svgWrapper: r });
  };

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
