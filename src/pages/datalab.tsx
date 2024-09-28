export default function Datalab() {
  return <div>Datalab</div>;
}

// "use client";
// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";
// import { Inter, Noto_Serif, Josefin_Sans } from "next/font/google";
// import localFont from "next/font/local";

// import { api } from "@/utils/api";
// import { indexOf } from "lodash";

// const fontinter = Inter({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
// });

// const fontnoto = Noto_Serif({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
// });

// const fontjosefin = Josefin_Sans({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700"],
// });

// const fontplato = localFont({
//   src: "../../public/PlatoSans.otf",
//   weight: "400",
// });

// const colors1 = [
//   "#1f77b4",
//   "#ff7f0e",
//   "#2ca02c",
//   "#d62728",
//   "#9467bd",
//   "#8c564b",
//   "#e377c2",
//   "#7f7f7f",
//   "#bcbd22",
//   "#17becf",
// ];

// const colors2 = [
//   "#4e79a7",
//   "#f28e2b",
//   "#e15759",
//   "#76b7b2",
//   "#59a14f",
//   "#edc948",
//   "#b07aa1",
//   "#ff9da7",
//   "#9c755f",
//   "#bab0ab",
// ];

// const colors3 = [
//   "#1b9e77",
//   "#d95f02",
//   "#7570b3",
//   "#e7298a",
//   "#66a61e",
//   "#e6ab02",
//   "#a6761d",
//   "#666666",
//   "#8dd3c7",
//   "#ffffb3",
// ];
// const _colors4 = [
//   "#9AB1C3",
//   "#BDCAD3",
//   "#DBDCD4",
//   "#EFD5B7",
//   "#E8BAAB",
//   "#DCAAB0",
//   "#C59FB1",
// ].reverse();

// const strokeColors4 = [
//   "#6A8CA3",
//   "#9EADB8",
//   "#BCBDB5",
//   "#D0B698",
//   "#C99B8C",
//   "#BD8B91",
//   "#A68092",
// ].reverse();

// export default function Datalab() {
//   const topFiveQuery = api.captures.getTopCapturedSpeciesNumbers.useQuery();

//   return (
//     <div>
//       <h1>Datalab</h1>
//       {topFiveQuery.data && <FlowChart _data={topFiveQuery.data} />}
//     </div>
//   );
// }

// const FlowChart = ({
//   _data,
// }: {
//   _data: {
//     data: {
//       speciesId: bigint | null;
//       speciesName: string | null;
//       total: number;
//       month: unknown;
//       year: unknown;
//     }[];
//     count: {
//       id: bigint | null;
//       total: number;
//     }[];
//   };
// }) => {
//   const { data, count } = _data;
//   const svgRef = useRef();

//   const colors4 = _colors4;

//   console.log(colors4);
//   useEffect(() => {
//     // Adjust the margin and width calculations
//     const margin = { top: 450, right: 20, bottom: 300, left: 20 };
//     const totalWidth = 4200;
//     const chartWidth = totalWidth - margin.left - margin.right;
//     const totalHeight = 2170;
//     const chartHeight = totalHeight - margin.top - margin.bottom;

//     // Parse the date
//     const parseDate = d3.timeParse("%Y-%m");

//     // Get all unique species names
//     const speciesNames = Array.from(
//       new Set(data.map((d) => d.speciesName))
//     ).sort();

//     // Initialize an empty array to hold the transformed data
//     const transformedData: any[] = [];

//     const transformMonth = (month: number, numBins = 4) => {
//       const binSize = 12 / numBins;
//       return Math.ceil(month / binSize) * binSize;
//     };

//     // Get all unique dates
//     const uniqueDates = Array.from(
//       new Set(data.map((d) => `${d.year}-${transformMonth(d.month)}`))
//     ).sort((a, b) => {
//       return new Date(a).getTime() - new Date(b).getTime();
//     });
//     uniqueDates.unshift("2019-01");
//     uniqueDates.unshift("2018-01");
//     uniqueDates.unshift("2017-01");

//     uniqueDates.push("2025-12");

//     uniqueDates.push("2026-12");
//     uniqueDates.push("2027-12");
//     uniqueDates.forEach((dateStr) => {
//       const date = parseDate(dateStr);
//       const entry = { x: date };
//       speciesNames.forEach((species) => {
//         const speciesData = data.find(
//           (d) =>
//             `${d.year}-${transformMonth(d.month)}` === dateStr &&
//             d.speciesName === species
//         );
//         entry[species] = speciesData ? +speciesData.total : 0;
//       });
//       transformedData.push(entry);
//     });
//     console.log(transformedData);

//     // Clear previous SVG content
//     d3.select(svgRef.current).selectAll("*").remove();

//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", totalWidth)
//       .attr("height", totalHeight)
//       .style("background-color", "#FFFCF6");

//     // Add title text with handwritten font
//     svg
//       .append("text")
//       .attr("x", totalWidth / 2)
//       .attr("y", margin.top - 100)
//       .attr("text-anchor", "middle")
//       .style("font-family", `${fontjosefin.style.fontFamily}, sans-serif`)
//       .style("font-size", "240px")
//       .style("font-weight", "300")
//       .style("fill", "#333")
//       .text("BOA1");

//     svg
//       .append("text")
//       .attr("x", totalWidth / 2)
//       .attr("y", margin.top)
//       .attr("text-anchor", "middle")
//       .style("font-family", `${fontjosefin.style.fontFamily}, serif`)
//       .style("font-size", "100px")
//       .style("font-weight", "200")
//       .style("fill", "#333")
//       .text("2019 - 2024");

//     const chartGroup = svg
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Define the filter for the shadow
//     const defs = chartGroup.append("defs");

//     // Create a filter for each stroke color
//     strokeColors4.forEach((color, index) => {
//       const filter = defs
//         .append("filter")
//         .attr("id", `drop-shadow-${index}`)
//         .attr("height", "150%");

//       filter
//         .append("feGaussianBlur")
//         .attr("in", "SourceAlpha")
//         .attr("stdDeviation", 10)
//         .attr("result", "blur");

//       filter
//         .append("feOffset")
//         .attr("in", "blur")
//         .attr("dx", 10)
//         .attr("dy", 10)
//         .attr("result", "offsetBlur");

//       filter
//         .append("feFlood")
//         .attr("flood-color", "red")
//         .attr("flood-opacity", 0.3)
//         .attr("result", "coloredShadow");

//       filter
//         .append("feComposite")
//         .attr("in", "coloredShadow")
//         .attr("in2", "offsetBlur")
//         .attr("operator", "in")
//         .attr("result", "coloredShadowBlur");

//       const feMerge = filter.append("feMerge");
//       feMerge.append("feMergeNode").attr("in", "coloredShadowBlur");
//       feMerge.append("feMergeNode").attr("in", "SourceGraphic");
//     });

//     // Set up the scales
//     const x = d3.scaleTime().range([0, chartWidth]);
//     const y = d3.scaleLinear().range([chartHeight, 0]);

//     // Set up the color scale
//     const color = d3.scaleOrdinal(colors4);
//     const strokeColor = d3.scaleOrdinal(strokeColors4);

//     // Stack the data
//     const stack = d3
//       .stack()
//       .keys(speciesNames)
//       .offset(d3.stackOffsetSilhouette);

//     const layers = stack(transformedData);

//     // Set the domains of the scales
//     x.domain(d3.extent(transformedData, (d) => d.x));
//     y.domain([
//       d3.min(layers, (layer) => d3.min(layer, (d) => d[0])),
//       d3.max(layers, (layer) => d3.max(layer, (d) => d[1])),
//     ]);

//     // Create the area generator
//     const area = d3
//       .area()
//       .x((d) => x(d.data.x))
//       .y0((d) => y(d[0]))
//       .y1((d) => y(d[1]))
//       .curve(d3.curveBasisOpen);

//     console.log(layers);
//     // Append the layers
//     chartGroup
//       .selectAll(".layer")
//       .data(layers)
//       .enter()
//       .append("path")
//       .attr("class", "layer")
//       .attr("d", area)
//       .style("fill", (d, i) => color(i))
//       .style("opacity", 0.9)
//       .style("stroke", (d, i) => strokeColor(i))
//       .style("stroke-width", 0.9)
//       .style("stroke-opacity", 0.7)
//       .style("filter", (d, i) => `url(#drop-shadow)`);

//     // .on("mouseenter", function (event, d) {
//     //   d3.select(this)
//     //     .transition()
//     //     .duration(200)
//     //     .style(
//     //       "filter",
//     //       (d, i) => `url(#drop-shadow-${i}) saturate(150%) brightness(110%)`
//     //     )
//     // })
//     // .on("mouseleave", function (event, d) {
//     //   d3.select(this)
//     //     .transition()
//     //     .duration(200)
//     //     .style("filter", (d, i) => `url(#drop-shadow-${i})`);
//     // });

//     // Add the x-axis
//     // svg
//     //   .append("g")
//     //   .attr("class", "x axis")
//     //   .attr("transform", `translate(0,${height})`)
//     //   .call(d3.axisBottom(x));

//     // Add the y-axis
//     // svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));

//     // Reverse the order of speciesNames for the legend
//     const reversedSpeciesNames = [...speciesNames].reverse();

//     // Add legend
//     const legendGroup = svg
//       .append("g")
//       .attr(
//         "transform",
//         `translate(${totalWidth - margin.right - 560}, ${
//           chartHeight + margin.top - 260
//         })`
//       );

//     const legendItems = legendGroup
//       .selectAll(".legend-item")
//       .data(reversedSpeciesNames)
//       .enter()
//       .append("g")
//       .attr("class", "legend-item")
//       .attr("transform", (d, i) => `translate(0, ${i * 60})`);

//     legendItems
//       .append("rect")
//       .attr("width", 50)
//       .attr("height", 50)
//       .style("fill", (d, i) => color(speciesNames.length - 1 - i))
//       .style("stroke", (d, i) => strokeColor(speciesNames.length - 1 - i))
//       .style("stroke-width", 2);

//     legendItems
//       .append("text")
//       .attr("x", 60)
//       .attr("y", 40)
//       .text((d) => d)
//       .style("font-size", "40px")
//       .style("font-style", "italic")
//       .style("font-weight", "200")
//       .style("font-family", `${fontjosefin.style.fontFamily}, serif`);

//     // ... rest of the existing code ...
//   }, [data]);

//   return (
//     <>
//       <link
//         href="https://fonts.googleapis.com/css2?family=Amethysta&display=swap"
//         rel="stylesheet"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Bowlby+One+SC&display=swap"
//         rel="stylesheet"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=B612:ital,wght@0,400;0,700;1,400;1,700&display=swap"
//         rel="stylesheet"
//       />

//       <svg ref={svgRef}></svg>
//     </>
//   );
// };
