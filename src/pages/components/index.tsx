import { NavBar } from "@/components/Navbar"
import Unauthorized from "@/components/Unauthorized";
import { Box, Button, ButtonGroup, Checkbox, Container, Divider, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { withSSRContext } from "aws-amplify";
import { FC, useState } from "react";
import Link from "next/link";
import { Component } from "@/types";

const ComponentsPage: FC<{authenticated: boolean, username: string, components: Component[]}> = ({authenticated, username, components}) => {
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
            alignItems: "flex-start",
            gap: '3rem'
          }}
        >
          <Box
            sx={{
              width: (700),
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
                      <TableCell sx={{fontWeight: '600'}} align="right">Created by</TableCell>
                      <TableCell sx={{fontWeight: '600'}} align="right">Parameters</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {components.map((component, index) => (
                      <TableRow
                        key={component.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        hover={true}
                      >
                        <TableCell component="th" scope="row">
                          <Link href={`/components/${component.id}`}>{component.component_name}</Link>
                        </TableCell>
                        <TableCell align="right">{component.created_by}</TableCell>
                        <TableCell align="right">{component.parameters.join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  )
}

export async function getServerSideProps(context: { req?: any; res: any; modules?: any[] | undefined; } | undefined) {
  const { Auth } = withSSRContext(context)
  try {
    const user = await Auth.currentAuthenticatedUser()
    const components = await fetch('https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents').then(result => result.json())
    return {
      props: {
        authenticated: true,
        username: user.username,
        components: components
      }
    }
  } catch (err) {
    context?.res.writeHead(302, { Location: '/login' })
    context?.res.end()
  }
  return {props: {}}
}

export default ComponentsPage