import Button from '@mui/material/Button';
import { Storage, withSSRContext } from 'aws-amplify'
import { Box, Card, CardContent, Checkbox, CircularProgress, Container, Divider, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Stack, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FC, useEffect, useState } from 'react';
import { getModule } from '../utils/wasm'
import { NavBar } from '@/components/Navbar';
import NestedModal from '@/components/SingleCompModal';
import React from 'react';

const Demo: FC = () => {
  const [main, setMain] = useState<string>('RunSortingAlgm')
  const [loading, setLoading] = useState<boolean>(false)
  const [complete, setComplete] = useState<boolean>(false)
  const [treeCombinations, setTree] = useState<string[]>([])
  const [chosenCombination, setChosen] = useState<string>()
  const [url, setUrl] = useState<string>()

  const submitHandler = () => {
    setLoading(true)
    fetch("https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler", {
      method: 'POST',
      body: JSON.stringify({"mainComponent": main}),
    }).then(async res => {
      setLoading(false)
      const body = await res.json()
      console.log(body)
      if (res.status == 200) {
        setComplete(true)
        setTree(body.message)
        setChosen(body.message[0])
      }
    }).catch(err => {
      console.log(err)
    })
  }

  const handleChange = (e: any) => {
    setChosen(e.target.value)
  }

  const handleCreate = (e: any) => {
    setLoading(true)
    fetch("https://dog5x4pmlc.execute-api.us-east-1.amazonaws.com/default/cppc-compiler", {
      method: 'POST',
      body: JSON.stringify({"mainComponent": main, "combinationString": chosenCombination}),
    }).then(async res => {
      setLoading(false)
      const body = await res.json()
      console.log(body.message)
      const url = await Storage.get(body.message)
      setUrl(url)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <>
      <NavBar />
      <main>
        <Container style={{marginTop: "7rem"}}>

          <Grid container spacing={4}>
            <Grid item>
              <Typography variant="h5" component="h5">
                Choose main component
              </Typography>
              <MainList />
            </Grid>
          </Grid>

          <Box>
            <Button 
              variant='contained'
              color='success'
              disabled={loading}
              onClick={submitHandler}
              sx={{marginTop: '1rem'}}
            >
              {loading && <CircularProgress size={20} sx={{marginRight: '1rem'}} color='success'/>} 
              <span>Create Tree Combinations</span>
            </Button>

            {complete && 
              <FormControl fullWidth sx={{margin: '2rem 0'}}>
                <InputLabel id="demo-simple-select-label">Template Tree</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={chosenCombination}
                  label="Combination"
                  onChange={handleChange}
                >
                  {treeCombinations.map((comb, ind) => <MenuItem value={comb} key={ind}>{comb}</MenuItem>)}
                </Select>
                <Button onClick = {handleCreate}>
                  {loading && <CircularProgress size={20} sx={{marginRight: '1rem'}} color='success'/>} 
                  <span>Create Main</span>
                </Button>
              </FormControl>
            }

            {url && <MainBlock wasmUrl={url} />}
          </Box>
          
        </Container>
      </main>
    </>
  )
}
export default Demo

const createComponentTree = async (id: string) => {
  const ret: any = {}
  ret.component = await fetch('https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents', {
    method: 'POST',
    body: id
  }).then((res) => res.json())

  const result = await fetch(`https://9dkyg96d16.execute-api.us-east-1.amazonaws.com/default/componentRegistration?id=${id}`, {
    method: 'GET'
  }).then((res) => res.json())
  
  ret['parameters'] = {}
  for(const param in result.parameters) {
    ret['parameters'][param] = []
    for(const compID of result.parameters[param]) {
      await ret['parameters'][param].push(await createComponentTree(compID))
    }
  }
  
  return ret
}

const MainList: FC = () => {
  const [chosen, setChosen] = useState<string[]>([])
  const [compTree, setCompTree] = useState<any>(undefined)
  const [parameters, setParameters] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    createComponentTree('72308948efd14331be8f01dc323dc8a9').then(res => {
      setCompTree(res)
      setParameters(res.component.parameters)
      console.log(res.parameters['SortAlgm1'])
      setLoading(false)
    })
  }, [])

  return (
    <React.Fragment>
      <Stack spacing={2} sx={{marginTop: '2rem'}}>
        <Card>
          <CardContent>
            {!loading && (
              <>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {compTree.component.component_name}
                </Typography>

                {parameters.map((param: string) => (
                  <Paper variant="outlined" sx={{paddingLeft: '1rem', paddingRight: '1rem', mt: '0.5rem'}} key={`${compTree.component.id}/${param}`}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant='body1' width={200}>
                        {param}
                      </Typography>
                      <List>
                        {compTree.parameters[param].map((c: any) => (
                          <ListItem
                            key={`${c.component.id}`}
                            secondaryAction={
                              <NestedModal node={c}/>
                            }
                            // disablePadding
                            sx={{width: '400px'}}
                          >
                            <ListItemButton role={undefined} dense>
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  // checked={checked.indexOf(value) !== -1}
                                  tabIndex={-1}
                                  disableRipple
                                  inputProps={{ 'aria-labelledby': c.component.id }}
                                />
                              </ListItemIcon>
                              <ListItemText id={c.component.id} primary={c.component.component_name} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Paper>
                ))}
              </>
            )}
            {loading && (
              <CircularProgress size={20} sx={{marginRight: '1rem'}} color='success'/>
            )}
          </CardContent>
        </Card>
      </Stack>
    </React.Fragment>
  )
}


interface DataPoint {
  x: number;
  y1: number;
  y2: number;
}

const MainBlock: FC<{wasmUrl: string}> = ({wasmUrl}) => {  
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [module, setModule] = useState<any>()

  const init = async () => {
    const md = await getModule(wasmUrl)
    console.log(md)
    setModule(md)
    setLoading(false)
  }

  useEffect(() => {
    init()
  }, [wasmUrl])

  const handleRun = async () => {
    console.log(module)
    setLoading(true)
    const perf: DataPoint[] = []

    for(var size = 30; size <= 10000; size+=100) {
      const first = module._malloc(8)
      const second = module._malloc(8)
      module._run(size, first, second)

      perf.push({x: size, y1: module.getValue(first, 'double'), y2: module.getValue(second, 'double')})
    }
    setData(perf)
    setLoading(false)
  }

  return (
    <Box sx={{marginTop: '2rem'}}>
      <Divider />
      <Button variant='contained' color='success' disabled={loading} onClick={handleRun} sx={{marginBottom: '1rem', marginTop: '0.5rem'}} >
        {loading && <CircularProgress size={20} sx={{marginRight: '1rem'}} color='success'/>} 
        <span>Run</span>
      </Button>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h5">
            Graph
          </Typography>
          <Divider sx={{marginTop: '1rem'}}/>
          {data.length != 0 && <Graph data={data}/>}
        </CardContent>
      </Card>
    </Box>
    
  )
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
      <Line type="monotone" dataKey="y1" stroke="#8884d8" activeDot={{ r: 4 }} dot={false} />
      <Line type="monotone" dataKey="y2" stroke="#82ca9d" activeDot={{ r: 4 }} dot={false} />
    </LineChart>
  );
};