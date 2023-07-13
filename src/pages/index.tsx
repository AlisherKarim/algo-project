import Button from '@mui/material/Button';
import { Storage } from 'aws-amplify'
import { Box, Card, CardContent, CircularProgress, Container, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FC, useEffect, useState } from 'react';
import { getModule } from '../utils/wasm'
import { NavBar } from '@/components/Navbar';

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
                Main
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

const MainList: FC = () => {
  return (
    <Stack spacing={2} sx={{marginTop: '2rem'}}>
      <Card>
        <CardContent>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            RunSortingAlgm
          </Typography>
          <Typography variant="body2">
            {'@RunSortingAlgm<$RandomVectorGenerator, $SortAlgm1, $SortAlgm2>'}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
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
      <Button variant='contained' color='success' disabled={loading} onClick={handleRun} >
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