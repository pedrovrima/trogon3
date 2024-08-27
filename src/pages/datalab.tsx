"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import { api } from "@/utils/api";
import { indexOf } from "lodash";
const colors1 = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

const colors2 = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
];

const colors3 = [
  "#1b9e77",
  "#d95f02",
  "#7570b3",
  "#e7298a",
  "#66a61e",
  "#e6ab02",
  "#a6761d",
  "#666666",
  "#8dd3c7",
  "#ffffb3",
];
const _colors4 = [
  "#003f5c",
  "#2f4b7c",
  "#665191",
  "#7a5195",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
  "#ffa600",
].reverse();

export default function Datalab() {
  const topFiveQuery = api.captures.getTopCapturedSpeciesNumbers.useQuery();

  return (
    <div>
      <h1>Datalab</h1>
      {topFiveQuery.data && <FlowChart _data={topFiveQuery.data} />}
    </div>
  );
}

const FlowChart = ({ _data }) => {
  const { data, count } = _data;
  const svgRef = useRef();

  const colors4 = _colors4;

  console.log(colors4);
  useEffect(() => {
    // Set up the SVG canvas dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Parse the date
    const parseDate = d3.timeParse("%Y-%m");

    // Get all unique species names
    const speciesNames = Array.from(
      new Set(data.map((d) => d.speciesName))
    ).sort();

    // Initialize an empty array to hold the transformed data
    const transformedData = [];

    const transformMonth = (month, numBins = 4) => {
      const binSize = 12 / numBins;
      return Math.ceil(month / binSize) * binSize;
    };

    // Get all unique dates
    const uniqueDates = Array.from(
      new Set(data.map((d) => `${d.year}-${transformMonth(d.month)}`))
    ).sort((a, b) => {
      return new Date(a) - new Date(b);
    });
    uniqueDates.unshift("2019-01");
    uniqueDates.unshift("2016-01");
    uniqueDates.unshift("2013-01");

    uniqueDates.push("2025-12");

    uniqueDates.push("2026-12");
    uniqueDates.push("2028-12");
    uniqueDates.forEach((dateStr) => {
      const date = parseDate(dateStr);
      const entry = { x: date };
      speciesNames.forEach((species) => {
        const speciesData = data.find(
          (d) =>
            `${d.year}-${transformMonth(d.month)}` === dateStr &&
            d.speciesName === species
        );
        entry[species] = speciesData ? +speciesData.total : 0;
      });
      transformedData.push(entry);
    });
    console.log(transformedData);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Clear previous chart content if any
    svg.selectAll("*").remove();

    // Set up the scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Set up the color scale
    const color = d3.scaleOrdinal(colors4);

    // Stack the data
    const stack = d3
      .stack()
      .keys(speciesNames)
      .offset(d3.stackOffsetSilhouette);

    const layers = stack(transformedData);

    // Set the domains of the scales
    x.domain(d3.extent(transformedData, (d) => d.x));
    y.domain([
      d3.min(layers, (layer) => d3.min(layer, (d) => d[0])),
      d3.max(layers, (layer) => d3.max(layer, (d) => d[1])),
    ]);

    // Create the area generator
    const area = d3
      .area()
      .x((d) => x(d.data.x))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveBasisOpen);

    console.log(layers);
    // Append the layers
    svg
      .selectAll(".layer")
      .data(layers)
      .enter()
      .append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", (d, i) => color(i));

    // Add the x-axis
    // svg
    //   .append("g")
    //   .attr("class", "x axis")
    //   .attr("transform", `translate(0,${height})`)
    //   .call(d3.axisBottom(x));

    // Add the y-axis
    // svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={svgRef}></svg>;
};
