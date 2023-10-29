import Button from "@mui/material/Button";
import { Storage, withSSRContext } from "aws-amplify";
import {
  Alert,
  AlertTitle,
  Backdrop,
  Box,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { FC, ReactNode, useContext, useEffect, useState } from "react";
import { getModule } from "../utils/wasm";
import { NavBar } from "@/components/Navbar";
import React from "react";

import { styled, useTheme } from "@mui/material/styles";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { TreeItemProps, treeItemClasses } from "@mui/lab/TreeItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { SvgIconProps } from "@mui/material/SvgIcon";

import CopyrightIcon from "@mui/icons-material/Copyright";
import CodeIcon from "@mui/icons-material/Code";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { MainPageContext, MainPageContextProvider, ProjectContext } from "@/context";
import { MainList } from "@/components/MainPageComponents/MainComponentsList";
import { MainComponentBlock } from "@/components/MainPageComponents/MainComponentBlock";
import { MainComponentCombinationsViewer } from "@/components/MainPageComponents/MainComponentCombinationsViewer";
import { AnalysisComponent } from "@/components/MainPageComponents/GraphViewer";

const MainPage: FC<{mainComponents: any[]}> = (props) => {
  const {isLoading, setLoading, alertMessage, setAlertMessage} = useContext(ProjectContext);

  useEffect(() => {
    setLoading(false);
  }, [])

  return (
    <>
      <NavBar />
      <main>
        <Container style={{ marginTop: "7rem", marginBottom: "7rem" }}>

          {alertMessage.text !== '' && 
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={false}
              onClick={() => setLoading(false)}
            >
              <Alert severity={alertMessage.severity}>
                <AlertTitle>{alertMessage.title}</AlertTitle>
                {alertMessage.text}
              </Alert>
            </Backdrop>
          }

          <Paper elevation={0} variant="outlined" sx={{minHeight: "50vh", padding: "2rem"}}>
            <MainPageContextProvider>
              <MainList mainComponents={props.mainComponents}/>
              <MainComponentBlock />
              <MainComponentCombinationsViewer />
              <AnalysisComponent />
            </MainPageContextProvider>
          </Paper>
          
          {/* <Grid container spacing={4}>
            <Grid item xs={8}>
              <MainList />
            </Grid>
          </Grid> */}
        </Container>
      </main>
    </>
  );
};
export default MainPage;


export async function getServerSideProps(
  context: { req?: any; res: any; modules?: any[] | undefined } | undefined
) {
  const { Auth } = withSSRContext(context);
  try {
    const user = await Auth.currentAuthenticatedUser();
    const components = await fetch(
      "https://0c5csak34j.execute-api.us-east-1.amazonaws.com/default/getMainComponents",
      {
        method: "GET",
      }
    ).then((result) => result.json());
    return {
      props: {
        authenticated: true,
        username: user.username,
        mainComponents: components,
      },
    };
  } catch (err) {
    console.log(err)
    context?.res.writeHead(302, { Location: "/login" });
    context?.res.end();
  }
  return { props: {} };
}











/*
* Get rid of the followings
*/


const createComponentTree = async (id: string) => {
  const ret: any = {};
  ret.is_chosen = true;
  ret.component = await fetch(
    `https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents?id=${id}`,
    {
      method: "GET",
    }
  ).then((res) => res.json());

  const result = await fetch(
    `https://9dkyg96d16.execute-api.us-east-1.amazonaws.com/default/componentRegistration?id=${id}`,
    {
      method: "GET",
    }
  ).then((res) => res.json());

  ret["parameters"] = {};
  for (const param in result.parameters) {
    ret["parameters"][param] = [];
    for (const registered_component of result.parameters[param]) {
      await ret["parameters"][param].push(
        await createComponentTree(registered_component["component_id"])
      );
    }
  }

  return ret;
};

const getChosenList = (treeNode: any) => {
  const ret = [];
  if (treeNode.is_chosen) ret.push(treeNode.component.id);
  Object.keys(treeNode.parameters).forEach((param) => {
    treeNode.parameters[param].forEach((comp: any) => {
      ret.push(...getChosenList(comp));
    });
  });
  return ret;
};

interface DataPoint {
  x: number;
  Algm1: number;
  Algm2: number;
}

const MainBlock: FC<{ wasmUrl: string }> = ({ wasmUrl }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [module, setModule] = useState<any>();
  const [minInput, setMinInput] = useState<number>(100);
  const [maxInput, setMaxInput] = useState<number>(10000);

  const init = async () => {
    const md = await getModule(wasmUrl);
    console.log(md);
    setModule(md);
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, [wasmUrl]);

  const handleRun = async () => {
    console.log(module);
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
    <Paper sx={{ padding: "1rem" }}>
      <Alert
        sx={{
          marginBottom: "2rem",
        }}
        severity="info"
      >
        Change the following two numbers to give custom input range
      </Alert>
      <Paper
        variant="outlined"
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
    </Paper>
  );
};

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
