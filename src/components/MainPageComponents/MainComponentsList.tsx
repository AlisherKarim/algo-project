import { MainPageContext } from "@/context";
import { FC, useContext, useState } from "react";

export const MainList: FC = () => {
  // context variables
  const mainPageContext = useContext(MainPageContext)

  // local variables
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

  // useEffect(() => {
  //   createComponentTree("6b0b42c16cbc4ab88ce7992c8e43c66d").then((res) => {
  //     setTree(res);
  //     setLoading(false);
  //   });
  // }, []);
  // useEffect(() => {
  //   console.log(tree);
  //   if (tree) setChosen(getChosenList(tree));
  // }, [tree]);
  // useEffect(() => {
  //   console.log(chosen_component_ids);
  // }, [chosen_component_ids]);

  // const handleChange = (e: any) => {
  //   setChosenCombination(e.target.value);
  // };

  // const handleCreate = (e: any) => {
  //   setLoadingMain(true);
  //   fetch(
  //     "https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler",
  //     {
  //       method: "POST",
  //       body: JSON.stringify({
  //         main_id: "6b0b42c16cbc4ab88ce7992c8e43c66d",
  //         chosen_components: chosen_component_ids,
  //         combination: chosenCombination,
  //       }),
  //     }
  //   )
  //     .then(async (res) => {
  //       setLoadingMain(false);
  //       const body = await res.json();
  //       console.log(body.message);
  //       const url = await Storage.get(body.message);
  //       setUrl(url);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // // returns array of components for the respective param_names
  // const parseInput = (input: string) => {
  //   const startIdx = input.indexOf("<");
  //   const endIdx = input.lastIndexOf(">");

  //   if (startIdx !== -1 && endIdx !== -1) {
  //     const classNamesStr = input.substring(startIdx + 1, endIdx);
  //     const classNames = classNamesStr
  //       .split(",")
  //       .map((className) => className.trim().split("::").slice(-1)[0]);
  //     return classNames;
  //   } else {
  //     return [];
  //   }
  // };

  // const createTreeFromList = (s: string[][]) => {
    
  // }

  // const submitHandler = () => {
  //   setLoadingComb(true);
  //   fetch(
  //     "https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler",
  //     {
  //       method: "POST",
  //       body: JSON.stringify({
  //         main_id: "6b0b42c16cbc4ab88ce7992c8e43c66d",
  //         chosen_components: chosen_component_ids,
  //       }),
  //     }
  //   )
  //     .then(async (res) => {
  //       if (res.status == 200) {
  //         // TODO: check if the result is empty ([])

  //         const body = await res.json();
  //         // console.log(body.combinations.split('\'').filter((s: string, index: number) => index % 2 == 1))
  //         const combinations = body.message
  //           .split("'")
  //           .filter((s: string, index: number) => index % 2 == 1);

  //         // init
  //         const tempList: Set<string>[] = [];
  //         for (let i = 0; i < parseInput(combinations[0]).length; i++)
  //           tempList.push(new Set<string>());
  //         console.log(tempList);
  //         setChosenComponents(
  //           Array<string>(parseInput(combinations[0]).length)
  //         );

  //         combinationsList.splice(0, combinationsList.length);
  //         for (const comb of combinations) {
  //           console.log(comb);
  //           const parsed = parseInput(comb);
  //           combinationsList.push(parsed);
  //           parsed.forEach((parsedComponentName, index) =>
  //             tempList[index].add(parsedComponentName)
  //           );
  //         }
  //         console.log(combinationsList)
  //         setPossibleComponents(tempList);

  //         setComplete(true);
  //         setComninations(combinations);
  //         setChosenCombination(combinations[0]);
  //       }
  //       setLoadingComb(false);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // return (
  //   <React.Fragment>
  //     <Card>
  //       <CardContent>
  //         <Typography variant="h5" component="h5" marginBottom={"1rem"}>
  //           Choose main component
  //         </Typography>
  //         {!loading ? (
  //           <>
  //             <Alert
  //               sx={{
  //                 marginBottom: "2rem",
  //               }}
  //               severity="info"
  //               // icon={false}
  //             >
  //               Here you can find some of the components that can be run as a
  //               main components and test other components for performance or
  //               other qualities by comparing them using a graph. You can
  //               choose/unchoose some components that were registered already.
  //               Then, all the possible tree comninations will be created among
  //               those components that were chosen.
  //             </Alert>
  //             {/* <ComponentTreeView /> */}
  //             <TreeView
  //               defaultCollapseIcon={<ArrowDropDownIcon />}
  //               defaultExpandIcon={<ArrowRightIcon />}
  //               defaultEndIcon={<div style={{ width: 24 }} />}
  //               sx={{ flexGrow: 1, overflowY: "auto" }}
  //             >
  //               <CreateNodeItem
  //                 compNode={tree}
  //                 setChosen={setChosen}
  //                 chosenList={chosen_component_ids}
  //                 isRoot={true}
  //               />
  //             </TreeView>
  //           </>
  //         ) : (
  //           <CircularProgress
  //             size={20}
  //             sx={{ marginRight: "1rem" }}
  //             color="success"
  //           />
  //         )}
  //       </CardContent>
  //     </Card>
  //     <Button
  //       variant="contained"
  //       color="success"
  //       disabled={loading}
  //       onClick={submitHandler}
  //       sx={{ marginTop: "1rem" }}
  //     >
  //       {loadingCombinations ? (
  //         <>
  //           <CircularProgress
  //             size={20}
  //             sx={{ marginRight: "1rem" }}
  //             color="info"
  //           />{" "}
  //           Loading components...
  //         </>
  //       ) : (
  //         <span>Check possible combinations</span>
  //       )}
  //     </Button>

  //     <Box>
  //       {complete && (
  //         <Paper
  //           sx={{
  //             padding: "5px",
  //             marginTop: "1rem",
  //           }}
  //         >
  //           {/* <Alert
  //             sx={{
  //               marginBottom: "5px",
  //               marginTop: "1rem",
  //             }}
  //             severity="info"
  //           >
  //             Select component from each column
  //           </Alert> */}
  //           <Paper
  //             sx={{
  //               display: "flex",
  //               flexDirection: "row",
  //               // justifyContent: 'space-evenly',
  //               marginTop: "1rem",
  //             }}
  //             variant='outlined'
  //           >
  //             {/* {tree["component"]["parameters"].map(
  //               (param_name: string, param_index: number) => (
  //                 <Paper key={param_name} sx={{ flex: "1" }}>
  //                   <List
  //                     sx={{
  //                       width: "100%",
  //                       maxHeight: 140,
  //                       bgcolor: "background.paper",
  //                       overflow: "scroll",
  //                     }}
  //                   >
  //                     {Array.from(possibleComponents[param_index]).map(
  //                       (component, idx) => (
  //                         <ListItem
  //                           key={
  //                             "combination-list-item-" + param_index + "-" + idx
  //                           }
  //                           disableGutters
  //                         >
  //                           <ListItemButton
  //                             selected={
  //                               chosenComponents[param_index] == component
  //                             }
  //                             role={undefined}
  //                             dense
  //                             disableTouchRipple
  //                             onClick={() => {
  //                               const temp = [...chosenComponents]
  //                               temp[param_index] = component;
  //                               setChosenComponents(temp);
  //                               console.log(chosenComponents);
  //                             }}
  //                           >
  //                             <ListItemText primary={component} />
  //                           </ListItemButton>
  //                         </ListItem>
  //                       )
  //                     )}
  //                   </List>
  //                 </Paper>
  //               )
  //             )} */}

  //             <TreeView
  //               aria-label="file system navigator"
  //               defaultCollapseIcon={<ExpandMoreIcon />}
  //               defaultExpandIcon={<ChevronRightIcon />}
  //               sx={{ flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
  //             >
  //               <TreeItem nodeId="RandomVectorGenerator1" label="RandomVectorGenerator">
  //                 <TreeItem nodeId="MergeSort" label="MergeSort">
  //                   <TreeItem nodeId="MergeSort2" label="MergeSort" endIcon={<ArrowRightIcon />}></TreeItem>
  //                   <TreeItem nodeId="StdSortAlgm1" label="StdSortAlgm" endIcon={<ArrowRightIcon />}></TreeItem>
  //                 </TreeItem>
  //                 <TreeItem nodeId="StdSortAlgm3" label="StdSortAlgm" >
  //                   <TreeItem nodeId="MergeSort4" label="MergeSort" endIcon={<ArrowRightIcon />}></TreeItem>
  //                   <TreeItem nodeId="StdSortAlgm2" label="StdSortAlgm" endIcon={<ArrowRightIcon />}></TreeItem>
  //                 </TreeItem>
  //               </TreeItem>
                
  //               <TreeItem nodeId="DecreasingVector5" label="DecreasingVector">
  //                 <TreeItem nodeId="MergeSort6" label="MergeSort">
  //                   <TreeItem nodeId="MergeSort7" label="MergeSort" endIcon={<ArrowRightIcon />}></TreeItem>
  //                   <TreeItem nodeId="StdSortAlg8" label="StdSortAlgm" endIcon={<ArrowRightIcon />}></TreeItem>
  //                 </TreeItem>
  //                 <TreeItem nodeId="StdSortAlg9" label="StdSortAlgm">
  //                   <TreeItem nodeId="MergeSort10" label="MergeSort" endIcon={<ArrowRightIcon />}></TreeItem>
  //                   <TreeItem nodeId="StdSortAlgm11" label="StdSortAlgm" endIcon={<ArrowRightIcon />}></TreeItem>
  //                 </TreeItem>
  //               </TreeItem>
  //             </TreeView>

  //           </Paper>

  //           <FormControl fullWidth sx={{ margin: "2rem 0" }}>
  //             <InputLabel id="demo-simple-select-label">
  //               Possible combinations
  //             </InputLabel>
  //             <Select
  //               labelId="demo-simple-select-label"
  //               id="demo-simple-select"
  //               value={chosenCombination}
  //               label="Combination"
  //               onChange={handleChange}
  //               sx={{ backgroundColor: "#fff" }}
  //             >
  //               {treeCombinations.map((comb, ind) => (
  //                 <MenuItem value={comb} key={ind}>
  //                   {comb}
  //                 </MenuItem>
  //               ))}
  //             </Select>
  //             <Button onClick={handleCreate}>
  //               {loadingMain && (
  //                 <CircularProgress
  //                   size={20}
  //                   sx={{ marginRight: "1rem" }}
  //                   color="success"
  //                 />
  //               )}
  //               <span>Create Main</span>
  //             </Button>
  //           </FormControl>
  //         </Paper>
  //       )}

  //       {url && <MainBlock wasmUrl={url} />}
  //     </Box>
  //   </React.Fragment>
  // );

  console.log(mainPageContext)
  return (
    <div>
      {mainPageContext.mainComponents?.length === 0 && (
        <>Empty</>
      )}
    </div>
  )
};