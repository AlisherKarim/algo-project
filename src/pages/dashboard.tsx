import { FileViewer } from "@/components/FileViewer";
import { FolderView } from "@/components/FolderView";
import React, { FC, useContext, useEffect, useState } from "react";
import Splitter, { SplitDirection } from "@devbookhq/splitter";
import { TransactionList } from "@/components/TransactionList";
import styles from "@/styles/Home.module.css";
import { NavBar } from "@/components/Navbar";
import { withSSRContext } from "aws-amplify";
import { Box, Button, ButtonGroup, Container, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import { FileUploader } from "@/components/FileUploader";
import { Component, ITransaction } from "@/types";
import { ProjectContext } from "@/context";

const Dashboard: FC<{
  authenticated: boolean;
  username: string;
  components: Component[];
}> = ({ authenticated, username, components }) => {
  const [currentFile, setCurrentFile] = useState<string>();
  const [keyPath, setKeyPath] = useState<string>();
  const [selectedComponent, setSelected] = useState<string>();
  const [isYaml, setIsYaml] = useState<boolean>(false);
  const [userComponents, setUserComponents] = useState<Component[]>(components);
  const projectContext = useContext(ProjectContext);

  useEffect(() => {
    projectContext.setLoading(false);
  }, [])

  const updateComponents = () => {
    fetch(
      "https://shfce2b7r5.execute-api.us-east-1.amazonaws.com/default/getUserTransactions",
      {
        method: "POST",
        body: username,
      }
    )
      .then((result) => result.json())
      .then((res) => setUserComponents(res));
  };

  const handleDelete = () => {
    if (!selectedComponent) return;

    fetch(
      "https://6zgeflldw6.execute-api.us-east-1.amazonaws.com/default/deleteComponentByID",
      {
        method: "POST",
        body: JSON.stringify({ id: selectedComponent }),
      }
    )
      .then((res) => res.json())
      .then((result) => {
        updateComponents();
      })
      .catch((err) => console.log(err));
  };

  if (!authenticated) {
    return (
      <>
        <NavBar />
        <Container>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "3rem",
              justifyContent: "space-between",
            }}
          >
            Please, sign in first to see your dashboard
          </div>
          <Link href="/login">Login</Link>
        </Container>
      </>
    );
  }
  return (
    <>
      <NavBar />
      <Paper variant="outlined">
        <Box sx={{ m: "1rem", display: "flex", gap: "1rem" }}>
          <FileUploader callBack={updateComponents} />
          <Button
            startIcon={<DeleteIcon />}
            disabled={!selectedComponent}
            onClick={handleDelete}
            variant="contained"
          >
            Delete
          </Button>
        </Box>
      </Paper>
      <Paper style={{ display: "flex", height: "82vh" }} variant="outlined">
        <Splitter
          direction={SplitDirection.Horizontal}
          initialSizes={[20, 20, 60]}
          gutterClassName={styles.customGutter}
          draggerClassName="custom-dragger-horizontal"
          minWidths={[250, 200, 200]}
        >
          <TransactionList
            setKeyPath={setKeyPath}
            userComponents={userComponents}
            callBack={updateComponents}
            setSelectedComponent={setSelected}
          />
          <FolderView
            setCurrentFile={setCurrentFile}
            keyPath={keyPath}
            setIsYaml={setIsYaml}
          />
          <FileViewer currentFile={currentFile} isYaml={isYaml} />
        </Splitter>
      </Paper>
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
      "https://shfce2b7r5.execute-api.us-east-1.amazonaws.com/default/getUserTransactions",
      {
        method: "POST",
        body: user.username,
      }
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

export default Dashboard;
