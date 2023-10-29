import { MainPageContext, MainPageContextProvider } from '@/context'
import { Alert, AlertTitle, Backdrop, Box, Button, Checkbox, Divider, Paper, Skeleton, Typography, styled, useTheme } from '@mui/material';
import React, { useContext, FC, ReactNode, useState, useEffect, } from 'react'
import TreeItem, { TreeItemProps, treeItemClasses } from "@mui/lab/TreeItem";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { TreeView } from '@mui/lab';

// icons
import CopyrightIcon from "@mui/icons-material/Copyright";
import CodeIcon from "@mui/icons-material/Code";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const MainComponentBlock = () => {
  const [showLoadingSkeleton, setLoadingSkeleton] = useState<boolean>(false);
  const [error, setError] = useState<string>()
  const [chosenList, setChosen] = useState<any[]>([])
  const [componentTree, setComponentTree] = useState<any>()
  const [showComponentTree, setShowComponentTree] = useState<boolean>(false);

  const {
    mainComponents,
    setMainComponents,
    currentChosenComponent,
    setCurrentChosenComponent,
    currentComponentTree,
    setCurrentComponentTree,
    currentChosenList,
    setCurrentChosenList
  } = useContext(MainPageContext);

  useEffect(() => {
    setShowComponentTree(false)
    setCurrentComponentTree(null)
  }, [currentChosenComponent])

  // helper function

  const createComponentTree = async (id: string) => {
    console.log(id)
    const ret: any = {};

    try {
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

      console.log(ret, result)
    
      ret["parameters"] = {};
      for (const param in result.parameters) {
        ret["parameters"][param] = [];
        for (const registered_component of result.parameters[param]) {
          await ret["parameters"][param].push(
            await createComponentTree(registered_component["component_id"])
          );
        }
      }
    } catch (err) {
      console.log(err)
      if(typeof err === 'string') {
        setError(err)
      } else {
        setError(err?.toString())
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

  const handleComponentChosen = async () => {
    setLoadingSkeleton(true)
    const tree = await createComponentTree(currentChosenComponent.id)
    console.log(tree)
    setComponentTree(tree)
    setCurrentComponentTree(tree)
    setLoadingSkeleton(false)
    if(tree) {
      const chosen_component_ids = getChosenList(tree)
      setChosen(chosen_component_ids)
      setCurrentChosenList(chosen_component_ids)
    }
    setShowComponentTree(true)
  }


  return (
    <div>
      {currentChosenComponent && 
        <div style={{margin: '2rem'}}>
          <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem'}}>
            <KeyboardArrowDownIcon color="primary" fontSize='large' />
          </div>
          <Button onClick={() => handleComponentChosen()} variant='outlined'>Create component tree!</Button>
        </div>
      }

      {error && 
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={error != undefined}
          onClick={() => setError(undefined)}
        >
          <Alert severity='warning'>
            <AlertTitle>Some errors occured while creating component tree</AlertTitle>
            {error}
            <p>Please, refresh the page and try again.</p>
          </Alert>
        </Backdrop>
      }

      {
        showLoadingSkeleton && 
        <div style={{marginTop: '2rem'}}>
          <Skeleton variant="rounded" sx={{width: '100%', height: '200px'}} />
        </div>
      }

      {
        showComponentTree && 
        <Paper style={{marginTop: '2rem'}} variant="outlined">
          <TreeView
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            sx={{ flexGrow: 1, overflowY: "auto", padding: '1rem' }}
          >
            <CreateNodeItem
              compNode={componentTree}
              setChosen={setChosen}
              chosenList={chosenList}
              isRoot={true}
            />
          </TreeView>
        </Paper>
      }
    </div>
  )
}

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
