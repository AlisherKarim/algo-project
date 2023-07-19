import { NavBar } from "@/components/Navbar"
import Unauthorized from "@/components/Unauthorized";
import { Box, Button, ButtonGroup, Checkbox, Container, Divider, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { withSSRContext } from "aws-amplify";
import { FC, useState } from "react";
import Link from "next/link";
import { Component } from "@/types";

const rows: Component[] = [
  {
    name: 'BasicAlgorithm',
    created_by: 'user124',
    parameters: 'param1, param2, ...'
  },
  {
    name: 'AnotherAlgorithm',
    created_by: 'qwerty',
    parameters: 'param2'
  },
  {
    name: 'SimpleAlgorithm',
    created_by: 'admin',
    parameters: '-'
  }
]

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder',
];

const MultipleSelectCheckmarks: FC<{componentNames: string[]}> = ({componentNames}) => {
  const [selectedComponentNames, setComponentNames] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof selectedComponentNames>) => {
    const {
      target: { value },
    } = event;
    setComponentNames(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 400 }}>
        <InputLabel id="demo-multiple-checkbox-label" size="small">Registered components</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedComponentNames}
          onChange={handleChange}
          input={<OutlinedInput label="Registered components" size="small" />}
          renderValue={(selected) => selected.join(', ')}
          size='small'
          // MenuProps={MenuProps}
        >
          {componentNames.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={selectedComponentNames.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}


const ComponentsPage: FC<{authenticated: boolean, username: string, component: Component}> = ({authenticated, username, component}) => {
  console.log(component)
  if(!authenticated) {
    return <Unauthorized />
  }

  return (
    <>
      <NavBar />
      <Container>
        <Box
          sx={{
            marginTop: '2rem',
            display: "flex",
            justifyContent: 'center',
            // flexDirection: "column",
            alignItems: "flex-start",
            gap: '3rem'
          }}
        >
          <Box
            sx={{
              width: 300,
              display: "flex",
              justifyContent: 'center',
              flexDirection: "column",
              gap: '2rem'
            }}
          >
            <Box
              sx={{
                maxWidth: '100%',
                display: 'flex', 
                alignItems: 'center'
              }}
            >
              <SearchIcon sx={{ color: 'action.active', mr: 1}} />
              <TextField 
                fullWidth 
                label="Search components..." 
                id="search" 
                size="small" 
                sx={{
                  backgroundColor: '#fff'
                }}
              />
            </Box>
            <Box>
              <TableContainer component={Paper}>
                <Table sx={{ }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{fontWeight: '600'}}>Component name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((comp, index) => (
                      <TableRow
                        key={comp.name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        hover={true}
                        selected={component?.name == comp.name}
                      >
                        <TableCell component="th" scope="row">
                          <Link href={`/components/${comp.name}`}>{comp.name}</Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
          <Paper elevation={1} sx={{padding: '1rem', width: 800}}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {component.name}
              </Typography>
              <Divider />
              <ButtonGroup sx={{mt: '1rem'}}>
                <Button size="small">Show<span>.yml</span> file</Button>
                <Button size="small" disabled>Delete component</Button>
              </ButtonGroup>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '1rem',
                gap: '1rem'
              }}
            >
              <Paper variant="outlined" sx={{paddingLeft: '1rem', paddingRight: '1rem'}}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant='body1' width={200}>
                    Parameter_Name_1
                  </Typography>
                  <MultipleSelectCheckmarks componentNames={names}/>
                  <Button variant='outlined' color='success'>Save</Button>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{paddingLeft: '1rem', paddingRight: '1rem'}}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant='body1' width={200}>
                    Param_Name_2
                  </Typography>
                  <MultipleSelectCheckmarks componentNames={names}/>
                  <Button variant='outlined' color='success'>Save</Button>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{paddingLeft: '1rem', paddingRight: '1rem'}}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant='body1' width={200}>
                    Parameter_Name_3
                  </Typography>
                  <MultipleSelectCheckmarks componentNames={names}/>
                  <Button variant='outlined' color='success'>Save</Button>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  )
}

export async function getServerSideProps(context: { req?: any; res: any; modules?: any[] | undefined; params?: any} | undefined) {
  console.log(context?.params)
  const { Auth } = withSSRContext(context)
  try {
    const user = await Auth.currentAuthenticatedUser()
    return {
      props: {
        authenticated: true,
        username: user.username,
        component: rows.find((r => r.name == context?.params.id))
      }
    }
  } catch (err) {
    context?.res.writeHead(302, { Location: '/login' })
    context?.res.end()
  }
  return {props: {}}
}

export default ComponentsPage