import Button from "@mui/material/Button";
import { Storage } from "aws-amplify";
import {
  Alert,
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
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
// import { LineChart } from '@mui/x-charts/LineChart';
import { FC, ReactNode, useEffect, useState } from "react";
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

const MainPage: FC = () => {
  return (
    <>
      <NavBar />
      <main>
        <Container style={{ marginTop: "7rem" }}>
          <Grid container spacing={4}>
            <Grid item xs={8}>
              <MainList />
            </Grid>
          </Grid>
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
    "https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents",
    {
      method: "POST",
      body: JSON.stringify({ id: id }),
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

// TODO: rename this funcitonal component as MainComponent (id: string) and create another component kind of MainComponentsList
const MainList: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMain, setLoadingMain] = useState<boolean>(false);
  const [complete, setComplete] = useState<boolean>(false);
  const [treeCombinations, setComninations] = useState<string[]>([]);
  const [combinationsList, setCombinationsList] = useState<string[][]>([]);
  const [chosenCombination, setChosenCombination] = useState<string>();

  const [possibleComponents, setPossibleComponents] = useState<Set<string>[]>(
    []
  );
  const [chosenComponents, setChosenComponents] = useState<string[]>([]);

  const [url, setUrl] = useState<string>();

  const [tree, setTree] = useState<any>();
  const [chosen_component_ids, setChosen] = useState<string[]>([]);

  const [loadingCombinations, setLoadingComb] = useState<boolean>(false);

  useEffect(() => {
    createComponentTree("6b0b42c16cbc4ab88ce7992c8e43c66d").then((res) => {
      setTree(res);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    console.log(tree);
    if (tree) setChosen(getChosenList(tree));
  }, [tree]);
  useEffect(() => {
    console.log(chosen_component_ids);
  }, [chosen_component_ids]);

  const handleChange = (e: any) => {
    setChosenCombination(e.target.value);
  };

  const handleCreate = (e: any) => {
    setLoadingMain(true);
    fetch(
      "https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler",
      {
        method: "POST",
        body: JSON.stringify({
          main_id: "6b0b42c16cbc4ab88ce7992c8e43c66d",
          chosen_components: chosen_component_ids,
          combination: chosenCombination,
        }),
      }
    )
      .then(async (res) => {
        setLoadingMain(false);
        const body = await res.json();
        console.log(body.message);
        const url = await Storage.get(body.message);
        setUrl(url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // returns array of components for the respective param_names
  const parseInput = (input: string) => {
    const startIdx = input.indexOf("<");
    const endIdx = input.lastIndexOf(">");

    if (startIdx !== -1 && endIdx !== -1) {
      const classNamesStr = input.substring(startIdx + 1, endIdx);
      const classNames = classNamesStr
        .split(",")
        .map((className) => className.trim().split("::").slice(-1)[0]);
      return classNames;
    } else {
      return [];
    }
  };

  const submitHandler = () => {
    setLoadingComb(true);
    fetch(
      "https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler",
      {
        method: "POST",
        body: JSON.stringify({
          main_id: "6b0b42c16cbc4ab88ce7992c8e43c66d",
          chosen_components: chosen_component_ids,
        }),
      }
    )
      .then(async (res) => {
        if (res.status == 200) {
          // TODO: check if the result is empty ([])

          const body = await res.json();
          // console.log(body.combinations.split('\'').filter((s: string, index: number) => index % 2 == 1))
          const combinations = body.message
            .split("'")
            .filter((s: string, index: number) => index % 2 == 1);

          // init
          const tempList: Set<string>[] = [];
          for (let i = 0; i < parseInput(combinations[0]).length; i++)
            tempList.push(new Set<string>());
          console.log(tempList);
          setChosenComponents(
            Array<string>(parseInput(combinations[0]).length)
          );

          combinationsList.splice(0, combinationsList.length);
          for (const comb of combinations) {
            console.log(comb);
            const parsed = parseInput(comb);
            combinationsList.push(parsed);
            parsed.forEach((parsedComponentName, index) =>
              tempList[index].add(parsedComponentName)
            );
          }
          setPossibleComponents(tempList);

          setComplete(true);
          setComninations(combinations);
          setChosenCombination(combinations[0]);
        }
        setLoadingComb(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <React.Fragment>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h5" marginBottom={"1rem"}>
            Choose main component
          </Typography>
          {!loading ? (
            <>
              <Alert
                sx={{
                  marginBottom: "2rem",
                }}
                severity="info"
                // icon={false}
              >
                Here you can find some of the components that can be run as a
                main components and test other components for performance or
                other qualities by comparing them using a graph. You can
                choose/unchoose some components that were registered already.
                Then, all the possible tree comninations will be created among
                those components that were chosen.
              </Alert>
              {/* <ComponentTreeView /> */}
              <TreeView
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}
                defaultEndIcon={<div style={{ width: 24 }} />}
                sx={{ flexGrow: 1, overflowY: "auto" }}
              >
                <CreateNodeItem
                  compNode={tree}
                  setChosen={setChosen}
                  chosenList={chosen_component_ids}
                  isRoot={true}
                />
              </TreeView>
            </>
          ) : (
            <CircularProgress
              size={20}
              sx={{ marginRight: "1rem" }}
              color="success"
            />
          )}
        </CardContent>
      </Card>
      <Button
        variant="contained"
        color="success"
        disabled={loading}
        onClick={submitHandler}
        sx={{ marginTop: "1rem" }}
      >
        {loadingCombinations ? (
          <>
            <CircularProgress
              size={20}
              sx={{ marginRight: "1rem" }}
              color="info"
            />{" "}
            Loading components...
          </>
        ) : (
          <span>Check possible combinations</span>
        )}
      </Button>

      <Box>
        {complete && (
          <Paper
            sx={{
              padding: "5px",
              marginTop: "1rem",
            }}
          >
            <Alert
              sx={{
                marginBottom: "5px",
                marginTop: "1rem",
              }}
              severity="info"
            >
              Select component from each column
            </Alert>
            <Paper
              sx={{
                display: "flex",
                flexDirection: "row",
                // justifyContent: 'space-evenly',
                marginTop: "1rem",
              }}
            >
              {tree["component"]["parameters"].map(
                (param_name: string, param_index: number) => (
                  <Paper key={param_name} sx={{ flex: "1" }}>
                    <List
                      sx={{
                        width: "100%",
                        maxHeight: 140,
                        bgcolor: "background.paper",
                        overflow: "scroll",
                      }}
                    >
                      {Array.from(possibleComponents[param_index]).map(
                        (component, idx) => (
                          <ListItem
                            key={
                              "combination-list-item-" + param_index + "-" + idx
                            }
                            disableGutters
                          >
                            <ListItemButton
                              selected={
                                chosenComponents[param_index] == component
                              }
                              role={undefined}
                              dense
                              disableTouchRipple
                              onClick={() => {
                                console.log(chosenComponents);
                                chosenComponents[param_index] = component;
                                setChosenComponents(chosenComponents);
                              }}
                            >
                              <ListItemText primary={component} />
                            </ListItemButton>
                          </ListItem>
                        )
                      )}
                    </List>
                  </Paper>
                )
              )}
            </Paper>

            <FormControl fullWidth sx={{ margin: "2rem 0" }}>
              <InputLabel id="demo-simple-select-label">
                Possible combinations
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={chosenCombination}
                label="Combination"
                onChange={handleChange}
                sx={{ backgroundColor: "#fff" }}
              >
                {treeCombinations.map((comb, ind) => (
                  <MenuItem value={comb} key={ind}>
                    {comb}
                  </MenuItem>
                ))}
              </Select>
              <Button onClick={handleCreate}>
                {loadingMain && (
                  <CircularProgress
                    size={20}
                    sx={{ marginRight: "1rem" }}
                    color="success"
                  />
                )}
                <span>Create Main</span>
              </Button>
            </FormControl>
          </Paper>
        )}

        {url && <MainBlock wasmUrl={url} />}
      </Box>
    </React.Fragment>
  );
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
    // <LineChart
    //   width={600}
    //   height={400}
    //   series={[
    //     { data: data.map(dataPoint => dataPoint.y1), label: 'SortAlgm1' },
    //     { data: data.map(dataPoint => dataPoint.y2), label: 'SortAlgm2' },
    //   ]}
    //   xAxis={[{ scaleType: 'point', data: data.map(dataPoint => dataPoint.x) }]}
    // />
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
