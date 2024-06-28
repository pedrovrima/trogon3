import * as d3 from "d3";

const months = {
  "1": "J",
  "2": "F",
  "3": "M",
  "4": "A",
  "5": "M",
  "6": "J",
  "7": "J",
  "8": "A",
  "9": "S",
  "10": "O",
  "11": "N",
  "12": "D",
};
// @ts-expect-error
export default function Barplot({ data, xVariable, yVariable, xDomain }) {
  console.log(data);
  var x = d3
    .scaleBand()
    // @ts-expect-error
    .domain(xDomain || data.map((d) => d[xVariable]))
    .range([0, 1000])
    .padding(0.1);
  var y = d3
    .scaleLinear()
    // @ts-expect-error
    .domain([0, d3.max(data, (d) => d[yVariable])])
    .range([0, 500])
    .nice();

  console.log(y.ticks());
  return (
    <svg viewBox="0 0 1200 680">
      <text
        x="600"
        y="50"
        fontSize="45"
        fill="white"
        style={{ textAnchor: "middle" }}
      >
        {"BOA1"}
      </text>

      <text
        x="600"
        y="670"
        fontSize="20"
        fill="white"
        style={{ textAnchor: "middle" }}
      >
        {"Meses"}
      </text>
      <text
        x="0"
        y="300"
        fontSize="20"
        fill="white"
        style={{ textAnchor: "middle" }}
        transform="rotate(-90, 30, 300)"
      >
        {"Capturas por 1000 redes* hora"}
      </text>

      <line x1="100" y1="100" x2="100" y2="600" stroke="white" />

      {y.ticks().map((d, i) => (
        <text
          key={i}
          x="90"
          y={600 - y(d) + 10}
          fontSize="20"
          fill="white"
          style={{ textAnchor: "end" }}
        >
          {d}
        </text>
      ))}
      <line x1="100" y1="600" x2="1100" y2="600" stroke="white" />
      {x.domain().map((d, i) => (
        <text
          key={i}
          // @ts-expect-error
          x={100 + x(d) + x.bandwidth() / 2}
          y="630"
          fontSize="20"
          fill="white"
        >
          {/* @ts-expect-error */}
          {months[d]}
        </text>
      ))}
      {/* @ts-expect-error */}
      {data.map((d, i) => (
        <rect
          key={i}
          // @ts-expect-error
          x={100 + x(d[xVariable]) + 10}
          y={600 - y(d[yVariable])}
          width={x.bandwidth()}
          height={y(d[yVariable])}
          fill="orange"
        />
      ))}
    </svg>
  );
}
