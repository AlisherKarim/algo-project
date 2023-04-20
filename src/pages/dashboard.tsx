import { FileViewer } from "@/components/FileViewer"
import { FolderView } from "@/components/FolderView"
import { useAuthenticator, withAuthenticator } from "@aws-amplify/ui-react"
import { Button, Container } from "@mui/material"
import { Storage } from "aws-amplify"

const Dashboard = () => {
  return <>
    <Container style={{display: 'flex', marginTop: '3rem'}} >
      <FolderView />
      <FileViewer />
    </Container>
  </>
}

export default withAuthenticator(Dashboard)