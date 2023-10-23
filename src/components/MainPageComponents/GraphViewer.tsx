import React from 'react'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

interface DataPoint {
  x: number;
  Algm1: number;
  Algm2: number;
}

interface LineChartProps {
  data: DataPoint[];
}

const Graph: React.FC<LineChartProps> = ({ data }) => {
  return (
    <LineChart width={600} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" type="number" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="Algm1"
        stroke="#8884d8"
        activeDot={{ r: 4 }}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="Algm2"
        stroke="#82ca9d"
        activeDot={{ r: 4 }}
        dot={false}
      />
    </LineChart>
  );
};

export const GraphViewer = () => {
  return (
    <div>GraphViewer</div>
  )
}


