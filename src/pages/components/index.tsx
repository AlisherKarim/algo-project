import { NavBar } from "@/components/Navbar";
import Unauthorized from "@/components/Unauthorized";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Container,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { withSSRContext } from "aws-amplify";
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { Component } from "@/types";
import _ from "lodash";

const ComponentsPage: FC<{
  authenticated: boolean;
  username: string;
  components: Component[];
}> = ({ authenticated, username, components }) => {
  const [filteredComponents, setFilteredComponents] =
    useState<Component[]>(components);

  const debouncedSearch = _.debounce((term) => {
    fetch(
      `https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents?keyword=${term}`,
      { method: "GET" }
    )
      .then((result) => result.json())
      .then((res) => {
        console.log(term);
        console.log(res);
        setFilteredComponents(res);
      });
  }, 300);

  if (!authenticated) {
    return <Unauthorized />;
  }

  return (
    <>
      <NavBar />
      <Container>
        <Box
          sx={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "3rem",
          }}
        >
          <Box
            sx={{
              width: 700,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <Alert severity="info">
              Type keywords to search for components. For example, &apos; algorithms &apos;
            </Alert>
            <Box
              sx={{
                maxWidth: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              <TextField
                fullWidth
                label="Search components..."
                id="search"
                size="small"
                sx={{
                  backgroundColor: "#fff",
                }}
                onChange={(e) => {
                  debouncedSearch(e.target.value);
                }}
              />
            </Box>
            <Box>
              <TableContainer component={Paper}>
                <Table sx={{}} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "600" }}>
                        Component name
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="right">
                        Created by
                      </TableCell>
                      <TableCell sx={{ fontWeight: "600" }} align="right">
                        Parameters
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredComponents.map((component, index) => {
                      // if (keyword != '' && component?.keywords.indexOf(keyword) == -1)
                      //   return
                      return (
                        <TableRow
                          key={component.id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                          hover={true}
                        >
                          <TableCell component="th" scope="row">
                            <Link href={`/components/${component.id}`}>
                              {component.component_name}
                            </Link>
                          </TableCell>
                          <TableCell align="right">John Doe</TableCell>
                          <TableCell align="right">
                            {component.parameters.join(", ")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export async function getServerSideProps(
  context: { req?: any; res: any; modules?: any[] | undefined } | undefined
) {
  const { Auth } = withSSRContext(context);
  try {
    const user = await Auth.currentAuthenticatedUser();
    const components = await fetch(
      `https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents?keyword=${''}`,
      { method: "GET" }
    ).then((result) => result.json());
    return {
      props: {
        authenticated: true,
        username: user.username,
        components: components,
      },
    };
  } catch (err) {
    context?.res.writeHead(302, { Location: "/login" });
    context?.res.end();
  }
  return { props: {} };
}

export default ComponentsPage;
