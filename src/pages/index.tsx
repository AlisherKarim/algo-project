import { Inter } from 'next/font/google'
import Button from '@mui/material/Button';
import { Storage } from 'aws-amplify'
import { Alert, Box, Card, CardActions, CardContent, CircularProgress, Container, Divider, FormControl, Grid, Input, InputAdornment, InputLabel, List, ListItem, ListItemIcon, ListItemText, Stack, TextField, Typography } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FC, useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import { getModule } from '../utils/wasm'
import { ddbDocClient, PutCommand } from "../libs/ddbDocClient"; 
import { v4 as uuidv4 } from 'uuid';
import { useAuthenticator } from '@aws-amplify/ui-react';

const Home: FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  const [algoPath, setAlgoPath] = useState<string>('')
  const [testgenPath, setTestgenPath] = useState<string>('')
  const [mainPath, setMainPath] = useState<string>('')
  const [wasmUrl, setWasmUrl] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const [showResponse, setShow] = useState<boolean>(false)

  const getUrl = async (folder_path: string) => {
    console.log(folder_path)
    const s3File = await Storage.get(folder_path).then(url => url).catch(err => undefined);
    console.log(s3File)
    return s3File
  }

  const handleCompile = async () => {
    // create uuid and send the file to the dynamo db
    const folder_id = uuidv4()

    console.log(mainPath, algoPath, testgenPath)
    // after successful upload, create a record on "S3UploadRecords"

    // algoKey: 'public/public_folder/algorithms/bubble',
    // testgenKey: 'public/public_folder/test_generaters/testgen1'

    const params = {
      TableName: "S3UploadRecords",
      Item: {
        uploadId: uuidv4(),
        algoKey: 'public/public_folder/algorithms/bubble',
        testgenKey: 'public/public_folder/test_generaters/testgen1',
        status: "pending",
        timestamp: new Date().toISOString(),
        userName: user.username,
        folderId: folder_id,
        type: "compile"
      },
  };
    try {
      const data = await ddbDocClient.send(new PutCommand(params));
      console.log("Success - item added or updated", data);
    } catch (err: any) {
      console.error("Error", err.stack);
    }
    

    const startTime = Date.now();
    const timeout = 10000; // overall long polling time
    const interval = 5000;

    // check if the given files (algo_path, ...) exist in s3
    // ...
    
    
    // send the file

    // starts to check if the compiled output is already in the given folder
    const checkPeridodically = async () => {
      const wasmFileUrl = await getUrl(`outputs/${user.username}/${folder_id}/main.wasm`)
      if(wasmFileUrl) {
        setShow(true)
        setWasmUrl(wasmFileUrl)
      } else {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < timeout) {
          setTimeout(checkPeridodically, interval);
        } else {
          console.error('Directory does not exist within the timeout period.');
        }
      }
    }
    checkPeridodically()

  }

  return (
    <>
      <main>
        <Container style={{marginTop: "7rem"}}>

          <Grid container spacing={4}>
            <Grid item xs={4}>
              <Typography variant="h5" component="h5">
                Algorithm
              </Typography>
              <AlgoList setPath={setAlgoPath}/>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h5" component="h5">
                Test Generator
              </Typography>
              <TestGenList setPath={setTestgenPath} />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h5" component="h5">
                Main
              </Typography>
              <MainList setPath={setMainPath} />
            </Grid>
          </Grid>

          <Button 
            variant='contained'
            color='success'
            disabled={!(algoPath && testgenPath) || loading}
            onClick={handleCompile}
            sx={{marginTop: '1rem'}}
          >
            {loading && <CircularProgress size={20} sx={{marginRight: '1rem'}} color='success'/>} 
            <span>Compile</span>
          </Button>

          <Divider sx={{marginTop: '2rem'}} />

          {showResponse && <MainBlock algoPath={algoPath} testgenPath={testgenPath} mainPath={mainPath} wasmUrl={wasmUrl}/>}

        </Container>
      </main>
    </>
  )
}

export default Home

const AlgoList: FC<{setPath: (p: string) => void}> = ({setPath}) => {
  // TODO: fetch all the available algos from storage

  const [chosenIndex, setIndex] = useState<number>(-1)

  const algos = [
    {
      name: 'Bubble Sort',
      description: 'Sorts the given array of numbers in quadratic time',
      key: 'algorithms/bubble'
    },
    {
      name: 'Merge Sort',
      description: 'Sorts the given array of numbers in nlogn time',
      key: 'algorithms/merge'
    },
  ]

  return (
    <Stack spacing={2} sx={{marginTop: '2rem'}}>

      {algos.map((algo, ind) =>  (
        <Card key={algo.key}>
          <CardContent>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {algo.name}
            </Typography>
            <Typography variant="body2">
              {algo.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small"
              variant={chosenIndex == ind ? 'contained' : 'outlined'}
              onClick={() => {
                if(ind == chosenIndex) {
                  setPath('')
                  setIndex(-1)
                } else {
                  setPath(algo.key)
                  setIndex(ind)
                }
              }}
            >
              Use
            </Button>
          </CardActions>
        </Card>
      ))}
    </Stack>
  )
}


const TestGenList: FC<{setPath: (p: string) => void}> = ({setPath}) => {

  const [chosenIndex, setIndex] = useState<number>(-1)
  const generators = [
    {
      name: 'Test Gen 1',
      description: 'Creates sample array of size n = 100, 1000, 100000.',
      extra: 'a[i] <= 1e6',
      key: 'test_generaters/testgen1'
    },
    {
      name: 'Test Gen 2',
      description: 'Creates sample array of size n = 100, 1000, 100000.',
      extra: 'a[i] <= 1e9',
      key: 'test_generaters/testgen2'
    }
  ]

  return (
    <Stack spacing={2} sx={{marginTop: '2rem'}}>
      {generators.map((gen, ind) => (
        <Card key={gen.key}>
          <CardContent>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {gen.name}
            </Typography>
            <Typography variant="body2">
              {gen.description}
            </Typography>
            <Typography variant='body2'>
              <code>{gen.extra}</code>
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              variant={chosenIndex == ind ? 'contained' : 'outlined'}
              onClick={() => {
                if(ind == chosenIndex) {
                  setPath('')
                  setIndex(-1)
                } else {
                  setPath(gen.key)
                  setIndex(ind)
                }
              }}
            >
              Use
            </Button>
          </CardActions>
        </Card>
      ))}
    </Stack>
  )
}

const MainList: FC<{setPath: (p: string) => void}> = ({setPath}) => {
  return (
    <Stack spacing={2} sx={{marginTop: '2rem'}}>
      <Card>
        <CardContent>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Main Function Block
          </Typography>
          <Typography variant="body2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" variant='contained'>Use</Button>
        </CardActions>
      </Card>
    </Stack>
  )
}


interface DataPoint {
  x: number;
  y1: number;
  y2: number;
}

const MainBlock: FC<{algoPath: string, testgenPath: string, mainPath: string, wasmUrl: string}> = ({algoPath, testgenPath, mainPath, wasmUrl}) => {  
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const handleRun = async () => {
    setLoading(true)
    // const algo1 = await getModule('public_folder/outputs/bubble/main.wasm')
    console.log(wasmUrl)
    const algo1 = await getModule(wasmUrl)
    const perf: DataPoint[] = []

    algo1.onRuntimeInitialized = async () => {
      
      for(var size = 30; size <= 6000; size+=100) {
        const start = performance.now()
        algo1._main(size)
        const end = performance.now()
        perf.push({x: size, y1: end - start, y2: 0})
      }
      setData(perf)
      setLoading(false)

      // const signedURL2 = await Storage.get('test/main.wasm'); // key
      // const algo2 = await getModule(signedURL2)

      // algo2.onRuntimeInitialized = () => {
      //   let i = 0
      //   for(var size = 30; size <= 6000; size+=100) {
      //     const start = performance.now()
      //     algo2._main(size)
      //     const end = performance.now()
      //     perf[i].y2 = end - start;
      //     i++;
      //   }
      //   setData(perf)
      //   setLoading(false)
      // }
    }
  }

  return (
    <Box sx={{marginTop: '2rem'}}>
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h5">
                Main Component
              </Typography>
              <List sx={{maxWidth: '250px'}}>
                <ListItem>
                  <ListItemText>Algorithm</ListItemText>
                  <ListItemIcon>
                    <CheckIcon color={algoPath ? 'success': 'disabled'}  />
                  </ListItemIcon>
                </ListItem>
                <ListItem>
                  <ListItemText>Test Generator</ListItemText>
                  <ListItemIcon>
                    <CheckIcon color={testgenPath ? 'success': 'disabled'} />
                  </ListItemIcon>
                </ListItem>
                <ListItem>
                  <ListItemText>Main</ListItemText>
                  <ListItemIcon>
                    <CheckIcon color={mainPath ? 'success': 'disabled'} />
                  </ListItemIcon>
                </ListItem>
              </List>
              {/* <Typography variant="h5" component="h5">
                {algoPath && algo.error && <Alert severity="error" sx={{marginBottom: '1rem'}}>{algo.error.message}</Alert>}
                {testgenPath && testgen.error && <Alert severity="error">{testgen.error.message}</Alert>}
              </Typography> */}
            </CardContent>
            <CardActions>
              <Button variant='contained' color='success' disabled={!(algoPath && testgenPath) || loading} onClick={handleRun} >
                {loading && <CircularProgress size={20} sx={{marginRight: '1rem'}} color='success'/>} 
                <span>Run</span>
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h5">
                Graph
              </Typography>
              <Divider sx={{marginTop: '1rem'}}/>
              {data.length != 0 && <Graph data={data}/>}
            </CardContent>
          </Card>
        </Grid>
        
      </Grid>
      
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