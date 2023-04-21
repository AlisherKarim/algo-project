import { FileViewer } from "@/components/FileViewer"
import { FolderView } from "@/components/FolderView"
import { useAuthenticator, withAuthenticator } from "@aws-amplify/ui-react"
import { Button, Container } from "@mui/material"
import { Storage } from "aws-amplify"
import { useState } from "react"

const Dashboard = () => {
  const [currentFile, setCurrentFile] = useState<string>()
  return <>
    <Container style={{display: 'flex', marginTop: '3rem'}} >
      <FolderView setCurrentFile={setCurrentFile} />
      <FileViewer currentFile={currentFile}/>
    </Container>
  </>
}

export default withAuthenticator(Dashboard)