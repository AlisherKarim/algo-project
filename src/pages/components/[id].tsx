import { NavBar } from "@/components/Navbar";
import Unauthorized from "@/components/Unauthorized";
import {
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
import { withSSRContext } from "aws-amplify";
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { Component, RegisteredComponent } from "@/types";
import _ from "lodash";

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

  const debouncedSearch = _.debounce((term) => {
    fetch(
      "https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents",
      { method: "POST", body: JSON.stringify({ keyword: term }) }
    )
      .then((result) => result.json())
      .then((res) => {
        console.log(term);
        console.log(res);
        setFilteredComponents(res);
      });
  }, 300);

  const registerComponent = (param_name: string, comp: RegisteredComponent) => {
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
              {!loading && registered_ids && (
                <>
                  {component.parameters.length != 0 && (
                    <Alert severity="info">
                      Click 'More' to register your own components or see the
                      full list of components registered to that parameter
                    </Alert>
                  )}
                  {component.parameters.map((param) => {
                    return (
                      <Paper
                        variant="outlined"
                        sx={{ paddingLeft: "1rem", paddingRight: "1rem" }}
                        key={`${component.id}/${param}`}
                      >
                        {/* <ParameterRegistration param={param} components={components} component={component} registered_ids={registered_ids[param]}/> */}
                        <RegisterComponent
                          user_id={username}
                          component={component}
                          param_name={param}
                          registered_components={registered_ids[param]}
                          registerComponent={registerComponent}
                        />
                      </Paper>
                    );
                  })}
                </>
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
  registered_components: RegisteredComponent[];
  registerComponent: (param_name: string, comp: RegisteredComponent) => void;
}> = ({
  user_id,
  component,
  param_name,
  registered_components,
  registerComponent,
}) => {
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

  const [showFiltered, setShowFiltered] = useState<boolean>(false);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>();
  const debouncedSearch = _.debounce((term) => {
    fetch(
      `https://kuaunfdp12.execute-api.us-east-1.amazonaws.com/default/componentRegistrationSearch?id=${component.id}&param_name=${param_name}&search_term=${term}`,
      { method: "GET" }
    )
      .then((result) => result.json())
      .then((res) => {
        setFilteredComponents(res);
      });
  }, 300);

  useEffect(() => {
    debouncedSearch("");
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="body1" width={200}>
        {param_name}
      </Typography>

      <Button onClick={handleOpen}>More</Button>
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
              onFocus={() => {
                setShowFiltered(true);
              }}
            />
          </Box>
          {showFiltered && (
            <Paper variant="outlined" sx={{ padding: "0 3px" }}>
              <List
                sx={{
                  width: "100%",
                  maxHeight: 140,
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
                      onClick={() =>
                        registerComponent(param_name, {
                          component_id: comp.id,
                          registered_by: [],
                        })
                      }
                    >
                      <ListItemText primary={comp.component_name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Paper variant="outlined" sx={{ padding: "1rem" }}>
            <Alert
              sx={{
                marginBottom: "2rem",
              }}
              severity="info"
            >
              This list shows all the registered components to this parameter.
              Those which are outlined by green color are registered by you. The
              numbers on the left show the number of users who registered that
              component
            </Alert>
            <Typography variant="h6">Registered components</Typography>
            <Box
              sx={{
                marginTop: "10px",
                display: "flex",
                gap: "5px",
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              {registered_components.map((comp) => (
                <Chip
                  label={<GetComponentNameByID comp={comp} />}
                  variant="outlined"
                  color={
                    comp.registered_by.find((id) => id == user_id)
                      ? "success"
                      : "primary"
                  }
                  icon={<Chip label={comp.registered_by.length} size="small" />}
                  onClick={() => registerComponent(param_name, comp)}
                />
              ))}
              {registered_components.length == 0 && (
                <Alert severity="warning">
                  There are no components that were registered to this parameter
                </Alert>
                // <Typography variant='caption'>There are no components that were registered to this parameter</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};

const GetComponentNameByID: FC<{ comp: RegisteredComponent }> = ({ comp }) => {
  const [name, setName] = useState<string>();
  useEffect(() => {
    fetch(
      "https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents",
      { method: "POST", body: JSON.stringify({ id: comp.component_id }) }
    )
      .then((res) => res.json())
      .then((result) => setName(result.component_name));
  }, [comp]);
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
      "https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents",
      { method: "POST", body: JSON.stringify({ id: context?.params.id }) }
    ).then((result) => result.json());
    const components = await fetch(
      "https://rx8u7i66ib.execute-api.us-east-1.amazonaws.com/default/getComponents",
      { method: "POST", body: JSON.stringify({ keyword: "" }) }
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
