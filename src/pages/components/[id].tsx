import { NavBar } from "@/components/Navbar";
import Unauthorized from "@/components/Unauthorized";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Modal,
  Paper,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { withSSRContext } from "aws-amplify";
import { FC, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Component, RegisteredComponent } from "@/types";
import _ from "lodash";
import { ProjectContext } from "@/context";

const ComponentsPage: FC<{
  authenticated: boolean;
  username: string;
  component: Component;
  components: Component[];
}> = ({ authenticated, username, component, components }) => {
  const [filteredComponents, setFilteredComponents] =
    useState<Component[]>(components);
  const [registered_ids, setRegistered] = useState<any>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const projectContext = useContext(ProjectContext);

  useEffect(() => {
    projectContext.setLoading(false);
  }, [])

  const debouncedSearch = _.debounce((term) => {
    fetch(
      `https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents?keyword=${term}`,
      { method: "GET" }
    )
      .then((result) => {
        return result.json();
      })
      .then((res) => {
        setFilteredComponents(res);
      })
      .catch((err) => console.log(err));
  }, 300);

  const registerComponent = (param_name: string, comp: RegisteredComponent) => {
    // setLoading(true);
    fetch(
      `https://9dkyg96d16.execute-api.us-east-1.amazonaws.com/default/componentRegistration`,
      {
        method: "POST",
        body: JSON.stringify({
          id: component.id,
          param_name: param_name,
          user_id: username,
          component_id: comp.component_id,
        }),
      }
    )
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setRegistered(result.parameters);
        // setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    // update registered
    if (component.parameters.length > 0) {
      setLoading(true);
      fetch(
        `https://9dkyg96d16.execute-api.us-east-1.amazonaws.com/default/componentRegistration?id=${component.id}`,
        {
          method: "GET",
        }
      )
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          setRegistered(result.parameters);
          setLoading(false);
        })
        .catch((err) => console.log(err));
    }
  }, [component]);

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
            // flexDirection: "column",
            alignItems: "flex-start",
            gap: "3rem",
          }}
        >
          <Box
            sx={{
              width: 300,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredComponents.map((comp, index) => (
                      <TableRow
                        key={comp.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                        hover={true}
                        selected={component?.id == comp.id}
                      >
                        <TableCell component="th" scope="row">
                          <Link href={`/components/${comp.id}`}>
                            {comp.component_name}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
          <Paper elevation={1} sx={{ padding: "1rem", width: 800 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {component.component_name}
              </Typography>
              <Divider />
              <ButtonGroup sx={{ mt: "1rem" }}>
                <Button size="small">
                  Show<span>.yml</span> file
                </Button>
                <Button size="small" disabled>
                  Delete component
                </Button>
              </ButtonGroup>
            </Box>
            {!loading && registered_ids && (
              <Box
                sx={{
                  marginTop: "1rem",
                }}
              >
                <ParameterInfo
                  user_id={username}
                  component={component}
                  registerComponent={registerComponent}
                  registered_components={registered_ids}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: "1rem",
                gap: "1rem",
              }}
            >
              {loading && (
                <CircularProgress
                  size={20}
                  sx={{ marginRight: "1rem" }}
                  color="success"
                />
              )}

              {component.parameters.length == 0 && (
                <Alert severity="warning">
                  This components does not have any parameters
                </Alert>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

const RegisterComponent: FC<{
  user_id: string;
  component: Component;
  param_name: string;
  registerComponent: (param_name: string, comp: RegisteredComponent) => void;
}> = ({ user_id, component, param_name, registerComponent }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
    bgcolor: "background.paper",
    borderRadius: "5px",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const debouncedSearch = _.debounce((term) => {
    fetch(
      `https://kuaunfdp12.execute-api.us-east-1.amazonaws.com/default/componentRegistrationSearch?id=${component.id}&param_name=${param_name}&search_term=${term}&user_id=${user_id}`,
      { method: "GET" }
    )
      .then((result) => result.json())
      .then((res) => {
        setFilteredComponents(res);
      })
      .catch((err) => console.log(err));
  }, 300);

  useEffect(() => {
    debouncedSearch("");
  }, []);

  return (
    <Box>
      <Button
        size="small"
        sx={{ marginBottom: "0.5rem" }}
        variant="contained"
        onClick={handleOpen}
      >
        Register new components
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
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
              label="Search components to register..."
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

          {filteredComponents.length > 0 ? (
            <Paper variant="outlined" sx={{ padding: "0 3px" }}>
              <List
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  bgcolor: "background.paper",
                  overflow: "scroll",
                }}
              >
                {filteredComponents?.map((comp) => (
                  <ListItem key={comp.id} disableGutters>
                    <ListItemButton
                      role={undefined}
                      dense
                      disableTouchRipple
                      onClick={() => {
                        registerComponent(param_name, {
                          component_id: comp.id,
                          registered_by: [],
                        });
                        handleClose();
                      }}
                    >
                      <ListItemText primary={comp.component_name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Alert severity="info">No component found</Alert>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

const ParameterInfo: FC<{
  user_id: string;
  component: Component;
  registerComponent: (param_name: string, comp: RegisteredComponent) => void;
  registered_components: any;
}> = ({ user_id, component, registerComponent, registered_components }) => {
  useEffect(() => {
    console.log(registered_components);
  }, []);

  return (
    <>
      {component.parameters.map((param_name) => (
        <Accordion key={`${component.id}-${param_name}`}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="body2" fontWeight={600}>
              {param_name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RegisterComponent
              user_id={user_id}
              param_name={param_name}
              registerComponent={registerComponent}
              component={component}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <Box
                sx={{
                  flexGrow: "1",
                }}
              >
                <Typography variant="subtitle2" sx={{ marginBottom: "0.5rem" }}>
                  Components registered by you
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ boxShadow: "none", border: "1px solid gainsboro" }}
                >
                  {registered_components &&
                  registered_components[param_name].filter((comp: any) =>
                    comp.registered_by.find(
                      (reg_id: string) => reg_id == user_id
                    )
                  ).length == 0 ? (
                    <Alert severity="warning">
                      You did&apos;t register any component
                    </Alert>
                  ) : (
                    <Table aria-label="components registered by the user">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell align="right">Component</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registered_components ? (
                          registered_components[param_name]
                            .filter((comp: any) =>
                              comp.registered_by.find(
                                (reg_id: string) => reg_id == user_id
                              )
                            )
                            .map((component_obj: any, index: number) => {
                              return (
                                <TableRow
                                  key={component_obj.id}
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell component="th" scope="row">
                                    {index + 1}
                                  </TableCell>
                                  <TableCell align="right">
                                    {
                                      <GetComponentNameByID
                                        id={component_obj.component_id}
                                      />
                                    }
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        registerComponent(
                                          param_name,
                                          component_obj
                                        )
                                      }
                                    >
                                      Unregister
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        ) : (
                          <CircularProgress />
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TableContainer>
              </Box>

              <Box
                sx={{
                  flexGrow: "1",
                }}
              >
                <Typography variant="subtitle2" sx={{ marginBottom: "0.5rem" }}>
                  All the components registered
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ boxShadow: "none", border: "1px solid gainsboro" }}
                >
                  <Table aria-label="all the registered components">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell align="right">Component</TableCell>
                        <TableCell align="right">Registered by</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {registered_components ? (
                        registered_components[param_name].map(
                          (component_obj: any, index: number) => (
                            <TableRow
                              key={component_obj.id}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {index + 1}
                              </TableCell>
                              <TableCell align="right">
                                {
                                  <GetComponentNameByID
                                    id={component_obj.component_id}
                                  />
                                }
                              </TableCell>
                              <TableCell align="right">
                                {component_obj.registered_by.length +
                                  " user(s)"}
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        <CircularProgress />
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

const GetComponentNameByID: FC<{ id: string }> = ({ id }) => {
  const [name, setName] = useState<string>();
  useEffect(() => {
    if (!id) return;
    fetch(
      `https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents?id=${id}`,
      { method: "GET" }
    )
      .then((res) => res.json())
      .then((result) => setName(result.component_name));
  }, [id]);
  return name ? (
    <>{name}</>
  ) : (
    <CircularProgress size={10} sx={{ marginRight: "1rem" }} color="success" />
  );
};

export async function getServerSideProps(
  context:
    | { req?: any; res: any; modules?: any[] | undefined; params?: any }
    | undefined
) {
  console.log(context?.params);
  const { Auth } = withSSRContext(context);
  try {
    const user = await Auth.currentAuthenticatedUser();
    const component = await fetch(
      `https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents?id=${context?.params.id}`,
      { method: "GET" }
    ).then((result) => result.json());
    const components = await fetch(
      `https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents?keyword=${""}`,
      { method: "GET" }
    ).then((result) => result.json());

    return {
      props: {
        authenticated: true,
        username: user.username,
        component: component,
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
