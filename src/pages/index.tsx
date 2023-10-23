import Button from "@mui/material/Button";
import { Storage } from "aws-amplify";
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
import { MainPageContextProvider, ProjectContext } from "@/context";
import { MainList } from "@/components/MainPageComponents/MainComponentsList";

const MainPage: FC = () => {
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

          <Paper elevation={0} variant="outlined" sx={{minHeight: "80vh", padding: "2rem"}}>
            <MainPageContextProvider>
              <MainList />
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

declare module "react" {
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  bgColorForDarkMode?: string;
  color?: string;
  colorForDarkMode?: string;
  labelIcon: React.ElementType<SvgIconProps>;
  chosen?: ReactNode;
  labelText: string | ReactNode;
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
  // [`& .${treeItemClasses.group}`]: {
  //   marginLeft: 0,
  //   [`& .${treeItemClasses.content}`]: {
  //     paddingLeft: theme.spacing(2),
  //   },
  // },
}));

function StyledTreeItem(props: StyledTreeItemProps) {
  const theme = useTheme();
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    chosen,
    labelText,
    colorForDarkMode,
    bgColorForDarkMode,
    ...other
  } = props;

  const styleProps = {
    "--tree-view-color":
      theme.palette.mode !== "dark" ? color : colorForDarkMode,
    "--tree-view-bg-color":
      theme.palette.mode !== "dark" ? bgColor : bgColorForDarkMode,
  };

  return (
    <StyledTreeItemRoot
      label={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 0.5,
            pr: 0,
          }}
        >
          {/* <Box component={LabelIcon} color="inherit" sx={{ mr: 1 }} /> */}
          {typeof labelText == "string" ? (
            <Typography
              variant="body2"
              sx={{ fontWeight: "inherit", flexGrow: 1 }}
            >
              {labelText}
            </Typography>
          ) : (
            labelText
          )}
          {chosen}
        </Box>
      }
      style={styleProps}
      {...other}
    />
  );
}

const CreateNodeItem: FC<{
  compNode: any;
  setChosen: (s: string[]) => void;
  chosenList: string[];
  isRoot: boolean;
}> = ({ compNode, setChosen, chosenList, isRoot }) => {
  return (
    <StyledTreeItem
      nodeId={compNode.component.id}
      labelText={
        <Typography variant="body2" sx={{ fontWeight: "bolder", flexGrow: 1 }}>
          {compNode.component.component_signature +
            (compNode.component.parameters.length > 0
              ? `<${compNode.component.parameters
                  .map((param: string) => "$" + param)
                  .join(",")}>`
              : "")}
        </Typography>
      }
      labelIcon={CopyrightIcon}
      chosen={
        isRoot ? (
          <></>
        ) : (
          <Checkbox
            checked={
              chosenList.find((id) => id == compNode.component.id) != undefined
            }
            onChange={(e) => {
              if (
                chosenList.find((id) => id == compNode.component.id) ==
                undefined
              )
                setChosen([...chosenList, compNode.component.id]);
              else
                setChosen(
                  chosenList.filter((id) => id != compNode.component.id)
                );
            }}
          />
        )
      }
    >
      {Object.keys(compNode.parameters).map((param: any) => (
        <StyledTreeItem
          key={`${compNode.component.id}-${param}`}
          nodeId={`${compNode.component.id}-${param}`}
          labelText={`$${param}`}
          labelIcon={CodeIcon}
        >
          {compNode.parameters[param].map((nd: any) => (
            <CreateNodeItem
              compNode={nd}
              setChosen={setChosen}
              chosenList={chosenList}
              key={nd.component.id}
              isRoot={false}
            />
          ))}
        </StyledTreeItem>
      ))}
    </StyledTreeItem>
  );
};
