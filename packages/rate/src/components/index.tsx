import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

// https://www.react-graph-gallery.com/stacked-area-plot
export const data = [
  {
    x: 1,
    groupA: 38,
    groupB: 19,
    groupC: 9,
    groupD: 4,
  },
  {
    x: 2,
    groupA: 16,
    groupB: 14,
    groupC: 96,
    groupD: 40,
  },
  {
    x: 3,
    groupA: 64,
    groupB: 96,
    groupC: 64,
    groupD: 40,
  },
  {
    x: 4,
    groupA: 32,
    groupB: 48,
    groupC: 64,
    groupD: 40,
  },
  {
    x: 5,
    groupA: 12,
    groupB: 18,
    groupC: 14,
    groupD: 10,
  },
];

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type StackedAreaChartProps = {
  width: number;
  height: number;
  data: { [key: string]: number }[];
};

export const StackedAreaChart = ({
  width,
  height,
  data,
}: StackedAreaChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const groups = useMemo(
    () => Object.keys(data[0]).filter((group) => !["x"].includes(group)),
    [data]
  );

  // Data Wrangling: stack the data
  const stackSeries = d3
    .stack()
    .keys(groups)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);
  const series = stackSeries(data);

  // Y axis
  const max = 300; // todo
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, max || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis
  const [xMin, xMax] = d3.extent(data, (d) => d.x);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin || 0, xMax || 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  // Render the X and Y axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append("g").call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);

  // Build the line
  const areaBuilder = d3
    .area<any>()
    .x((d) => {
      return xScale(d.data.x);
    })
    .y1((d) => yScale(d[1]))
    .y0((d) => yScale(d[0]));

  const allPath = series.map((serie, i) => {
    const path = areaBuilder(serie);
    return (
      <path
        key={i}
        d={path || undefined}
        opacity={1}
        stroke="none"
        fill="#9a6fb0"
        fillOpacity={i / 10 + 0.1}
      />
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allPath}
        </g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
    </div>
  );
};

export function Chart() {
  return <StackedAreaChart data={data} width={400} height={400} />;
}
