import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { useDimensions } from "../hooks";

// https://www.react-graph-gallery.com/bubble-plot
const MARGIN = { top: 30, right: 30, bottom: 80, left: 100 };
const BUBBLE_MIN_SIZE = 4;
const BUBBLE_MAX_SIZE = 10;

type BubblePlotProps = {
  width: number;
  height: number;
  data: {
    grossSalesPrice: number;
    priceUpdatedAt: Date;
    modelName: string;
    equipmentsTotalGrossPrice: number;
  }[];
};

export const BubblePlot = ({ width, height, data }: BubblePlotProps) => {
  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const yScale = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => d.grossSalesPrice)) as [
      number,
      number
    ];
    return d3.scaleLinear().domain([min, max]).range([boundsHeight, 0]).nice();
  }, [data, height]);

  const xScale = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => d.priceUpdatedAt)) as [
      Date,
      Date
    ];
    return d3.scaleTime().domain([min, max]).range([0, boundsWidth]).nice();
  }, [data, width]);

  const groups = data
    .map((d) => d.modelName)
    .filter((x, i, a) => a.indexOf(x) == i);

  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(groups)
    .range(["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253"]);

  const sizeScale = useMemo(() => {
    const [min, max] = d3.extent(
      data.map((d) => d.equipmentsTotalGrossPrice)
    ) as [number, number];
    return d3
      .scaleSqrt()
      .domain([min, max])
      .range([BUBBLE_MIN_SIZE, BUBBLE_MAX_SIZE]);
  }, [data, width]);

  // Render the X and Y axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();

    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append("g")
      .attr("transform", `translate(0,${boundsHeight + 20})`)
      .call(xAxisGenerator);
    svgElement
      .append("text")
      .attr("font-size", 12)
      .attr("text-anchor", "end")
      .attr("x", boundsWidth)
      .attr("y", boundsHeight + 60)
      .text("priceUpdatedAt");

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement
      .append("g")
      .attr("transform", `translate(${-20},0)`)
      .call(yAxisGenerator);
    svgElement
      .append("text")
      .attr("font-size", 12)
      .attr("text-anchor", "end")
      .attr("x", 0)
      .attr("y", -80)
      .text("grossSalesPrice")
      .attr("transform", `rotate(${-90})`);
  }, [xScale, yScale, boundsHeight, boundsWidth]);

  // Build the shapes
  const allShapes = data
    .sort((a, b) => b.equipmentsTotalGrossPrice - a.equipmentsTotalGrossPrice)
    .map((d, i) => {
      return (
        <circle
          key={i}
          r={sizeScale(d.equipmentsTotalGrossPrice)}
          cx={xScale(d.priceUpdatedAt)}
          cy={yScale(d.grossSalesPrice)}
          opacity={1}
          stroke={colorScale(d.modelName)}
          fill={colorScale(d.modelName)}
          fillOpacity={0.4}
          strokeWidth={1}
        />
      );
    });

  return (
    <svg width={width} height={height}>
      <g
        width={boundsWidth}
        height={boundsHeight}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
      >
        {allShapes}
      </g>
      <g
        width={boundsWidth}
        height={boundsHeight}
        ref={axesRef}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
      />
    </svg>
  );
};

export function Chart({ data }: { data: BubblePlotProps["data"] }) {
  const divRef = useRef(null);
  const dimensions = useDimensions(divRef);

  return (
    <div ref={divRef} style={{ height: "20em" }}>
      {data.length > 0 && <BubblePlot data={data} {...dimensions} />}
    </div>
  );
}
