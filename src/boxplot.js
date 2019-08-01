/* Based on https://github.com/akngs/d3-boxplot */
import {
  axisBottom,
  axisLeft,
} from 'd3-axis';
import {
  scaleLinear,
  scaleBand,
} from 'd3-scale';
import { select } from 'd3-selection';

export const boxplotSymbolDot = 'dot';
export const boxplotSymbolTick = 'tick';

export function boxplot({
  axisTitle,
  setTooltip,
}) {
  let bandwidth = 20;
  let boxwidth = 20;
  let jitter = 0.2;
  let key;
  let scale = scaleLinear();
  let showInnerDots = true;
  let symbol = boxplotSymbolTick;
  let opacity = 1;
  let vertical = false;
  const verticalPadding = axisTitle ? 50 : 30;

  const boxplotBuilder = ctx => {
    const inversed = scale.range()[0] > scale.range()[1];
    const r = Math.max(1.5, Math.sqrt(bandwidth) * 0.5);
    const selection = ctx.selection ? ctx.selection() : ctx;
    const h = vertical ? 'width' : 'height';
    const x = vertical ? 'y' : 'x';
    const y = vertical ? 'x' : 'y';
    const coor = (passedX, passedY) => (vertical
      ? [passedY, passedX]
      : [passedX, passedY]
    );

    const jitterer = jitter === 0 ? 0
      : (d, i) => Math.sin(1e5 * (i + d.value)) * 0.5 * // 1. determinisic pseudo random noise
        (d.farout ? 0 : d.outlier ? 0.5 : 1) * jitter * bandwidth; // 2. scale

    const renderers = {
      [boxplotSymbolDot]: {
        enter(context) {
          context
            .attr('fill', 'currentColor')
            .attr('stroke', 'none')
            .attr('opacity', 0)
            .attr('r', 0)
            .attr(`c${x}`, d => scale(d.value))
            .attr(`c${y}`, jitterer);
        },
        exit(context) {
          context
            .attr('opacity', 0)
            .attr('r', 0);
        },
        nodeName: 'circle',
        update(context) {
          context
            .attr('opacity', opacity)
            .attr('r', d => (d.farout ? r * 1.5 : r))
            .attr(`c${x}`, d => scale(d.value))
            .attr(`c${y}`, jitterer);
        },
      },
      [boxplotSymbolTick]: {
        enter(context) {
          context
            .attr('stroke', 'currentColor')
            .attr('stroke-width', 2)
            .attr('opacity', 0)
            .attr(`${x}1`, d => scale(d.value))
            .attr(`${x}2`, d => scale(d.value))
            .attr(`${y}1`, 0)
            .attr(`${y}2`, 0);
        },
        exit(context) {
          context
            .attr('opacity', 0)
            .attr(`${y}1`, 0)
            .attr(`${y}2`, 0);
        },
        nodeName: 'line',
        update(context) {
          context
            .attr('opacity', opacity)
            // .attr('opacity', d => (['Minimum', 'Maximum'].includes(d.datum) ? 0 : opacity))
            .attr(`${x}1`, d => scale(d.value))
            .attr(`${x}2`, d => scale(d.value))
            .attr(`${y}1`, d => Math.min(-2, -boxwidth * (['Minimum', 'Maximum'].includes(d.datum) 
              ? 0.25
              : ['Mean1', 'Mean2'].includes(d.datum)
                ? 0.1
                : 0.60)))
            .attr(`${y}2`, d => Math.max(2, boxwidth * (['Minimum', 'Maximum'].includes(d.datum) 
            ? 0.25 
            : ['Mean1', 'Mean2'].includes(d.datum)
              ? 0.1 
              : 0.60)))
            .attr('transform', d => {
              console.log('datum', d.datum)
              return d.datum === 'Mean2' ? 'rotate(90)' : 'rotate(0)'});
        },
      },
    };

    const renderer = renderers[symbol];

    let gDecadeBar = selection.select('g.decadeBar');

    if (gDecadeBar.empty()) {
      gDecadeBar = selection.append('g')
        .attr('class', 'decadeBar')
        .attr('color', '#ccc')
        .attr('transform', `translate(${
          coor(0, (vertical ? verticalPadding : bandwidth))
        })`);
      gDecadeBar.exit().remove();
    }

    const decadeBar = gDecadeBar
      .call(
        (vertical
          ? axisLeft
          : axisBottom
        )(scale)
          .tickSize(-bandwidth)
          .tickSizeOuter(-10)
      );

    axisTitle && decadeBar.append('text')
      .attr('class', 'axisTitle')
      .attr('fill', '#333')
      .attr('font-size', '1rem')
      .attr('transform', `translate(${
        coor(scale(50), vertical ? -(verticalPadding / 2) : 30)
        })${
        vertical ? ' rotate(-90)' : ''
      }`)
      .text(axisTitle);

    let gBox = selection.select('g.box');
    if (gBox.empty()) {
      gBox = selection.append('g')
        .attr('class', 'box')
        .attr('transform', `translate(${coor(
          0,
          (bandwidth * 0.5) + (vertical ? verticalPadding : 0),
        )})`);
    }

    const whiskerPath = d => (
        `M${coor(scale(d.start), (-0.25 * boxwidth))} ` +
        `l${coor(0, (0.5 * boxwidth))} ` +
        `m${coor(0, (-0.25 * boxwidth))} ` +
        `L${coor(scale(d.end), 0)}`
    );

    let gWhisker = selection.select('g.whisker');
    if (gWhisker.empty()) {
      gWhisker = selection.append('g')
        .attr('class', 'whisker')
        .attr('transform', `translate(${coor(
            0,
            (vertical ? verticalPadding : 0) + (bandwidth * 0.5),
          )})`);
    }

    const whisker = gWhisker.selectAll('path')
      .data(d => d.whiskers)
      .enter().append('path')
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-dasharray', '6 6')
      .attr('stroke-width', 2)
      .attr('d', d => whiskerPath(d));

    const box = gBox.selectAll('line')
      .data(d => d.boxes)
      .enter().append('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', boxwidth)
      // .attr('opacity', 0)
      .attr(`${x}1`, (d, i) => scale(d.start) + (i === 0 ? 0 : 0.5) * (inversed ? -1 : +1))
      .attr(`${x}2`, (d, i) => scale(d.end) - (i === 0 ? 0.5 : 0) * (inversed ? -1 : +1))
      .attr(`${y}1`, 0)
      .attr(`${y}2`, 0)
      .attr(h, boxwidth);

    let gPoint = selection.select('g.point');
    if (gPoint.empty()) {
      gPoint = selection.append('g')
        .attr('class', 'point')
        .attr('color', '#333')
        .attr('transform', `translate(${coor(
          0,
          (vertical ? verticalPadding : 0) + (bandwidth * 0.5),
        )})`);
    }
    let point = gPoint.selectAll('.point')
      .data(
        d => (showInnerDots ? d.points : d.points.filter(d2 => d2.outlier)),
        key ? (d => key(d.datum)) : undefined
      );

    const pointExit = point.exit();
    point = point.enter().append(renderer.nodeName)
      .attr('class', 'point')
      .call(renderer.enter)
      .merge(point)
      .classed('outlier', d => d.outlier)
      .classed('farout', d => d.farout);

    if (setTooltip) {
      point
        .attr('cursor', 'pointer')
        .on('mouseenter', d => {
          setTooltip(`${['Mean1', 'Mean2'].includes(d.datum) 
          ? 'Mean' 
          : d.datum}: ${d.value}`);
        })
        .on('mouseleave', () => {
          setTooltip();
        });
    }

    whisker
      .attr('d', whiskerPath);
    box
      .attr('stroke-width', boxwidth)
      .attr(`${x}1`, (d, i) => scale(d.start) + (i === 0 ? 0 : 0.5) * (inversed ? -1 : +1))
      .attr(`${x}2`, (d, i) => scale(d.end) - (i === 0 ? 0.5 : 0) * (inversed ? -1 : +1))
      .attr(`${y}1`, 0)
      .attr(`${y}2`, 0);
    point
      .call(renderer.update);
    pointExit
      .call(renderer.exit)
      .remove();

    return this;
  };

  boxplotBuilder.vertical = (...args) => (args.length
    ? (vertical = args[0], boxplotBuilder)
    : vertical);

  boxplotBuilder.scale = (...args) => (args.length
    ? (scale = args[0], boxplotBuilder)
    : scale);

  boxplotBuilder.showInnerDots = (...args) => (args.length
    ? (showInnerDots = args[0], boxplotBuilder)
    : showInnerDots);

  boxplotBuilder.bandwidth = (...args) => (args.length
    ? (bandwidth = args[0], boxplotBuilder)
    : bandwidth);

  boxplotBuilder.boxwidth = (...args) => (args.length
    ? (boxwidth = args[0], boxplotBuilder)
    : boxwidth);

  boxplotBuilder.symbol = (...args) => (args.length
    ? (symbol = args[0], boxplotBuilder)
    : symbol);

  boxplotBuilder.opacity = (...args) => (args.length
    ? (opacity = args[0], boxplotBuilder)
    : opacity);

  boxplotBuilder.jitter = (...args) => (args.length
    ? (jitter = args[0], boxplotBuilder)
    : jitter);

  boxplotBuilder.key = (...args) => (args.length
    ? (key = args[0], boxplotBuilder)
    : key);

  return boxplotBuilder;
}

export const boxplotStats = ({
  iqr,
  max,
  mean,
  median,
  min,
  q1,
  q3,
}) => {
  const buffer = (max - min) / 10;
  const ceilingCandidate = Math.ceil(max / 10) * 10;
  const ceiling = ceilingCandidate
    ? ceilingCandidate > max ? ceilingCandidate : (ceilingCandidate + buffer)
    : buffer;
  const floorCandidate = Math.floor(min / 10) * 10;
  const floor = floorCandidate
    ? floorCandidate < min ? floorCandidate : (floorCandidate - buffer)
    : -buffer;

  const boxes = [
    {
      end: median,
      start: q1,
    },
    {
      end: q3,
      start: median,
    },
  ];

  const points = [
    {
      datum: 'Minimum',
      farout: false,
      outlier: false,
      value: min,
    },
    {
      datum: 'Q1',
      farout: false,
      outlier: false,
      value: q1,
    },
    {
      datum: 'Median',
      farout: false,
      outlier: false,
      value: median,
    },
    {
      datum: 'Q3',
      farout: false,
      outlier: false,
      value: q3,
    },
    {
      datum: 'Maximum',
      farout: false,
      outlier: false,
      value: max,
    },
  ].concat(typeof mean !== undefined && [{
    datum: 'Mean1',
    farout: false,
    outlier: false,
    value: mean,
  },
  {
    datum: 'Mean2',
    farout: false,
    outlier: false,
    value: mean,
  }]);

  const whiskers = [
    {
      end: q1,
      // start: min(Object.values(data).filter(d => fences[1].start <= d)),
      start: min, // min(values.filter(d => fences[1].start <= d)),
    },
    {
      end: q3, // fiveNums[3],
      // start: max(Object.values(data).filter(d => fences[3].start >= d)),
      start: max, // max(values.filter(d => fences[3].end >= d)),
    },
  ];

  return {
    boxes,
    buffer,
    ceiling,
    floor,
    iqr,
    points,
    whiskers,
  };
};

export const renderBoxPlot = ({
  axisTitle,
  color = '#1784AC',
  container,
  data,
  height = 0,
  setTooltip,
  width = 0,
  vertical = width < height,
}) => {
  const stats = boxplotStats(data, vertical);
  const axis1 = scaleLinear()
    .domain(vertical ? [stats.ceiling, stats.floor] : [stats.floor, stats.ceiling])
    .range([10, vertical ? height - 10 : width - 10]);
  const axis2 = scaleBand()
    .domain([0, 100])
    .range([0, vertical ? height : width]);

  const boxplotInstance = boxplot({
    axisTitle,
    setTooltip,
  })
    .bandwidth(axis2.bandwidth())
    .boxwidth(axis2.bandwidth() / 4)
    .key(d => d.key)
    .scale(axis1)
    .vertical(vertical);

  select(container).selectAll('svg').empty() || select(container).selectAll('svg').remove();

  select(container).append('svg')
    .attr('color', color)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .datum(stats)
    .call(boxplotInstance);
};
