import { Inter } from 'next/font/google'
import Button from '@mui/material/Button';
import { Storage } from 'aws-amplify'
import { Box, Container, FormControl, Input, InputAdornment, InputLabel, TextField } from '@mui/material'
import * as d3 from "d3";
import { useEffect } from 'react';
import { Axis, Orient } from "d3-axis-for-react";
import rawData from "../data/data.json";

export default function Home() {
  return (
    <>
      <main>
        <Container style={{marginTop: "7rem"}}>
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel htmlFor="standard-adornment-amount">Search your algorithm</InputLabel>
            <Input
              id="standard-adornment-amount"
            />
          </FormControl>
          <Button>Search</Button>
          <Box sx={{margin: 'auto'}}>
            <Button color='success' variant='contained'>Test</Button>
            <Graph />
          </Box>
        </Container>
      </main>
    </>
  )
}

// TODO: change the below code, this one is just a demo


type Record = {
  date: Date;
  value: number;
};

const data = rawData.map((d: any) => {
  return {
    date: new Date(d.date),
    value: +d.value
  };
}) as Record[];

function Graph() {
  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };

  const x = d3
    .scaleUtc()
    .domain(d3.extent(data, (d) => d.date) as [Date, Date])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear<number>()
    .domain([0, d3.max(data, (d) => d.value)] as [number, number])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line<Record>()
    .defined((d) => !isNaN(d.value))
    .x((d) => x(d.date))
    .y((d) => y(d.value));

  return (
    <div>
      <h1>Demo Graph</h1>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(0,${height - margin.bottom})`}>
          <Axis scale={x} orient={Orient.bottom} />
        </g>
        <g transform={`translate(${margin.left},0)`}>
          <Axis scale={y} orient={Orient.left} />
        </g>
        <path
          fill="none"
          stroke="steelblue"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          d={line(data) as string}
        />
      </svg>
    </div>
  );
}

