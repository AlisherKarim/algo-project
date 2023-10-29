import { MainPageContext } from "@/context";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getModule } from "../../utils/wasm";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export const AnalysisComponent = () => {
  const {
    mainComponents,
    setMainComponents,
    currentChosenComponent,
    setCurrentChosenComponent,
    currentComponentTree,
    setCurrentComponentTree,
    currentChosenList,
    setCurrentChosenList,
    wasmURL,
    setWasmUrl,
  } = useContext(MainPageContext);

  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [module, setModule] = useState<any>();
  const [minInput, setMinInput] = useState<number>(100);
  const [maxInput, setMaxInput] = useState<number>(10000);
  const [showLoadingSkeleton, setLoadingSkeleton] = useState<boolean>(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);

  const init = async () => {
    setLoadingSkeleton(true);
    console.log(wasmURL);
    if (!wasmURL) return;
    try {
      const md = await getModule(wasmURL);
      console.log(md);
      setModule(md);
    } catch (err) {
      console.log(err);
    }

    setLoadingSkeleton(false);
    setLoading(false);
  };

  useEffect(() => {
    setShowGraph(false);
    init();
  }, [wasmURL]);

  const handleRun = async () => {
    console.log(module);
    setShowGraph(true);
    setLoading(true);
    const perf: DataPoint[] = [];

    for (var size = minInput; size <= maxInput; size += 100) {
      const first = module._malloc(8);
      const second = module._malloc(8);
      module._run(size, first, second);

      perf.push({
        x: size,
        Algm1: module.getValue(first, "double"),
        Algm2: module.getValue(second, "double"),
      });
    }
    setData(perf);
    setLoading(false);
  };

  return (
    <div>
      {wasmURL && showLoadingSkeleton && (
        <div style={{ marginTop: "2rem" }}>
          <Skeleton variant="rounded" sx={{ width: "100%", height: "400px" }} />
        </div>
      )}

      {wasmURL && !showLoadingSkeleton && (
        <>
          <div style={{ margin: "2rem" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <KeyboardArrowDownIcon color="primary" fontSize="large" />
            </div>
          </div>
          <Paper sx={{ padding: "1rem" }} variant='outlined'>
            <Alert
              sx={{
                marginBottom: "2rem",
              }}
              severity="info"
            >
              Change the following two numbers to give custom input range
            </Alert>
            <Paper
              variant='elevation'
              sx={{
                padding: "1rem",
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <TextField
                id="min-input"
                label="Minimum Input Size"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                value={minInput}
                onChange={(e) => setMinInput(Number(e.target.value))}
                size="small"
              />
              <TextField
                id="max-input"
                label="Maximum Input Size"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                value={maxInput}
                onChange={(e) => setMaxInput(Number(e.target.value))}
                size="small"
              />
              <Button
                variant="contained"
                color="success"
                disabled={loading}
                onClick={handleRun}
              >
                {loading && (
                  <CircularProgress
                    size={20}
                    sx={{ marginRight: "1rem" }}
                    color="success"
                  />
                )}
                <span>Run</span>
              </Button>
            </Paper>
            {showGraph && (
              <Card sx={{ marginBottom: "3rem" }}>
                <CardContent>
                  {data.length != 0 && (
                    <>
                      <Typography variant="h5" component="h5">
                        Comparison between two chosen algorithms
                      </Typography>
                      <Divider sx={{ marginTop: "1rem" }} />
                      <Graph data={data} />
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </Paper>
        </>
      )}
    </div>
  );
};

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
  return <div>GraphViewer</div>;
};
