import { MainPageContext } from "@/context";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  SvgIconProps,
  styled,
  useTheme,
} from "@mui/material";
import React, { FC, ReactNode, useContext, useEffect, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { TreeItem, TreeItemProps, TreeView, treeItemClasses } from "@mui/lab";

import CopyrightIcon from "@mui/icons-material/Copyright";
import CodeIcon from "@mui/icons-material/Code";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Storage } from "aws-amplify";

export const MainComponentCombinationsViewer = () => {
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
  const [showLoadingSkeleton, setLoadingSkeleton] = useState<boolean>(false);
  const [value, setValue] = React.useState(0);
  const [showCombinationsView, setShowCombinationsView] =
    useState<boolean>(false);

  // dropdown view related
  const [combinations, setCombinations] = useState<any>([]);
  const [chosenCombination, setChosenCombination] = useState<string>();
  const [loadingMain, setLoadingMain] = useState<boolean>(false);

  const handleCreate = (e: any) => {
    setLoadingMain(true);
    fetch(
      "https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler",
      {
        method: "POST",
        body: JSON.stringify({
          main_id: currentChosenComponent.id,
          chosen_components: currentChosenList,
          combination: chosenCombination,
        }),
      }
    )
      .then(async (res) => {
        const body = await res.json();
        console.log(body.message);
        const url = await Storage.get(body.message);
        setWasmUrl(url);
        setLoadingMain(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingMain(false);
      });
  };

  // tree view related
  const [chosenList, setChosen] = useState<any[]>([]);

  useEffect(() => {
    setShowCombinationsView(false);
    setCurrentComponentTree(null);
    setWasmUrl(null);
  }, [currentChosenComponent]);

  // tab related
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleCombinationChange = (e: any) => {
    setChosenCombination(e.target.value);
    setWasmUrl(null);
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

  const combinationParser = (combination: string) => {
    console.log(combination);
    // combinations is always in the form {comp_name}<{comp1}, {comp2}, ...>
    // where compi is combination itself

    // comp_name is {namespace}::{name}

    const comp_name = combination.split("<")[0];
    console.log(comp_name);
    const name = comp_name.split("::").slice(-1)[0];
    console.log(name);

    // params
    const startIdx = combination.indexOf("<");
    const endIdx = combination.lastIndexOf(">");

    if (startIdx !== -1 && endIdx !== -1) {
      const classNamesStr = combination.substring(startIdx + 1, endIdx);
      const classNames = classNamesStr
        .split(",")
        .map((className) => className.trim());
      console.log(classNames);
    }
  };

  // !important function
  const submitHandler = () => {
    // setLoadingComb(true);
    fetch(
      "https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler",
      {
        method: "POST",
        body: JSON.stringify({
          main_id: currentChosenComponent.id,
          chosen_components: currentChosenList,
        }),
      }
    )
      .then(async (res) => {
        if (res.status == 200) {
          // TODO: check if the result is empty ([])

          const body = await res.json();
          // console.log(body.combinations.split('\'').filter((s: string, index: number) => index % 2 == 1))
          const combinations =
            body.message
              .split("'")
              .filter((s: string, index: number) => index % 2 == 1) ?? [];

          console.log(combinations);
          setCombinations(combinations);

          for (var i = 0; i < combinations.length; i++) {
            combinationParser(combinations[i]);
          }

          // init
          const tempList: Set<string>[] = [];
          for (let i = 0; i < parseInput(combinations[0]).length; i++)
            tempList.push(new Set<string>());
          console.log(tempList);
          // setChosenComponents(
          //   Array<string>(parseInput(combinations[0]).length)
          // );

          // combinationsList.splice(0, combinationsList.length);
          // for (const comb of combinations) {
          //   console.log(comb);
          //   const parsed = parseInput(comb);
          //   combinationsList.push(parsed);
          //   parsed.forEach((parsedComponentName, index) =>
          //     tempList[index].add(parsedComponentName)
          //   );
          // }
          // console.log(combinationsList)
          // setPossibleComponents(tempList);

          // setComplete(true);
          // setComninations(combinations);
          // setChosenCombination(combinations[0]);
        }
        // setLoadingComb(false);

        setLoadingSkeleton(false);
        setShowCombinationsView(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleComponentChosen = () => {
    console.log(currentComponentTree);
    setLoadingSkeleton(true);
    setWasmUrl(null)
    submitHandler();
  };

  return (
    <div>
      {currentComponentTree != null && (
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
          <Button onClick={() => handleComponentChosen()} variant="outlined">
            Find possible combinations
          </Button>
        </div>
      )}

      {showLoadingSkeleton && (
        <div style={{ marginTop: "2rem" }}>
          <Skeleton variant="rounded" sx={{ width: "100%", height: "200px" }} />
        </div>
      )}

      {!showLoadingSkeleton && showCombinationsView && (
        <Paper
          sx={{ width: "100%", marginTop: "2rem", padding: "1rem" }}
          variant="outlined"
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Tree view" {...a11yProps(0)} />
              <Tab label="Dropdown view [temp]" {...a11yProps(1)} />
            </Tabs>
          </Box>

          {/* tree view */}
          <CustomTabPanel value={value} index={0}>
            <Alert
              sx={{
                marginBottom: "2rem",
              }}
              severity="info"
            >
              [TODO] Information how to choose
            </Alert>

            <TreeView
              defaultCollapseIcon={<ArrowDropDownIcon />}
              defaultExpandIcon={<ArrowRightIcon />}
              defaultEndIcon={<div style={{ width: 24 }} />}
              sx={{ flexGrow: 1, overflowY: "auto", padding: "1rem" }}
            >
              <CreateNodeItem
                compNode={currentComponentTree}
                setChosen={setChosen}
                chosenList={chosenList}
                isRoot={true}
              />
            </TreeView>
          </CustomTabPanel>

          {/* select view */}
          <CustomTabPanel value={value} index={1}>
            <FormControl fullWidth sx={{ margin: "1rem 0" }}>
              <InputLabel id="demo-simple-select-label">
                Possible combinations
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={chosenCombination}
                label="Combination"
                onChange={handleCombinationChange}
                sx={{ backgroundColor: "#fff" }}
              >
                {combinations.map((comb: string, ind: number) => (
                  <MenuItem value={comb} key={ind}>
                    {comb}
                  </MenuItem>
                ))}
              </Select>
              <Button sx={{ marginTop: "1rem" }} onClick={handleCreate}>
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
          </CustomTabPanel>
        </Paper>
      )}
    </div>
  );
};

// Tab related

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

// Tree view related

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
