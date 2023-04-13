import { FileViewer } from "@/components/FileViewer"
import { FolderView } from "@/components/FolderView"
import { withAuthenticator } from "@aws-amplify/ui-react"
import { Container } from "react-bootstrap"

const Profile = () => {
  return <>
    <Container style={{display: 'flex'}} className="mt-5">
      <FolderView />
      <FileViewer />
    </Container>
  </>
}



export default withAuthenticator(Profile)